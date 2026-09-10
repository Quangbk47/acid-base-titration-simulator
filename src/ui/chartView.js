import { generateCurve } from '../chemistry/curve.js';

export const buildChartModel = (input, currentVolumeMl) => {
  const curve = generateCurve(input, { maxVolumeMl: Math.max(currentVolumeMl, 50) });
  if (curve.error) return curve;
  return { ...curve, currentVolumeMl };
};

export const renderChartView = (root, input, currentVolumeMl) => {
  const chart = root?.querySelector('[data-chart]');
  const empty = root?.querySelector('[data-chart-empty]');
  const table = root?.querySelector('[data-curve-rows]');
  if (!chart || !input) return;
  const model = buildChartModel(input, currentVolumeMl);
  if (model.error) { if (empty) empty.textContent = model.error.message; return model; }
  const width = 640; const height = 260; const pad = { l: 42, r: 16, t: 16, b: 30 };
  const maxX = Math.max(...model.points.map((p) => p.volumeMl), 1);
  const point = (p) => `${pad.l + (p.volumeMl / maxX) * (width - pad.l - pad.r)},${pad.t + ((14 - p.pH) / 14) * (height - pad.t - pad.b)}`;
  chart.setAttribute('viewBox', `0 0 ${width} ${height}`);
  const xAt = (volume) => pad.l + (volume / maxX) * (width - pad.l - pad.r);
  const markers = [['halfEqMl', 'curve-half'], ['equivalenceMl', 'curve-equivalence'], ['endpointMl', 'curve-endpoint']]
    .filter(([key]) => model.milestones[key] <= maxX)
    .map(([key, cls]) => `<line class="${cls}" x1="${xAt(model.milestones[key])}" x2="${xAt(model.milestones[key])}" y1="${pad.t}" y2="${height - pad.b}" />`).join('');
  const current = model.points.filter((p) => Math.abs(p.volumeMl - currentVolumeMl) < 1e-9).map((p) => { const [cx, cy] = point(p).split(','); return `<circle class="curve-current" cx="${cx}" cy="${cy}" r="5" />`; }).join('');
  chart.innerHTML = `${markers}<polyline class="curve-line" points="${model.points.map(point).join(' ')}" />${current}`;
  if (empty) empty.hidden = true;
  if (table) table.innerHTML = model.points.filter((_, i) => i % Math.max(1, Math.floor(model.points.length / 12)) === 0).map((p) => `<tr><td>${p.volumeMl.toFixed(2)}</td><td>${p.pH.toFixed(2)}</td><td>${p.stage}</td></tr>`).join('');
  return model;
};
