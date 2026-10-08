import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

// Explicit discovery prevents ignored backups/build output being executed as tests.
const root = resolve(import.meta.dirname, '..');
const files = (await readdir(resolve(root, 'tests'))).filter((name) => name.endsWith('.test.js')).sort();
if (!files.length) throw new Error('NO_UNIT_TESTS_FOUND');
const result = spawnSync(process.execPath, ['--test', ...files.map((name) => resolve(root, 'tests', name))], { cwd: root, stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
