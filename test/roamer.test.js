import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { RepoRoamer } from "../src/index.js";

async function makeFixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "shemi-roamer-"));
  await fs.mkdir(path.join(root, "src"));
  await fs.mkdir(path.join(root, ".github", "workflows"), { recursive: true });
  await fs.writeFile(path.join(root, "README.md"), "# Fixture\n", "utf8");
  await fs.writeFile(path.join(root, "package.json"), "{\"name\":\"fixture\"}\n", "utf8");
  await fs.writeFile(path.join(root, "src", "index.js"), "export const value = 1;\n", "utf8");
  await fs.writeFile(path.join(root, ".env"), "TOKEN=do-not-read\n", "utf8");
  return root;
}

async function collect(root, seed) {
  const roamer = new RepoRoamer({ root, seed, maxDepth: 4, peek: true });
  await roamer.initialize();
  const events = [];
  for (let index = 0; index < 12; index += 1) {
    const event = await roamer.step();
    events.push({ action: event.action, displayPath: event.displayPath, peek: event.peek ?? null });
  }
  return events;
}

test("seeded traversal is reproducible", async t => {
  const root = await makeFixture();
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  assert.deepEqual(await collect(root, "miseos"), await collect(root, "miseos"));
});

test("default traversal never exposes secret path names or contents", async t => {
  const root = await makeFixture();
  t.after(() => fs.rm(root, { recursive: true, force: true }));

  const events = await collect(root, "secrets-check");
  const serialized = JSON.stringify(events);
  assert.equal(serialized.includes(".env"), false);
  assert.equal(serialized.includes("do-not-read"), false);
  assert.equal(serialized.includes("TOKEN="), false);
});

test("initialize rejects a missing root", async () => {
  const roamer = new RepoRoamer({ root: path.join(os.tmpdir(), "missing-shemi-root") });
  await assert.rejects(() => roamer.initialize(), /Root must be an existing directory/);
});
