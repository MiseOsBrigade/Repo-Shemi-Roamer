import fs from "node:fs/promises";
import path from "node:path";
import { findCharacter } from "./characters.js";
import { createRandom } from "./random.js";
import {
  CODE_EXTENSIONS,
  isAllowedHiddenName,
  isHiddenName,
  isIgnoredEntry,
  isSecretish,
  maskPath,
  relativeDepth,
  truncate
} from "./safety.js";

const FILE_PERSONALITIES = [
  { test: file => /package\.json$/i.test(file), action: "aligns the service board" },
  { test: file => /README\.md$/i.test(file), action: "studies the kitchen lore" },
  { test: file => /AGENTS\.md$|CLAUDE\.md$/i.test(file), action: "reviews the brigade instructions" },
  { test: file => /\.github|workflows/i.test(file), action: "checks the delivery pass" },
  { test: file => /Dockerfile$|\.dockerfile$/i.test(file), action: "checks the container oven" },
  { test: file => /test|spec/i.test(file), action: "tastes the quality gate" },
  { test: file => /security|policy|auth/i.test(file), action: "guards the pantry locks" },
  { test: file => /api|route|connector/i.test(file), action: "stirs the API sauce" },
  { test: file => /log|metric|event|stream/i.test(file), action: "follows the data current" },
  { test: file => /\.(js|mjs|cjs|ts|tsx|jsx)$/i.test(file), action: "checks the recipe logic" },
  { test: file => /\.(md|mdx|txt)$/i.test(file), action: "reads the station notes" },
  { test: file => /\.(ya?ml|toml|json)$/i.test(file), action: "studies the configuration spices" }
];

export class RepoRoamer {
  constructor(options = {}) {
    this.root = path.resolve(options.root ?? ".");
    this.current = this.root;
    this.maxDepth = Number.isFinite(options.maxDepth) ? options.maxDepth : 5;
    this.peek = Boolean(options.peek);
    this.showHidden = Boolean(options.showHidden);
    this.character = findCharacter(options.character ?? "orchestra-core");
    this.random = typeof options.random === "function" ? options.random : createRandom(options.seed);
    this.visited = new Set([this.root]);
    this.stepCount = 0;
  }

  async initialize() {
    const stat = await this.safeStat(this.root);
    if (!stat || !stat.isDirectory()) {
      throw new Error(`Root must be an existing directory: ${this.root}`);
    }
  }

  async safeStat(absPath) {
    try {
      return await fs.lstat(absPath);
    } catch {
      return null;
    }
  }

