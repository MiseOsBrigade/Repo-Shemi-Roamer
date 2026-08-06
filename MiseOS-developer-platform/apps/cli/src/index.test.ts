import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('CLI help is runnable from source', () => {
  const entrypoint = fileURLToPath(new URL('./index.ts', import.meta.url));
  const workspace = fileURLToPath(new URL('../../../', import.meta.url));
  const result = spawnSync(
    process.execPath,
    ['--import', 'tsx', entrypoint, '--help'],
    { cwd: workspace, encoding: 'utf8' },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /MiseOS Registry CLI/);
  assert.match(result.stdout, /catalog/);
  assert.match(result.stdout, /doctor/);
});
