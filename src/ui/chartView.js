import { generateCurve } from '../chemistry/curve.js';
import { pairForInput } from '../data/titrationPairs.js';
import { phenolphthaleinThresholdMl } from '../chemistry/pairSolver.js';
import { escapeHtml } from './htmlSafety.js';
import { solverForInput, withTitrantVolume } from './theoryView.js';

export const CHART_PADDING = Object.freeze({ l: 44, r: 18, t: 28, b: 56 });
let cachedCurve = null;
let cachedKey = '';
const focusHandlers = new WeakMap();

export const buildChartModel = (input, currentVolumeMl) => {
  const initial = solverForInput(input)(withTitrantVolume(input, 0));
  if (initial.error) return initial;
  const maxVolumeMl = Math.max(currentVolumeMl, initial.Veq * 2, 1);
  const key = JSON.stringify([withTitrantVolume(input, 0), maxVolumeMl]);
  if (key !== cachedKey) {
    if (!input.Ka && !input.Kb && !input.pairId) cachedCurve = generateCurve(input, { maxVolumeMl, stepMl: maxVolumeMl / 100 });
    else {
      const volumes = Array.from({ length: 101 }, (_, i) => maxVolumeMl * i / 100);
      for (const v of initial.equivalentVolumesMl ?? [initial.Veq]) volumes.push(v, v * 0.99, v * 1.01);
      volumes.push(initial.Veq * 0.99, initial.Veq, initial.Veq * 1.01, initial.Veq / 2);
      const points = [...new Set(volumes)].filter((v) => v <= maxVolumeMl).sort((a, b) => a - b).map((volumeMl) => ({ volumeMl, ...solverForInput(input)(withTitrantVolume(input, volumeMl)) }));
      const endpointMl = phenolphthaleinThresholdMl(input, maxVolumeMl);
      if (Number.isFinite(endpointMl) && !points.some((p) => Math.abs(p.volumeMl - endpointMl) < 1e-12)) {
        points.push({ volumeMl: endpointMl, ...solverForInput(input)(withTitrantVolume(input, endpointMl)) });
        points.sort((a, b) => a.volumeMl - b.volumeMl);
      }
      cachedCurve = points.find((p) => p.error) ?? { points, milestones: { ...initial.milestones, endpointMl }, model: initial.model };
    }
    cachedKey = key;
  }
  return { ...cachedCurve, currentVolumeMl };
};

export const orderedChartData = (history) => history.filter((p) => Number.isFinite(p.volumeMl) && Number.isFinite(p.pH)).slice().sort((a, b) => a.volumeMl - b.volumeMl);
export const buildAxisTicks = (maxX, width, minY = 0, maxY = 14) => {
  const count = width < 360 ? 2 : 4;
  const step = Math.max(2, Math.ceil((maxY - minY) / 14) * 2);
  const y = []; for (let value = minY; value <= maxY; value += step) y.push(value);
  if (y.at(-1) !== maxY) y.push(maxY);
  return { x: Array.from({ length: count + 1 }, (_, i) => maxX * i / count), y };
};

