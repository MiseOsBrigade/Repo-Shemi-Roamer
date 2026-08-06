# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Planned

- Pluggable event sinks.
- Authenticated workflow executor adapters kept separate from visual character interactions.

## [0.2.0] - 2026-08-06

### Added

- Eight supplied MiseOS character cards represented in one optimized passive WebP world asset with source-card integrity hashes.
- Interactive Miseverse circuit-city map with accessible hotspots and roster fallback.
- Ed25519-signed hotspot manifest, trusted public-key registry, and asset-integrity verification.
- Explicit character stations, repository traversal biases, and allowlisted visual workflow labels.
- Deterministic world snapshot and JSON Lines visual replay generation.
- GitHub Pages-ready static demo surface under `docs/miseverse/`.
- Miseverse architecture, brand, schema, integration, and security documentation.

### Changed

- Expanded the backwards-compatible character registry from four profiles to nine, including the legacy Orchestra Core.
- Added a package export for the Miseverse grid model.

### Security

- Character images remain visual-only and never supply executable behavior.
- Browser simulation requires a trusted manifest, matching world-asset checksum, and explicit user consent.
- Real repository execution remains outside the browser runtime and requires separate authorization.

## [0.1.0] - 2026-08-04

### Added

- Read-only repository and container filesystem roaming.
- Modular safety, character, renderer, random, and CLI option modules.
- Optional safe `--peek` mode for small non-secret text files.
- Finite `--steps` mode for CI and demonstrations.
- Deterministic `--seed` support.
- JSON Lines output through `--json`.
- Node.js smoke and safety tests.
- GitHub Actions validation workflow.

### Security

- Secret-like paths are redacted from emitted events.
- Heavy and system-sensitive directories are skipped.
- Symbolic links are never followed.
- File content access is disabled by default.
