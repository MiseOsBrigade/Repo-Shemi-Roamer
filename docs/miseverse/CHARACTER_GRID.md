# Character Grid Integration

The eight supplied character cards are integrated as first-class Miseverse operators.

| ID | Character | Role | Station | Primary signals |
|---|---|---|---|---|
| `kurogami-senpai` | Kurogami Senpai | Chef de Cuisine | Grid Orchestration Layer | plan, orchestrate, deploy, release |
| `kuro-guard` | Kuro Guard | Steward | Security Gateway | monitor, protect, audit, attest |
| `iron-hashi` | Iron Hashi | Boucher | Validation Forge | validate, checksum, test, confirm |
| `scale-oni` | Scale Oni | Rôtisseur | Optimization Forge | profile, optimize, scale, benchmark |
| `seira` | Seira | Sommelier | Release Lounge | curate, package, release, celebrate |
| `streama` | Streama | Data Stream Chef | Data Streams | ingest, normalize, stream, observe |
| `build-kun` | Build-Kun | Boulanger | Build Workshop | build, package, containerize, deploy |
| `umami-code` | Umami Code | Saucier | Studio | compose, refactor, integrate, document |

## Interaction contract

A character can be selected from the world map or accessible roster. Selection reveals metadata and a visual simulation of the character's allowlisted workflow labels. The simulation is intentionally non-executing and does not imply a repository mutation or external action.

The generated world artwork is stored at `assets/miseverse-grid-world.webp`. The original supplied card files are represented in the composite and tracked by SHA-256 provenance records in `data/source-assets.json`; they are not executable assets.
