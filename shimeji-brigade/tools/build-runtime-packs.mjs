import { mkdir, readFile, readdir, cp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = new URL('../', import.meta.url).pathname;
const registry = JSON.parse(await readFile(join(ROOT, 'src/character-registry.json'), 'utf8')).characters;
await mkdir(join(ROOT, 'exports'), { recursive: true });

for (const entry of registry) {
  const manifest = JSON.parse(await readFile(join(ROOT, entry.spriteRoot, 'manifest.json'), 'utf8'));
  const report = JSON.parse(await readFile(join(ROOT, 'exports/validation-reports', `${entry.id}.json`), 'utf8'));
  const payload = { format: 'shimeji-brigade-runtime-pack', version: '0.8.0', exportedAt: new Date().toISOString(), character: entry, manifest, validationReport: report };
  await writeFile(join(ROOT, 'exports', `${entry.id}-runtime-pack.json`), JSON.stringify(payload, null, 2) + '\n');
  const tmp = join(ROOT, 'exports', `${entry.id}.tmp`);
  await rm(tmp, { recursive: true, force: true });
  await mkdir(tmp, { recursive: true });
  await writeFile(join(tmp, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  await writeFile(join(tmp, 'registry-entry.json'), JSON.stringify(entry, null, 2) + '\n');
  await writeFile(join(tmp, 'validation-report.json'), JSON.stringify(report, null, 2) + '\n');
  await cp(join(ROOT, entry.spriteRoot), join(tmp, 'sprites'), { recursive: true });
  execFileSync('zip', ['-qr', join(ROOT, 'exports', `${entry.id}-runtime-pack.zip`), '.'], { cwd: tmp });
  await rm(tmp, { recursive: true, force: true });
  console.log(`BUILT exports/${entry.id}-runtime-pack.zip`);
}
