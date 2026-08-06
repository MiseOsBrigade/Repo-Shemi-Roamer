from __future__ import annotations

import json
import os
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

import httpx
from bs4 import BeautifulSoup

from .models import SourceDocument
from .security import normalize_https_url, safe_local_path, scan_prompt_injection

class FetchError(RuntimeError):
    pass

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

def fetch(source: str) -> SourceDocument:
    if source.startswith(("https://", "http://")):
        host = (urlsplit(source).hostname or "").lower()
        if host in {"x.com", "twitter.com", "www.x.com", "www.twitter.com"}:
            return fetch_x(source)
        if any(name in host for name in ("youtube.com", "youtu.be", "vimeo.com")):
            return fetch_media(source)
        return fetch_web(source)
    return fetch_local(source)

def fetch_local(source: str) -> SourceDocument:
    path = safe_local_path(source)
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        try:
            from pypdf import PdfReader
        except ImportError as exc:
            raise FetchError("Install linkforge-core[pdf] for PDF input") from exc
        reader = PdfReader(str(path))
        text = "\n\n".join((page.extract_text() or "") for page in reader.pages)
        extractor = "pypdf"
    elif suffix in {".html", ".htm"}:
        soup = BeautifulSoup(path.read_text(encoding="utf-8", errors="replace"), "html.parser")
        for node in soup(["script", "style", "nav", "footer"]):
            node.decompose()
        text = "\n".join(soup.stripped_strings)
        extractor = "local-html"
    else:
        text = path.read_text(encoding="utf-8", errors="replace")
        extractor = "local-text"
    if not text.strip():
        raise FetchError("No readable text found")
    return SourceDocument(
        source=str(path), normalized_source=str(path), title=path.stem.replace("-", " ").title(),
        text=text.strip(), extractor=extractor, retrieved_at=_now(),
        injection_signals=scan_prompt_injection(text), raw_metadata={"bytes": path.stat().st_size},
    )

def fetch_web(source: str) -> SourceDocument:
    url = normalize_https_url(source)
    timeout = float(os.getenv("LINKFORGE_TIMEOUT_SECONDS", "25"))
    max_bytes = int(os.getenv("LINKFORGE_MAX_BYTES", "12582912"))
    headers = {"User-Agent": "MiseOS-LinkForge/1.0 (+source-research)"}
    with httpx.Client(timeout=timeout, follow_redirects=False, headers=headers) as client:
        for _ in range(5):
            with client.stream("GET", url) as response:
                if response.is_redirect:
                    target = response.headers.get("location")
                    if not target:
                        raise FetchError("Redirect omitted Location")
                    url = normalize_https_url(str(response.url.join(target)))
                    continue
                response.raise_for_status()
                ctype = response.headers.get("content-type", "")
                if not any(t in ctype for t in ("text/html", "text/plain", "application/xhtml+xml")):
                    raise FetchError(f"Unsupported content type: {ctype}")
                chunks: list[bytes] = []
                total = 0
                for chunk in response.iter_bytes():
                    total += len(chunk)
                    if total > max_bytes:
                        raise FetchError("Source exceeded configured byte limit")
                    chunks.append(chunk)
                body = b"".join(chunks)
                break
        else:
            raise FetchError("Too many redirects")
    html = body.decode(response.encoding or "utf-8", errors="replace")
    if "text/plain" in ctype:
        title, text, headings, metadata = url, html, [], {}
    else:
        soup = BeautifulSoup(html, "html.parser")
        for node in soup(["script", "style", "nav", "footer", "form", "noscript"]):
            node.decompose()
        title = (soup.title.get_text(" ", strip=True) if soup.title else url)
        canonical = soup.find("link", rel=lambda v: v and "canonical" in v)
        main = soup.find("article") or soup.find("main") or soup.body or soup
        headings = [h.get_text(" ", strip=True) for h in main.find_all(["h1", "h2", "h3"])]
        text = "\n".join(main.stripped_strings)
        metadata = {"canonical": canonical.get("href") if canonical else None}
    if len(text.strip()) < 80:
        raise FetchError("Source contained too little readable text")
    return SourceDocument(
        source=source, normalized_source=url, canonical_url=metadata.get("canonical") or url,
        title=title[:300], text=text.strip(), extractor="bounded-httpx-beautifulsoup",
        retrieved_at=_now(), headings=headings[:100], injection_signals=scan_prompt_injection(text),
        raw_metadata={"content_type": ctype, "bytes": len(body)},
    )

def fetch_x(source: str) -> SourceDocument:
    token = os.getenv("X_BEARER_TOKEN")
    if not token:
        doc = fetch_web(source)
        doc.extractor = "x-public-page"
        doc.warnings.append("X API token unavailable; public page extraction may be incomplete")
        return doc
    url = normalize_https_url(source)
    match = re.search(r"/status/(\d+)", url)
    if not match:
        raise FetchError("Could not parse X post ID")
    post_id = match.group(1)
    endpoint = f"https://api.x.com/2/tweets/{post_id}"
    params = {"tweet.fields": "author_id,created_at,conversation_id,lang,public_metrics", "expansions": "author_id", "user.fields": "name,username"}
    response = httpx.get(endpoint, params=params, headers={"Authorization": f"Bearer {token}"}, timeout=20)
    response.raise_for_status()
    payload = response.json()
    data = payload.get("data") or {}
    users = ((payload.get("includes") or {}).get("users") or [])
    author = users[0] if users else {}
    text = str(data.get("text") or "").strip()
    return SourceDocument(
        source=source, normalized_source=url, canonical_url=url,
        title=f"X post by @{author.get('username', 'unknown')}", text=text,
        extractor="x-api-v2", retrieved_at=_now(), author=author.get("name"),
        published_at=data.get("created_at"), injection_signals=scan_prompt_injection(text),
        raw_metadata={"post": data, "author": author},
    )

def fetch_media(source: str) -> SourceDocument:
    url = normalize_https_url(source)
    command = ["yt-dlp", "--dump-single-json", "--skip-download", "--write-auto-subs", "--write-subs", "--sub-langs", "en.*,en", url]
    try:
        proc = subprocess.run(command, check=True, capture_output=True, text=True, timeout=90)
    except FileNotFoundError as exc:
        raise FetchError("Install yt-dlp for media capture") from exc
    except subprocess.CalledProcessError as exc:
        raise FetchError(exc.stderr[-500:]) from exc
    payload: dict[str, Any] = json.loads(proc.stdout)
    text = "\n\n".join(filter(None, [payload.get("title"), payload.get("description")]))
    if not text.strip():
        raise FetchError("Media metadata contained no readable text")
    return SourceDocument(
        source=source, normalized_source=url, canonical_url=payload.get("webpage_url") or url,
        title=payload.get("title") or "Media source", text=text,
        extractor="yt-dlp-metadata", retrieved_at=_now(), author=payload.get("uploader"),
        published_at=payload.get("upload_date"), injection_signals=scan_prompt_injection(text),
        raw_metadata={k: payload.get(k) for k in ("id", "duration", "view_count", "channel", "tags")},
    )
