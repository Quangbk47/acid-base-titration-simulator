import assert from 'node:assert/strict';
import test from 'node:test';
import {
  generateCurve,
  generateStrongAcidWeakBaseCurve,
  generateWeakAcidCurve,
  solveStrongAcidWeakBase,
  solveStrongStrong,
  solveWeakAcidStrongBase,
} from '../src/chemistry/index.js';
import {
  phase4WorkbookMetadata,
  phase4WorkbookSystems,
  PHASE_4_PROVISIONAL_PH_TOLERANCE,
} from './fixtures/phase4Reference.js';

const chemistryInput = (system, volumeMl) => {
  const common = { temperature: 298.15 };
  if (system.id === 'NH3-HCl') {
    return { ...common, Ca: system.titrantConcentrationM, Va: volumeMl / 1000, Cb: system.analyteConcentrationM, Vb: system.analyteVolumeMl / 1000, Kb: system.equilibriumConstant };
  }
  return { ...common, Ca: system.analyteConcentrationM, Va: system.analyteVolumeMl / 1000, Cb: system.titrantConcentrationM, Vb: volumeMl / 1000, ...(system.id === 'CH3COOH-NaOH' ? { Ka: system.equilibriumConstant } : {}) };
};

const solve = (system, volumeMl) => {
  const input = chemistryInput(system, volumeMl);
  if (system.id === 'HCl-NaOH') return solveStrongStrong(input);
  if (system.id === 'CH3COOH-NaOH') return solveWeakAcidStrongBase(input);
  return solveStrongAcidWeakBase(input);
};

test('Phase 4 workbook import preserves source identity and incomplete review gates', () => {
  assert.equal(phase4WorkbookMetadata.sha256, '9B53E2BFAABF4145847BDFA9E9FF4686A853D3DFF32889C3D0E20947DC567CCC');
  assert.equal(phase4WorkbookMetadata.reviewStatus, 'PENDING');
  assert.equal(phase4WorkbookMetadata.declaredPHTolerance, null);
  assert.equal(phase4WorkbookMetadata.declaredVolumeToleranceMl, null);
  assert.deepEqual(phase4WorkbookSystems.map(({ id }) => id), ['HCl-NaOH', 'CH3COOH-NaOH', 'NH3-HCl']);
});

test('Phase 4 workbook Veq is independently confirmed for all three systems', () => {
  for (const system of phase4WorkbookSystems) {
    const calculatedVeqMl = system.id === 'NH3-HCl'
      ? system.analyteConcentrationM * system.analyteVolumeMl / system.titrantConcentrationM
      : system.analyteConcentrationM * system.analyteVolumeMl / system.titrantConcentrationM;
    assert.ok(Math.abs(calculatedVeqMl - system.expectedVeqMl) <= 1e-12, system.id);
    for (const row of system.rows) assert.ok(Math.abs(row.expectedPH + row.expectedPOH - 14) <= 1e-12, `${system.id}/${row.milestone}`);
  }
});

test('Phase 4 audit detects workbook pH discrepancies without rewriting expected values', () => {
  const discrepancies = [];
  for (const system of phase4WorkbookSystems) {
    for (const row of system.rows) {
      const actual = solve(system, row.volumeMl);
      assert.equal(actual.error, undefined, `${system.id}/${row.milestone}`);
      const deltaPH = Math.abs(actual.pH - row.expectedPH);
      if (deltaPH > PHASE_4_PROVISIONAL_PH_TOLERANCE) discrepancies.push({ system: system.id, milestone: row.milestone, deltaPH });
    }
  }
  assert.equal(discrepancies.length, 1);
  assert.equal(discrepancies[0].system, 'HCl-NaOH');
  assert.equal(discrepancies[0].milestone, '25-percent');
  assert.ok(discrepancies[0].deltaPH > 0.17);
});

test('Phase 4 audit records stage vocabulary differences instead of changing solver physics', () => {
  const differences = [];
  for (const system of phase4WorkbookSystems) {
    for (const row of system.rows) {
      const actual = solve(system, row.volumeMl);
      if (actual.stage !== row.expectedStage) differences.push(`${system.id}/${row.milestone}`);
    }
  }
  assert.deepEqual(differences, [
    'HCl-NaOH/90-percent',
    'HCl-NaOH/99-percent',
    'CH3COOH-NaOH/initial',
    'CH3COOH-NaOH/half-equivalence',
    'CH3COOH-NaOH/90-percent',
    'CH3COOH-NaOH/99-percent',
    'NH3-HCl/initial',
    'NH3-HCl/half-equivalence',
    'NH3-HCl/90-percent',
    'NH3-HCl/99-percent',
  ]);
});

test('Phase 4 curves include every completed workbook checkpoint in order', () => {
  for (const system of phase4WorkbookSystems) {
    const volumesMl = system.rows.map(({ volumeMl }) => volumeMl);
    const input = chemistryInput(system, 0);
    const options = { volumesMl, maxVolumeMl: Math.max(...volumesMl) };
    const curve = system.id === 'HCl-NaOH'
      ? generateCurve(input, options)
      : system.id === 'CH3COOH-NaOH'
        ? generateWeakAcidCurve(input, options)
        : generateStrongAcidWeakBaseCurve(input, options);
    assert.equal(curve.error, undefined, system.id);
    for (const volumeMl of volumesMl) assert.ok(curve.points.some((point) => Math.abs(point.volumeMl - volumeMl) <= 1e-12), `${system.id}/${volumeMl}`);
    assert.deepEqual(curve.points.map(({ volumeMl }) => volumeMl), [...curve.points.map(({ volumeMl }) => volumeMl)].sort((a, b) => a - b));
  }
});
