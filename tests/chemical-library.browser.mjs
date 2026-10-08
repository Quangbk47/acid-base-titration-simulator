import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const base = process.env.SIMULATOR_BASE_URL ?? 'http://localhost:4173';
const output = 'tmp/acid-base-library-qa'; await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = []; const checks = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }); const requests = [];
  page.on('pageerror', (error) => errors.push(error.message)); page.on('request', (request) => requests.push(request.url()));
  const ready = () => page.waitForFunction(() => document.documentElement.dataset.appReady === 'true');
  await page.goto(base + '/'); await ready();
  assert.equal(await page.locator('.chemical-card').count(), 36);
  for (const [filter, count] of [['acid', 22], ['base', 14], ['strong-acid', 2], ['weak-acid', 20], ['strong-base', 2], ['weak-base', 12], ['polyacid', 6], ['ion', 2]]) {
    await page.locator('#chemical-filter').selectOption(filter); assert.equal(await page.locator('.chemical-card').count(), count, filter);
  }
  await page.locator('#chemical-filter').selectOption('');
  for (const [query, id] of [['axit photphoric', 'phosphoric'], ['Hydrofluoric acid', 'hydrofluoric'], ['H₃PO₄', 'phosphoric'], ['CO3^2−', 'carbonate'], ['CH₃COO⁻', 'acetate']]) {
    await page.locator('#chemical-search').fill(query); assert.equal(await page.locator(`[data-chemical-id="${id}"]`).count(), 1, query);
  }
  await page.locator('#chemical-search').fill('not-a-chemical'); assert.equal(await page.locator('.chemical-card').count(), 0); assert.match(await page.locator('[data-chemical-catalog]').textContent(), /Không tìm thấy/);
  await page.locator('#chemical-search').fill('<img src=x onerror=alert(1)>'); assert.equal(await page.locator('[data-chemical-catalog] img').count(), 0);
  const select = async (id) => { await page.locator('#chemical-search').fill(''); await page.locator('#chemical-filter').selectOption(''); await page.locator(`[data-chemical-id="${id}"]`).click(); };
  const detail = page.locator('[data-chemical-detail]');
  await select('phosphoric'); assert.equal(await detail.locator('.equilibrium-step').count(), 3);
  for (const label of ['Ka1', 'pKa1', 'Ka2', 'pKa2', 'Ka3', 'pKa3', 'H₂PO₄⁻', 'HPO₄²⁻', 'PO₄³⁻']) assert.ok((await detail.textContent()).includes(label));
  const first = detail.locator('.equilibrium-step').first(); await first.locator('summary').click(); assert.equal(await first.getAttribute('open'), null); await first.locator('summary').click(); assert.notEqual(await first.getAttribute('open'), null);
  await detail.locator('summary').filter({ hasText: 'Hiểu Ka/Kb' }).click(); assert.match(await detail.textContent(), /pKa = −log/);
  assert.equal(await detail.locator('[data-chemical-simulate]').count(), 0); assert.match(await detail.textContent(), /Hiện chỉ hỗ trợ tra cứu/);
  await page.screenshot({ path: output + '/phosphoric-desktop.png', fullPage: true });
  await detail.locator('[data-close-chemical]').click(); assert.equal(await detail.isVisible(), false);
  assert.equal(await page.locator('[data-chemical-id="phosphoric"]').evaluate((el) => el === document.activeElement), true);
  await select('oxalic'); assert.equal(await detail.locator('.equilibrium-step').count(), 2); assert.equal(await detail.locator('[data-chemical-simulate]').count(), 1);
  await select('sulfuric'); assert.match(await detail.locator('.equilibrium-step').first().textContent(), /Phân ly mạnh/); assert.match(await detail.locator('.equilibrium-step').nth(1).textContent(), /Ka2/);
  await select('boric'); assert.equal(await detail.locator('.equilibrium-step').count(), 1); assert.match(await detail.textContent(), /Lewis/);
  await select('carbonate'); assert.match(await detail.textContent(), /Kw\/Ka₂/); assert.equal(await detail.locator('[data-chemical-simulate]').count(), 0);
  await select('urea'); assert.match(await detail.textContent(), /Cần xác minh/); assert.match(await detail.textContent(), /21 °C/); assert.doesNotMatch(await detail.textContent(), /pKb\s*=\s*[-+]?\d/);
  await select('hydrazine'); assert.match(await detail.locator('.equilibrium-step').nth(1).textContent(), /Kb2: Cần xác minh/);
  assert.ok(!requests.some((url) => /vendor\/three|excelExport|api\.openai/.test(url)));
  checks.push('36 entries, all 8 filters, bilingual/unicode/charged search, no-results and markup safety; no heavy/external AI loads');
  checks.push('H3PO4 3 stages, oxalic 2, sulfuric strong first, boric Lewis, carbonate derivation, urea/hydrazine pending; disclosures and keyboard focus');
  for (const [chemical, pairId, ca, cb, volume] of [['acetic', 'acetic-naoh', '0.1', '0.1', '25,00 mL'], ['oxalic', 'oxalic-naoh', '0.1', '0.1', 'Nấc 1: 25,00 mL · Nấc 2: 50,00 mL'], ['calcium', 'hcl-calcium', '0.01', '0.005', '25,00 mL']]) {
    await page.goto(base + '/'); await ready(); await select(chemical); await detail.locator('[data-chemical-simulate]').first().click(); await ready();
    assert.equal(await page.locator('#chemical-pair').inputValue(), pairId); assert.equal(await page.locator('#analyte-concentration').inputValue(), ca); assert.equal(await page.locator('#titrant-concentration').inputValue(), cb);
    await page.reload(); await ready(); await page.locator('#predict-equivalence').click(); assert.equal(await page.locator('[data-theory-volume]').textContent(), volume);
    await page.getByRole('button', { name: 'Tính trạng thái', exact: true }).click(); await page.locator('#add-drop').click(); assert.equal(await page.locator('[data-result="added-volume"]').textContent(), '0.10 mL'); await page.locator('#reset-simulation').click();
  }
  checks.push('Lookup-to-supported-model transfer plus direct reload, theory, drop and reset: acetic/oxalic/calcium; no unsupported model link');
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 }); await page.goto(base + '/'); await ready();
    await page.locator('#chemical-search').fill('Phosphoric'); await page.locator('[data-chemical-id="phosphoric"]').click();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'Detail width ' + width);
    if (width === 375) await page.screenshot({ path: output + '/phosphoric-mobile.png', fullPage: true });
  }
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true }); const touch = await context.newPage(); touch.on('pageerror', (e) => errors.push(e.message));
  await touch.goto(base + '/'); await touch.locator('#chemical-search').fill('H3PO4'); await touch.locator('[data-chemical-id="phosphoric"]').tap(); await touch.locator('.equilibrium-step summary').nth(2).tap(); assert.equal(await touch.locator('.equilibrium-step').nth(2).getAttribute('open'), null); await context.close();
  checks.push('Desktop/mobile 320/375/768/1440 without overflow, native touch details');
  assert.deepEqual(errors, []); await writeFile(output + '/library-results.json', JSON.stringify({ pass: true, checks, errors }, null, 2)); console.log(JSON.stringify({ pass: true, checks }, null, 2));
} finally { await browser.close(); }
