import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const sourceRoots = ['src', 'scripts', 'tests'];

function javascriptFiles(directory) {
  const files = [];
  for (const entry of readdirSync(join(root, directory), { withFileTypes: true })) {
    const fullPath = join(root, directory, entry.name);
    if (entry.isDirectory()) files.push(...javascriptFiles(join(directory, entry.name)));
    if (entry.isFile() && /\.(js|mjs)$/.test(entry.name)) files.push(fullPath);
  }
  return files;
}

const files = sourceRoots.flatMap(javascriptFiles);
let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) failed = true;
}

if (failed) process.exitCode = 1;
else console.log(`Lint baseline passed for ${files.length} JavaScript files.`);

