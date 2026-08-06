<div align="center">

# MiseOS Developer Platform

### Character-native agent operations for governed, measurable digital work

[![CI](https://github.com/MiseOsBrigade/Repo-Shemi-Roamer/actions/workflows/miseos-platform-ci.yml/badge.svg)](https://github.com/MiseOsBrigade/Repo-Shemi-Roamer/actions/workflows/miseos-platform-ci.yml)
[![Security](https://github.com/MiseOsBrigade/Repo-Shemi-Roamer/actions/workflows/miseos-platform-security.yml/badge.svg)](https://github.com/MiseOsBrigade/Repo-Shemi-Roamer/actions/workflows/miseos-platform-security.yml)
[![Node](https://img.shields.io/badge/node-%3E%3D20.11-339933?logo=nodedotjs&logoColor=white)](package.json)
[![pnpm](https://img.shields.io/badge/pnpm-9.15.4-F69220?logo=pnpm&logoColor=white)](package.json)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-developer%20preview-orange)](CHANGELOG.md)

**112 character agents + 23 registry manifests = 135 ecosystem items.**  
The ecosystem is not 135 characters.

[Quick start](#quick-start) · [Architecture](#architecture) · [Capabilities](#capabilities) · [Documentation](#documentation) · [Contributing](CONTRIBUTING.md)

</div>

---

## What is MiseOS?

MiseOS is a provider-neutral developer platform for turning recognizable character identities into bounded software agents with explicit capabilities, permissions, evidence, and operational controls.

The current release provides a runnable registry control plane: a canonical JSON catalog, 23 capability manifests, a TypeScript runtime with explicit handler mappings, a Fastify API, and a CLI. It is the foundation for GridOps, repository-aware GitHub agents, private registries, and a participation marketplace.

> **Core principle:** identity makes an agent understandable; capability makes it useful; authority makes it safe; evidence makes it trustworthy.

## Table of contents

- [Quick start](#quick-start)
- [Capabilities](#capabilities)
- [Three-layer ecosystem](#three-layer-ecosystem)
- [Architecture](#architecture)
- [API](#api)
- [CLI](#cli)
- [Configuration](#configuration)
- [Validation](#validation)
- [Security model](#security-model)
- [Monetization path](#monetization-path)
- [Documentation](#documentation)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Releases and support](#releases-and-support)
- [License](#license)

## Quick start

### Requirements

- Node.js `>=20.11`
- Corepack
- pnpm `9.15.4`

```bash
git clone https://github.com/MiseOsBrigade/Repo-Shemi-Roamer.git
cd Repo-Shemi-Roamer/MiseOS-developer-platform
corepack enable
pnpm install
pnpm verify
pnpm dev
```

The API starts at `http://localhost:8787`.

```bash
curl --fail http://localhost:8787/health
curl --fail http://localhost:8787/v1/catalog
```

Execute a capability:

```bash
curl --fail-with-body \
  -X POST http://localhost:8787/v1/execute/miseos.analytics-engine \
  -H 'content-type: application/json' \
  -d '{"values":[4,8,15,16,23,42]}'
```

## Capabilities

- Canonical catalog plus 23 versioned registry manifests.
- JSON Schema validation and ecosystem-count invariants.
- Explicit TypeScript handler for every registry item.
- Workspace-scoped execution with traversal protection.
- Fastify REST API with security headers, rate limiting, health, lookup, execution, and OpenAPI routes.
- CLI for discovery, validation, diagnostics, and execution.
- Policy, trust, release, workflow, repository-health, SBOM, analytics, documentation, and package-adapter capabilities.
- Unit and integration tests, Docker image, Compose, CI, security scanning, and release automation.

See [the complete capability map](docs/product/CAPABILITIES.md).

## Three-layer ecosystem

```text
┌────────────────────────────────────────────────────────────┐
│ Layer 1: Character IP                                      │
│ Identity, stories, cards, games, education, community      │
├────────────────────────────────────────────────────────────┤
│ Layer 2: Agent Utility — the product core                  │
│ Capabilities, tools, memory, permissions, proof, metrics   │
├────────────────────────────────────────────────────────────┤
│ Layer 3: Participation Economy                             │
│ Publishing, marketplace, reputation, rewards, licensing   │
└────────────────────────────────────────────────────────────┘
```

Layer 2 connects emotional understanding to practical and commercial value. Read the [three-layer ecosystem model](docs/product/THREE-LAYER-ECOSYSTEM.md).

## Architecture

```text
registry/registry-catalog.manifest.json   canonical source
registry/manifests/*.manifest.json        distributable records
packages/core/                            validation, runtime, handlers
apps/api/                                 REST control plane
apps/cli/                                 operator CLI
docs/                                     product and operator guidance
examples/                                 copy-paste usage
```

The runtime maps each manifest's `runtime.handler` to an allowlisted implementation. It does not execute arbitrary shell commands. Generated files are confined to the selected workspace.

See [Architecture](docs/architecture/ARCHITECTURE.md) and [Architecture Decisions](docs/architecture/DECISIONS.md).

## API

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/health` | Runtime and catalog health |
| `GET` | `/v1/catalog` | Canonical registry catalog |
| `GET` | `/v1/registry/:id` | Retrieve one manifest |
| `POST` | `/v1/execute/:id` | Execute an allowlisted capability |
| `GET` | `/v1/openapi.json` | OpenAPI description |

## CLI

```bash
pnpm miseos catalog list
pnpm miseos catalog list --json
pnpm miseos catalog validate
pnpm miseos doctor
pnpm miseos run miseos.repo-reliability-kit \
  --input '{"signals":{"tests":true,"branchProtection":true}}'
```

## Configuration

Copy `.env.example` to `.env` only when an adapter requires configuration.

```bash
cp .env.example .env
```

The local catalog and bounded handlers require no model-provider or billing credential. Future GitHub, model, storage, signing, and billing integrations must be implemented as scoped adapters.

## Validation

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm validate:catalog
pnpm build
```

Run the full gate:

```bash
pnpm verify
```

No check should be reported as successful unless it actually ran and its output was observed. See the [Autonomous Repository Steward](docs/governance/AUTONOMOUS-REPOSITORY-STEWARD.md).

## Security model

- Deny-by-default network intent in manifests.
- Workspace-scoped filesystem operations.
- Explicit handler allowlist.
- No secret values in manifests or committed environment files.
- Tiered authority for autonomous repository changes.
- Proof gates separate model confidence from verified evidence.
- Private vulnerability reporting through GitHub Security Advisories.

Read [SECURITY.md](SECURITY.md) before deploying or adding an integration.

## Monetization path

The open developer core supports a commercial ladder: Community, Pro, Team, Enterprise, and Marketplace. Potential metering includes executions, runner minutes, model usage, private items, active repositories, seats, and proof-gate runs.

Billing remains outside the core runtime and may authorize access but never bypass security or evidence requirements. See [Monetization Architecture](docs/monetization/MONETIZATION.md).

## Documentation

- [Product brief](docs/product/PRODUCT-BRIEF.md)
- [Capabilities](docs/product/CAPABILITIES.md)
- [AI model taxonomy](docs/product/AI-MODEL-TAXONOMY.md)
- [Three-layer ecosystem](docs/product/THREE-LAYER-ECOSYSTEM.md)
- [Architecture](docs/architecture/ARCHITECTURE.md)
- [Operations](docs/OPERATIONS.md)
- [Runbook](docs/operations/RUNBOOK.md)
- [Release process](docs/operations/RELEASES.md)
- [Registry capabilities](docs/REGISTRY-CAPABILITIES.md)
- [Repository steward](docs/governance/AUTONOMOUS-REPOSITORY-STEWARD.md)
- [Agent guide](docs/agent-guides/CLAUDE.md)

## Roadmap

### Release 1 — Registry foundation

- [x] Canonical catalog and schema
- [x] Bounded capability runtime
- [x] CLI and API
- [x] Tests, container, and CI

### Release 2 — Repository operations

- [ ] GitHub App authentication and webhook ingestion
- [ ] Pull Request Guardian
- [ ] Workflow Medic and Release Sentinel integration
- [ ] Evidence-backed pull-request summaries
- [ ] GridOps repository dashboard

### Release 3 — Hosted team platform

- [ ] PostgreSQL persistence and organization model
- [ ] RBAC, approvals, and audit history
- [ ] Managed runners and model routing
- [ ] Usage metering and subscriptions
- [ ] Private registries

### Release 4 — Participation marketplace

- [ ] Publisher verification
- [ ] Signed manifests and provenance
- [ ] Agent and workflow licensing
- [ ] Contributor reputation and build quests
- [ ] Enterprise Brigade packs

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md), the [Code of Conduct](CODE_OF_CONDUCT.md), and the [agent guide](docs/agent-guides/CLAUDE.md). Every capability change requires a manifest, handler, tests, permissions, documentation, and evidence.

## Releases and support

- Release history: [CHANGELOG.md](CHANGELOG.md)
- Release procedure: [docs/operations/RELEASES.md](docs/operations/RELEASES.md)
- Bugs and feature requests: GitHub Issues
- Vulnerabilities: private GitHub Security Advisory, as described in [SECURITY.md](SECURITY.md)

## License

Licensed under the [MIT License](LICENSE). Character artwork, names, trademarks, and third-party assets may require separate rights notices before public or commercial distribution.
