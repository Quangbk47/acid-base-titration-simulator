import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const requiredFiles = [
  'index.html',
  'assets/styles.css',
  'src/app.js',
  'src/chemistry/units.js',
  'src/chemistry/strongStrong.js',
  'src/chemistry/milestones.js',
  'src/chemistry/curve.js',
  'src/chemistry/index.js',
  'src/data/standardCases.js',
  'src/firebase/index.js',
  'src/simulation/state.js',
  'src/ui/navigation.js',
  'scripts/lint.mjs',
  'scripts/path-security.mjs',
  'scripts/serve.mjs',
  'tests/smoke.test.js',
  'tests/chemistry.test.js',
  'tests/chart.test.js',
  'tests/fixtures/phase1Reference.js',
];
let failed = false;

for (const relativePath of requiredFiles) {
  const file = join(root, relativePath);
  if (!existsSync(file)) {
    console.error(`Missing required file: ${relativePath}`);
    failed = true;
    continue;
  }
  const text = readFileSync(file, 'utf8');
  if (text.charCodeAt(0) === 0xfeff || /[ \t]+\r?$/m.test(text) || !text.endsWith('\n')) {
    console.error(`Formatting check failed: ${relativePath}`);
    failed = true;
  }
}

if (failed) process.exitCode = 1;
else console.log(`Format baseline passed for ${requiredFiles.length} files.`);

