import test from 'node:test';
import assert from 'node:assert/strict';
import { chemicals, chemicalById, constantEntries, constantDescription, KW_25, SOURCES } from '../src/data/chemicals.js';
import { findChemicals, supportedPairs, simulationLink, chemicalDetailHtml } from '../src/ui/chemicalLibraryView.js';
import { titrationPairs } from '../src/data/titrationPairs.js';
import { weakAcidCases } from '../src/data/standardCases.js';

const requested = 'HN3 HF HCN HClO HClO2 HNO2 H2S H2SO3 H2SO4 H2CO3 H3PO4 H3BO3 HCOOH CH3COOH CH3CH2COOH C6H5COOH CH2ClCOOH CCl3COOH CH3CH(OH)COOH H2C2O4 C6H5OH NH3 CH3NH2 C2H5NH2 (CH3)2NH (CH3)3N C6H5NH2 C5H5N N2H4 HONH2 CO(NH2)2 CO3^2- CH3COO- HCl NaOH Ca(OH)2'.split(' ');
// Independently transcribed from the selected source tables, not from catalog records.
const reference = {
  acetic: { Ka: 1.8e-5 }, ammonia: { Kb: 1.8e-5 }, oxalic: { Ka1: 0.06, Ka2: 6.1e-5 }, calcium: { Ksp: 1.3e-6 },
  hydrazoic: { Ka: 2.5e-5 }, hydrofluoric: { Ka: 6.4e-4 }, hydrocyanic: { Ka: 4.9e-10 }, hypochlorous: { Ka: 2.9e-8 }, chlorous: { Ka: 1.1e-2 }, nitrous: { Ka: 4.6e-4 },
  sulfide: { Ka1: 8.9e-8, Ka2: 1e-19 }, sulfurous: { Ka1: 1.6e-2, Ka2: 6.4e-8 }, sulfuric: { Ka2: 1.2e-2 }, carbonic: { Ka1: 4.3e-7, Ka2: 4.7e-11 }, phosphoric: { Ka1: 7.5e-3, Ka2: 6.2e-8, Ka3: 4.2e-13 }, boric: { Ka: 5.4e-10 },
  formic: { Ka: 1.8e-4 }, propionic: { Ka: 1.3e-5 }, benzoic: { Ka: 6.3e-5 }, chloroacetic: { Ka: 1.4e-3 }, lactic: { Ka: 1.4e-4 }, phenol: { Ka: 1.3e-10 },
  methylamine: { Kb: 4.4e-4 }, ethylamine: { Kb: 6.4e-4 }, dimethylamine: { Kb: 5.9e-4 }, trimethylamine: { Kb: 6.3e-5 }, aniline: { Kb: 4.3e-10 }, pyridine: { Kb: 1.7e-9 }, hydrazine: { Kb: 1.3e-6 }, hydroxylamine: { Kb: 1.1e-8 },
};
test('Library: all 36 requested formulas are unique and have Vietnamese/English names and provenance', () => {
  assert.deepEqual(chemicals.map((c) => c.formulaAscii).sort(), [...requested].sort());
  assert.equal(new Set(chemicals.map((c) => c.id)).size, 36);
  for (const c of chemicals) {
    assert.ok(c.name && c.englishName && c.medium); assert.ok(Object.values(SOURCES).includes(c.source));
    assert.equal(c.steps, c.equilibria.length); assert.ok(c.equilibria.every((s, i) => s.step === i + 1));
    assert.equal(c.temperatureC, c.id === 'urea' ? null : 25);
    assert.equal(findChemicals(c.formulaAscii).some((item) => item.id === c.id), true, c.formulaAscii);
  }
});
test('Library: selected constants match reference tables and pK = −log10(K)', () => {
  for (const [id, values] of Object.entries(reference)) for (const [key, expected] of Object.entries(values)) assert.equal(chemicalById(id)[key], expected, id + '/' + key);
  for (const c of chemicals) for (const { key, value, pValue } of constantEntries(c)) { assert.ok(value > 0 && Number.isFinite(value)); if (key !== 'Ksp') assert.ok(Math.abs(pValue + Math.log10(value)) < 1e-12); }
  assert.ok(Math.abs(chemicalById('benzoic').pKa - 4.2006594505) < 1e-9);
  assert.ok(Math.abs(chemicalById('trichloroacetic').pKa - 0.70) < 1e-12);
});
test('Library: conflicting source values remain separate, attributed, immutable and unused', () => {
  assert.equal(chemicalById('dimethylamine').alternatives[0].value, 5.4e-4);
  assert.equal(chemicalById('dimethylamine').Kb, 5.9e-4);
  assert.equal(chemicalById('benzoic').alternatives[0].value, 4.19);
  for (const c of chemicals) for (const alternative of c.alternatives) {
    assert.equal(alternative.temperatureC, 25); assert.ok(Object.values(SOURCES).includes(alternative.source)); assert.ok(Object.isFrozen(alternative));
    assert.notEqual(alternative.value, c[alternative.key]);
  }
  assert.match(chemicalDetailHtml(chemicalById('dimethylamine')), /không dùng trong phép tính/);
});
test('Library: derived carbonate/acetate use the corresponding conjugate-acid step at the same temperature', () => {
  assert.equal(chemicalById('carbonate').Kb * chemicalById('carbonic').Ka2, KW_25);
  assert.equal(chemicalById('carbonate').Kb2 * chemicalById('carbonic').Ka1, KW_25);
  assert.equal(chemicalById('acetate').Kb * chemicalById('acetic').Ka, KW_25);
  assert.match(chemicalById('carbonic').notes, /biểu kiến/);
});
test('Library: sulfuric, boric and unverified urea are never represented as false numeric equilibria', () => {
  const sulfuric = chemicalById('sulfuric'); assert.equal(sulfuric.Ka1, undefined); assert.equal(sulfuric.equilibria[0].mode, 'strong'); assert.equal(sulfuric.equilibria[1].constantKey, 'Ka2');
  const boric = chemicalById('boric'); assert.equal(boric.steps, 1); assert.equal(boric.mechanism, 'Lewis'); assert.match(boric.equation, /B\(OH\)₄⁻/);
  const urea = chemicalById('urea'); assert.equal(urea.Kb, undefined); assert.equal(urea.pKb, undefined); assert.equal(urea.verification, 'pending'); assert.match(constantDescription(urea), /Cần xác minh/);
  assert.equal(chemicalById('hydrazine').Kb2, undefined); assert.deepEqual(chemicalById('hydrazine').pendingConstants, ['Kb2']);
  assert.equal(chemicalById('calcium').steps, 1); assert.equal(chemicalById('calcium').protonCapacity, 2);
});
test('Library: search supports Vietnamese, English, ascii/unicode formulas and charged ions', () => {
  for (const [query, id] of [['axit photphoric', 'phosphoric'], ['Phosphoric acid', 'phosphoric'], ['H₃PO₄', 'phosphoric'], ['CO3^2−', 'carbonate'], ['CO₃²⁻', 'carbonate'], ['CH3COO-', 'acetate'], ['B(OH)3', 'boric'], ['Propanoic', 'propionic']]) assert.equal(findChemicals(query).some((c) => c.id === id), true, query);
  assert.equal(findChemicals('not a chemical').length, 0);
  for (const [filter, count] of [['acid', 22], ['base', 14], ['strong-acid', 2], ['weak-acid', 20], ['strong-base', 2], ['weak-base', 12], ['polyacid', 6], ['ion', 2]]) assert.equal(findChemicals('', filter).length, count, filter);
});
test('Library: lookup does not enable untested models; simulation links use the existing six directions', () => {
  assert.deepEqual(titrationPairs.map((p) => p.id), ['hcl-naoh', 'acetic-naoh', 'nh3-hcl', 'hcl-nh3', 'oxalic-naoh', 'hcl-calcium']);
  assert.deepEqual(chemicals.filter((c) => supportedPairs(c).length).map((c) => c.id), ['hcl', 'naoh', 'acetic', 'ammonia', 'oxalic', 'calcium']);
  for (const c of chemicals.slice(6)) assert.equal(supportedPairs(c).length, 0, c.id);
  assert.equal(new URL(simulationLink(titrationPairs.at(-1)), 'http://localhost').searchParams.get('titrantConcentrationM'), '0.005');
  assert.throws(() => simulationLink({ id: 'phosphoric-naoh' }), /chưa được hỗ trợ/);
  assert.equal(weakAcidCases[0].Ka, chemicalById('acetic').Ka);
});
test('Library: polyacid detail shows independent steps and explanations without unsafe markup', () => {
  const phosphate = chemicalDetailHtml(chemicalById('phosphoric'));
  for (const key of ['Ka1', 'Ka2', 'Ka3', 'pKa1', 'pKa2', 'pKa3', 'H₂PO₄⁻', 'HPO₄²⁻', 'PO₄³⁻']) assert.ok(phosphate.includes(key), key);
  assert.equal((phosphate.match(/class="equilibrium-step"/g) ?? []).length, 3);
  assert.equal((chemicalDetailHtml(chemicalById('oxalic')).match(/class="equilibrium-step"/g) ?? []).length, 2);
  assert.match(phosphate, /Hiện chỉ hỗ trợ tra cứu/); assert.ok(!phosphate.includes('data-chemical-simulate'));
  const html = chemicalDetailHtml({ ...chemicalById('acetic'), name: '<img src=x onerror=alert(1)>', notes: '<script>bad()</script>' });
  assert.ok(!html.includes('<img')); assert.ok(!html.includes('<script>')); assert.ok(html.includes('&lt;img'));
});

