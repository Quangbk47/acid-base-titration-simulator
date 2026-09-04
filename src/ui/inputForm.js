import { solveStrongStrong } from '../chemistry/index.js';
import { standardCases } from '../data/standardCases.js';
import { TITRATION_SYSTEMS, toChemistryInput, validateTitrationForm } from './validation.js';

const FIELD_IDS = Object.freeze({
  systemType: 'system-type',
  analyteConcentrationM: 'analyte-concentration',
  analyteVolumeMl: 'analyte-volume',
  titrantConcentrationM: 'titrant-concentration',
  addedVolumeMl: 'added-volume',
});

const valuesFromForm = (form) => Object.fromEntries(new FormData(form).entries());

const clearErrors = (form) => {
  for (const output of form.querySelectorAll('[data-error-for]')) output.textContent = '';
  for (const control of form.elements) control.removeAttribute?.('aria-invalid');
};

const showErrors = (form, errors) => {
  clearErrors(form);
  for (const [field, message] of Object.entries(errors)) {
    const control = form.querySelector(`#${FIELD_IDS[field] ?? field}`);
    const output = form.querySelector(`[data-error-for="${field}"]`);
    control?.setAttribute('aria-invalid', 'true');
    if (output) output.textContent = message;
  }
};

const setText = (root, selector, value) => {
  const element = root.querySelector(selector);
  if (element) element.textContent = value;
};

export function evaluateTitration(values, solve = solveStrongStrong) {
  const validation = validateTitrationForm(values);
  if (!validation.ok) return validation;
  const chemistryInput = toChemistryInput(validation.value);
  const result = solve(chemistryInput);
  if (result.error) return { ok: false, solverError: result.error };
  return { ok: true, chemistryInput, result };
}

export function initInputForm({ form, root = document, solve = solveStrongStrong } = {}) {
  if (!form) return null;
  const caseSelector = form.querySelector('#case-selector');
  const systemSelector = form.querySelector('#system-type');
  const analyte = form.querySelector('#analyte');
  const titrant = form.querySelector('#titrant');
  const stateBadge = root.querySelector('[data-simulation-state]');

  const syncSystem = () => {
    const system = TITRATION_SYSTEMS[systemSelector.value];
    analyte.value = system?.analyte ?? '';
    titrant.value = system?.titrant ?? '';
  };

  const loadCase = () => {
    const selected = standardCases.find(({ id }) => id === caseSelector.value) ?? standardCases[0];
    systemSelector.value = 'strong-acid-strong-base';
    syncSystem();
    form.elements.analyteConcentrationM.value = selected.CaM;
    form.elements.analyteVolumeMl.value = selected.VaMl;
    form.elements.titrantConcentrationM.value = selected.CbM;
    form.elements.addedVolumeMl.value = selected.VbMl;
    clearErrors(form);
  };

  for (const item of standardCases) caseSelector.add(new Option(item.label, item.id));
  loadCase();
  caseSelector.addEventListener('change', loadCase);
  systemSelector.addEventListener('change', syncSystem);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (stateBadge) stateBadge.textContent = 'Validating';
    setText(form, '[data-form-error]', '');
    const evaluation = evaluateTitration(valuesFromForm(form), solve);
    if (!evaluation.ok) {
      if (evaluation.errors) showErrors(form, evaluation.errors);
      else setText(form, '[data-form-error]', evaluation.solverError.message);
      if (stateBadge) stateBadge.textContent = evaluation.errors ? 'Input error' : 'Solver error';
      return;
    }

    clearErrors(form);
    setText(form, '[data-form-error]', '');
    const { result } = evaluation;
    setText(root, '[data-result="ph"]', result.pH.toFixed(2));
    setText(root, '[data-result="ph-label"]', result.pH < 7 ? 'Axit' : result.pH > 7 ? 'Bazơ' : 'Trung tính');
    setText(root, '[data-result="volume"]', `${result.totalVolumeMl.toFixed(2)} mL`);
    setText(root, '[data-result="excess"]', result.excess.species ?? 'Không');
    setText(root, '[data-result="stage"]', result.stage);
    setText(root, '[data-result="reaction"]', result.dominantReaction);
    if (stateBadge) stateBadge.textContent = 'Ready';
  });

  return { loadCase };
}
