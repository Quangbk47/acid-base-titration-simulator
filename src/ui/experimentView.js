const text = (selector, value) => { const element = document.querySelector(selector); if (element) element.textContent = value; };

export const renderExperiment = (state) => {
  const result = state.current;
  text('[data-field="volume"]', `${state.addedVolumeMl.toFixed(2)} mL`);
  text('[data-field="drop"]', `${state.dropSizeMl.toFixed(2)} mL`);
  text('[data-field="status"]', state.screen);
  text('[data-field="ph"]', result ? result.pH.toFixed(2) : '—');
  text('[data-field="ph-label"]', result ? (result.pH < 7 ? 'Axit' : result.pH > 7 ? 'Bazơ' : 'Trung tính') : 'Chưa tính');
  text('[data-field="total-volume"]', result ? `${result.totalVolumeMl.toFixed(2)} mL` : '—');
  text('[data-field="excess"]', result?.excess?.species ?? '—');
  text('[data-field="stage"]', result?.stage ?? '—');
  text('[data-field="vessel"]', result ? `Đã thêm ${state.addedVolumeMl.toFixed(2)} mL` : 'Chưa có giọt đang rơi');
  const table = document.querySelector('[data-chemistry-body]');
  if (!table) return;
  table.replaceChildren();
  if (!result) { const row = document.createElement('tr'); row.innerHTML = '<td colspan="4">Chưa tính</td>'; table.append(row); return; }
  for (const species of result.species) {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${species.id}</td><td>${species.moles.toExponential(3)}</td><td>${species.concentration.toExponential(3)} M</td><td>${result.dominantReaction}</td>`;
    table.append(row);
  }
};
