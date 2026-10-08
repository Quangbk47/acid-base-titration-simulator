import assert from 'node:assert/strict';
import test from 'node:test';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import http from 'node:http';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { escapeHtml, validatePassiveGraphSvg } from '../src/ui/htmlSafety.js';
import { createSimulationReport, reportToHtml } from '../src/ui/report.js';
import { validateTitrationForm } from '../src/ui/validation.js';

test('SEC: report metadata and history are escaped as text', () => {
  const payload = '<img src=x onerror="alert(1)">';
  const html = reportToHtml({ modelVersion: payload, current: { pH: 7 }, points: [{ volumeMl: 25, pH: 7, stage: payload }] });
  assert.ok(html.includes(escapeHtml(payload)));
  assert.ok(!html.includes(payload));
  assert.equal(escapeHtml('&<>"\''), '&amp;&lt;&gt;&quot;&#39;');
});

test('SEC: passive SVG accepts actual chart shapes and rejects active content or external URLs', () => {
  assert.equal(validatePassiveGraphSvg('<svg class="titration-chart" data-chart="" aria-hidden="true" viewBox="0 0 640 260"><line class="curve-equivalence" x1="25" x2="25" y1="16" y2="230"></line><circle cx="25" cy="100" r="5"></circle></svg>'), true);
  assert.equal(validatePassiveGraphSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><polyline points="0,0 1,1" /></svg>'), true);
  for (const svg of [
    '<svg onload="alert(1)"></svg>', '<svg><script>alert(1)</script></svg>',
    '<svg><foreignObject><img src=x onerror="alert(1)"></foreignObject></svg>',
    '<svg><image href="https://example.com/tracker" /></svg>',
    '<svg><a href="javascript:alert(1)"><circle r="1" /></a></svg>',
    '<svg><animate attributeName="href" values="javascript:alert(1)" /></svg>',
    '<svg style="background:url(https://example.com)"></svg>',
    '<svg><circle fill="url(https://example.com)" r="1" /></svg>',
    '<!DOCTYPE svg [<!ENTITY x SYSTEM "file:///etc/passwd">]><svg>&x;</svg>',
    '<svg><circle r="1" r="2" /></svg>', '<svg><circle></svg></circle>',
    '<svg/><img src=x onerror="alert(1)">', '<svg><svg onload="alert(1)" /></svg>',
    '<svg><circle r="1&#34; onload=alert(1)" /></svg>',
  ]) {
    assert.equal(validatePassiveGraphSvg(svg), false, svg);
    assert.throws(() => reportToHtml({ modelVersion: 'v1', points: [], graphImage: { svg } }), /INVALID_REPORT_GRAPH/);
    assert.throws(() => createSimulationReport({ input: {}, result: null, history: [], modelVersion: 'v1', graphSvg: svg }), /INVALID_REPORT_GRAPH/);
  }
});

test('SEC: input rejects markup, non-finite and malformed numeric values', () => {
  const valid = { systemType: 'strong-acid-strong-base', analyteConcentrationM: '0.1', analyteVolumeMl: '25', titrantConcentrationM: '0.1', addedVolumeMl: '0', buretVolumeMl: '50' };
  for (const key of ['analyteConcentrationM', 'analyteVolumeMl', 'titrantConcentrationM', 'addedVolumeMl', 'buretVolumeMl']) {
    for (const value of ['<script>alert(1)</script>', 'Infinity', '1e309', 'NaN', '0.1;alert(1)', {}]) assert.equal(validateTitrationForm({ ...valid, [key]: value }).ok, false);
  }
  for (const systemType of ['__proto__', 'constructor', 'toString', 'unknown']) assert.equal(validateTitrationForm({ ...valid, systemType }).ok, false);
});

test('SEC: lockfile excludes the known Critical proxy-addr release', () => {
  const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
  const version = lock.packages['node_modules/proxy-addr'].version.split('.').map(Number);
  assert.ok(version[0] > 2 || version[0] === 2 && (version[1] > 0 || version[1] === 0 && version[2] >= 8));
});

test('SEC: local preview restricts files, handles malformed paths and remains available', async () => {
  const server = spawn(process.execPath, ['scripts/serve.mjs'], { cwd: new URL('..', import.meta.url), env: { ...process.env, PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  let stderr = '';
  server.stderr.on('data', (chunk) => { stderr += chunk; });
  try {
    const line = await Promise.race([once(server.stdout, 'data'), once(server, 'exit').then(() => { throw new Error(stderr); })]);
    const port = Number(String(line[0]).match(/localhost:(\d+)/)?.[1]);
    assert.ok(port > 0);
    const request = (path, options = {}) => new Promise((resolve, reject) => {
      const req = http.request({ hostname: '127.0.0.1', port, path, ...options }, (res) => {
        let body = ''; res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      });
      req.on('error', reject); req.end();
    });
    for (const path of ['/', '/simulate', '/src/app.js', '/assets/styles.css', '/assets/vendor/three/three.module.js']) assert.equal((await request(path)).status, 200, path);
    for (const path of ['/.git/HEAD', '/.env', '/%2egit/HEAD', '/src/%2e%2e/%2eenv', '/src/%5c..%5c.env', '/src/app.js%00']) assert.equal((await request(path)).status, 403, path);
    for (const path of ['/package-lock.json', '/firestore.rules', '/docs/DATA_MODEL.md', '/tmp/titration-audit/results.json', '/scripts/serve.mjs', '/src/missing.js']) assert.equal((await request(path)).status, 404, path);
    assert.equal((await request('/%ZZ')).status, 400);
    assert.equal((await request('/favicon.ico')).status, 204);
    assert.equal((await request('/src/app.js', { method: 'POST' })).status, 405);
    assert.equal((await request('/', { headers: { host: 'attacker.example' } })).status, 403);
    const head = await request('/', { method: 'HEAD' });
    assert.equal(head.status, 200); assert.equal(head.body, '');
    assert.equal(head.headers['x-content-type-options'], 'nosniff');
    assert.equal((await request('/simulate')).status, 200);
  } finally { server.kill('SIGTERM'); }
});

test('SEC: preview rejects junctions to private files inside or outside its public root', async () => {
  const fixture = mkdtempSync(join(tmpdir(), 'acid-base-preview-security-'));
  const root = join(fixture, 'site');
  for (const directory of ['scripts', 'assets', 'docs']) mkdirSync(join(root, directory), { recursive: true });
  mkdirSync(join(fixture, 'outside'));
  cpSync(new URL('../scripts/serve.mjs', import.meta.url), join(root, 'scripts/serve.mjs'));
  cpSync(new URL('../scripts/path-security.mjs', import.meta.url), join(root, 'scripts/path-security.mjs'));
  writeFileSync(join(root, 'package.json'), '{"type":"module"}');
  writeFileSync(join(root, 'index.html'), '<!doctype html><title>QA</title>');
  writeFileSync(join(root, 'docs/private.js'), 'QA_PRIVATE_SENTINEL');
  writeFileSync(join(fixture, 'outside/private.js'), 'QA_OUTSIDE_SENTINEL');
  symlinkSync(join(root, 'docs'), join(root, 'assets/private'), 'junction');
  symlinkSync(join(fixture, 'outside'), join(root, 'assets/outside'), 'junction');
  const server = spawn(process.execPath, [join(root, 'scripts/serve.mjs')], { env: { ...process.env, PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  server.stderr.resume();
  try {
    const [line] = await once(server.stdout, 'data');
    const port = Number(String(line).match(/localhost:(\d+)/)?.[1]);
    for (const path of ['/assets/private/private.js', '/assets/outside/private.js']) {
      const response = await fetch(`http://127.0.0.1:${port}${path}`);
      assert.equal(response.status, 403, path);
      assert.ok(!(await response.text()).includes('SENTINEL'));
    }
  } finally { server.kill('SIGTERM'); }
});
