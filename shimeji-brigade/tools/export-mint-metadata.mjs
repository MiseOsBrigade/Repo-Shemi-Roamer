import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname;
const registry = JSON.parse(await readFile(join(ROOT, 'src/character-registry.json'), 'utf8')).characters;
const characters = [];
for (const entry of registry) {
  const manifest = JSON.parse(await readFile(join(ROOT, entry.spriteRoot, 'manifest.json'), 'utf8'));
  characters.push({
    id: entry.id,
    name: entry.name,
    role: entry.role,
    squad: entry.squad,
    frameSize: manifest.frameSize,
    states: manifest.states,
    runtimePack: `exports/${entry.id}-runtime-pack.zip`,
    referenceBacked: manifest.referenceBacked,
    candidateFrames: manifest.candidateFrames,
    visualApprovalRequired: manifest.visualApprovalRequired,
    externalBoundary: { noWalletLogic: true, noPrivateKeys: true, noMintingLogic: true }
  });
}
await mkdir(join(ROOT, 'exports'), { recursive: true });
await writeFile(join(ROOT, 'exports/mint-ready-metadata.json'), JSON.stringify({ format: 'shimeji-mint-bridge-metadata', version: '0.8.0', createdAt: new Date().toISOString(), characters }, null, 2) + '\n');
console.log('BUILT exports/mint-ready-metadata.json');
