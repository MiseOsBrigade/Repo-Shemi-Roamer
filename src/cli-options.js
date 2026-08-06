export const HELP_TEXT = `Repo Shemi Roamer

Usage:
  shemi [root] [options]

Options:
  --character=<id>    Select a mascot profile
  --max-depth=<n>     Maximum traversal depth (default: 5)
  --tick=<ms>         Delay between live steps (default: 700)
  --steps=<n>         Run a finite number of steps
  --seed=<value>      Use deterministic traversal
  --peek              Read the first useful line of safe small text files
  --json              Emit JSON Lines instead of terminal UI
  --show-hidden       Include hidden entries except ignored or secret paths
  --list-characters   Print available mascot profiles
  --help              Print this help
  --version           Print the package version
`;

export function parseArgs(argv) {
  const options = {
    root: ".",
    character: "orchestra-core",
    maxDepth: 5,
    tickMs: 700,
    steps: null,
    seed: null,
    peek: false,
    json: false,
    showHidden: false,
    listCharacters: false,
    help: false,
    version: false
  };

  for (const arg of argv) {
    if (arg.startsWith("--character=")) options.character = arg.slice("--character=".length);
    else if (arg.startsWith("--max-depth=")) options.maxDepth = Number(arg.slice("--max-depth=".length));
    else if (arg.startsWith("--tick=")) options.tickMs = Number(arg.slice("--tick=".length));
    else if (arg.startsWith("--steps=")) options.steps = Number(arg.slice("--steps=".length));
    else if (arg.startsWith("--seed=")) options.seed = arg.slice("--seed=".length);
    else if (arg === "--peek") options.peek = true;
    else if (arg === "--json") options.json = true;
    else if (arg === "--show-hidden") options.showHidden = true;
    else if (arg === "--list-characters") options.listCharacters = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--version" || arg === "-v") options.version = true;
    else if (!arg.startsWith("--")) options.root = arg;
    else throw new Error(`Unknown option: ${arg}`);
  }

  if (!Number.isInteger(options.maxDepth) || options.maxDepth < 1) {
    throw new Error("--max-depth must be a positive integer");
  }
  if (!Number.isInteger(options.tickMs) || options.tickMs < 100) {
    throw new Error("--tick must be an integer of at least 100 milliseconds");
  }
  if (options.steps !== null && (!Number.isInteger(options.steps) || options.steps < 1)) {
    throw new Error("--steps must be a positive integer");
  }

  return options;
}
