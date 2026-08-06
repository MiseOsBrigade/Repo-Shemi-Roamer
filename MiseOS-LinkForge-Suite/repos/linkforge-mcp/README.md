# LinkForge MCP

A tool-only Model Context Protocol server for ChatGPT, Claude, Codex, and other
MCP clients. It delegates capture jobs to LinkForge API and exposes packet
search, fetch, capture, status, artifact listing, and checksum verification.

## Tools

- `search`: search packet metadata
- `fetch`: fetch one packet as structured data
- `capture_link`: create a capture job
- `get_capture`: inspect job state
- `verify_packet`: verify SHA-256 checksums through the API/local store

## Run

```bash
python -m pip install -e '.[dev]'
linkforge-mcp --transport stdio
linkforge-mcp --transport streamable-http --host 127.0.0.1 --port 8790
```

For ChatGPT Developer Mode, expose the Streamable HTTP endpoint over HTTPS and
connect the `/mcp` URL. Keep the server behind authentication and use exact CSP
and origin allowlists when a widget is added.