  async safeListDir(absPath) {
    try {
      const entries = await fs.readdir(absPath, { withFileTypes: true });
      return {
        entries: entries
          .filter(entry => this.showHidden || !isHiddenName(entry.name) || isAllowedHiddenName(entry.name))
          .filter(entry => !isIgnoredEntry(path.join(absPath, entry.name), entry.name, this.root))
          .filter(entry => !entry.isSymbolicLink())
          .sort((a, b) => {
            if (a.isDirectory() && !b.isDirectory()) return -1;
            if (!a.isDirectory() && b.isDirectory()) return 1;
            return a.name.localeCompare(b.name);
          }),
        error: null
      };
    } catch (error) {
      return {
        entries: [],
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  scoreCandidate(absPath, stat) {
    const relative = path.relative(this.root, absPath) || ".";
    const lower = relative.toLowerCase();
    let score = stat?.isDirectory() ? 5 : 2;

    for (const preferred of this.character.preferredPaths ?? []) {
      if (preferred === "." && relative === ".") score += 2;
      else if (preferred !== "." && lower.includes(preferred.toLowerCase())) score += 7;
    }

    for (const preferred of this.character.preferredFiles ?? []) {
      const target = preferred.replaceAll("*", "").toLowerCase();
      if (target && lower.includes(target)) score += 8;
    }

    if (isSecretish(relative)) score = 1;
    return Math.max(1, score);
  }

  chooseWeighted(items) {
    if (items.length === 0) return null;
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    let roll = this.random() * total;

    for (const item of items) {
      roll -= item.weight;
      if (roll <= 0) return item.value;
    }

    return items.at(-1)?.value ?? null;
  }

  async maybePeekFile(absPath) {
    if (!this.peek || isSecretish(absPath)) return null;

    const extension = path.extname(absPath).toLowerCase();
    const base = path.basename(absPath);
    if (!CODE_EXTENSIONS.has(extension) && base !== "Dockerfile") return null;

    const stat = await this.safeStat(absPath);
    if (!stat || !stat.isFile() || stat.size > 80_000) return null;

    try {
      const content = await fs.readFile(absPath, "utf8");
      const firstUsefulLine = content
        .split(/\r?\n/)
        .map(line => line.trim())
        .find(line => line && !line.startsWith("//") && !line.startsWith("#"));
      return firstUsefulLine ? truncate(firstUsefulLine, 100) : "[empty or comments only]";
    } catch {
      return null;
    }
  }

  describeFile(absPath) {
    const match = FILE_PERSONALITIES.find(rule => rule.test(absPath));
    return match?.action ?? "pokes an unfamiliar artifact";
  }

  makeEvent(action, target, extra = {}) {
    return {
      step: this.stepCount,
      at: new Date().toISOString(),
      character: {
        id: this.character.id,
        name: this.character.name,
        sprite: this.character.sprite,
        role: this.character.kitchenRole,
        responsibility: this.character.responsibility
      },
      action,
      root: this.root,
      path: isSecretish(target) ? "[redacted]" : target,
      displayPath: maskPath(target, this.root),
      visitedCount: this.visited.size,
      ...extra
    };
  }

  async step() {
    this.stepCount += 1;
    const currentStat = await this.safeStat(this.current);

    if (!currentStat) {
      const parent = path.dirname(this.current);
      this.current = parent === this.current ? this.root : parent;
      return this.makeEvent("retreats from a missing station", this.current);
    }

    if (currentStat.isFile()) {
      const previous = this.current;
      this.current = path.dirname(this.current);
      return this.makeEvent("returns to the pass", previous);
    }

    const { entries, error } = await this.safeListDir(this.current);
    if (error) {
      const previous = this.current;
      const parent = path.dirname(this.current);
      this.current = parent === this.current ? this.root : parent;
      return this.makeEvent("avoids a locked room", previous, { reason: error });
    }

    const depth = relativeDepth(this.root, this.current);
    const choices = [];

    for (const entry of entries) {
      const absolute = path.join(this.current, entry.name);
      const stat = await this.safeStat(absolute);
      if (!stat) continue;
      if (entry.isDirectory() && depth >= this.maxDepth) continue;
      if (!entry.isDirectory() && !entry.isFile()) continue;
      choices.push({ value: absolute, weight: this.scoreCandidate(absolute, stat) });
    }

    const parent = path.dirname(this.current);
    if (this.current !== this.root && parent !== this.current) {
      choices.push({ value: parent, weight: 3 });
    }

    const chosen = this.chooseWeighted(choices);
    if (!chosen) {
      if (this.current !== this.root && parent !== this.current) this.current = parent;
      return this.makeEvent("finds a dead end and turns around", this.current);
    }

    const chosenStat = await this.safeStat(chosen);
    this.current = chosen;
    this.visited.add(chosen);

    if (chosenStat?.isDirectory()) {
      return this.makeEvent("steps into the next station", chosen);
    }

    const peek = await this.maybePeekFile(chosen);
    return this.makeEvent(this.describeFile(chosen), chosen, peek ? { peek } : {});
  }
}

export function formatEventLine(event) {
  const peek = event.peek ? ` | peek: ${event.peek}` : "";
  return `${event.character.sprite} ${event.character.name} ${event.action}: ${event.displayPath}${peek}`;
}

export { listCharacters, findCharacter } from "./characters.js";
export { createRandom } from "./random.js";
