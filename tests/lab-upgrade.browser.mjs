import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const base = 'http://localhost:4173'; const output = 'tmp/lab-upgrade-qa'; await mkdir(output, { recursive: true });
const errors = []; const checks = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }); page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + '/simulate'); await page.waitForFunction(() => document.documentElement.dataset.appReady === 'true');
  await page.locator('#data-assessment button[type="submit"]').click(); assert.match(await page.locator('[data-assessment-status]').textContent(), /Chưa có số liệu/);
  await page.locator('#data-assessment summary').filter({ hasText: 'Import CSV' }).click();
  await page.locator('[data-import-file]').setInputFiles({ name: 'measurements.csv', mimeType: 'text/csv', buffer: Buffer.from('V (mL),pH\n0,1.1\n12.5,1.5\n24,2.7\n26,11.3\n40,12.4') });
  await page.waitForFunction(() => document.querySelector('[data-confirm-import]').disabled === true && document.querySelector('[data-import-preview] table'));
  assert.equal(await page.locator('[data-measurement-rows] tr').count(), 0); await page.locator('[data-import-units]').check(); await page.locator('[data-confirm-import]').click(); assert.equal(await page.locator('[data-measurement-rows] tr').count(), 5);
  await page.locator('[data-assessment-form] [name="source"]').selectOption('measured'); await page.locator('#data-assessment button[type="submit"]').click(); assert.match(await page.locator('[data-assessment-output]').textContent(), /MAE =/); assert.equal(await page.locator('[data-assessment-output] svg circle').count(), 5);
  assert.match(await page.locator('[data-assessment-output]').textContent(), /chưa đủ cơ sở kết luận/);
  const exportPromise = page.waitForEvent('download'); await page.locator('[data-export-assessment]').click(); const download = await exportPromise; await download.saveAs(output + '/evaluation.xlsx');
  // Import our exported OOXML using its actual numeric sheet, including native chart assets.
  await page.locator('[data-import-file]').setInputFiles(output + '/evaluation.xlsx'); await page.waitForFunction(() => document.querySelector('[data-import-sheet]').options.length === 5);
  await page.locator('[data-import-sheet]').selectOption({ label: 'Dữ liệu pH-V' }); assert.match(await page.locator('[data-import-preview]').textContent(), /V chất chuẩn/);
  const importValidation = await page.evaluate(async () => {
    const { parseXlsx } = await import('/src/analysis/importData.js'); const { zipFiles } = await import('/src/ui/excelExport.js');
    try { await parseXlsx(zipFiles({ 'xl/workbook.xml': '<!DOCTYPE x [<!ENTITY bad SYSTEM "file:///x">]><x/>' })); return false; } catch { return true; }
  }); assert.equal(importValidation, true);
  const firstVolume = await page.locator('[data-volume]').first().inputValue(); await page.locator('[data-add-row]').click(); assert.equal(await page.locator('[data-volume]').first().inputValue(), firstVolume); assert.equal(await page.locator('[data-export-assessment]').isDisabled(), true); await page.locator('[data-delete-row]').last().click();
  await page.getByRole('button', { name: 'Tính trạng thái', exact: true }).click(); await page.locator('#add-drop').click(); await page.locator('[data-save-session]').click(); await page.waitForFunction(() => document.querySelectorAll('[data-open-session]').length === 1); await page.locator('#reset-simulation').click(); await page.locator('[data-open-session]').click(); assert.equal(await page.locator('[data-result="added-volume"]').textContent(), '0.10 mL');
  await page.reload(); await page.waitForFunction(() => document.documentElement.dataset.appReady === 'true'); await page.locator('[data-refresh-history]').click(); assert.equal(await page.locator('[data-open-session]').count(), 1);
  page.once('dialog', (dialog) => dialog.accept()); await page.locator('[data-delete-session]').click(); await page.waitForFunction(() => document.querySelectorAll('[data-open-session]').length === 0);
  for (const width of [320, 375, 768, 1440]) { await page.setViewportSize({ width, height: 900 }); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, 'overflow ' + width); }
  await page.setViewportSize({ width: 375, height: 900 }); await page.locator('#data-assessment').screenshot({ path: output + '/assessment-mobile.png' });
  checks.push('CSV preview/units/confirm; invalid/empty input; real metrics and graph; native-chart XLSX download/import; entity rejection; editable rows and stale invalidation');
  checks.push('Guest local save/reload/open paused/delete; no forced account; desktop/mobile 320/375/768/1440');
  if (process.env.LAB_EMULATOR === '1') {
    const context = await browser.newContext(); const online = await context.newPage(); online.on('pageerror', (e) => errors.push(e.message));
    const external = []; online.on('request', (r) => { if (!['localhost', '127.0.0.1'].includes(new URL(r.url()).hostname)) external.push(r.url()); });
    await online.addInitScript(() => { globalThis.__LAB_FIREBASE__ = { enabled: true, allowRegistration: true, config: { apiKey: 'demo-local-only', authDomain: 'localhost', projectId: 'demo-acid-base-titration', appId: '1:0:web:demo' }, emulators: { auth: 9099, firestore: 8085 } }; });
    await online.goto(base + '/simulate'); await online.waitForFunction(() => document.documentElement.dataset.appReady === 'true');
    const email = 'lab-' + crypto.randomUUID() + '@example.test'; const password = crypto.randomUUID();
    await online.locator('[data-login-form] [name="email"]').fill(email); await online.locator('[data-login-form] [name="password"]').fill(password); await online.locator('[data-register]').click();
    await online.waitForFunction(() => document.querySelector('[data-account-status]').textContent.includes('Đã đăng nhập'));
    await online.locator('[data-history-mode]').selectOption('cloud'); await online.locator('[data-save-session]').click(); await online.waitForFunction(() => document.querySelectorAll('[data-open-session]').length === 1);
    await online.locator('[data-signout]').click(); await online.waitForFunction(() => !document.querySelector('[data-login-form]').hidden); assert.equal(await online.locator('[data-open-session]').count(), 0);
    await online.locator('[data-login-form] [name="email"]').fill(email); await online.locator('[data-login-form] [name="password"]').fill(password); await online.locator('[data-login-form] button[type="submit"]').click(); await online.waitForFunction(() => document.querySelector('[data-account-status]').textContent.includes('Đã đăng nhập'));
    await online.locator('[data-history-mode]').selectOption('cloud'); await online.waitForFunction(() => document.querySelectorAll('[data-open-session]').length === 1); await online.locator('[data-open-session]').click();
    online.once('dialog', (dialog) => dialog.accept()); await online.locator('[data-delete-session]').click(); await online.waitForFunction(() => document.querySelectorAll('[data-open-session]').length === 0);
    assert.deepEqual(external, []); await context.close(); checks.push('Actual Auth + Firestore demo Emulators: register/sign-in/sign-out, account history create/list/open/delete; zero production requests');
  }
  assert.deepEqual(errors, []); await writeFile(output + '/browser-results.json', JSON.stringify({ pass: true, checks, emulator: process.env.LAB_EMULATOR === '1' }, null, 2)); console.log(JSON.stringify({ pass: true, checks }, null, 2));
} finally { await browser.close(); }
