import fs from "node:fs/promises";
import path from "node:path";
import { createHash, createPublicKey, verify } from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "docs", "miseverse", "data", "manifest.json");
const trustPath = path.join(root, "config", "miseverse", "trusted-keys.json");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const trust = JSON.parse(await fs.readFile(trustPath, "utf8"));
const { signature, ...unsigned } = manifest;
if (signature?.alg !== "Ed25519") throw new Error("Unsupported manifest signature algorithm");
const trustedKey = trust.keys.find(key => key.keyId === signature.keyId && key.alg === signature.alg);
if (!trustedKey) throw new Error(`Untrusted manifest key: ${signature?.keyId ?? "missing"}`);
const signatureValid = verify(
  null,
  Buffer.from(JSON.stringify(unsigned), "utf8"),
  createPublicKey(trustedKey.publicKeySpkiPem),
  Buffer.from(signature.value, "base64")
);
if (!signatureValid) throw new Error("Miseverse manifest signature verification failed");
const assetPath = path.join(root, "docs", "miseverse", manifest.asset.path);
const assetHash = createHash("sha256").update(await fs.readFile(assetPath)).digest("hex");
if (assetHash !== manifest.asset.sha256) throw new Error("Miseverse world asset hash mismatch");
if (manifest.policy?.visualOnly !== true || manifest.policy?.allowlistOnly !== true) {
  throw new Error("Miseverse manifest policy must remain visual-only and allowlist-only");
}
console.log(`Verified ${manifest.manifestId}: signature, trusted key, policy, and world asset hash.`);
