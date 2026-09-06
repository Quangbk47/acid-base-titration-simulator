const formatNumber = (value) => (Number.isFinite(value) ? value.toFixed(4) : 'n/a');

export const createSimulationReport = ({ input, result, history, modelVersion, graphSvg = null }) => ({
  modelVersion,
  input: { ...input },
  current: result ? { pH: result.pH, volumeMl: result.totalVolumeMl - input.Va * 1000, stage: result.stage, excess: result.excess } : null,
  milestones: result?.milestones ?? null,
  points: history.map(({ volumeMl, pH, stage }) => ({ volumeMl, pH, stage })),
  graphImage: graphSvg ? { filename: 'acid-base-titration-graph.svg', format: 'image/svg+xml', svg: graphSvg } : null,
});

export const reportToText = (report) => [
  `Acid-Base Titration Simulator (${report.modelVersion})`,
  `pH hien tai: ${report.current ? formatNumber(report.current.pH) : 'n/a'}`,
  `The tich titrant (mL): ${report.current ? formatNumber(report.current.volumeMl) : 'n/a'}`,
  `Giai doan: ${report.current?.stage ?? 'n/a'}`,
  `So diem do thi: ${report.points.length}`,
  `Moc tuong duong (mL): ${report.milestones ? formatNumber(report.milestones.equivalenceMl) : 'n/a'}`,
  `Moc endpoint (mL): ${report.milestones ? formatNumber(report.milestones.endpointMl) : 'n/a'}`,
].join('\n');

export const reportToHtml = (report) => {
  const graph = report.graphImage?.svg ?? '<p>Chưa có đồ thị.</p>';
  const rows = report.points.map(({ volumeMl, pH, stage }) => `<tr><td>${volumeMl.toFixed(2)}</td><td>${pH.toFixed(2)}</td><td>${stage}</td></tr>`).join('');
  return `<!doctype html><html lang="vi"><meta charset="utf-8"><title>Acid-Base Simulation Report</title><style>body{font:16px sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:.4rem}svg{max-width:100%;height:auto}</style><h1>Acid-Base Titration Simulation Report</h1><p>Model: ${report.modelVersion}</p><p>pH hiện tại: ${formatNumber(report.current?.pH)}</p>${graph}<h2>Dữ liệu đồ thị</h2><table><thead><tr><th>V (mL)</th><th>pH</th><th>Giai đoạn</th></tr></thead><tbody>${rows}</tbody></table></html>`;
};

export const downloadSimulationReport = (report) => {
  const download = (content, type, filename) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  download(JSON.stringify(report, null, 2), 'application/json', 'acid-base-simulation-report.json');
  download(reportToHtml(report), 'text/html', 'acid-base-simulation-report.html');
  if (report.graphImage?.svg) download(report.graphImage.svg, 'image/svg+xml', report.graphImage.filename);
};
