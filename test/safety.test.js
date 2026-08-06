import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import {
  isAllowedHiddenName,
  isIgnoredEntry,
  isSecretish,
  maskPath,
  truncate
} from "../src/safety.js";

test("secret-like path segments are detected and redacted", () => {
  const root = path.resolve("/tmp/example");
  const target = path.join(root, "config", ".env.production", "value.txt");
  assert.equal(isSecretish(target), true);
  assert.equal(maskPath(target, root), "config/[redacted]/value.txt");
});

test("safe hidden project directories remain discoverable", () => {
  assert.equal(isAllowedHiddenName(".github"), true);
  assert.equal(isAllowedHiddenName(".env"), false);
});

test("ignored system paths are skipped relative to the traversal root", () => {
  assert.equal(isIgnoredEntry("/var/log/app.log", "log", "/"), true);
  assert.equal(isIgnoredEntry("/workspace/src", "src", "/workspace"), false);
});

test("truncate handles short and long values", () => {
  assert.equal(truncate("abc", 4), "abc");
  assert.equal(truncate("abcdef", 4), "abc…");
});
