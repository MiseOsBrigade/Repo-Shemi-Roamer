import fs from "node:fs/promises";
import path from "node:path";
import { createHash, createPrivateKey, createPublicKey, sign } from "node:crypto";
import { fileURLToPath } from "node:url";
import { buildWorldSnapshot } from "../src/miseverse-grid.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const privateKeyPath = process.env.MISEVERSE_PRIVATE_KEY_PATH;
const keyId = process.env.MISEVERSE_KEY_ID ?? "miseverse-release-2026-08";
if (!privateKeyPath) throw new Error("MISEVERSE_PRIVATE_KEY_PATH is required");

const worldAssetPath = "docs/miseverse/assets/miseverse-grid-world.webp";
const worldAsset = await fs.readFile(path.join(root, worldAssetPath));
const privateKey = createPrivateKey(await fs.readFile(privateKeyPath, "utf8"));
const publicKey = createPublicKey(privateKey);
const jwk = publicKey.export({ format: "jwk" });
if (typeof jwk.x !== "string") throw new Error("Unable to export Ed25519 public key");

const world = buildWorldSnapshot();
const unsigned = {
  schemaVersion: "1.0.0",
  manifestId: "miseverse-character-grid-v1",
  generatedAt: world.generatedAt,
  asset: {
    path: "assets/miseverse-grid-world.webp",
    sha256: createHash("sha256").update(worldAsset).digest("hex")
  },
  hotspots: world.characters.map(character => ({
    id: character.id,
    label: character.name,
    role: character.role,
    position: character.position,
    actionIds: character.actions
  })),
  policy: {
    visualOnly: true,
    allowlistOnly: true,
    explicitConsentRequired: true,
    imageCodeExecution: false
  }
};
const payload = Buffer.from(JSON.stringify(unsigned), "utf8");
const signature = sign(null, payload, privateKey).toString("base64");
const manifest = {
  ...unsigned,
  signature: { alg: "Ed25519", keyId, value: signature }
};
const trust = {
  schemaVersion: "1.0.0",
  keys: [{
    keyId,
    alg: "Ed25519",
    publicKeyRawBase64Url: jwk.x,
    publicKeySpkiPem: publicKey.export({ format: "pem", type: "spki" }).toString()
  }]
};
await fs.writeFile(
  path.join(root, "docs", "miseverse", "data", "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8"
);
await fs.writeFile(
  path.join(root, "config", "miseverse", "trusted-keys.json"),
  `${JSON.stringify(trust, null, 2)}\n`,
  "utf8"
);
await fs.writeFile(
  path.join(root, "docs", "miseverse", "data", "trusted-keys.json"),
  `${JSON.stringify(trust, null, 2)}\n`,
  "utf8"
);
console.log(`Signed Miseverse manifest with ${keyId}.`);
