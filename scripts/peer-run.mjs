import { spawn, spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const root = new URL('..', import.meta.url);
const rootPath = decodeURIComponent(root.pathname).replace(/^\/+/, '').replaceAll('/', '\\');
const port = 4173;
const baseUrl = `http://127.0.0.1:${port}`;
const reportPath = new URL('../docs/PEER_RUN_REPORT.md', import.meta.url);
const results = [];

const record = (check, pass, evidence) => {
  results.push({ check, pass, evidence });
};

const sha = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: rootPath, encoding: 'utf8' }).stdout.trim();
let server;
const chemistryCheck = spawnSync(process.execPath, ['--test', 'tests/chemistry.test.js', 'tests/phase4.test.js'], {
  cwd: rootPath,
  encoding: 'utf8',
});
const chemistryPass = chemistryCheck.status === 0;
record('Chemistry automated suite', chemistryPass, `exit=${chemistryCheck.status}; 0 skip expected for Phase 4`);

const get = async (path) => {
  const response = await fetch(`${baseUrl}${path}`);
  return { response, body: await response.text() };
};

const has = (body, text) => body.includes(text);

try {
  const npmAvailable = spawnSync('npm', ['--version'], { cwd: rootPath, encoding: 'utf8' }).status === 0;
  const command = npmAvailable ? 'npm' : process.execPath;
  const args = npmAvailable ? ['start'] : ['scripts/serve.mjs'];
  server = spawn(command, args, { cwd: rootPath, stdio: 'pipe', windowsHide: true });
  let serverOutput = '';
  server.stdout.on('data', (chunk) => { serverOutput += chunk; });
  server.stderr.on('data', (chunk) => { serverOutput += chunk; });

  let home;
  let simulate;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      home = await get('/');
      simulate = await get('/simulate');
      break;
    } catch {
      await delay(100);
    }
  }
  if (!home || !simulate) throw new Error(`Server did not become ready. Output: ${serverOutput}`);

  record('/ loads', home.response.ok, `${home.response.status} ${home.response.statusText}`);
  record('/simulate loads', simulate.response.ok, `${simulate.response.status} ${simulate.response.statusText}`);

  const controls = ['Thêm giọt', 'Chạy', 'Tạm dừng', 'Đặt lại'];
  const missing = controls.filter((label) => !has(simulate.body, label));
  record('Control labels in route', missing.length === 0, missing.length ? `Missing: ${missing.join(', ')}` : controls.join(', '));

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => pageErrors.push(String(error)));
    await page.goto(`${baseUrl}/simulate`, { waitUntil: 'networkidle' });

    const addDrop = page.getByRole('button', { name: /^Thêm giọt/ });
    const run = page.getByRole('button', { name: /^Chạy/ });
    const pause = page.getByRole('button', { name: /^Tạm dừng/ });
    const reset = page.getByRole('button', { name: /^Đặt lại/ });
    const requiredControls = [addDrop, run, pause, reset];
    const missingDom = [];
    for (const [index, control] of requiredControls.entries()) {
      if (!(await control.isVisible())) missingDom.push(controls[index]);
    }
    record('Required controls exist', missingDom.length === 0, missingDom.length ? `Missing: ${missingDom.join(', ')}` : 'All controls visible in DOM');
    const disabledDom = requiredControls.filter((control) => control.isDisabled());
    record('Controls enabled', disabledDom.length === 0, disabledDom.length ? `${disabledDom.length} required controls disabled` : 'All required controls enabled');

    await page.getByRole('button', { name: 'Tính trạng thái' }).click();
    await addDrop.click();
    const addedVolume = await page.locator('[data-result="added-volume"]').textContent();
    const graphRowsAfterDrop = await page.locator('[data-curve-rows] tr').count();
    const graphText = await page.locator('[data-curve-rows]').textContent();
    const pH = await page.locator('[data-result="ph"]').textContent();
    const reaction = await page.locator('[data-result="reaction"]').textContent();
    const graphPass = graphRowsAfterDrop > 0 && !graphText.includes('Chưa có dữ liệu mô phỏng');
    const chemistryPass = pH !== '—' && !reaction.includes('Chưa tính');
    record('Graph has real data', graphPass, `rows=${graphRowsAfterDrop}; placeholder=${graphText.includes('Chưa có dữ liệu mô phỏng')}`);
    record('Chemistry state connected', chemistryPass, `pH=${pH}; reaction=${reaction}`);
    await run.click();
    await page.waitForTimeout(800);
    const running = await page.locator('[data-simulation-state]').textContent();
    const runningVolume = await page.locator('[data-result="added-volume"]').textContent();
    const pauseEnabled = !(await pause.isDisabled());
    await pause.click();
    const pausedState = await page.locator('[data-simulation-state]').textContent();
    const pausedVolume = await page.locator('[data-result="added-volume"]').textContent();
    await page.waitForTimeout(700);
    const pausedStable = pausedVolume === await page.locator('[data-result="added-volume"]').textContent();
    await reset.click();
    const resetStatus = await page.locator('[data-simulation-state]').textContent();
    const resetVolume = await page.locator('[data-result="added-volume"]').textContent();
    const interactionPass = addedVolume?.includes('0.05 mL')
      && graphRowsAfterDrop >= 1
      && running === 'Running'
      && runningVolume !== addedVolume
      && pauseEnabled
      && pausedState === 'Paused'
      && pausedStable
      && resetStatus === 'Ready'
      && resetVolume?.includes('0.00 mL');
    record('Browser interaction', interactionPass, `add=${addedVolume}; running=${runningVolume}; pausedStable=${pausedStable}; reset=${resetStatus}/${resetVolume}`);
    record('Console/runtime errors', consoleErrors.length === 0 && pageErrors.length === 0,
      consoleErrors.length || pageErrors.length ? `console=${consoleErrors.join(' | ')}; page=${pageErrors.join(' | ')}` : 'No console or page errors observed by Playwright');
  } finally {
    await browser.close();
  }
} catch (error) {
  if (!results.some(({ check }) => check === 'Required controls exist')) {
    record('Required controls exist', false, 'Browser DOM verification unavailable');
    record('Controls enabled', false, 'Browser DOM verification unavailable');
    record('Graph has real data', false, 'Browser interaction unavailable; initial placeholder was not treated as a pass');
    record('Chemistry state connected', false, 'Browser interaction unavailable; initial placeholder was not treated as a pass');
    record('Console/runtime errors', false, 'Browser runtime could not be started');
  }
  record('Peer runner execution', false, error.message);
} finally {
  if (server && !server.killed) server.kill('SIGTERM');
}

