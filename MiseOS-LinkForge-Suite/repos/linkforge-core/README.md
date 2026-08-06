# LinkForge Core

The deterministic capture engine for MiseOS LinkForge. It accepts HTTPS URLs,
local text/Markdown/HTML/PDF files, X post URLs, and supported media URLs. It
normalizes content, scans for indirect prompt-injection signals, creates a
structured summary, and writes a verifiable packet.

## Outputs

`source.txt`, `report.md`, `report.json`, `report.yaml`, `report.txt`,
`manifest.json`, `manifest.yaml`, and `sha256sums.txt`.

## Quick start

```bash
python -m pip install -e '.[all,dev]'
linkforge capture ./examples/github-security-settings.txt --output artifacts/demo
linkforge verify artifacts/demo
```

OpenAI synthesis is optional. Without credentials, the deterministic extractive
engine remains available. External source text is delimited and treated only as
data.
