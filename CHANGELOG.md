# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Planned

- Additional mascot profiles.
- Browser overlay and GitHub Pages visualization.
- Pluggable event sinks.

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