const date = new Date().toISOString();
const failed = results.filter(({ pass }) => !pass);
// ROADMAP defines Phase 1 as the pure chemistry engine; UI interaction/graph/state are Phase 2.
const phase1 = chemistryPass ? 'PASS' : 'FAIL';
const phase2 = failed.length === 0 ? 'PASS' : 'PARTIAL';
const report = `# Peer Run Report

- Date: ${date}
- Commit SHA: ${sha}
- Local URL: ${baseUrl}

## Results

| Check | Result | Evidence |
| --- | --- | --- |
${results.map(({ check, pass, evidence }) => `| ${check} | ${pass ? 'PASS' : 'FAIL'} | ${evidence.replaceAll('|', '\\|')} |`).join('\n')}

## Manual verification

- [ ] Open \/simulate at desktop width; record visual layout result: ____________________
- [ ] Verify keyboard focus and accessible labels: ____________________
- [ ] Verify Add drop / Run / Pause / Reset behavior: ____________________
- [ ] Verify graph data and chemistry state after interaction: ____________________

## Final result

- Peer Run: ${failed.length === 0 ? 'PASS' : 'FAIL'}
- Phase 1: ${phase1}
- Phase 2: ${phase2}
- Outstanding issues: ${failed.length ? failed.map(({ check, evidence }) => `${check}: ${evidence}`).join('; ') : 'None'}`;
writeFileSync(reportPath, report);
console.log(JSON.stringify({ commit: sha, results, report: reportPath.pathname }, null, 2));
process.exitCode = failed.length === 0 ? 0 : 1;
