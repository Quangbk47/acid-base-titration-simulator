import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import test from 'node:test';

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

test('Phase 0 does not ship chemistry calculations or Firebase runtime calls', () => {
  const app = read('src/app.js');
  assert.doesNotMatch(app, /firestore|signIn|pH\s*=/i);
  assert.match(read('src/chemistry/index.js'), /deferred-to-phase-1/);
  assert.match(read('src/firebase/index.js'), /deferred-to-phase-4/);
  assert.match(read('src/data/standardCases.js'), /Object\.freeze\(\[\]\)/);
});
