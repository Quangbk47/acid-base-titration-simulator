// HCl–NaOH audit. npm start first; uses the existing Playwright dev dependency.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const baseline = process.env.TITRATION_AUDIT_BASELINE === '1';
const output = resolve('tmp/titration-audit');
const baseUrl = process.env.SIMULATOR_BASE_URL ?? 'http://localhost:4173';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const findings = [];
const observations = [];
const errors = [];
const check = (condition, description, actual) => { if (!condition) findings.push({ description, actual }); };
try {
  const page = await browser.newPage({ viewport: { width: 1366, height: 1000 } });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${baseUrl}/simulate`);
  const stage = page.locator('[data-vessel-3d]');
  await stage.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-vessel-3d]').dataset.renderer === 'ready');
  check(await page.locator('#add-drop').isDisabled(), 'Add disabled before calculating');
  check(await page.locator('#run-simulation').isDisabled(), 'Run disabled before calculating');
  const submit = () => page.getByRole('button', { name: 'Tính trạng thái', exact: true }).click();
  const snapshot = () => page.evaluate(() => {
    const canvas = document.querySelector('[data-vessel-viewport] canvas');
    const cell = document.querySelector('[data-curve-rows] tr:last-child');
    const value = (selector) => document.querySelector(selector).textContent;
    const svg = document.querySelector('[data-chart]');
    const current = svg.querySelector('.curve-current');
    return {
      volume: Number(value('[data-result="added-volume"]').split(' ')[0]),
      total: Number(value('[data-result="volume"]').split(' ')[0]),
      ph: Number(value('[data-result="ph"]')),
      stage: value('[data-result="stage"]'),
      buret: Number(canvas.dataset.buretMl),
      modelTotal: Number(canvas.dataset.totalMl),
      modelPh: Number(value('[data-vessel-ph]').replace(',', '.')),
      drops: Number(canvas.dataset.dropCount),
      indicator: canvas.dataset.indicator,
      color: document.querySelector('[data-indicator-solution]').style.getPropertyValue('--indicator-color'),
      chartVolume: Number(cell.children[0].textContent.split(' ')[0]),
      chartPh: Number(cell.children[1].textContent),
      svgY: Number(current?.getAttribute('cy')),
      svgHeight: svg.viewBox.baseVal.height,
    };
  });
  await submit();
  // Hand-calculated reference: n(HCl)=0.0025 mol, n(NaOH)=0.0001*V(mL).
  const references = [[0, 1], [0.1, 1.003474], [12.5, 1.477121], [24.9, 3.698101], [25, 7], [25.1, 10.300162], [50, 12.522879]];
  let stepped = 0;
  for (const [volume, expectedPh] of references) {
    const target = Math.round(volume * 10);
    await page.evaluate((count) => { for (let i = 0; i < count; i += 1) document.querySelector('#add-drop').click(); }, target - stepped);
    stepped = target;
    const actual = await snapshot();
    observations.push({ checkpoint: `${volume} mL`, expectedPh, ...actual });
    check(Math.abs(actual.ph - expectedPh) <= 0.011, `pH reference at ${volume} mL`, actual);
    check(actual.volume === volume && actual.chartVolume === volume, `State/chart volume at ${volume} mL`, actual);
    check(actual.buret === 50 - volume && actual.total === 25 + volume && actual.modelTotal === actual.total, `Volume conservation at ${volume} mL`, actual);
    check(actual.modelPh === actual.ph && actual.chartPh === actual.ph, `3D/chemistry/chart share pH at ${volume} mL`, actual);
    // Plot padding is 28px above and 56px below to reserve numbered axes.
    const expectedY = 28 + ((14 - expectedPh) / 14) * (actual.svgHeight - 84);
    check(Math.abs(actual.svgY - expectedY) < 0.4, `Chart current point at ${volume} mL`, actual);
    if (volume === 25) {
      check(actual.stage === 'at-equivalence' && actual.ph === 7, '250 drops reach 25 mL / pH 7', actual);
      check(/,\s*0\)$/.test(actual.color), 'Equivalence solution is colorless', actual.color);
      await stage.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1100);
      await stage.screenshot({ path: `${output}/${baseline ? 'baseline-' : ''}equivalence.png` });
    }
    if (volume < 25) check(actual.indicator === 'acidic' && /,\s*0\)$/.test(actual.color), `Colorless before equivalence at ${volume} mL`, actual);
    if (volume > 25) check(actual.indicator === 'base-excess', `Pink after equivalence at ${volume} mL`, actual);
  }
  const empty = await snapshot();
  await page.evaluate(() => document.querySelector('#add-drop').click());
  check((await snapshot()).volume === empty.volume, 'Empty buret cannot dispense another drop', await snapshot());

  await page.locator('#reset-simulation').click();
  const reset = await snapshot();
  check(reset.volume === 0 && reset.buret === 50 && reset.total === 25 && reset.ph === 1 && reset.drops === 0, 'Reset restores original state', reset);
  check(await page.locator('[data-curve-rows] tr').count() === 1, 'Reset clears history');
  await page.locator('#simulation-speed').selectOption('fast');
  await page.locator('#run-simulation').click();
  await page.waitForTimeout(650);
  await page.locator('#pause-simulation').click();
  const paused = await snapshot();
  await page.evaluate(() => {
    window.__auditTransient = [];
    window.__auditObserver = new MutationObserver(() => { if (document.querySelector('[data-indicator-solution]').classList.contains('indicator-transient')) window.__auditTransient.push(true); });
    window.__auditObserver.observe(document.querySelector('[data-indicator-solution]'), { attributes: true, attributeFilter: ['class'] });
  });
  await page.waitForTimeout(2600);
  check((await snapshot()).volume === paused.volume && (await snapshot()).ph === paused.ph, 'Pause freezes chemistry');
  check(await page.evaluate(() => window.__auditTransient.length === 0), 'Pause cancels delayed indicator effects');
  await page.evaluate(() => window.__auditObserver.disconnect());
  await page.locator('#run-simulation').click();
  await page.waitForTimeout(350);
  await submit();
  const recalculated = await snapshot();
  await page.waitForTimeout(650);
  check((await snapshot()).volume === recalculated.volume, 'Calculate during auto run cancels pending runner', { before: recalculated, after: await snapshot() });
  if (await page.locator('#pause-simulation').isEnabled()) await page.locator('#pause-simulation').click();

  await page.locator('#case-selector').selectOption('hcl-naoh-equivalence');
  await submit();
  const sample = await snapshot();
  check(sample.volume === 25 && sample.ph === 7, '100% Veq sample loads its 25 mL reference volume', sample);
  await page.locator('#case-selector').selectOption('hcl-naoh-initial');
  await page.locator('#buret-volume').fill('-1');
  await submit();
  check(await page.locator('#buret-volume').getAttribute('aria-invalid') === 'true', 'Reject negative buret volume');
  await page.locator('#buret-volume').fill('0');
  await submit();
  check((await snapshot()).buret === 0 && await page.locator('#add-drop').isDisabled() && await page.locator('#run-simulation').isDisabled(), 'Zero-filled buret stays empty', await snapshot());

  if (!baseline) {
    // Three speeds are tested with real scheduling and paused at their first drop.
    for (const speed of ['slow', 'normal', 'fast']) {
      await page.locator('#case-selector').selectOption('hcl-naoh-25-percent');
      await page.locator('#case-selector').selectOption('hcl-naoh-initial');
      await submit();
      await page.locator('#simulation-speed').selectOption(speed);
      await page.locator('#run-simulation').click();
      await page.waitForFunction(() => document.querySelector('[data-vessel-viewport] canvas').dataset.dropCount === '1');
      await page.locator('#pause-simulation').click();
      const actual = await snapshot();
      check(actual.volume === 0.1 && actual.ph === 1, `First drop identical at ${speed} speed`, actual);
    }
    await page.locator('#case-selector').selectOption('hcl-naoh-initial');
    await submit();
    await page.locator('#simulation-speed').selectOption('fast');
    await page.locator('#run-simulation').click();
    await page.locator('#reset-simulation').click();
    await page.waitForTimeout(650);
    check((await snapshot()).volume === 0, 'Reset during run cancels pending drops');
    await page.locator('#buret-volume').fill('0.2');
    await submit();
    await page.locator('#run-simulation').click();
    await page.waitForTimeout(1000);
    const stopped = await snapshot();
    check(stopped.volume === 0.2 && stopped.buret === 0 && await page.locator('#pause-simulation').isDisabled(), 'Auto run stops exactly when buret empties', stopped);
  }
  check(errors.length === 0, 'No uncaught browser errors', errors);
  const report = { mode: baseline ? 'before-fixes' : 'regression', observations, findings, browserErrors: errors };
  await writeFile(`${output}/${baseline ? 'baseline' : 'results'}.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (!baseline) assert.equal(findings.length, 0, `HCl–NaOH audit has ${findings.length} failing checks; see results.json`);
} finally { await browser.close(); }
