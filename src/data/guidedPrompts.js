const labels = Object.freeze({ initial: 'Trước khi thêm NaOH, bạn dự đoán pH và màu phenolphthalein là gì?', half: 'Ở nửa tương đương, pH có gần pKa không? Hãy đối chiếu số đo.', equivalence: 'Tại tương đương, dung dịch còn mang tính axit hay bazơ? Vì sao?', after: 'Sau tương đương, chất nào dư và pH thay đổi theo chiều nào?' });
export const promptForState = (result, addedVolumeMl) => {
  if (!result) return null;
  const { halfEqMl, equivalenceMl } = result.milestones;
  const close = (value, target) => Math.abs(value - target) <= Math.max(0.05, target * 1e-3);
  const milestone = close(addedVolumeMl, 0) ? 'initial' : close(addedVolumeMl, halfEqMl) ? 'half' : close(addedVolumeMl, equivalenceMl) ? 'equivalence' : addedVolumeMl > equivalenceMl ? 'after' : null;
  if (!milestone) return null;
  return Object.freeze({ id: `weak-acid-${milestone}`, milestone, question: labels[milestone], feedback: milestone === 'half' ? `pH thực tế ${result.pH.toFixed(2)}; pKa = ${(-Math.log10(result.Ka)).toFixed(2)}.` : `pH thực tế ${result.pH.toFixed(2)}; chất dư: ${result.excess.species ?? 'không có theo stoichiometry'}.` });
};
