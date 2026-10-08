import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, readFile, readdir, writeFile, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { buildWebsite } from '../scripts/build.mjs';

const fixture = async () => {
  const rootDir = await mkdtemp(join(tmpdir(), 'acid-base-build-'));
  for (const dir of ['assets', 'src', 'dist']) await mkdir(join(rootDir, dir));
  await writeFile(join(rootDir, 'index.html'), '<html>fixture</html>');
  await writeFile(join(rootDir, 'assets/styles.css'), 'body{}');
  await writeFile(join(rootDir, 'src/app.js'), 'export const fixture = true;');
  await writeFile(join(rootDir, 'dist/keep-original.txt'), 'previous build must survive');
  return rootDir;
};
const commit = 'a'.repeat(40);

test('build publishes only web resources and preserves the previous build', async () => {
  const rootDir = await fixture();
  for (const file of ['.env', 'debug.log', 'app.js.map', 'credentials.json', 'notes.md']) await writeFile(join(rootDir, 'src', file), 'synthetic private fixture');
  await mkdir(join(rootDir, 'src/.git'));
  await writeFile(join(rootDir, 'src/.git/HEAD'), 'synthetic private fixture');
  const result = await buildWebsite({ rootDir, commit });
  assert.deepEqual(await readdir(join(rootDir, 'dist/src')), ['app.js']);
  assert.equal(await readFile(join(result.previousBuild, 'keep-original.txt'), 'utf8'), 'previous build must survive');
  const release = JSON.parse(await readFile(join(rootDir, 'dist/assets/release.json'), 'utf8'));
  assert.equal(release.commit, commit);
  assert.equal(release.dirty, false);
  assert.ok(release.files.every((file) => /^[a-f0-9]{64}$/.test(file.sha256)));
});

test('build refuses outside destinations and source junctions without replacing the old build', async () => {
  const rootDir = await fixture();
  await assert.rejects(buildWebsite({ rootDir, destination: join(rootDir, '../outside-dist'), commit }), /UNSAFE_BUILD_DESTINATION/);
  const outside = await mkdtemp(join(tmpdir(), 'acid-base-build-outside-'));
  await writeFile(join(outside, 'private.json'), 'synthetic private fixture');
  await symlink(outside, join(rootDir, 'src/external'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(buildWebsite({ rootDir, commit }), /BUILD_SYMLINK_REJECTED/);
  assert.equal(await readFile(join(rootDir, 'dist/keep-original.txt'), 'utf8'), 'previous build must survive');
});
