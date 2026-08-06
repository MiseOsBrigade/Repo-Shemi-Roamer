from __future__ import annotations

import ipaddress
import os
import re
import socket
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

class SecurityError(ValueError):
    pass

INJECTION_PATTERNS = [
    re.compile(pattern, re.I) for pattern in (
        r"ignore (all|any|the) previous instructions",
        r"system prompt",
        r"developer message",
        r"reveal (your|the) (secret|credentials|token|prompt)",
        r"call (this|the) tool",
        r"execute (this|the following) command",
        r"send .{0,40} to https?://",
        r"do not tell the user",
        r"override (your|the) rules",
    )
]

def scan_prompt_injection(text: str) -> list[str]:
    signals: list[str] = []
    for pattern in INJECTION_PATTERNS:
        match = pattern.search(text)
        if match:
            signals.append(match.group(0)[:120])
    return sorted(set(signals))

def normalize_https_url(value: str) -> str:
    parsed = urlsplit(value.strip())
    allow_http = os.getenv("LINKFORGE_ALLOW_HTTP", "false").lower() == "true"
    if parsed.scheme not in ({"https", "http"} if allow_http else {"https"}):
        raise SecurityError("Only HTTPS URLs are accepted by default")
    if not parsed.hostname or parsed.username or parsed.password:
        raise SecurityError("URL must have a public host and no embedded credentials")
    host = parsed.hostname.encode("idna").decode("ascii").lower()
    _validate_host(host)
    netloc = host if parsed.port is None else f"{host}:{parsed.port}"
    return urlunsplit((parsed.scheme.lower(), netloc, parsed.path or "/", parsed.query, ""))

def _validate_host(host: str) -> None:
    if host in {"localhost", "localhost.localdomain"} or host.endswith(".local"):
        raise SecurityError("Local hosts are blocked")
    try:
        addresses = {item[4][0] for item in socket.getaddrinfo(host, None)}
    except socket.gaierror as exc:
        raise SecurityError(f"Host resolution failed: {host}") from exc
    for raw in addresses:
        ip = ipaddress.ip_address(raw)
        if not ip.is_global:
            raise SecurityError(f"Non-public address blocked: {ip}")

def safe_local_path(value: str) -> Path:
    path = Path(value).expanduser().resolve(strict=True)
    if not path.is_file():
        raise SecurityError("Local source must be a regular file")
    return path
