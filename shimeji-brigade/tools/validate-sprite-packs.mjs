import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = new URL('../assets/sprites/', import.meta.url).pathname;
const OUT = new URL('../exports/validation-reports/', import.meta.url).pathname;
const REQUIRED = ['idle', 'walk', 'climb', 'fall', 'drag', 'interact', 'perch'];

async function pngMeta(file) {
  const buf = await readFile(file);
  if (buf.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') return { ok: false, error: 'not_png' };
  return { ok: true, width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), colorType: buf[25], hasAlpha: buf[25] === 4 || buf[25] === 6 };
}

await import('node:fs/promises').then(({ mkdir }) => mkdir(OUT, { recursive: true }));
let failed = false;
for (const id of await readdir(ROOT)) {
  const root = join(ROOT, id);
  if (!(await stat(root)).isDirectory()) continue;
  const manifest = JSON.parse(await readFile(join(root, 'manifest.json'), 'utf8'));
  const report = { id, valid: true, warnings: [], errors: [], states: {}, createdAt: new Date().toISOString() };
  for (const state of REQUIRED) {
    const count = manifest.states?.[state];
    if (!Number.isInteger(count)) report.errors.push(`missing_state_${state}`);
    report.states[state] = { expected: count, frames: [] };
    for (let i = 1; i <= count; i++) {
      const name = `frame_${String(i).padStart(3, '0')}.png`;
      const file = join(root, state, name);
      try {
        const meta = await pngMeta(file);
        if (!meta.ok) report.errors.push(`${state}/${name}: ${meta.error}`);
        if (meta.width !== manifest.frameSize.width || meta.height !== manifest.frameSize.height) report.errors.push(`${state}/${name}: bad_dimensions`);
        if (!meta.hasAlpha) report.errors.push(`${state}/${name}: missing_alpha`);
        report.states[state].frames.push({ name, ...meta });
      } catch {
        report.errors.push(`${state}/${name}: missing`);
      }
    }
  }
  if (manifest.referenceBacked !== true) report.warnings.push('visual_reference_approval_required');
  report.valid = report.errors.length === 0;
  failed ||= !report.valid;
  await import('node:fs/promises').then(({ writeFile }) => writeFile(join(OUT, `${id}.json`), JSON.stringify(report, null, 2) + '\n'));
  console.log(`${report.valid ? 'PASS' : 'FAIL'} ${id} (${report.warnings.length} warnings, ${report.errors.length} errors)`);
}
if (failed) process.exit(1);
