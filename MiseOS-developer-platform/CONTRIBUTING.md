# Contributing to MiseOS

## Development setup

```bash
corepack enable
pnpm install
pnpm verify
```

Use Node.js `>=20.11` and pnpm `9.15.4`.

## Change workflow

1. Create an issue for substantial features or architecture changes.
2. Branch from `main` using `feat/`, `fix/`, `docs/`, `security/`, or `release/`.
3. Make the smallest coherent change.
4. Add or update tests and documentation.
5. Run `pnpm verify`.
6. Open a pull request using the template.

## Capability contribution contract

A new registry capability must include:

- Unique, stable registry ID.
- Manifest and catalog entry.
- Typed input/output behavior.
- Explicit runtime handler mapping.
- Minimum permissions.
- Unit tests, failure tests, and catalog validation.
- Usage example and operator documentation.
- Security review when adding network, process, credential, or mutation access.

## Commit style

Use Conventional Commits:

```text
feat(api): add execution history endpoint
fix(runtime): block workspace path traversal
docs(product): explain model routing roles
security(secrets): remove tracked credential reference
```

## Pull-request evidence

Report each check as `CONFIRMED`, `INFERRED`, or `UNKNOWN`. Never mark an unavailable check as passed. Do not include secret values in logs or screenshots.

## Review expectations

Maintainers review correctness, scope, tests, compatibility, permission changes, security impact, and documentation. Cross-subsystem and breaking changes require explicit maintainer approval and migration guidance.
