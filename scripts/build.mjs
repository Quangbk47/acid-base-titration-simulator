import { copyFile, lstat, mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join, relative, resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { isPathInsideRoot } from './path-security.mjs';

const root = resolve(import.meta.dirname, '..');
const allowedExtensions = new Set(['.js', '.mjs', '.css', '.json', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico', '.woff', '.woff2']);
const forbiddenName = /^(?:\.env(?:\..*)?|.*\.log|.*\.map|.*(?:service[-_]?account|credentials|private[-_]?key).*)$/i;

export const buildWebsite = async ({ rootDir = root, destination = join(rootDir, 'dist'), commit, dirty = false } = {}) => {
  rootDir = resolve(rootDir);
  destination = resolve(destination);
  if (!isPathInsideRoot(rootDir, destination) || relative(rootDir, destination) !== 'dist') throw new Error('UNSAFE_BUILD_DESTINATION');
  if (!/^[a-f0-9]{40}$/.test(commit ?? '')) throw new Error('INVALID_RELEASE_COMMIT');
  const files = [];
  const collect = async (path) => {
    if (path === 'assets/release.json') throw new Error('RESERVED_RELEASE_METADATA_PATH');
    const source = join(rootDir, path);
    const stat = await lstat(source);
    if (stat.isSymbolicLink()) throw new Error(`BUILD_SYMLINK_REJECTED: ${path}`);
    const name = path.split('/').at(-1);
    if (name.startsWith('.') || forbiddenName.test(name)) return;
    if (stat.isDirectory()) {
      for (const child of await readdir(source)) await collect(`${path}/${child}`);
    } else if (stat.isFile() && (path === 'index.html' || allowedExtensions.has(extname(path)) || path === 'assets/vendor/three/LICENSE')) {
      files.push(path);
    }
  };
  for (const entry of ['index.html', 'assets', 'src']) await collect(entry);
  files.sort();
  let previousBuild = null;
  try {
    const stat = await lstat(destination);
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error('UNSAFE_EXISTING_BUILD');
    const temporaryRoot = join(rootDir, 'tmp');
    await mkdir(temporaryRoot, { recursive: true });
    if ((await lstat(temporaryRoot)).isSymbolicLink()) throw new Error('UNSAFE_BUILD_BACKUP');
    const backupRoot = join(rootDir, 'tmp/build-backups');
    await mkdir(backupRoot, { recursive: true });
    if ((await lstat(backupRoot)).isSymbolicLink()) throw new Error('UNSAFE_BUILD_BACKUP');
    previousBuild = join(backupRoot, randomUUID());
    if (!isPathInsideRoot(rootDir, previousBuild)) throw new Error('UNSAFE_BUILD_BACKUP');
    await rename(destination, previousBuild);
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await mkdir(destination, { recursive: true });
  const manifest = [];
  for (const path of files) {
    const output = join(destination, path);
    await mkdir(resolve(output, '..'), { recursive: true });
    await copyFile(join(rootDir, path), output);
    const bytes = await readFile(output);
    manifest.push({ path, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
  const release = { schemaVersion: 1, commit, dirty, builtAt: new Date().toISOString(), files: manifest };
  await mkdir(join(destination, 'assets'), { recursive: true });
  await writeFile(join(destination, 'assets/release.json'), `${JSON.stringify(release, null, 2)}\n`);
  return { destination, previousBuild, release };
};

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const dirty = Boolean(execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim());
  const result = await buildWebsite({ commit, dirty });
  console.log(`Build complete: ${result.destination}; commit=${commit}; dirty=${dirty}; files=${result.release.files.length + 1}`);
  if (result.previousBuild) console.log(`Previous build preserved: ${result.previousBuild}`);
}
