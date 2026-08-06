from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

import yaml

from .html import build_html
from .pdf import build_pdf


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def update_packet_provenance(root: Path, generated: list[Path]) -> None:
    manifest_path = root / "manifest.json"
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        manifest.setdefault("outputs", {}).update({path.name: sha256(path) for path in generated})
        manifest["renderer"] = {"name": "linkforge-render", "version": "1.0.0"}
        manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        (root / "manifest.yaml").write_text(
            yaml.safe_dump(manifest, sort_keys=False), encoding="utf-8"
        )
    checksum_targets = [
        path
        for path in root.iterdir()
        if path.is_file() and path.name != "sha256sums.txt"
    ]
    (root / "sha256sums.txt").write_text(
        "".join(f"{sha256(path)}  {path.name}\n" for path in sorted(checksum_targets)),
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser(prog="linkforge-render")
    parser.add_argument("command", choices=["render"])
    parser.add_argument("report", type=Path)
    parser.add_argument("--evidence", type=Path)
    parser.add_argument("--visual", action="append", type=Path, default=[])
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    report = json.loads(args.report.read_text(encoding="utf-8"))
    evidence = (
        json.loads(args.evidence.read_text(encoding="utf-8")) if args.evidence else None
    )
    args.output.mkdir(parents=True, exist_ok=True)
    pdf_path = args.output / "report.pdf"
    html_path = args.output / "report.html"
    build_pdf(report, pdf_path, evidence, args.visual)
    build_html(report, html_path, evidence)
    update_packet_provenance(args.output, [pdf_path, html_path])
    print(json.dumps({"pdf": str(pdf_path), "html": str(html_path)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
