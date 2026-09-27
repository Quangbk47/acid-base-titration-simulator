import { generateCurve } from '../chemistry/curve.js';

export const buildChartModel = (input, currentVolumeMl) => {
  const curve = generateCurve(input, { maxVolumeMl: Math.max(currentVolumeMl, 50) });
  if (curve.error) return curve;
  return { ...curve, currentVolumeMl };
};

export const renderChartView = (root, input, currentVolumeMl, currentResult = null, dropCount = 0, history = []) => {
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
  const visiblePoints = model.points.filter((p) => p.volumeMl <= currentVolumeMl + 1e-9);
  const pointsMarkup = visiblePoints.map((p) => { const [cx, cy] = point(p).split(','); return `<circle class="curve-point" cx="${cx}" cy="${cy}" r="3" />`; }).join('');
  const currentPoint = currentResult ? { volumeMl: currentVolumeMl, pH: currentResult.pH } : model.points.find((p) => Math.abs(p.volumeMl - currentVolumeMl) < 1e-9);
  const current = currentPoint ? (() => { const [cx, cy] = point(currentPoint).split(','); return `<circle class="curve-current" cx="${cx}" cy="${cy}" r="5" />`; })() : '';
  chart.innerHTML = `${markers}${pointsMarkup}${current}`;
  if (empty) empty.hidden = true;
  if (table) table.innerHTML = (history.length ? history : [{ dropCount, volumeMl: currentVolumeMl, pH: currentResult?.pH ?? model.points[0].pH, stage: currentResult?.stage ?? model.points[0].stage }])
    .map((row) => `<tr><td>${row.volumeMl.toFixed(2)} mL</td><td>${row.pH.toFixed(2)}</td><td>${row.stage}</td></tr>`).join('');
  return model;
};
