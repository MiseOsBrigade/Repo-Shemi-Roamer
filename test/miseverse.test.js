import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createPublicKey, verify } from "node:crypto";
import { CHARACTERS, findCharacter, listCharacters } from "../src/characters.js";
import { buildCharacterReplay, buildWorldSnapshot, visualCharacters } from "../src/miseverse-grid.js";

test("legacy character behavior remains compatible", () => {
  assert.equal(findCharacter("unknown").id, "orchestra-core");
  assert.equal(listCharacters()[0].id, "orchestra-core");
  assert.equal(typeof findCharacter("kurogami-senpai").kitchenRole, "string");
});

test("eight visual operators have unique identities and a shared composite world asset", () => {
  const operators = visualCharacters();
  assert.equal(operators.length, 8);
  assert.equal(new Set(operators.map(item => item.id)).size, 8);
  for (const character of operators) {
    assert.ok(character.actions.length >= 4);
    assert.ok(fs.existsSync(path.resolve(character.image)), `${character.image} should exist`);
  }
  assert.equal(new Set(operators.map(item => item.image)).size, 1);
  assert.equal(CHARACTERS.length, 9);
});

test("world snapshot maps every visual operator to a district", () => {
  const snapshot = buildWorldSnapshot();
  assert.equal(snapshot.characters.length, 8);
  assert.ok(snapshot.characters.every(character =>
    snapshot.districts.some(district => district.id === character.station)
  ));
});

test("replay remains visual-only and unauthorized", () => {
  const replay = buildCharacterReplay();
  assert.equal(replay.length, 32);
  assert.ok(replay.every(event => event.authorized === false && event.status === "allowlisted"));
});

test("committed manifest has a valid trusted Ed25519 signature", () => {
  const manifest = JSON.parse(fs.readFileSync("docs/miseverse/data/manifest.json", "utf8"));
  const trust = JSON.parse(fs.readFileSync("config/miseverse/trusted-keys.json", "utf8"));
  const { signature, ...unsigned } = manifest;
  const key = trust.keys.find(item => item.keyId === signature.keyId);
  assert.ok(key);
  assert.equal(verify(
    null,
    Buffer.from(JSON.stringify(unsigned), "utf8"),
    createPublicKey(key.publicKeySpkiPem),
    Buffer.from(signature.value, "base64")
  ), true);
});
