# Agent Guide

## Repository objective

Maintain a secure, provider-neutral registry and bounded runtime for MiseOS developer-agent capabilities.

## Before changing code

- Read `README.md`, `docs/architecture/ARCHITECTURE.md`, and the nearest package README.
- Preserve the invariant: 112 character agents + 23 registry manifests = 135 ecosystem items.
- Never describe the ecosystem as 135 characters.
- Do not introduce arbitrary shell execution into `packages/core`.
- Keep credentials outside manifests and source control.

## Required validation

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:catalog
pnpm build
```

Use `pnpm verify` for the full sequence. Report unavailable checks as `UNKNOWN`, not successful.
