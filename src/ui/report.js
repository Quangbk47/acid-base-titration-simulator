export const createReport = ({ result, input, addedVolumeMl, chart }) => {
  const chartSvg = chart?.outerHTML ?? '';
  const summary = {
    pH: result.pH,
    pOH: result.pOH,
    totalVolumeMl: result.totalVolumeMl,
    stage: result.stage,
    excess: { ...result.excess },
    dominantReaction: result.dominantReaction,
  };
  return Object.freeze({
    title: `Báo cáo chuẩn độ ${result.model === 'weak-acid-strong-base' ? 'CH₃COOH–NaOH' : 'HCl–NaOH'}`,
    model: result.model,
    modelVersion: result.modelVersion,
    input: { ...input },
    addedVolumeMl,
    pH: result.pH,
    stage: result.stage,
    species: result.species.map((item) => ({ ...item })),
    summary,
    milestones: { ...result.milestones },
    chartSvg,
    chartImageDataUrl: chartSvg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(chartSvg)}` : '',
    createdAt: new Date().toISOString(),
  });
};
export const downloadReport = (report) => {
  const endpoint = Number.isFinite(report.milestones.endpointMl) ? `; endpoint ${report.milestones.endpointMl.toFixed(2)} mL` : '';
  const content = `${report.title}\nModel: ${report.modelVersion}\npH: ${report.pH.toFixed(2)}\nV NaOH: ${report.addedVolumeMl.toFixed(2)} mL\nStage: ${report.stage}\nMốc: 1/2 eq ${report.milestones.halfEqMl.toFixed(2)} mL; eq ${report.milestones.equivalenceMl.toFixed(2)} mL${endpoint}\n\nSummary\n${JSON.stringify(report.summary, null, 2)}\n\nSpecies\n${JSON.stringify(report.species, null, 2)}\n\nInput\n${JSON.stringify(report.input, null, 2)}\n\nChart snapshot: ${report.chartImageDataUrl ? 'included in local report object' : 'not available'}`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  link.download = 'bao-cao-chuan-do.txt';
  link.click();
  URL.revokeObjectURL(link.href);
};