export const renderChartView = (root, input, currentVolumeMl, currentResult = null, dropCount = 0, history = [], theoryOnly = false) => {
  const chart = root?.querySelector('[data-chart]');
  const empty = root?.querySelector('[data-chart-empty]');
  const table = root?.querySelector('[data-curve-rows]');
  if (!chart || !input) return;
  const model = buildChartModel(input, currentVolumeMl);
  if (model.error) { if (empty) empty.textContent = model.error.message; return model; }
  const width = chart.clientWidth || 640; const height = chart.clientHeight || 260; const pad = CHART_PADDING;
  const maxX = Math.max(...model.points.map((p) => p.volumeMl), 1);
  const minY = Math.floor(Math.min(0, ...model.points.map((p) => p.pH)));
  const maxY = Math.ceil(Math.max(14, ...model.points.map((p) => p.pH)));
  const point = (p) => `${pad.l + (p.volumeMl / maxX) * (width - pad.l - pad.r)},${pad.t + ((maxY - p.pH) / (maxY - minY)) * (height - pad.t - pad.b)}`;
  chart.setAttribute('viewBox', `0 0 ${width} ${height}`);
  const xAt = (volume) => pad.l + (volume / maxX) * (width - pad.l - pad.r);
  const yAt = (pH) => pad.t + ((maxY - pH) / (maxY - minY)) * (height - pad.t - pad.b);
  const formatVolume = (v) => v === 0 ? '0' : v >= 10000 || v < 0.01 ? v.toExponential(1) : Number(v.toFixed(2)).toString();
  const ticks = buildAxisTicks(maxX, width, minY, maxY);
  const axes = ticks.y.map((ph) => `<g class="axis-tick-y"><line class="chart-grid" x1="${pad.l}" x2="${width - pad.r}" y1="${yAt(ph)}" y2="${yAt(ph)}" /><text x="${pad.l - 9}" y="${yAt(ph) + 4}" text-anchor="end">${ph}</text></g>`).join('')
    + ticks.x.map((v) => `<g class="axis-tick-x"><line class="chart-grid" x1="${xAt(v)}" x2="${xAt(v)}" y1="${pad.t}" y2="${height - pad.b}" /><text x="${xAt(v)}" y="${height - pad.b + 19}" text-anchor="middle">${formatVolume(v)}</text></g>`).join('')
    + `<text class="axis-label-y" x="8" y="15">pH</text><text class="axis-label-x" x="${width / 2}" y="${height - 9}" text-anchor="middle">V ${pairForInput(input).titrant} đã thêm (mL)</text>`;
  const markers = [['halfEqMl', 'curve-half'], ['equivalenceMl', 'curve-equivalence'], ['endpointMl', 'curve-endpoint']]
    .filter(([key]) => Number.isFinite(model.milestones[key]) && model.milestones[key] <= maxX && (!input.Kb || key !== 'endpointMl'))
    .map(([key, cls]) => `<line class="${cls}" x1="${xAt(model.milestones[key])}" x2="${xAt(model.milestones[key])}" y1="${pad.t}" y2="${height - pad.b}" />`).join('');
  const extraMarkers = (model.milestones.equivalentVolumesMl ?? []).slice(0, -1).map((v) => `<line class="curve-equivalence" data-equivalence-volume="${v}" x1="${xAt(v)}" x2="${xAt(v)}" y1="${pad.t}" y2="${height - pad.b}" />`).join('');
  const visiblePoints = theoryOnly ? model.points : model.points.filter((p) => p.volumeMl <= currentVolumeMl + 1e-9);
  const actual = theoryOnly ? [] : orderedChartData(history.length ? history : [{ dropCount, volumeMl: currentVolumeMl, pH: currentResult?.pH ?? model.points[0].pH, stage: currentResult?.stage ?? model.points[0].stage }]);
  const lineMode = root.querySelector('#chart-style')?.value === 'line';
  const simulationLegend = root.querySelector('[data-simulation-legend]');
  const theoryLegend = root.querySelector('[data-theory-legend]');
  if (simulationLegend) simulationLegend.textContent = `Dữ liệu mô phỏng · ${lineMode ? 'nét liền' : 'điểm'}`;
  if (theoryLegend) theoryLegend.textContent = `Mẫu lý thuyết · ${lineMode ? 'nét đứt' : 'điểm'}`;
  const lines = lineMode ? `<polyline class="curve-theory-line" points="${visiblePoints.map(point).join(' ')}" /><polyline class="curve-line" points="${actual.map(point).join(' ')}" />` : '';
  const circles = (points, cls, source) => points.map((p) => { const [cx, cy] = point(p).split(','); return `<circle class="${cls}" cx="${cx}" cy="${cy}" r="${cls === 'curve-point' ? 3 : 2}" tabindex="0" data-chart-point="${source}" data-volume="${p.volumeMl}" data-ph="${p.pH}" aria-label="${source}: V = ${p.volumeMl.toFixed(4)} mL; pH = ${p.pH.toFixed(4)}"><title>${source}: V = ${p.volumeMl.toFixed(4)} mL; pH = ${p.pH.toFixed(4)}</title></circle>`; }).join('');
  const currentPoint = theoryOnly ? null : currentResult ? { volumeMl: currentVolumeMl, pH: currentResult.pH } : model.points.find((p) => Math.abs(p.volumeMl - currentVolumeMl) < 1e-9);
  const current = currentPoint ? (() => { const [cx, cy] = point(currentPoint).split(','); return `<circle class="curve-current" cx="${cx}" cy="${cy}" r="5" pointer-events="none" />`; })() : '';
  chart.innerHTML = `${axes}${markers}${extraMarkers}${lines}${circles(visiblePoints, 'curve-theory-point', 'Lý thuyết')}${circles(actual, 'curve-point', 'Mô phỏng')}${current}`;
  if (empty) empty.hidden = true;
  const readout = root.querySelector('[data-chart-readout]');
  if (readout) readout.textContent = 'Rê chuột, chạm hoặc dùng Tab vào điểm để xem V và pH.';
  const showPoint = (event) => {
    const selected = event.target.closest?.('[data-chart-point]');
    if (selected && readout) readout.textContent = `${selected.dataset.chartPoint}: V = ${Number(selected.dataset.volume).toFixed(4)} mL; pH = ${Number(selected.dataset.ph).toFixed(4)}`;
  };
  chart.onpointerover = showPoint; chart.onclick = showPoint;
  const priorFocus = focusHandlers.get(chart);
  if (priorFocus) chart.removeEventListener('focusin', priorFocus);
  chart.addEventListener('focusin', showPoint); focusHandlers.set(chart, showPoint);
  if (table) table.innerHTML = theoryOnly ? '<tr><td colspan="3">Dự đoán lý thuyết · chưa có dữ liệu mô phỏng.</td></tr>' : actual
    .map((row) => `<tr><td>${row.volumeMl.toFixed(2)} mL</td><td>${row.pH.toFixed(2)}</td><td>${escapeHtml(row.stage)}</td></tr>`).join('');
  return model;
};
