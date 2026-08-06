# Operations Runbook

## Health check

```bash
curl --fail http://localhost:8787/health
```

A healthy response has `ok: true`, 23 registry items, and ecosystem total 135.

## Common failures

### Catalog validation fails

Run:

```bash
pnpm validate:catalog
```

Check catalog counts, duplicate IDs, manifest schema violations, and missing handler mappings.

### Capability returns HTTP 422

Inspect the structured `errors` and `warnings` fields. Confirm the registry item is active, its handler exists, input JSON is valid, and the selected workspace is writable.

### API cannot start

Check Node.js version, dependency installation, port `8787`, and environment configuration.

## Incident handling

1. Preserve logs without secret values.
2. Classify impact and affected capabilities.
3. Disable a manifest only when continued execution is unsafe.
4. Restore service with the smallest reversible change.
5. Record evidence and unknowns.
6. Publish a post-incident note for material customer impact.
