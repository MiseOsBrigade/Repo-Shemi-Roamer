from __future__ import annotations
import json
import re
from pathlib import Path
import yaml
from .fetch import fetch
from .hashing import sha256_file, sha256_text, write_sums
from .render import payload, write_packet_files
from .summarize import summarize

def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")[:80] or "source"

def capture(source: str, output: Path, *, provider: str="auto") -> dict[str, object]:
    output.mkdir(parents=True, exist_ok=True)
    document = fetch(source)
    summary = summarize(document, provider=provider)
    content_hash = sha256_text(document.text)
    source_path = output/"source.txt"
    source_path.write_text(document.text.rstrip()+"\n", encoding="utf-8")
    data = payload(document, summary, content_hash)
    generated = [source_path, *write_packet_files(output, data)]
    manifest = {
        "schema_version":"1.0", "pipeline":"linkforge-core", "brand":"MiseOS LinkForge",
        "source":{"input":source,"normalized":document.normalized_source,"title":document.title,"content_sha256":content_hash},
        "processing":{"retrieved_at":document.retrieved_at,"extractor":document.extractor,"summarizer":summary.method,"warnings":document.warnings,"injection_signals":document.injection_signals},
        "outputs":{path.name:sha256_file(path) for path in generated},
    }
    manifest_json=output/"manifest.json"; manifest_json.write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
    manifest_yaml=output/"manifest.yaml"; manifest_yaml.write_text(yaml.safe_dump(manifest,sort_keys=False),encoding="utf-8")
    generated += [manifest_json,manifest_yaml]
    sums=write_sums(output,generated)
    return {"output":str(output),"title":document.title,"method":summary.method,"files":[str(x) for x in [*generated,sums]]}
