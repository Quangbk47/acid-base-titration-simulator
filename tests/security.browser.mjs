import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [];
const externalRequests = [];
try {
  const page = await browser.newPage({ viewport: { width: 1366, height: 1000 } });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)) return route.continue();
    externalRequests.push(`${url.protocol}//${url.host}${url.pathname}`);
    return route.abort();
  });
  await page.goto('http://localhost:4173/simulate');
  await page.getByRole('button', { name: 'Tính trạng thái', exact: true }).click();
  await page.locator('[data-vessel-3d]').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-vessel-3d]').dataset.renderer === 'ready');
  const results = await page.evaluate(async () => {
    const { reportToHtml, downloadSimulationReport } = await import('/src/ui/report.js');
    const { renderExperimentView } = await import('/src/ui/experimentView.js');
    const { renderChartView } = await import('/src/ui/chartView.js');
    const { safeGraphSvg } = await import('/src/ui/htmlSafety.js');
    const payload = '<img src=x onerror="parent.__securityXss=1;window.__securityXss=1">';
    window.__securityXss = 0;
    const results = {};
    const svg = document.querySelector('[data-chart]').outerHTML;
    results.actualChartSvgPreserved = safeGraphSvg(svg) === svg;
    const iframe = document.createElement('iframe');
    iframe.srcdoc = reportToHtml({ modelVersion: payload, current: { pH: 7 }, points: [{ volumeMl: 25, pH: 7, stage: payload }], graphImage: { svg } });
    document.body.append(iframe);
    await new Promise((resolve) => setTimeout(resolve, 250));
    results.exportNoExecution = window.__securityXss === 0 && !iframe.contentDocument.querySelector('img,script');
    results.exportStillContainsGraph = Boolean(iframe.contentDocument.querySelector('svg circle'));
    iframe.remove();
    const root = document.createElement('div');
    root.innerHTML = '<table><tbody data-chemistry-rows></tbody></table><svg data-chart></svg><table><tbody data-curve-rows></tbody></table>';
    document.body.append(root);
    renderExperimentView(root, { pH: 7, totalVolumeMl: 50, excess: {}, stage: payload, dominantReaction: payload, species: [{ id: payload, moles: 1, concentration: 1 }] }, { addedVolumeMl: 25, dropCount: 1 });
    renderChartView(root, { Ca: 0.1, Va: 0.025, Cb: 0.1, Vb: 0, temperature: 298.15 }, 25, { pH: 7, stage: payload }, 250, [{ volumeMl: 25, pH: 7, stage: payload }]);
    await new Promise((resolve) => setTimeout(resolve, 250));
    results.renderersNoExecution = window.__securityXss === 0 && !root.querySelector('img,script');
    results.renderersPreserveText = root.textContent.includes(payload);
    root.remove();
    results.activeGraphsRejected = ['<svg onload="alert(1)"></svg>', '<svg><script>alert(1)</script></svg>', '<svg><foreignObject><img src=x /></foreignObject></svg>', '<svg><image href="https://example.com/tracker" /></svg>'].every((svg) => {
      try { downloadSimulationReport({ modelVersion: 'v1', points: [], graphImage: { svg } }); return false; }
      catch (error) { return error.message === 'INVALID_REPORT_GRAPH'; }
    });
    return results;
  });
  for (const [key, value] of Object.entries(results)) assert.equal(value, true, key);
  await page.locator('#titration-form').evaluate((form) => { form.noValidate = true; form.querySelector('#analyte-concentration').type = 'text'; });
  for (const value of ['<img src=x onerror="alert(1)">', '1e309']) {
    await page.locator('#analyte-concentration').fill(value);
    await page.getByRole('button', { name: 'Tính trạng thái', exact: true }).click();
    assert.equal(await page.locator('#analyte-concentration').getAttribute('aria-invalid'), 'true');
  }
  await page.locator('#analyte-concentration').fill('0.1');
  await page.getByRole('button', { name: 'Tính trạng thái', exact: true }).click();
  await page.locator('#add-drop').click();
  assert.equal(await page.locator('[data-result="added-volume"]').textContent(), '0.10 mL');
  assert.equal(Number(await page.locator('[data-vessel-viewport] canvas').getAttribute('data-buret-ml')), 49.9);
  assert.deepEqual(errors, []);
  assert.deepEqual(externalRequests, []);
  const output = resolve('tmp/security-audit');
  await mkdir(output, { recursive: true });
  const report = { pass: true, checks: results, invalidInputRejected: true, simulationStillWorking: true, errors, externalRequests };
  await writeFile(`${output}/browser-results.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
