import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { isPathInsideRoot } from '../scripts/path-security.mjs';

const root = resolve(import.meta.dirname, '..');
const read = (relativePath) => readFileSync(join(root, relativePath), 'utf8');

test('Phase 0 scaffold contains the documented architecture', () => {
  const required = [
    'index.html',
    'assets/styles.css',
    'src/app.js',
    'src/chemistry/index.js',
    'src/data/standardCases.js',
    'src/firebase/index.js',
    'src/simulation/state.js',
    'src/ui/navigation.js',
    'DEPLOYMENT_TARGETS.md',
  ];
  for (const file of required) assert.equal(existsSync(join(root, file)), true, file);
});

test('HTML loads the app as an ES module and exposes accessible baseline regions', () => {
  const html = read('index.html');
  assert.match(html, /<script type="module" src="\/src\/app\.js"><\/script>/);
  assert.match(html, /id="main-content"/);
  assert.match(html, /aria-label="Điều hướng chính"/);
  assert.match(html, /data-view="home"/);
  assert.match(html, /data-view="simulate"/);
});

test('Phase 1 exposes chemistry without coupling it to DOM or Firebase', () => {
  assert.match(read('src/chemistry/index.js'), /phase-1-strong-strong-verified/);
  for (const file of ['src/chemistry/units.js', 'src/chemistry/strongStrong.js', 'src/chemistry/milestones.js', 'src/chemistry/curve.js']) {
    const source = read(file);
    assert.doesNotMatch(source, /document|window|firebase|firestore/i, file);
  }
  assert.match(read('src/data/standardCases.js'), /hcl-naoh-equivalence/);
  assert.match(read('src/firebase/index.js'), /phase-4a-foundation-skeleton/);
});

test('Preview path guard is cross-platform and blocks traversal', () => {
  const previewRoot = resolve(root, 'preview-root');
  assert.equal(isPathInsideRoot(previewRoot, previewRoot), true);
  assert.equal(isPathInsideRoot(previewRoot, join(previewRoot, 'assets', 'styles.css')), true);
  assert.equal(isPathInsideRoot(previewRoot, resolve(previewRoot, '..', 'secret.txt')), false);
});
