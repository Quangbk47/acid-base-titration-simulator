import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const base = process.env.SIMULATOR_BASE_URL ?? 'http://localhost:4173';
const output = 'tmp/research-upgrade-qa'; await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = []; const checks = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }); const requests = [];
  page.on('pageerror', (e) => errors.push(e.message)); page.on('request', (r) => requests.push(r.url()));
  await page.goto(base + '/'); await page.waitForFunction(() => document.documentElement.dataset.appReady === 'true');
  assert.equal(await page.locator('.chemical-card').count(), 36); assert.equal(await page.locator('.team-card').count(), 4);
  assert.ok(!requests.some((url) => /vendor\/three|excelExport/.test(url)), 'Home never loads Three or workbook exporter');
  await page.locator('#chemical-search').fill('CH3COOH'); assert.equal(await page.locator('.chemical-card').count(), 1);
  await page.locator('#chemical-search').fill('oxalic'); assert.equal(await page.locator('.chemical-card').count(), 1);
  await page.locator('#chemical-search').fill(''); await page.locator('#chemical-filter').selectOption('base'); assert.equal(await page.locator('.chemical-card').count(), 14);
  for (const [filter, count] of [['strong-acid', 2], ['weak-acid', 20], ['strong-base', 2], ['weak-base', 12]]) { await page.locator('#chemical-filter').selectOption(filter); assert.equal(await page.locator('.chemical-card').count(), count); }
  await page.locator('#chemical-filter').selectOption('');
  await page.locator('[data-quiz-options] input[value="1"]').check(); await page.getByRole('button', { name: 'Kiểm tra đáp án', exact: true }).click();
  assert.match(await page.locator('[data-quiz-feedback]').textContent(), /^Đúng/); await page.locator('[data-quiz-next]').click();
  await page.locator('[data-quiz-options] input[value="1"]').check(); await page.getByRole('button', { name: 'Kiểm tra đáp án', exact: true }).click(); assert.match(await page.locator('[data-quiz-feedback]').textContent(), /^Chưa đúng/);
  await page.locator('#faq-question').fill('Điểm tương đương'); await page.getByRole('button', { name: 'Tra cứu hướng dẫn' }).click(); assert.match(await page.locator('[data-faq-output]').textContent(), /hệ số mol/);
  await page.locator('#faq-question').fill('<img src=x onerror=alert(1)>'); await page.getByRole('button', { name: 'Tra cứu hướng dẫn' }).click(); assert.match(await page.locator('[data-faq-output]').textContent(), /chưa có câu trả lời/); assert.equal(await page.locator('[data-faq-output] img').count(), 0);
  await page.locator('#quick-prediction [name="analyteConcentrationM"]').fill('0.2'); await page.locator('#quick-prediction [name="analyteVolumeMl"]').fill('20'); await page.getByRole('button', { name: 'Dự đoán', exact: true }).click(); assert.match(await page.locator('[data-quick-output]').textContent(), /40,00 mL/);
  await page.screenshot({ path: output + '/home-desktop.png', fullPage: true });
  checks.push('Home: catalog search/filter, quiz right/wrong, FAQ safety, official team, no heavy libraries');
  await page.locator('[data-quick-transfer]').click(); await page.waitForFunction(() => document.documentElement.dataset.appReady === 'true'); assert.equal(await page.locator('#analyte-volume').inputValue(), '20');
  await page.reload(); await page.waitForFunction(() => document.documentElement.dataset.appReady === 'true'); assert.equal(await page.locator('#analyte-concentration').inputValue(), '0.2');
  await page.locator('#predict-equivalence').click(); assert.equal(await page.locator('[data-theory-volume]').textContent(), '40,00 mL'); assert.equal(await page.locator('[data-chart-point="Mô phỏng"]').count(), 0);
  const downloadBefore = page.waitForEvent('download'); await page.locator('#export-excel').click(); await (await downloadBefore).saveAs(output + '/before-run.xlsx');
  await page.getByRole('button', { name: 'Tính trạng thái', exact: true }).click(); await page.locator('#add-drop').click();
  const volume = () => page.locator('[data-result="added-volume"]').textContent(); const before = await volume(); const rows = await page.locator('[data-curve-rows]').innerHTML();
  await page.locator('#predict-equivalence').click(); assert.equal(await volume(), before); assert.equal(await page.locator('[data-curve-rows]').innerHTML(), rows);
  await page.locator('#simulation-speed').selectOption('fast'); await page.locator('#run-simulation').click(); await page.locator('#predict-equivalence').click(); assert.equal(await page.locator('#pause-simulation').isEnabled(), true); await page.locator('#pause-simulation').click();
  await page.locator('#chart-style').selectOption('line'); assert.equal(await page.locator('.curve-line').count(), 1);
  const download = page.waitForEvent('download'); await page.locator('#export-excel').click(); await (await download).saveAs(output + '/after-drops.xlsx');
  await page.locator('#guided-ph').fill(await page.locator('[data-result="ph"]').textContent()); await page.locator('#guided-color').selectOption('clear'); await page.locator('#guided-excess').selectOption('H⁺'); await page.getByRole('button', { name: 'Kiểm tra dự đoán', exact: true }).click(); assert.match(await page.locator('[data-guided-feedback]').textContent(), /Chính xác/);
  await page.locator('#reset-simulation').click(); await page.waitForTimeout(1200); assert.equal(await volume(), '0.00 mL');
  checks.push('Direct /simulate + refresh, quick transfer, theory-only chart, prediction leaves current state/runner unchanged, xlsx before/after run');
  const cases = [
    ['strong-acid-strong-base', 'hcl-naoh', '0.1', '0.1', '25,00 mL', 'NaOH'],
    ['weak-acid-strong-base', 'acetic-naoh', '0.1', '0.1', '25,00 mL', 'NaOH'],
    ['strong-acid-weak-base', 'hcl-nh3', '0.1', '0.1', '25,00 mL', 'NH₃'],
    ['strong-acid-weak-base', 'nh3-hcl', '0.1', '0.1', '25,00 mL', 'HCl'],
    ['diprotic-acid-strong-base', 'oxalic-naoh', '0.1', '0.1', 'Nấc 1: 25,00 mL · Nấc 2: 50,00 mL', 'NaOH'],
    ['strong-acid-strong-base', 'hcl-calcium', '0.01', '0.005', '25,00 mL', 'Ca(OH)₂'],
  ];
  for (const [type, pairId, ca, cb, expected, titrant] of cases) {
    await page.locator('#system-type').selectOption(type); await page.locator('#chemical-pair').selectOption(pairId);
    await page.locator('#analyte-concentration').fill(ca); await page.locator('#analyte-volume').fill('25'); await page.locator('#titrant-concentration').fill(cb);
    await page.locator('#predict-equivalence').click(); assert.equal(await page.locator('[data-theory-volume]').textContent(), expected, pairId);
    assert.equal(await page.locator('#titrant').inputValue(), titrant); assert.equal(await page.locator('.axis-label-x').textContent(), `V ${titrant} đã thêm (mL)`);
    await page.getByRole('button', { name: 'Tính trạng thái', exact: true }).click(); const initialPh = await page.locator('[data-chart-point="Mô phỏng"]').last().getAttribute('data-ph');
    await page.locator('#add-drop').click(); assert.equal(await volume(), '0.10 mL'); assert.notEqual(await page.locator('[data-chart-point="Mô phỏng"]').last().getAttribute('data-ph'), initialPh);
    await page.locator('#reset-simulation').click(); assert.equal(await volume(), '0.00 mL');
  }
  checks.push('All six pair/direction selections, labels/axes/theory/initial/drop/reset follow one chemistry state');
  const stage = page.locator('[data-vessel-3d]'); await stage.scrollIntoViewIfNeeded(); await page.waitForFunction(() => document.querySelector('[data-vessel-3d]').dataset.renderer === 'ready');
  const original = await page.locator('[data-vessel-viewport] canvas').boundingBox();
  await page.locator('[data-vessel-fullscreen]').click(); await page.waitForFunction(() => !!document.fullscreenElement || document.querySelector('.vessel-expanded'));
  const expanded = await page.locator('[data-vessel-viewport] canvas').boundingBox(); assert.ok(expanded.width > original.width); assert.ok(expanded.height > original.height);
  await page.locator('[data-camera-reset]').click(); await page.locator('[data-vessel-fullscreen]').click(); await page.waitForFunction(() => !document.fullscreenElement && !document.querySelector('.vessel-expanded'));
  await page.locator('[data-vessel-fullscreen]').click(); await page.waitForFunction(() => !!document.fullscreenElement); await page.keyboard.press('Escape'); await page.waitForFunction(() => !document.fullscreenElement);
  await page.evaluate(() => { document.querySelector('[data-vessel-3d]').requestFullscreen = undefined; }); await page.locator('[data-vessel-fullscreen]').click(); await page.waitForFunction(() => !!document.querySelector('.vessel-expanded')); await page.keyboard.press('Escape'); assert.equal(await page.locator('.vessel-expanded').count(), 0);
  checks.push('Native fullscreen increases renderer size and exits; unsupported API fallback exits with Esc');
  await page.screenshot({ path: output + '/simulate-desktop.png', fullPage: true });
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/simulate']) {
      await page.goto(base + path); await page.waitForFunction(() => document.documentElement.dataset.appReady === 'true');
      if (path === '/simulate') await page.locator('#predict-equivalence').click();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1); assert.equal(overflow, false, path + ' ' + width);
      if (width === 375) await page.screenshot({ path: `${output}/${path === '/' ? 'home' : 'simulate'}-mobile.png`, fullPage: true });
    }
  }
  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }); const touch = await mobile.newPage(); touch.on('pageerror', (e) => errors.push(e.message));
  await touch.goto(base + '/simulate'); await touch.locator('#predict-equivalence').tap(); await touch.locator('[data-chart-point="Lý thuyết"]').nth(2).tap(); assert.match(await touch.locator('[data-chart-readout]').textContent(), /Lý thuyết: V =/); await touch.locator('[data-vessel-3d]').scrollIntoViewIfNeeded(); await touch.locator('[data-vessel-fullscreen]').tap(); await touch.waitForFunction(() => !!document.fullscreenElement || !!document.querySelector('.vessel-expanded')); await touch.locator('[data-vessel-fullscreen]').tap(); await touch.waitForFunction(() => !document.fullscreenElement && !document.querySelector('.vessel-expanded')); await mobile.close();
  checks.push('Responsive 320/375/768/1440 home + simulation, numbered axes and mobile touch tooltip');
  assert.deepEqual(errors, []); await writeFile(output + '/results.json', JSON.stringify({ pass: true, checks, errors }, null, 2)); console.log(JSON.stringify({ pass: true, checks }, null, 2));
} finally { await browser.close(); }
