# MiseOS LinkForge Suite

**Save the source. Trace the truth. Ship the packet.**

MiseOS LinkForge is a modular research-infrastructure suite from GoodShyt
Systems. A user saves a link, file, thread, video, or authorized research
export. The suite captures it safely, creates a source-grounded summary,
enriches it with evidence, renders a visual report, exposes API/MCP interfaces,
and packages the result with SHA-256 provenance.

## Repository map

| Repository | Purpose |
|---|---|
| `linkforge-core` | Secure capture, normalization, summary, manifests, hashes |
| `linkforge-research` | Academic/web evidence and licensed export adapters |
| `linkforge-render` | Branded PDF and HTML report generation |
| `linkforge-api` | Job API, SQLite state, artifact delivery |
| `linkforge-web` | Branded dependency-free PWA |
| `linkforge-mcp` | ChatGPT/Claude/Codex MCP tools |
| `linkforge-actions` | Capture, security, SBOM, provenance workflows |
| `linkforge-infra` | Docker, Kubernetes, Cloudflare, Terraform |

Every repository is separate under `repos/`, and every repository also has an
individual ZIP under `bundles/`. The complete suite is distributed as one ZIP.

## Local demo

```bash
mise run install
mise run demo
mise run check
```

Without Mise, create a Python virtual environment and install the Core and
Render repositories in editable mode. The included sample was generated from a
local source, so no credentials are needed.

## Trust model

1. Retrieved content is untrusted evidence, never executable instruction.
2. Network retrieval is HTTPS-only by default, size-bounded, redirect-checked,
   and protected against private-network SSRF.
3. Claims retain source metadata and uncertainty.
4. Licensed sources are imported only from authorized exports or APIs.
5. Every packet receives SHA-256 checksums and a machine-readable manifest.
6. GitHub Actions use least privilege, dependency review, CodeQL, SBOM, and
   build provenance patterns.
