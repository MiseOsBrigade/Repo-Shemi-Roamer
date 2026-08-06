# Security Policy

## Reporting a vulnerability

Use GitHub's private security advisory flow for this repository. Do not open a public issue for suspected vulnerabilities and do not include secret values in any report.

Include affected version or commit, impact, reproduction steps, required permissions, and sanitized evidence. Maintainers will acknowledge and triage reports according to severity and available project capacity.

## Supported versions

The latest tagged release and `main` receive security fixes during developer preview. Older releases may require upgrading to receive a fix.

## Security boundaries

- Capabilities execute through explicit handler mappings.
- Arbitrary shell execution is outside the core runtime.
- Filesystem operations must remain inside the selected workspace.
- Network, process, and secret access must be minimized and documented.
- Secrets belong in deployment secret stores or environment adapters, never manifests.
- Credential rotation, history rewriting, production deployment changes, and destructive database operations require explicit human approval.

## Deployment responsibilities

Operators must configure TLS, authentication, origin policy, rate limits, logging, backups, secret management, dependency scanning, and network isolation appropriate to their environment. The included local API is not a complete public multi-tenant security perimeter.
