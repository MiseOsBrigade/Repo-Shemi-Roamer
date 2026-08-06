# Miseverse Character Grid Architecture

## Operating model

The Miseverse is a circuit-board city projected from repository and workflow records. It is not an independent source of truth.

```text
Repository files and structured events
              ↓
       Repo Shemi runtime
              ↓
   character and station mapping
              ↓
   terminal, JSONL, and web projections
```

## Core invariant

> The grid owns state. Characters visualize bounded operator roles. An animation never proves that a workflow ran.

Each operator has four explicit bindings:

1. **Station** — where the operator appears in the world.
2. **Repository bias** — which safe paths receive higher traversal weight.
3. **Allowlisted actions** — labels exposed by the visual workflow preview.
4. **Responsibility** — the human-readable reason the role exists.

## Runtime boundaries

- Repository traversal is read-only.
- Symbolic links are not followed.
- Secret-like paths are redacted and excluded from peeking.
- Character images are passive visual assets.
- The browser runtime does not use `eval`, inline scripts, hidden PNG chunks, or arbitrary workflow code.
- The web simulation changes only interface state.
- Real actions require a separate authenticated executor and audit record.

## World districts

| Station | Operator | Function |
|---|---|---|
| Grid Orchestration Layer | Kurogami Senpai | Plan and coordinate |
| Security Gateway | Kuro Guard | Policy, monitoring, audit |
| Validation Forge | Iron Hashi | Tests and checksums |
| Optimization Forge | Scale Oni | Performance and scale |
| Release Lounge | Seira | Release quality and provenance |
| Data Streams | Streama | Events and telemetry |
| Build Workshop | Build-Kun | Builds, packages, containers |
| Studio | Umami Code | Composition and integration |

## Expansion path

New characters should be added to `src/characters.js`, validated against `schemas/character.schema.json`, supplied with an optimized visual asset under `docs/miseverse/assets/` plus a provenance record, and given a station that exists in `src/miseverse-grid.js`.
