// Run only against loopback Hosting Emulator fixtures. Current-mode success
// records existing exposure; it is not a passing production security gate.
import assert from 'node:assert/strict';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';

const root = process.env.SECURITY_REPO_ROOT ?? resolve(import.meta.dirname, '..');
const mode = process.env.SECURITY_HOSTING_MODE;
assert.ok(['current', 'draft'].includes(mode), 'Select current or draft fixture');
const base = new URL(process.env.SECURITY_HOSTING_BASE_URL ?? 'http://127.0.0.1:5006');
assert.ok(['127.0.0.1', 'localhost'].includes(base.hostname));
assert.equal(base.protocol, 'http:');
const fixture = process.env.SECURITY_HOSTING_FIXTURE_ROOT;
assert.ok(fixture, 'Provide the local fixture directory, never a production URL');
const cliRoot = process.env.SECURITY_FIREBASE_CLI_ROOT;
assert.ok(cliRoot, 'Provide the installed CLI directory for offline upload-file filtering');
// This pure filesystem helper is the function called by deploy/hosting/deploy.js.
// Do not import or invoke deploy, uploader, release or any Firebase API here.
const { listFiles } = createRequire(import.meta.url)(join(cliRoot, 'lib/listFiles.js'));
const configPath = process.env.SECURITY_HOSTING_CONFIG_PATH ?? join(root, 'firebase.json');
const config = JSON.parse((await readFile(configPath, 'utf8')).replace(/^\uFEFF/, ''));
const uploadFiles = new Set(listFiles(fixture, config.hosting.ignore));
const publicPaths = ['/', '/simulate', '/src/app.js', '/src/firebase/config.js'];
const internalPaths = ['/package.json', '/package-lock.json', '/scripts/serve.mjs', '/tests/security.test.js', '/docs/DATA_MODEL.md', '/SECURITY_AUDIT.md', '/tmp/titration-audit/results.json', '/tmp/security-audit/proposed-firestore.rules', '/tmp/security-audit/proposed-firebase.json'];
const ignoredPaths = ['/firebase.json', '/firestore.rules', '/firestore.indexes.json', '/.env', '/.firebaserc', '/.git/HEAD'];
const observations = [];
for (const path of [...publicPaths, ...internalPaths, ...ignoredPaths]) {
  // Negative probes must use an existing sentinel file for ignored resources.
  if (ignoredPaths.includes(path)) await access(join(fixture, path.slice(1)));
  if (mode === 'current' && internalPaths.includes(path)) await access(join(fixture, path.slice(1)));
  const response = await fetch(new URL(path, base));
  // ignore is an upload filter, not an HTTP access rule in this Emulator.
  // Observe ignored-file HTTP responses separately; assert their exclusion from
  // the actual CLI upload-file list instead of asserting an invented 404 policy.
  const expectedStatus = ignoredPaths.includes(path) ? null : (publicPaths.includes(path) || (mode === 'current' && internalPaths.includes(path)) ? 200 : 404);
  const uploadIncluded = path === '/' || path === '/simulate' ? null : uploadFiles.has(path.slice(1));
  const headers = Object.fromEntries(['content-security-policy', 'x-content-type-options', 'x-frame-options', 'referrer-policy', 'access-control-allow-origin'].map((key) => [key, response.headers.get(key)]));
  // Do not print or store any resource bodies/configuration values.
  observations.push({ path, status: response.status, expectedStatus, uploadIncluded, headers });
  if (expectedStatus !== null) assert.equal(response.status, expectedStatus, `${mode}: ${path}`);
  if (internalPaths.includes(path)) assert.equal(uploadIncluded, mode === 'current', `Upload exposure: ${path}`);
}
const output = join(root, 'tmp/security-audit/followup');
await mkdir(output, { recursive: true });
const ignoredUploadLeaks = observations.filter((row) => ignoredPaths.includes(row.path) && row.uploadIncluded);
const internalUploadExposures = observations.filter((row) => internalPaths.includes(row.path) && row.uploadIncluded);
const missingHeaders = mode === 'draft' ? observations.filter((row) => publicPaths.includes(row.path) && (row.headers['x-content-type-options'] !== 'nosniff' || row.headers['x-frame-options'] !== 'DENY' || !row.headers['content-security-policy'])) : [];
const label = process.env.SECURITY_HOSTING_RESULT_LABEL ?? mode;
assert.match(label, /^[a-z-]+$/);
await writeFile(join(output, `hosting-${label}-results.json`), JSON.stringify({ mode, label, scope: 'representative local fixture with synthetic ignored-file sentinels', observations, ignoredUploadLeaks, internalUploadExposures, missingHeaders }, null, 2));
console.log(JSON.stringify({ mode, observations: observations.length, matchedHttpObservations: true, internalResourcesExposed: observations.filter((row) => internalPaths.includes(row.path) && row.status === 200).length, internalUploadExposures: internalUploadExposures.length, ignoredFileProbes: ignoredPaths.length, ignoredUploadLeaks: ignoredUploadLeaks.map((row) => row.path), missingHeaders: missingHeaders.map((row) => row.path), notice: 'Any internal/ignored-file upload exposure or missing draft header leaves this regression gate FAIL. Emulator HTTP ignore behavior is recorded separately.' }));
if (ignoredUploadLeaks.length || internalUploadExposures.length || missingHeaders.length) process.exitCode = 1;
