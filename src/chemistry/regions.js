// Descriptive regions only: pH always comes from the equilibrium solver.
export function describeRegion(result, state) {
  const volume = state?.addedVolumeMl ?? 0;
  if (volume === 0) return 'Ban đầu: chưa thêm dung dịch chuẩn; pH từ cân bằng của mẫu.';
  if (result.stage === 'at-equivalence') return 'Tại điểm tương đương theo hệ số phản ứng; pH phụ thuộc hệ và thủy phân muối.';
  const prefix = volume > result.Veq ? 'Sau điểm tương đương' : 'Trước điểm tương đương';
  const species = new Map(result.species.map((s) => [s.id, s.concentration]));
  for (const [acid, base] of [['HA', 'A⁻'], ['NH₄⁺', 'NH₃'], ['H₂C₂O₄', 'HC₂O₄⁻'], ['HC₂O₄⁻', 'C₂O₄²⁻']]) {
    const ratio = species.get(base) / species.get(acid);
    if (Number.isFinite(ratio) && ratio >= 0.1 && ratio <= 10) return `${prefix}; có vùng đệm ${acid}/${base} (tỉ lệ bazơ/axit liên hợp 0,1–10 là quy ước tham khảo). pH vẫn giải bằng cân bằng đầy đủ.`;
  }
  return `${prefix}; ${result.stage === 'near-equivalence' ? 'đang gần bước nhảy pH.' : 'xem chất dư và cân bằng, không mặc định pH tương đương bằng 7.'}`;
}