// Independent elemental/charge balance parser for every displayed equation.
function composition(raw) {
  const coefficient = Number(raw.match(/^\d+/)?.[0] ?? 1); let formula = raw.replace(/^\d+/, '').trim();
  const chargeMatch = formula.match(/([²³]?)([⁺⁻])$/); const charge = chargeMatch ? (chargeMatch[1] === '²' ? 2 : chargeMatch[1] === '³' ? 3 : 1) * (chargeMatch[2] === '⁺' ? 1 : -1) : 0;
  formula = formula.replace(/([²³]?)([⁺⁻])$/, '').replace(/\*/g, '').replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (c) => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(c)));
  const tokens = formula.match(/[A-Z][a-z]?|\d+|[()[\]]/g); const stack = [{}];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === '(' || token === '[') stack.push({});
    else if (token === ')' || token === ']') { const group = stack.pop(); const multiplier = /^\d+$/.test(tokens[i + 1] ?? '') ? Number(tokens[++i]) : 1; for (const [element, n] of Object.entries(group)) stack.at(-1)[element] = (stack.at(-1)[element] ?? 0) + n * multiplier; }
    else { const n = /^\d+$/.test(tokens[i + 1] ?? '') ? Number(tokens[++i]) : 1; stack.at(-1)[token] = (stack.at(-1)[token] ?? 0) + n; }
  }
  assert.equal(stack.length, 1); return { ...Object.fromEntries(Object.entries(stack[0]).map(([element, n]) => [element, n * coefficient])), charge: charge * coefficient };
}
test('Library: every displayed equilibrium conserves elements and electric charge', () => {
  const sum = (side) => side.split(' + ').map(composition).reduce((total, species) => { for (const [key, value] of Object.entries(species)) total[key] = (total[key] ?? 0) + value; return total; }, {});
  for (const c of chemicals) for (const step of c.equilibria) {
    const [left, right] = step.equation.split(/ ⇌ | → /); assert.ok(right, step.equation); assert.deepEqual(sum(left), sum(right), c.id + ': ' + step.equation);
  }
});
