const text = (root, selector, value) => { const node = root.querySelector(selector); if (node) node.textContent = value; };

export const renderExperimentView = (root, result, state) => {
  if (!root || !result) return;
  text(root, '[data-result="ph"]', result.pH.toFixed(2));
  text(root, '[data-result="ph-label"]', result.pH < 7 ? 'Axit' : result.pH > 7 ? 'Bazơ' : 'Trung tính');
  text(root, '[data-result="volume"]', `${result.totalVolumeMl.toFixed(2)} mL`);
  const isWeakAcid = result.model === 'weak-acid-strong-base';
  text(root, '[data-result="system"]', isWeakAcid ? 'CH₃COOH + NaOH' : 'HCl + NaOH');
  text(root, '[data-result="species-summary"]', isWeakAcid ? 'CH₃COOH / NaOH' : 'HCl / NaOH');
  text(root, '[data-result="excess"]', result.excess.species ?? 'Không');
  text(root, '[data-result="stage"]', result.stage);
  text(root, '[data-result="reaction"]', result.dominantReaction);
  text(root, '[data-result="added-volume"]', `${state?.addedVolumeMl?.toFixed(2) ?? '0.00'} mL`);
  const tbody = root.querySelector('[data-chemistry-rows]');
  if (tbody) tbody.innerHTML = result.species.map((item) => `<tr><th scope="row">${item.id}</th><td>${item.moles.toExponential(3)}</td><td>${item.concentration.toExponential(3)} M</td><td>${result.dominantReaction}</td></tr>`).join('');
};
