import test from 'node:test';
import assert from 'node:assert/strict';
import { phase4References } from './fixtures/phase4Reference.js';
import { solveStrongStrong, solveWeakAcidStrongBase, mlToL, celsiusToKelvin } from '../src/chemistry/index.js';

const solverBySystem = {
  'HCl-NaOH': solveStrongStrong,
  'CH3COOH-NaOH': solveWeakAcidStrongBase,
};

const buildInput = (data, point) => ({
  Ca: data.analyte.concentration,
  Va: mlToL(data.analyte.volume),
  Cb: data.titrant.concentration,
  Vb: mlToL(point.vAdded),
  temperature: celsiusToKelvin(data.metadata.temperatureC),
  ...(data.analyte.pKa ? { Ka: 10 ** -data.analyte.pKa } : {}),
});

const solveReferencePoint = (systemName, data, point) => {
  const solve = solverBySystem[systemName];
  if (!solve) return null;
  return solve(buildInput(data, point));
};

const assertReferencePoint = (systemName, data, point, result) => {
  assert.ok(result, `${systemName}: solver chưa được triển khai`);
  assert.equal(result.error, undefined, `${systemName} ${point.vAdded} mL: solver error`);
  assert.ok(
    Math.abs(result.pH - point.expectedPh) <= data.metadata.tolerances.pH,
    `${systemName} ${point.vAdded} mL: expected pH ${point.expectedPh}, actual ${result.pH}`,
  );
};

Object.entries(phase4References).forEach(([systemName, data]) => {
  test(`Phase 4 - ${systemName} Mathematical Validation`, async (t) => {
    if (!solverBySystem[systemName]) {
      t.skip(`${systemName}: solver chưa có, chờ Phase 4 chemistry implementation`);
      return;
    }

    const veqMl = (data.analyte.concentration * data.analyte.volume) / data.titrant.concentration;
    assert.ok(
      Math.abs(veqMl - data.expectedVeqMl) <= data.metadata.tolerances.volumeMl,
      `${systemName}: expected Veq ${data.expectedVeqMl} mL, calculated ${veqMl} mL`,
    );

    for (const point of data.points) {
      await t.test(`Volume: ${point.vAdded}mL -> expected pH: ${point.expectedPh}`, () => {
        const result = solveReferencePoint(systemName, data, point);
        assertReferencePoint(systemName, data, point, result);
      });
    }
  });
});