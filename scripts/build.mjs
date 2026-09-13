import { cp, mkdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of ['index.html', 'assets', 'src']) {
  await cp(join(root, entry), join(dist, entry), { recursive: true });
}

console.log(`Build complete: ${dist}`);
