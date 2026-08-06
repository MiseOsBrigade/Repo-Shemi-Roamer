# Repository Boundaries

The suite is intentionally split so that capture, research, rendering, serving,
agent access, automation, and infrastructure can be versioned and secured
independently.

- Core has no dependency on the API, UI, MCP, or deployment layer.
- Research accepts a packet and emits evidence; it never mutates the source.
- Render consumes JSON and produces presentation artifacts.
- API invokes Core as a bounded worker and serves an allowlisted artifact set.
- Web is a static client and holds API credentials only in session storage.
- MCP offers narrow tools with accurate read/write annotations.
- Actions and Infra are operational control planes, not runtime libraries.
