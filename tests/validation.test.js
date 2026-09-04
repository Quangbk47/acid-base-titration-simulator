import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateTitration } from '../src/ui/inputForm.js';
import { toChemistryInput, validateTitrationForm } from '../src/ui/validation.js';

const valid = Object.freeze({
  systemType: 'strong-acid-strong-base',
  analyteConcentrationM: '0.1',
  analyteVolumeMl: '25',
  titrantConcentrationM: '0.1',
  addedVolumeMl: '0',
});

test('Phase 2 validation accepts valid UI values and converts mL to solver units', () => {
  const validation = validateTitrationForm(valid);
  assert.equal(validation.ok, true);
  assert.deepEqual(toChemistryInput(validation.value), {
    Ca: 0.1,
    Va: 0.025,
    Cb: 0.1,
    Vb: 0,
    temperature: 298.15,
  });
});

test('Phase 2 validation rejects empty required fields and text values', () => {
  const empty = validateTitrationForm({ ...valid, analyteVolumeMl: '' });
  assert.equal(empty.ok, false);
  assert.match(empty.errors.analyteVolumeMl, /Nhập/);
  const text = validateTitrationForm({ ...valid, titrantConcentrationM: 'abc' });
  assert.match(text.errors.titrantConcentrationM, /số hữu hạn/);
});

test('Phase 2 validation rejects negative values and invalid zero values', () => {
  const negative = validateTitrationForm({ ...valid, addedVolumeMl: '-0.1' });
  assert.match(negative.errors.addedVolumeMl, /không được âm/);
  for (const field of ['analyteConcentrationM', 'analyteVolumeMl', 'titrantConcentrationM']) {
    const zero = validateTitrationForm({ ...valid, [field]: '0' });
    assert.match(zero.errors[field], /lớn hơn 0/);
  }
});

test('Phase 2 validation requires valid Ka or Kb for weak systems before rejecting unsupported chemistry', () => {
  const weakAcid = validateTitrationForm({ ...valid, systemType: 'weak-acid-strong-base' });
  assert.match(weakAcid.errors.Ka, /cần Ka/);
  assert.match(weakAcid.errors.systemType, /chưa được.*hỗ trợ/);
  const weakBase = validateTitrationForm({ ...valid, systemType: 'strong-acid-weak-base', Kb: '1' });
  assert.match(weakBase.errors.Kb, /0 < Kb < 1/);
});

test('valid form data calls the Phase 1 chemistry boundary exactly once', () => {
  const calls = [];
  const fakeSolver = (input) => {
    calls.push(input);
    return { pH: 1, totalVolumeMl: 25, excess: {}, stage: 'before-equivalence' };
  };
  const evaluation = evaluateTitration(valid, fakeSolver);
  assert.equal(evaluation.ok, true);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], { Ca: 0.1, Va: 0.025, Cb: 0.1, Vb: 0, temperature: 298.15 });
});

test('invalid form data never calls the chemistry engine', () => {
  let calls = 0;
  const evaluation = evaluateTitration({ ...valid, analyteConcentrationM: '' }, () => {
    calls += 1;
    return {};
  });
  assert.equal(evaluation.ok, false);
  assert.equal(calls, 0);
});
