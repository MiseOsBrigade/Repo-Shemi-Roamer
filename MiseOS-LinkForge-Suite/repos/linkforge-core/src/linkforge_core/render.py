from __future__ import annotations
import json
from pathlib import Path
from typing import Any
import yaml
from .models import SourceDocument, SourceSummary

def payload(document: SourceDocument, summary: SourceSummary, content_hash: str) -> dict[str, Any]:
    return {"schema_version":"1.0","brand":"MiseOS LinkForge","source":document.to_dict(),"summary":summary.to_dict(),"provenance":{"content_sha256":content_hash}}

def markdown(data: dict[str, Any]) -> str:
    source, summary, provenance = data["source"], data["summary"], data["provenance"]
    lines = [f"# {source['title']}", "", "> MiseOS LinkForge — Save the source. Trace the truth. Ship the packet.", "", "## Executive summary", "", summary["executive_summary"], "", "## Key points", ""]
    lines += [f"- {x}" for x in summary["key_points"]]
    lines += ["", "## Sections", ""]
    for section in summary["sections"]:
        lines += [f"### {section['heading']}", "", section["details"], ""]
    for label, key in (("Actions", "actions"), ("Risks and limitations", "risks"), ("Verification questions", "verification_questions")):
        lines += [f"## {label}", ""] + [f"- {x}" for x in summary[key]] + [""]
    lines += ["## Provenance", "", f"- Source: {source['canonical_url'] or source['normalized_source']}", f"- Retrieved: {source['retrieved_at']}", f"- Extractor: {source['extractor']}", f"- Summary method: {summary['method']}", f"- Content SHA-256: `{provenance['content_sha256']}`", ""]
    return "\n".join(lines)

def write_packet_files(root: Path, data: dict[str, Any]) -> list[Path]:
    files: list[Path] = []
    for name, content in (
        ("report.json", json.dumps(data, indent=2, ensure_ascii=False)+"\n"),
        ("report.yaml", yaml.safe_dump(data, sort_keys=False, allow_unicode=True)),
        ("report.md", markdown(data)),
        ("report.txt", markdown(data).replace("# ", "").replace("## ", "").replace("### ", "")),
    ):
        path = root/name; path.write_text(content, encoding="utf-8"); files.append(path)
    return files
