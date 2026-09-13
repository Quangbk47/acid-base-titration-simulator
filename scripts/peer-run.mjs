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
const record = (check, pass, evidence) => results.push({ check, pass, evidence });
const sha = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: rootPath, encoding: 'utf8' }).stdout.trim();
let server;

const get = async (path) => {
  const response = await fetch(`${baseUrl}${path}`);
  return { response, body: await response.text() };
};

try {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const npmAvailable = spawnSync(npmCommand, ['--version'], { cwd: rootPath, encoding: 'utf8' }).status === 0;
  server = spawn(npmAvailable ? npmCommand : process.execPath, npmAvailable ? ['start'] : ['scripts/serve.mjs'], {
    cwd: rootPath,
    stdio: 'pipe',
    windowsHide: true,
  });
  let serverOutput = '';
  server.stdout.on('data', (chunk) => { serverOutput += chunk; });
  server.stderr.on('data', (chunk) => { serverOutput += chunk; });

  let home;
  let simulate;
  let knowledge;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      [home, simulate, knowledge] = await Promise.all([get('/'), get('/simulate'), get('/knowledge')]);
      break;
    } catch {
      await delay(100);
    }
  }
  if (!home || !simulate || !knowledge) throw new Error(`Server did not become ready. Output: ${serverOutput}`);

  record('Routes load', [home, simulate, knowledge].every(({ response }) => response.ok), `home=${home.response.status}; simulate=${simulate.response.status}; knowledge=${knowledge.response.status}`);
  const requiredIds = ['titration-form', 'add-drop', 'run-simulation', 'pause-simulation', 'reset-simulation'];
  const missingIds = requiredIds.filter((id) => !simulate.body.includes(`id="${id}"`));
  record('Required controls exist', missingIds.length === 0, missingIds.length ? `Missing IDs: ${missingIds.join(', ')}` : requiredIds.join(', '));
  record('Graph and chemistry structures exist', simulate.body.includes('data-chart') && simulate.body.includes('data-curve-rows') && simulate.body.includes('data-chemistry-rows'), 'Checked semantic runtime targets');
  record('Knowledge route exists', knowledge.body.includes('data-view="knowledge"'), 'Phase 5 knowledge view is present');

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => pageErrors.push(String(error)));
    await page.goto(`${baseUrl}/simulate`, { waitUntil: 'networkidle' });

    await page.locator('#titration-form button[type="submit"]').click();
    await page.waitForFunction(() => document.querySelector('[data-result="ph"]')?.textContent !== '—');
    const initialPH = await page.locator('[data-result="ph"]').textContent();
    await page.locator('#add-drop').click();
    const addedVolume = await page.locator('[data-result="added-volume"]').textContent();
    const graphRowsAfterDrop = await page.locator('[data-curve-rows] tr').count();

    await page.locator('#simulation-speed').selectOption('fast');
    await page.locator('#run-simulation').click();
    await page.waitForTimeout(650);
    const runningStatus = await page.locator('[data-simulation-state]').textContent();
    const runningVolume = await page.locator('[data-result="added-volume"]').textContent();
    await page.locator('#pause-simulation').click();
    const pausedVolume = await page.locator('[data-result="added-volume"]').textContent();
    await page.waitForTimeout(400);
    const pausedStable = pausedVolume === await page.locator('[data-result="added-volume"]').textContent();
    await page.locator('#reset-simulation').click();
    const resetStatus = await page.locator('[data-simulation-state]').textContent();
    const resetVolume = await page.locator('[data-result="added-volume"]').textContent();

    const interactionPass = Number.isFinite(Number(initialPH))
      && addedVolume?.includes('0.05 mL')
      && graphRowsAfterDrop > 1
      && runningStatus === 'Running'
      && runningVolume !== addedVolume
      && pausedStable
      && resetStatus === 'Ready'
      && resetVolume?.includes('0.00 mL');
    record('Browser interaction', interactionPass, `pH=${initialPH}; add=${addedVolume}; running=${runningVolume}; pausedStable=${pausedStable}; reset=${resetStatus}/${resetVolume}`);
    record('Console/runtime errors', consoleErrors.length === 0 && pageErrors.length === 0, consoleErrors.length || pageErrors.length ? `console=${consoleErrors.join(' | ')}; page=${pageErrors.join(' | ')}` : 'No console or page errors observed');

    const responsiveFailures = [];
    for (const width of [320, 375, 430, 768, 1366]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${baseUrl}/simulate`, { waitUntil: 'networkidle' });
      const dimensions = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      if (dimensions.scroll > dimensions.client) responsiveFailures.push(`${width}px:${dimensions.scroll}>${dimensions.client}`);
    }
    record('Responsive overflow', responsiveFailures.length === 0, responsiveFailures.length ? responsiveFailures.join(', ') : 'No horizontal overflow at 320/375/430/768/1366 px');

    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto(`${baseUrl}/simulate`, { waitUntil: 'networkidle' });
    const accessibilityPass = await page.locator('label[for="analyte-concentration"]').count() === 1
      && await page.locator('#add-drop').getAttribute('type') === 'button'
      && await page.locator('[data-simulation-state][role="status"][aria-live="polite"]').count() === 1;
    record('Accessible labels and controls', accessibilityPass, 'Input label, button semantics, and live simulation status checked');

    await page.goto(`${baseUrl}/knowledge`, { waitUntil: 'networkidle' });
    const knowledgeVisible = await page.locator('[data-view="knowledge"] h1').isVisible();
    const modelLimitsVisible = await page.getByRole('heading', { name: 'Giới hạn mô hình' }).isVisible();
    record('Knowledge view renders', knowledgeVisible && modelLimitsVisible, `heading=${knowledgeVisible}; modelLimits=${modelLimitsVisible}`);
  } finally {
    await browser.close();
  }
} catch (error) {
  record('Peer runner execution', false, error.message);
} finally {
  if (server && !server.killed) server.kill('SIGTERM');
}

const failed = results.filter(({ pass }) => !pass);
const report = `# Peer Run Report

- Date: ${new Date().toISOString()}
- Commit SHA: ${sha || 'working-tree'}
- Local URL: ${baseUrl}

## Results

| Check | Result | Evidence |
| --- | --- | --- |
${results.map(({ check, pass, evidence }) => `| ${check} | ${pass ? 'PASS' : 'FAIL'} | ${evidence.replaceAll('|', '\\|')} |`).join('\n')}

## Final result

- Peer Run: ${failed.length === 0 ? 'PASS' : 'FAIL'}
- Phase 1–5 technical regression: ${failed.length === 0 ? 'PASS' : 'PARTIAL'}
- Outstanding issues: ${failed.length ? failed.map(({ check, evidence }) => `${check}: ${evidence}`).join('; ') : 'None'}
`;
writeFileSync(reportPath, report);
console.log(JSON.stringify({ commit: sha, results, report: reportPath.pathname }, null, 2));
process.exitCode = failed.length === 0 ? 0 : 1;
