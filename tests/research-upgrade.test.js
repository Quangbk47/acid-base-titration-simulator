import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTheory } from '../src/ui/theoryView.js';
import { evaluateTitration } from '../src/ui/inputForm.js';
import { chemicals, calciumSolubilityM } from '../src/data/chemicals.js';
import { titrationPairs } from '../src/data/titrationPairs.js';
import { solvePair, withTitrantVolume, phenolphthaleinThresholdMl } from '../src/chemistry/pairSolver.js';
import { createSimulationState, addDrop, resetSimulation } from '../src/simulation/state.js';
import { experimentSheets, createWorkbook } from '../src/ui/excelExport.js';
import { faqAnswer, normalizeSearch, quizQuestions } from '../src/data/learning.js';
import { project } from '../src/data/project.js';
import { createSimulationReport } from '../src/ui/report.js';
import { validatePassiveGraphSvg } from '../src/ui/htmlSafety.js';
import { buildChartModel, buildAxisTicks } from '../src/ui/chartView.js';

const values = (pair, overrides = {}) => ({ systemType: pair.systemType, pairId: pair.id, analyteConcentrationM: 0.1, analyteVolumeMl: 25, titrantConcentrationM: pair.id === 'hcl-calcium' ? 0.005 : 0.1, buretVolumeMl: 500, addedVolumeMl: 0, Ka: 1.8e-5, Kb: 1.8e-5, ...overrides });
const approx = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≈ ${expected}`);

test('Research: every selectable pair matches its type, stoichiometry and equivalent pH region', () => {
  for (const pair of titrationPairs) {
    const theory = calculateTheory(values(pair)); assert.equal(theory.ok, true, pair.id);
    approx(theory.equivalenceMl, 25 * 0.1 * pair.ratio / (pair.id === 'hcl-calcium' ? 0.005 : 0.1));
    assert.equal(theory.analyte, pair.analyte); assert.equal(theory.titrant, pair.titrant);
    if (pair.base === 'ammonia') assert.ok(theory.pH < 7);
    else if (['acetic', 'oxalic'].includes(pair.acid)) assert.ok(theory.pH > 7);
    else approx(theory.pH, 7);
    const evaluated = evaluateTitration(values(pair)); assert.equal(evaluated.ok, true);
    const state = createSimulationState(evaluated.chemistryInput).state;
    const dropped = addDrop(state, 0.1).state; approx(dropped.addedVolumeMl, 0.1);
    assert.ok(!solvePair(dropped.chemistryInput).error); const reset = resetSimulation(dropped).state;
    approx(reset.chemistryInput[reset.titrantVolumeKey], 0); approx(solvePair(reset.chemistryInput).pH, evaluated.result.pH);
    const curve = buildChartModel(theory.input, 0); assert.ok(!curve.error); assert.ok(curve.points.every((p) => Number.isFinite(p.pH)));
  }
});
test('Research: independent mass and charge balance for oxalic acid at both equivalences and beyond', () => {
  const theory = calculateTheory(values(titrationPairs.find((p) => p.id === 'oxalic-naoh')));
  assert.deepEqual(theory.equivalents.map((p) => p.volumeMl), [25, 50]);
  for (const volume of [0, 12.5, 25, 49.9, 50, 50.1, 100]) {
    const result = solvePair(withTitrantVolume(theory.input, volume)); assert.ok(!result.error);
    const concentration = (id) => result.species.find((s) => s.id === id).concentration;
    approx(concentration('H₂C₂O₄') + concentration('HC₂O₄⁻') + concentration('C₂O₄²⁻'), 0.0025 / result.totalVolumeL);
    approx(concentration('H⁺') + concentration('Na⁺') - concentration('OH⁻') - concentration('HC₂O₄⁻') - 2 * concentration('C₂O₄²⁻'), 0, 1e-11);
    approx(concentration('H⁺') * concentration('HC₂O₄⁻') / concentration('H₂C₂O₄'), 0.06);
    approx(concentration('H⁺') * concentration('C₂O₄²⁻') / concentration('HC₂O₄⁻'), 6.1e-5);
  }
  // Initial acid: second dissociation is small; exact first-step quadratic.
  const hReference = (-0.06 + Math.sqrt(0.06 ** 2 + 4 * 0.06 * 0.1)) / 2;
  approx(solvePair(theory.input).pH, -Math.log10(hReference), 0.002);
});
test('Research: reversed HCl–NH3 conserves ammonia and agrees with NH3–HCl at equivalent mixtures', () => {
  const theory = calculateTheory(values(titrationPairs.find((p) => p.id === 'hcl-nh3')));
  approx(theory.pH, calculateTheory(values(titrationPairs.find((p) => p.id === 'nh3-hcl'))).pH, 1e-6);
  for (const volume of [0, 10, 25, 40, 50]) {
    const result = solvePair(withTitrantVolume(theory.input, volume)); const c = (id) => result.species.find((s) => s.id === id).concentration;
    approx(c('NH₃') + c('NH₄⁺'), 0.1 * volume / 1000 / result.totalVolumeL);
    approx(c('H⁺') + c('NH₄⁺') - c('OH⁻') - c('Cl⁻'), 0, 1e-11);
  }
});
test('Research: calcium uses 2 OH equivalents, physical calcium species and dissolved solubility bound', () => {
  const pair = titrationPairs.find((p) => p.id === 'hcl-calcium');
  assert.equal(evaluateTitration(values(pair, { titrantConcentrationM: 0.1 })).ok, false);
  assert.equal(evaluateTitration(values(pair, { titrantConcentrationM: calciumSolubilityM })).ok, true);
  const theory = calculateTheory(values(pair, { analyteConcentrationM: 0.01 })); approx(theory.equivalenceMl, 25);
  const result = solvePair(withTitrantVolume(theory.input, 25)); approx(result.pH, 7);
  assert.ok(!result.species.some((s) => s.id === 'Na⁺')); approx(result.species.find((s) => s.id === 'Ca²⁺').moles, 0.000125);
  assert.equal(evaluateTitration(values(pair, { pairId: 'hcl-nh3' })).ok, false);
});
test('Research: Excel sheets use numeric exact history and distinguish pre-run theory; text cannot become formula', () => {
  const pair = titrationPairs[0]; const setup = values(pair); const theory = calculateTheory(setup);
  const history = [{ volumeMl: 0, pH: 1, stage: 'before-equivalence' }, { volumeMl: 25, pH: 7, stage: 'at-equivalence' }];
  const sheets = experimentSheets({ values: setup, theory, state: { initialBuretVolumeMl: 50, addedVolumeMl: 25 }, history });
  assert.deepEqual(sheets.map((s) => s.name), ['Thông số', 'Lý thuyết', 'Dữ liệu pH-V']);
  assert.deepEqual(sheets[2].rows.filter((r) => r[2] === 'Mô phỏng').map((r) => r.slice(0, 2)), [[0, 1], [25, 7]]);
  const before = experimentSheets({ values: setup, theory }); assert.ok(!before[2].rows.some((r) => r[2] === 'Mô phỏng'));
  const bytes = createWorkbook([{ name: 'Kiểm tra', rows: [['=1+1', '<script> &'], [25, 7]] }]);
  const text = new TextDecoder().decode(bytes); assert.match(text, /t="inlineStr"/); assert.match(text, /&lt;script&gt; &amp;/); assert.ok(!text.includes('<f>'));
  assert.equal(new DataView(bytes.buffer).getUint32(0, true), 0x04034b50);
  assert.throws(() => createWorkbook([{ name: 'Bad', rows: [[NaN]] }]), /không hữu hạn/);
});
test('Research: learning data, official team and catalog are consistent and do not invent AI', () => {
  assert.equal(chemicals.length, 36); assert.equal(normalizeSearch('Axit CH₃COOH'), 'axit ch3cooh');
  assert.match(faqAnswer('Điểm tương đương là gì?'), /tỉ|lượng|hệ số mol/);
  assert.match(faqAnswer('unknown topic'), /chưa có câu trả lời/);
  assert.ok(quizQuestions.length >= 5); assert.ok(quizQuestions.every((q) => q.options[q.correct] && q.explanation));
  assert.deepEqual(project.members.map((p) => p.name), ['Nguyễn Bắc Hà', 'Đồng Nhật Anh', 'Nguyễn Đình Tuấn', 'Nguyễn Bùi Bảo Ngọc']);
  assert.equal(project.adviser, 'TS. Nguyễn Trọng Quang');
});

test('Research: indicator threshold uses the selected equilibrium and never substitutes for equivalence', () => {
  for (const id of ['acetic-naoh', 'oxalic-naoh', 'hcl-calcium']) {
    const setup = values(titrationPairs.find((pair) => pair.id === id));
    const theory = calculateTheory(setup); const threshold = phenolphthaleinThresholdMl(theory.input, theory.equivalenceMl * 2);
    assert.ok(Number.isFinite(threshold)); approx(solvePair(withTitrantVolume(theory.input, threshold)).pH, 8.2, 1e-7);
    const curve = buildChartModel(theory.input, 0); assert.ok(curve.points.some((point) => Math.abs(point.volumeMl - threshold) < 1e-9));
  }
  const ammonia = calculateTheory(values(titrationPairs.find((pair) => pair.id === 'hcl-nh3')));
  assert.equal(phenolphthaleinThresholdMl(ammonia.input, 50), null);
  assert.deepEqual(buildAxisTicks(50, 320).y, [0, 2, 4, 6, 8, 10, 12, 14]);
  const extended = buildAxisTicks(50, 640, -2, 16); assert.equal(extended.y[0], -2); assert.equal(extended.y.at(-1), 16);
});

test('Research: existing HTML report uses the right titrant volume in both ammonia directions', () => {
  for (const id of ['nh3-hcl', 'hcl-nh3']) {
    const theory = calculateTheory(values(titrationPairs.find((pair) => pair.id === id)));
    for (const volume of [0, 10]) {
      const input = withTitrantVolume(theory.input, volume); const result = solvePair(input);
      const report = createSimulationReport({ input, result, history: [], modelVersion: result.modelVersion });
      approx(report.current.volumeMl, volume);
    }
  }
  assert.equal(validatePassiveGraphSvg('<svg><line data-equivalence-volume="25" x1="1" x2="1" y1="0" y2="100" /></svg>'), true);
  assert.equal(validatePassiveGraphSvg('<svg><line data-equivalence-volume="javascript:alert(1)" /></svg>'), false);
});
