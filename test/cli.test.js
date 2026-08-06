import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function runCli(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["bin/shemi-roamer.mjs", ...args], {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", chunk => { stdout += chunk; });
    child.stderr.on("data", chunk => { stderr += chunk; });
    child.once("error", reject);
    child.once("close", code => resolve({ code, stdout, stderr }));
  });
}

test("finite JSON mode emits valid JSON Lines", async () => {
  const result = await runCli([".", "--steps=3", "--seed=test", "--json"]);
  assert.equal(result.code, 0, result.stderr);
  const lines = result.stdout.trim().split("\n");
  assert.equal(lines.length, 3);
  for (const line of lines) {
    const event = JSON.parse(line);
    assert.equal(typeof event.step, "number");
    assert.equal(typeof event.displayPath, "string");
  }
});

test("unknown options fail clearly", async () => {
  const result = await runCli(["--not-a-real-option"]);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /Unknown option/);
});
