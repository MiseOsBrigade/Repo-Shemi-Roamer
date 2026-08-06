# Repo Shemi Roamer

A Shimeji-style terminal mascot that safely roams through a repository or container filesystem. Repo Shemi is a read-only observer: it explores metadata by default, can optionally inspect a tightly constrained first line of safe text files, and never mutates the filesystem.

## Features

- Metadata-only traversal by default.
- Secret-like path redaction and content blocking.
- No symbolic-link traversal.
- Heavy and system-sensitive directory exclusions.
- Deterministic seeded demonstrations.
- Finite CI-safe execution.
- JSON Lines event output.
- Character profiles with path preferences.
- Node.js built-in test suite with no runtime dependencies.

## Requirements

- Node.js 20 or newer.

## Install and run

```bash
npm install
npm run roam:repo
```

Or invoke the CLI directly:

```bash
node bin/shemi-roamer.mjs . --max-depth=6 --tick=650
```

Press `q` or `Ctrl+C` to stop live terminal mode.

## Commands

```bash
npm run start
npm run roam:repo
npm run roam:container
npm run demo
npm run demo:jsonl
npm run list:characters
npm test
npm run check
```

## CLI reference

```text
shemi [root] [options]

--character=<id>    Select a mascot profile
--max-depth=<n>     Maximum traversal depth
--tick=<ms>         Delay between live steps
--steps=<n>         Run a finite number of steps
--seed=<value>      Use deterministic traversal
--peek              Read the first useful line of safe small text files
--json              Emit JSON Lines instead of terminal UI
--show-hidden       Include hidden entries except ignored paths
--list-characters   Print available mascot profiles
--help              Print help
--version           Print the package version
```

## Examples

### Bounded repository demo

```bash
node bin/shemi-roamer.mjs . --steps=8 --seed=miseos
```

### Machine-readable JSON Lines

```bash
node bin/shemi-roamer.mjs . --steps=8 --seed=miseos --json
```

### Safe peeking

Peeking is disabled by default. When enabled, Repo Shemi only reads files that are:

- text-like source, configuration, or documentation files;
- smaller than 80 KB;
- not identified as secret-like;
- not reached through a symbolic link.

```bash
node bin/shemi-roamer.mjs . --steps=8 --peek
```

### Container filesystem

```bash
node bin/shemi-roamer.mjs / --max-depth=4 --tick=800
```

System-sensitive paths such as `/proc`, `/sys`, `/dev`, `/run`, `/tmp`, `/var/lib`, `/var/cache`, and `/var/log` are excluded.

## Characters

```bash
node bin/shemi-roamer.mjs --list-characters
```

| ID | Character | Role | Repository bias |
|---|---|---|---|
| `orchestra-core` | Orchestra Core | Chef Spirit | Root docs, package metadata, workflows |
| `kurogami-senpai` | Kurogami Senpai | Chef de Cuisine | Source, CLI, and automation |
| `seira` | Seira | Sommelier | Security and configuration stations |
| `build-kun` | Build-Kun | Boulanger | Build, container, and binary stations |

Unknown character IDs safely fall back to `orchestra-core`.

## Safety model

Repo Shemi is intentionally incapable of filesystem mutation.

- It only uses `lstat`, `readdir`, and optional constrained `readFile` operations.
- It never writes, deletes, renames, moves, changes permissions, or executes repository files.
- It skips symbolic links rather than resolving them.
- It excludes heavy and system-sensitive directories.
- Hidden entries are excluded by default, except safe project metadata such as `.github`.
- Secret-like names are not peeked and are redacted in emitted paths.
- `--peek` must be explicitly enabled.

This design reduces accidental exposure, but it is not a sandbox or a substitute for operating-system access controls. Run it with the least filesystem permissions required.

## Event schema

Each JSON Lines event includes:

```json
{
  "step": 1,
  "at": "2026-08-04T00:00:00.000Z",
  "character": {
    "id": "orchestra-core",
    "name": "Orchestra Core",
    "sprite": "🍜",
    "role": "Chef Spirit",
    "responsibility": "Meta-orchestration and kitchen consciousness"
  },
  "action": "studies the kitchen lore",
  "root": "/workspace/repo",
  "path": "/workspace/repo/README.md",
  "displayPath": "README.md",
  "visitedCount": 2
}
```

A secret-like absolute path is emitted as `[redacted]`, and any secret-like path segment in `displayPath` is replaced with `[redacted]`.

## GitHub Actions

The included workflow validates Node.js 20, 22, and 24, runs syntax and test checks, and executes a deterministic bounded demonstration. Workflow permissions are read-only.

## Architecture

```text
repo-shemi-roamer/
├── bin/
│   └── shemi-roamer.mjs
├── src/
│   ├── characters.js
│   ├── cli-options.js
│   ├── index.js
│   ├── random.js
│   ├── safety.js
│   └── terminal-renderer.js
├── test/
│   ├── cli.test.js
│   ├── roamer.test.js
│   └── safety.test.js
├── .github/workflows/shemi-roamer.yml
├── CHANGELOG.md
├── LICENSE
├── README.md
└── package.json
```

## Extending the roster

Add a profile to `src/characters.js` with a unique `id`, display metadata, preferred paths, and preferred files. Profiles influence weighted traversal only; they do not grant capabilities or bypass safety controls.
