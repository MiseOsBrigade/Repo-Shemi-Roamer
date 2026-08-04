# Repo Shemi Roamer 🍜

A Shimeji-style terminal mascot that safely roams your repository or container filesystem. Repo Shemi explores directory and file metadata, never writes anything, and emits structured JSON Lines events that are ready for CI pipelines and automation.

---

## Contents

- [Quickstart](#quickstart)
- [Requirements](#requirements)
- [Install](#install)
- [Commands](#commands)
- [CLI reference](#cli-reference)
- [Characters](#characters)
- [Safety model](#safety-model)
- [JSON Lines and automation](#json-lines-and-automation)
- [Architecture](#architecture)
- [Testing and CI](#testing-and-ci)
- [Troubleshooting](#troubleshooting)

---

## Quickstart

```bash
# Install
npm install

# Watch the mascot roam the current repository
npm run roam:repo

# Run a bounded, deterministic demo (no TTY required)
npm run demo

# Emit structured JSON Lines for pipelines
npm run demo:jsonl
```

---

## Requirements

- **Node.js ≥ 20** (LTS or newer)
- No runtime dependencies — only Node.js built-ins are used.

---

## Install

```bash
# From source
git clone https://github.com/MiseOsBrigade/Repo-Shemi-Roamer.git
cd Repo-Shemi-Roamer
npm install
```

After installation the `shemi` binary is available via `npx` or directly:

```bash
npx shemi --help
node bin/shemi-roamer.mjs --help
```

---

## Commands

| Script | Command | Purpose |
|---|---|---|
| `npm start` | `node bin/shemi-roamer.mjs .` | Start live roaming in the current directory |
| `npm run roam:repo` | `node bin/shemi-roamer.mjs . --max-depth=6 --tick=650` | Live repo roam, depth 6, 650 ms tick |
| `npm run roam:container` | `node bin/shemi-roamer.mjs / --max-depth=4 --tick=800` | Live container filesystem roam |
| `npm run demo` | `node bin/shemi-roamer.mjs . --steps=8 --seed=miseos` | Bounded 8-step deterministic demo |
| `npm run demo:jsonl` | `node bin/shemi-roamer.mjs . --steps=8 --seed=miseos --json` | Same demo, JSON Lines output |
| `npm run list:characters` | `node bin/shemi-roamer.mjs --list-characters` | Print all available mascot profiles |
| `npm test` | `node --test` | Run the built-in Node.js test suite |
| `npm run check` | `node --check bin/shemi-roamer.mjs && node --test` | Full pre-commit validation |

---

## CLI reference

```text
shemi [root] [options]
```

`root` defaults to `.` (current directory) when omitted.

| Option | Type / Example | Behavior |
|---|---|---|
| `--character=<id>` | string, e.g. `kurogami-senpai` | Select a mascot profile (default: `orchestra-core`) |
| `--max-depth=<n>` | positive integer (default: `5`) | Maximum traversal depth from root |
| `--tick=<ms>` | integer ≥ 100 (default: `700`) | Milliseconds between live steps |
| `--steps=<n>` | positive integer | Run exactly *n* steps then exit; required in non-TTY mode without `--json` |
| `--seed=<value>` | any string, e.g. `ci` | Seed the PRNG for fully deterministic, reproducible runs |
| `--peek` | flag | Read the first useful line of safe small text files (see [Safety model](#safety-model)) |
| `--json` | flag | Emit one JSON Lines object per step instead of the terminal UI |
| `--show-hidden` | flag | Include hidden entries (those starting with `.`) except ignored or secret-like paths |
| `--list-characters` | flag | Print all mascot profiles and exit |
| `--help`, `-h` | flag | Print usage and exit |
| `--version`, `-v` | flag | Print package version and exit |

**Validation rules enforced at startup:**

- `--max-depth` must be a positive integer (no `NaN`, `0`, or `Infinity`).
- `--tick` must be an integer of at least `100` ms.
- `--steps` must be a positive integer when provided.
- Any unrecognised `--flag` throws an error with the option name.

---

## Characters

List available profiles:

```bash
node bin/shemi-roamer.mjs --list-characters
```

| ID | Name | Sprite | Kitchen role | Repository bias |
|---|---|---|---|---|
| `orchestra-core` | Orchestra Core | 🍜 | Chef Spirit | Root docs, `package.json`, `.github` |
| `kurogami-senpai` | Kurogami Senpai | 🥢 | Chef de Cuisine | `src/`, `bin/`, `.github/` |
| `seira` | Seira | 🧂 | Sommelier | `config/`, `infra/`, auth and security paths |
| `build-kun` | Build-Kun | 🏗️ | Boulanger | `docker/`, `build/`, `dist/`, `bin/` |

Unknown character IDs fall back silently to `orchestra-core`. Characters influence weighted traversal scoring only; they do not grant extra capabilities or bypass safety controls.

---

## Safety model

Repo Shemi is intentionally incapable of filesystem mutation.

### What it does

- Uses only `lstat`, `readdir`, and (when `--peek` is explicitly enabled) a constrained `readFile`.
- Never writes, deletes, renames, moves, changes permissions, or executes any file.

### Hidden path handling

- Hidden entries (names starting with `.`) are **excluded by default**.
- Safe project metadata directories — `.github`, `.devcontainer`, `.changeset` — are **always visible**.
- Pass `--show-hidden` to include all other hidden entries, except paths that are ignored or secret-like.

### Secret-like redaction

Any path segment that matches the following pattern is treated as secret-like:

```
.env, secret, token, credential, private_key, id_rsa, id_dsa,
*.pem, *.p12, *.key, kubeconfig, password, passwd, auth.json
(case-insensitive)
```

- Secret-like absolute paths are emitted as `[redacted]` in the `path` field of every JSON event.
- Each secret-like segment in `displayPath` is individually replaced with `[redacted]`.
- `--peek` is silently skipped for secret-like paths regardless of file type or size.

### Symlink behaviour

Symbolic links are **never followed**. They are filtered out before any directory listing is scored or traversed.

### Ignored paths

The following names and paths are always skipped, regardless of `--show-hidden`:

**Ignored directory names:** `.git`, `node_modules`, `.next`, `.turbo`, `.cache`, `dist`, `build`, `coverage`, `__pycache__`, `.venv`, `venv`, `proc`, `sys`, `dev`, `run`, `tmp`

**Ignored path prefixes (relative to root):** `var/lib`, `var/cache`, `var/log`

### `--peek` constraints

When `--peek` is enabled, a file is only read if **all** of the following conditions are met:

1. `--peek` is explicitly passed on the command line.
2. The file extension is one of: `.js .mjs .cjs .ts .tsx .jsx .py .go .rs .java .cs .php .rb .md .mdx .txt .json .yaml .yml .toml .html .css` — or the basename is exactly `Dockerfile`.
3. The file is not secret-like (see above).
4. The file size is **≤ 80,000 bytes**.
5. The file is a regular file (not a symlink, directory, or special file).

The value emitted in the `peek` field is the **first non-empty, non-comment line** of the file (truncated to 100 characters). Lines starting with `//` or `#` are skipped. If no such line exists the value is `[empty or comments only]`.

### Non-goals

- Repo Shemi is **not** a sandbox or security boundary.
- It is **not** a substitute for operating-system access controls.
- It provides **no** network access, process execution, or privilege escalation.

Run it with the minimum filesystem permissions required for the target directory.

---

## JSON Lines and automation

Use `--json` to emit one JSON object per line (JSON Lines / NDJSON), suitable for `jq`, log aggregators, or CI artefacts.

### Event schema

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

When `--peek` is active and a file is successfully read, a `"peek"` string field is added to the event.

### Deterministic runs with `--seed`

Passing `--seed=<value>` replaces `Math.random` with a seeded PRNG (Mulberry32 variant). The same seed always produces the same traversal sequence for the same directory tree, making demos and CI assertions reproducible.

```bash
node bin/shemi-roamer.mjs . --steps=5 --seed=ci --json
```

### Bounded runs with `--steps`

`--steps=<n>` causes the process to exit cleanly after exactly *n* steps. This is the recommended mode for CI pipelines and scripts where a persistent live process is not appropriate.

```bash
# CI pipeline example: emit 10 JSON events and validate with jq
node bin/shemi-roamer.mjs . --steps=10 --seed=pipeline --json \
  | jq -r '.displayPath'
```

### Pipe-safe behaviour

In non-TTY environments without `--json` **and** without `--steps`, the process throws an error immediately:

```
Live terminal mode requires a TTY. Use --steps=<n> or --json.
```

This prevents silent hangs in scripts and CI runners.

---

## Architecture

```text
Repo-Shemi-Roamer/
├── bin/
│   └── shemi-roamer.mjs   # CLI entrypoint; argument parsing, run loop, signal handling
├── src/
│   ├── index.js           # RepoRoamer class, step logic, event construction, formatEventLine
│   ├── safety.js          # Ignore lists, secret-like detection, hidden-name rules, maskPath, truncate
│   ├── characters.js      # Character roster, findCharacter, listCharacters
│   ├── random.js          # createRandom — seeded PRNG (Mulberry32) or Math.random passthrough
│   ├── cli-options.js     # HELP_TEXT constant, parseArgs with validation
│   └── terminal-renderer.js # clearScreen, hideCursor, showCursor, renderTerminal
├── test/
│   ├── cli.test.js
│   ├── roamer.test.js
│   └── safety.test.js
├── .github/
│   └── workflows/
│       └── shemi-roamer.yml
├── CHANGELOG.md
├── LICENSE
├── README.md
└── package.json
```

### Module map

| Module | Responsibility |
|---|---|
| `bin/shemi-roamer.mjs` | Parses `process.argv`, dispatches info commands, runs bounded or live loop, handles SIGINT/SIGTERM |
| `src/index.js` | `RepoRoamer` class — initialise, step, weighted candidate selection, peek, event construction |
| `src/safety.js` | Ignore lists, `isSecretish`, `isHiddenName`, `isIgnoredEntry`, `maskPath`, `truncate` |
| `src/characters.js` | Immutable character roster, `findCharacter`, `listCharacters` |
| `src/random.js` | `createRandom(seed)` — returns a seeded PRNG or `Math.random` when seed is absent |
| `src/cli-options.js` | `HELP_TEXT` string, `parseArgs(argv)` with strict validation |
| `src/terminal-renderer.js` | ANSI cursor and screen helpers, `renderTerminal` for the live TUI |

---

## Testing and CI

### Local validation

```bash
# Run the Node.js built-in test suite
npm test

# Syntax check the CLI entrypoint + run tests
npm run check

# Quick bounded smoke run (JSON output, no TTY required)
node bin/shemi-roamer.mjs . --steps=3 --seed=ci --json
```

### GitHub Actions workflow

The workflow at `.github/workflows/shemi-roamer.yml` runs on every push and pull request with **read-only** repository permissions.

| Step | What it does |
|---|---|
| Checkout | Shallow clone |
| Set up Node.js | Matrix: Node.js **20**, **22**, **24** |
| Install | `npm install --ignore-scripts` |
| Validate | `npm run check` (syntax + tests) |
| Demo | `npm run demo` (bounded 8-step seeded run) |

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Live terminal mode requires a TTY. Use --steps=<n> or --json.` | Running in a non-TTY shell (script, CI, pipe) without bounded or JSON mode | Add `--steps=<n>` or `--json` |
| `Unknown option: --foo` | Unrecognised flag passed to CLI | Check spelling; see `--help` for valid options |
| `Root must be an existing directory: <path>` | The `root` argument does not point to an existing directory | Pass a valid path, e.g. `node bin/shemi-roamer.mjs .` |
| Directory silently skipped / mascot never enters a folder | The directory matches an ignored name (`node_modules`, `dist`, etc.) or an ignored path prefix | Expected behaviour; see [Ignored paths](#ignored-paths) |
| Permission denied during traversal | OS denies `readdir` on a directory | Repo Shemi catches the error, emits `"avoids a locked room"` event, and moves on — no crash |
| `--peek` returns nothing for a file | File is secret-like, binary, >80 KB, or has only comments/empty lines | Expected behaviour; see [`--peek` constraints](#--peek-constraints) |
