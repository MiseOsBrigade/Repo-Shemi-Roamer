# Operations

## Security model

- Network access is denied by default in registry metadata.
- The runner accepts only named internal tasks; it never interpolates shell commands.
- File-producing handlers resolve paths against a configured workspace and reject traversal.
- Attestation uses a secret supplied by environment variable and performs timing-safe comparison.
- The container runs as a non-root user with a read-only filesystem in Compose.
- API payloads are capped at 1 MiB and requests are rate-limited.

## Deployment

Build and run:

```bash
docker build -t miseos-registry:1.0.0 .
docker run --rm -p 8787:8787 \
  -e MISEOS_ATTESTATION_SECRET='replace-with-a-long-random-secret' \
  miseos-registry:1.0.0
```

## Release gates

1. Update package and manifest versions.
2. Run `make verify`.
3. Confirm all 23 manifests validate.
4. Tag `vX.Y.Z`; the container workflow publishes to GHCR.
5. Publish language packages only through dedicated release adapters using OIDC or scoped tokens.

## Marketplace and billing

The catalog includes pricing and marketplace fields but does not pretend remote publication occurred. Implement publication as idempotent adapters with dry-run mode, audit events, retry policies, and secret-manager integration.
