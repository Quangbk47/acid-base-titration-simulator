export const renderChart = (history, milestones = {}) => {
  const svg = document.querySelector('[data-chart-svg]');
  const table = document.querySelector('[data-chart-body]');
  if (!svg || !table) return;
  svg.replaceChildren(); table.replaceChildren();
  if (!history.length) { const row = document.createElement('tr'); row.innerHTML = '<td colspan="3">Chưa có dữ liệu mô phỏng</td>'; table.append(row); return; }
  const width = 560; const height = 250;
  const maxV = Math.max(milestones.endpointMl ?? 0, ...history.map((p) => p.volumeMl), 1) * 1.05;
  const points = history.map((point) => `${(point.volumeMl / maxV) * width},${height - (point.pH / 14) * height}`).join(' ');
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  line.setAttribute('points', points); line.setAttribute('fill', 'none'); line.setAttribute('stroke', '#0d7a79'); line.setAttribute('stroke-width', '3'); svg.append(line);
  for (const [label, volume, color] of [['half-eq', milestones.halfEqMl, '#8c72b5'], ['equivalence', milestones.equivalenceMl, '#d9964b'], ['endpoint', milestones.endpointMl, '#d66d7b']]) {
    if (!Number.isFinite(volume) || volume > maxV) continue;
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const x = (volume / maxV) * width;
    marker.setAttribute('x1', x); marker.setAttribute('x2', x); marker.setAttribute('y1', 0); marker.setAttribute('y2', height);
    marker.setAttribute('stroke', color); marker.setAttribute('stroke-dasharray', '4 4'); marker.setAttribute('data-milestone', label); svg.append(marker);
  }
  const current = history.at(-1);
  const currentPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  currentPoint.setAttribute('cx', (current.volumeMl / maxV) * width);
  currentPoint.setAttribute('cy', height - (current.pH / 14) * height);
  currentPoint.setAttribute('r', '5'); currentPoint.setAttribute('fill', '#0d7a79');
  currentPoint.setAttribute('stroke', '#ffffff'); currentPoint.setAttribute('stroke-width', '2');
  currentPoint.setAttribute('data-current-point', 'true'); svg.append(currentPoint);
  for (const point of history) { const row = document.createElement('tr'); row.innerHTML = `<td>${point.volumeMl.toFixed(2)}</td><td>${point.pH.toFixed(2)}</td><td>${point.stage}</td>`; table.append(row); }
};
