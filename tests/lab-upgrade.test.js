import { describeRegion } from '../src/chemistry/regions.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { assessMeasurements, validateMeasurements, estimateEquivalence } from '../src/analysis/assessment.js';
import { parseCSV, tableToMeasurements, unzipWorkbook } from '../src/analysis/importData.js';
import { createLocalHistory, encodeCloudSession, decodeCloudSession } from '../src/history/sessions.js';
import { connectLabAccount } from '../src/firebase/labRuntime.js';
import { calculateTheory } from '../src/ui/theoryView.js';
import { titrationPairs } from '../src/data/titrationPairs.js';
import { solvePair, withTitrantVolume } from '../src/chemistry/pairSolver.js';
import { createWorkbook, experimentSheets } from '../src/ui/excelExport.js';
const values = (id = 'hcl-naoh') => ({ pairId: id, systemType: titrationPairs.find((p) => p.id === id).systemType, analyteConcentrationM: 0.1, analyteVolumeMl: 25, titrantConcentrationM: id === 'hcl-calcium' ? 0.005 : 0.1, addedVolumeMl: 0, buretVolumeMl: 50, Ka: 1.8e-5, Kb: 1.8e-5 });
const near = (a, b, tolerance = 1e-10) => assert.ok(Math.abs(a - b) < tolerance, `${a} ≈ ${b}`);
const data = (id = 'hcl-naoh') => { const setup = values(id); const theory = calculateTheory(setup); return [0, 12.5, 24, 26, 40].map((volumeMl) => ({ volumeMl, pH: solvePair(withTitrantVolume(theory.input, volumeMl)).pH })); };
test('Lab: reference MAE/RMSE/max calculations are correct; source and reliability remain distinct', () => {
  const rows = data(); const differences = [0.1, -0.2, 0, 0.3, -0.1]; rows.forEach((p, i) => p.pH += differences[i]);
  const result = assessMeasurements({ rows, values: values(), source: 'measured' }); assert.equal(result.ok, true);
  near(result.metrics.mae, 0.14); near(result.metrics.rmse, Math.sqrt(0.15 / 5)); near(result.metrics.maxDeviation, 0.3);
  assert.match(result.conclusion, /Phù hợp tốt/); assert.ok(result.warnings.some((w) => /chưa đủ cơ sở.*độ lặp lại/.test(w)));
  assert.equal(assessMeasurements({ rows: data(), values: values(), source: 'simulation' }).warnings.some((w) => /không phải số liệu đo/.test(w)), true);
});
test('Lab: no invented results for empty, invalid, sparse, unsupported or non-25C data', () => {
  for (const rows of [[], [{ volumeMl: '', pH: 7 }], [{ volumeMl: 0, pH: 'NaN' }], [{ volumeMl: -1, pH: 2 }], [{ volumeMl: 0, pH: 15 }]]) assert.equal(assessMeasurements({ rows, values: values() }).ok, false);
  assert.equal(assessMeasurements({ rows: data(), values: values(), temperatureC: 20 }).ok, false);
  assert.equal(assessMeasurements({ rows: data(), values: { ...values(), pairId: 'unknown' } }).ok, false);
  const sparse = assessMeasurements({ rows: data().slice(0, 2), values: values() }); assert.equal(sparse.ok, true); assert.match(sparse.conclusion, /Chưa đủ/); assert.equal(sparse.endpoint, null);
  assert.equal(assessMeasurements({ rows: data(), values: values(), criteria: { goodRmse: NaN } }).ok, false);
});
test('Lab: duplicates and unsorted volumes are warned but never altered', () => {
  const rows = [{ volumeMl: '25,0', pH: '7,0' }, { volumeMl: '0', pH: '1' }, { volumeMl: '25', pH: '7.1' }]; const original = JSON.stringify(rows);
  const result = validateMeasurements(rows); assert.equal(result.ok, true); assert.equal(result.warnings.length, 2); assert.equal(JSON.stringify(rows), original); assert.deepEqual(result.points.map((p) => p.volumeMl), [25, 0, 25]);
});
test('Lab: equivalence estimate needs coverage, resolution and an identifiable steep interval', () => {
  const points = [0, 20, 24.9, 25.1, 30].map((volumeMl) => ({ volumeMl, pH: solvePair(withTitrantVolume(calculateTheory(values()).input, volumeMl)).pH }));
  const estimate = estimateEquivalence(points, 25); near(estimate.volumeMl, 25); near(estimate.resolutionMl, 0.1);
  assert.equal(estimateEquivalence(points.slice(0, 3), 25), null); assert.equal(estimateEquivalence([...points, points[0]], 25), null);
  assert.equal(assessMeasurements({ rows: data('oxalic-naoh'), values: values('oxalic-naoh') }).endpoint, null);
});
test('Lab: CSV decimal commas, quoted cells, BOM, tabs and invalid quotes', () => {
  assert.deepEqual(tableToMeasurements(parseCSV('\uFEFFV;pH\r\n0;1,0\r\n25;7,0')), [{ volumeMl: '0', pH: '1,0' }, { volumeMl: '25', pH: '7,0' }]);
  assert.deepEqual(parseCSV('V,pH\n"0","1"'), [['V', 'pH'], ['0', '1']]); assert.equal(parseCSV('V\tpH\n25\t7')[1][1], '7');
  assert.throws(() => parseCSV('V,pH\n"0,1'), /ngoặc kép/); assert.deepEqual(parseCSV('V,pH\n,')[1], ['', '']);
});
test('Lab: workbook contains genuine native XY chart, measured series, axes and data, no formula injection', async () => {
  const assessment = assessMeasurements({ rows: data(), values: values(), note: '=WEBSERVICE("bad")', source: 'measured' });
  const sheets = experimentSheets({ values: values(), theory: assessment.theory, assessment }); assert.deepEqual(sheets.map((s) => s.name), ['Thông số', 'Lý thuyết', 'Dữ liệu pH-V', 'Đồ thị', 'Đánh giá số liệu']);
  const files = await unzipWorkbook(createWorkbook(sheets)); const chart = files['xl/charts/chart4.xml'];
  assert.match(chart, /scatterChart/); assert.equal((chart.match(/<c:delete val="0"/g) ?? []).length, 2); assert.match(chart, /Dữ liệu đo/); assert.match(chart, /Thể tích dung dịch chuẩn \(mL\)/); assert.match(chart, /<c:smooth val="0"/);
  assert.match(files['xl/worksheets/sheet4.xml'], /drawing r:id="drawing"/); assert.match(files['xl/drawings/_rels/drawing4.xml.rels'], /chart4.xml/);
  assert.match(files['xl/worksheets/sheet5.xml'], /t="inlineStr"/); assert.ok(!files['xl/worksheets/sheet5.xml'].includes('<f>'));
  assert.match(files['xl/worksheets/sheet5.xml'], /<v>25<\/v>/); assert.ok(!chart.includes('External'));
});
test('Lab: local sessions are append-only until explicit removal, preserve values and reject bad payloads', () => {
  const memory = new Map(); const repository = createLocalHistory({ getItem: (k) => memory.get(k), setItem: (k, v) => memory.set(k, v) });
  const session = { version: 1, createdAt: new Date().toISOString(), simulation: { values: values() } }; const one = repository.create(session); const two = repository.create(session);
  assert.notEqual(one.id, two.id); assert.equal(repository.list().length, 2); repository.remove(one.id); assert.equal(repository.list()[0].id, two.id);
  assert.throws(() => repository.create({}), /không hợp lệ/); const cloud = encodeCloudSession('owner', session, 123);
  assert.deepEqual(Object.keys(cloud).sort(), ['createdAt', 'input', 'modelVersion', 'uid', 'updatedAt']); assert.equal(cloud.uid, 'owner'); assert.equal(decodeCloudSession('legacy', { input: { Ca: 0.1 } }).unsupported, true); assert.equal(cloud.input.simulation.values.pairId, 'hcl-naoh');
});
test('Lab: cloud is explicitly off by default; guest operation never contacts production', async () => {
  assert.deepEqual(await connectLabAccount(() => {}), { configured: false });
});
test('Lab: supported weak systems preserve material/charge balance across representative volumes', () => {
  for (const id of ['acetic-naoh', 'nh3-hcl', 'hcl-nh3', 'oxalic-naoh']) {
    const theory = calculateTheory(values(id)); assert.equal(theory.ok, true); assert.ok(theory.pH !== 7);
    for (const volume of [0, 12.5, 25, 40, 50]) { const result = solvePair(withTitrantVolume(theory.input, volume)); assert.ok(!result.error); const charges = { 'H⁺': 1, 'OH⁻': -1, 'Na⁺': 1, 'Cl⁻': -1, 'CH₃COO⁻': -1, 'A⁻': -1, 'NH₄⁺': 1, 'HC₂O₄⁻': -1, 'C₂O₄²⁻': -2 }; const net = result.species.reduce((sum, p) => sum + (charges[p.id] ?? 0) * p.concentration, 0); near(net, 0, 1e-10); const pool = result.species.filter((p) => ['HA', 'A⁻', 'NH₃', 'NH₄⁺', 'H₂C₂O₄', 'HC₂O₄⁻', 'C₂O₄²⁻'].includes(p.id)).reduce((sum, p) => sum + p.concentration, 0); near(pool * result.totalVolumeL, id === 'hcl-nh3' ? 0.1 * volume / 1000 : 0.0025, 1e-10); }
  }
});

test('Lab: descriptive regions identify initial, buffer, equivalence and excess without changing solver pH', () => {
  const theory = calculateTheory(values('acetic-naoh'));
  for (const [volume, pattern] of [[0, /Ban đầu/], [12.5, /vùng đệm/], [25, /Tại điểm tương đương/], [40, /Sau điểm tương đương/]]) { const result = solvePair(withTitrantVolume(theory.input, volume)); assert.match(describeRegion(result, { addedVolumeMl: volume }), pattern); }
});
