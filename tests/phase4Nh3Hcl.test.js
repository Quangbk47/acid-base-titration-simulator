import assert from 'node:assert/strict';
import test from 'node:test';
import { solveStrongAcidWeakBase } from '../src/chemistry/index.js';
import { PHASE_4_PH_TOLERANCE, phase4Nh3HclReference } from './fixtures/phase4Reference.js';

test('CHEM-04: NH3-HCl matches each independent reference pH within 0.02', () => {
  const errors = [];
  for (const reference of phase4Nh3HclReference) {
    const result = solveStrongAcidWeakBase(reference);
    assert.equal(result.error, undefined, reference.id);
    const absoluteDeltaPH = Math.abs(result.pH - reference.pH);
    errors.push(absoluteDeltaPH);
    assert.ok(absoluteDeltaPH <= PHASE_4_PH_TOLERANCE, `${reference.id}: |ΔpH|=${absoluteDeltaPH}`);
    assert.equal(result.stage, reference.stage, reference.id);
    assert.equal(result.excess.species, reference.excessSpecies, reference.id);
    assert.equal(result.diagnostics.converged, true, reference.id);
    assert.ok(Math.abs(result.pH + result.pOH - 14) < 1e-12, reference.id);
    assert.ok(Math.abs(result.concentrations.NH3 + result.concentrations.NH4Plus
      - result.moles.ammoniaInitial / result.totalVolumeL) < 1e-12, reference.id);
  }
  assert.equal(errors.length, 15);
  assert.ok(Math.max(...errors) < 0.00005);
});

test('CHEM-04: stoichiometric excess data changes at equivalence', () => {
  const before = solveStrongAcidWeakBase(phase4Nh3HclReference[1]);
  const at = solveStrongAcidWeakBase(phase4Nh3HclReference[2]);
  const after = solveStrongAcidWeakBase(phase4Nh3HclReference[3]);
  assert.equal(before.excess.species, 'NH3');
  assert.ok(before.moles.residualNH3 > 0);
  assert.equal(at.excess.species, null);
  assert.equal(after.excess.species, 'H+');
  assert.ok(after.moles.residualH > 0);
});

test('CHEM-04: NH3-HCl rejects invalid input without NaN or Infinity', () => {
  const valid = phase4Nh3HclReference[0];
  for (const input of [{ ...valid, Kb: 0 }, { ...valid, Va: -0.001 }, { ...valid, temperature: 300 }]) {
    const result = solveStrongAcidWeakBase(input);
    assert.equal(result.error?.code, 'OUT_OF_RANGE');
    assert.doesNotMatch(JSON.stringify(result), /NaN|Infinity/);
  }
});
