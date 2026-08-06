import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCharacterReplay, buildWorldSnapshot } from "../src/miseverse-grid.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDirectory = path.join(root, "docs", "miseverse", "data");
await fs.mkdir(dataDirectory, { recursive: true });
await fs.writeFile(
  path.join(dataDirectory, "world.json"),
  `${JSON.stringify(buildWorldSnapshot(), null, 2)}\n`,
  "utf8"
);
await fs.writeFile(
  path.join(dataDirectory, "replay.jsonl"),
  `${buildCharacterReplay().map(event => JSON.stringify(event)).join("\n")}\n`,
  "utf8"
);
console.log("Built deterministic Miseverse world and visual replay data.");
