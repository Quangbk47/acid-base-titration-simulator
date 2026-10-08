import { chemicalById } from './chemicals.js';

export const titrationPairs = Object.freeze([
  { id: 'hcl-naoh', systemType: 'strong-acid-strong-base', acid: 'hcl', base: 'naoh', analyteId: 'hcl', titrantId: 'naoh', ratio: 1, reaction: 'HCl + NaOH → NaCl + H₂O' },
  { id: 'acetic-naoh', systemType: 'weak-acid-strong-base', acid: 'acetic', base: 'naoh', analyteId: 'acetic', titrantId: 'naoh', ratio: 1, reaction: 'CH₃COOH + NaOH → CH₃COONa + H₂O' },
  { id: 'nh3-hcl', systemType: 'strong-acid-weak-base', acid: 'hcl', base: 'ammonia', analyteId: 'ammonia', titrantId: 'hcl', ratio: 1, reverse: true, reaction: 'NH₃ + HCl → NH₄Cl' },
  { id: 'hcl-nh3', systemType: 'strong-acid-weak-base', acid: 'hcl', base: 'ammonia', analyteId: 'hcl', titrantId: 'ammonia', ratio: 1, reaction: 'HCl + NH₃ → NH₄Cl' },
  { id: 'oxalic-naoh', systemType: 'diprotic-acid-strong-base', acid: 'oxalic', base: 'naoh', analyteId: 'oxalic', titrantId: 'naoh', ratio: 2, reaction: 'H₂C₂O₄ + 2NaOH → Na₂C₂O₄ + 2H₂O' },
  { id: 'hcl-calcium', systemType: 'strong-acid-strong-base', acid: 'hcl', base: 'calcium', analyteId: 'hcl', titrantId: 'calcium', ratio: 0.5, reaction: '2HCl + Ca(OH)₂ → CaCl₂ + 2H₂O' },
].map((pair) => Object.freeze({ ...pair, analyte: chemicalById(pair.analyteId).formula, titrant: chemicalById(pair.titrantId).formula })));
export const pairForValues = (values) => values.pairId ? titrationPairs.find((pair) => pair.id === values.pairId && pair.systemType === values.systemType) : titrationPairs.find((pair) => pair.systemType === values.systemType);
export const pairForInput = (input) => titrationPairs.find((pair) => pair.id === input.pairId) ?? titrationPairs[input.Kb ? 2 : input.Ka ? 1 : 0];
