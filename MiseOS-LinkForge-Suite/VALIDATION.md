# Validation Report

Validation date: 2026-08-04

## Passed

- Python bytecode compilation across all repository source trees.
- Five automated tests across Core, Research, Render, and API.
- Local editable package builds for Core, Research, Render, and API using
  setuptools without downloading dependencies.
- End-to-end local capture from source text through JSON, YAML, Markdown, text,
  manifest, and SHA-256 checksum generation.
- Branded HTML and four-page PDF rendering with three supplied source visuals.
- PDF rasterization at 150 DPI and visual inspection of the title/report page
  and source-visual pages; no clipping or overflow observed.
- Packet SHA-256 verification after the presentation artifacts were added.
- FastAPI authenticated job submission, asynchronous Core execution, status
  polling, and artifact listing.
- Authorized licensed-export adapter with a clearly marked synthetic CSV row.
- JavaScript syntax checks for the PWA, service worker, and Cloudflare Worker.
- JSON, YAML (including multi-document Kubernetes YAML), and TOML parsing.

## Not executed in this environment

- Live remote URL retrieval, because the build container could not reliably
  resolve external DNS.
- Live OpenAI, X, OpenAlex, Crossref, or Semantic Scholar requests, because
  credentials and/or network access were not available to the runtime.
- MCP runtime launch, because the `mcp` package was not installed locally.
- Ruff linting, because Ruff was not installed locally. Python compilation and
  tests were run instead.
- Terraform plan/apply, Kubernetes deployment, Cloudflare deployment, or GitHub
  repository mutations.
- Proprietary Statista, PitchBook, CB Insights, or Wiley lookups, because those
  authenticated connectors were unavailable.

These limits are operational, not hidden. The relevant adapters, schemas,
configuration, and deployment files are included for execution in an authorized
environment.
