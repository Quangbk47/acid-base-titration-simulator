import { calculateTheory } from '../ui/theoryView.js';
import { solvePair, withTitrantVolume } from '../chemistry/pairSolver.js';
import { chemicalById } from '../data/chemicals.js';
import { buildChartModel } from '../ui/chartView.js';

export const MAX_POINTS = 2000;
export const DEFAULT_CRITERIA = Object.freeze({ goodRmse: 0.2, notableRmse: 0.5, minPoints: 5 });
export const parseMeasurement = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  const s = String(value ?? '').trim();
  return /^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:e[+-]?\d+)?$/i.test(s) ? Number(s.replace(',', '.')) : NaN;
};
export function validateMeasurements(rows) {
  if (!Array.isArray(rows) || rows.length > MAX_POINTS) return { ok: false, errors: [`Tối đa ${MAX_POINTS} điểm.`], warnings: [], points: [] };
  const errors = []; const warnings = []; const points = []; const seen = new Set();
  rows.forEach((row, i) => {
    const volumeMl = parseMeasurement(row.volumeMl); const pH = parseMeasurement(row.pH);
    if (!(volumeMl >= 0 && volumeMl <= 10000) || !(pH >= 0 && pH <= 14)) { errors.push(`Hàng ${i + 1}: cần V từ 0–10000 mL và pH từ 0–14, không để trống.`); return; }
    if (seen.has(volumeMl)) warnings.push(`Hàng ${i + 1}: trùng thể tích ${volumeMl} mL; giữ nguyên điểm, không tự coi là phép đo lặp.`);
    if (points.length && volumeMl < points.at(-1).volumeMl) warnings.push(`Hàng ${i + 1}: thể tích chưa theo thứ tự; không tự sắp xếp dữ liệu gốc.`);
    seen.add(volumeMl); points.push({ volumeMl, pH, row: i + 1 });
  });
  if (!rows.length) errors.push('Chưa có số liệu.');
  return { ok: errors.length === 0, points, errors, warnings };
}
export function estimateEquivalence(points, expectedMl) {
  // Conservative finite-difference endpoint estimate, never a claim of measurement reliability.
  const sorted = [...points].sort((a, b) => a.volumeMl - b.volumeMl);
  if (sorted.length < 5 || new Set(sorted.map((p) => p.volumeMl)).size !== sorted.length || !sorted.some((p) => p.volumeMl < expectedMl * 0.9) || !sorted.some((p) => p.volumeMl > expectedMl * 1.1)) return null;
  const slopes = sorted.slice(1).map((p, i) => ({ volumeMl: (p.volumeMl + sorted[i].volumeMl) / 2, intervalMl: p.volumeMl - sorted[i].volumeMl, slope: Math.abs((p.pH - sorted[i].pH) / (p.volumeMl - sorted[i].volumeMl)) }));
  const candidate = slopes.reduce((a, b) => a.slope > b.slope ? a : b);
  if (candidate.intervalMl > expectedMl * 0.1 || Math.abs(candidate.volumeMl - expectedMl) > expectedMl * 0.2 || candidate.slope < 0.5) return null;
  const ties = slopes.filter((s) => s !== candidate && s.slope >= candidate.slope * 0.95);
  if (ties.some((s) => Math.abs(s.volumeMl - candidate.volumeMl) > expectedMl * 0.1)) return null;
  return { ...candidate, errorMl: candidate.volumeMl - expectedMl, errorPercent: (candidate.volumeMl - expectedMl) / expectedMl * 100, resolutionMl: candidate.intervalMl / 2, method: 'Trung điểm khoảng có |ΔpH/ΔV| lớn nhất; sai số phân giải tối thiểu ±ΔV/2, chỉ là ước lượng.' };
}
export function assessMeasurements({ rows, values, temperatureC = 25, source = 'measured', note = '', criteria = DEFAULT_CRITERIA }) {
  const validation = validateMeasurements(rows);
  if (!validation.ok) return { ...validation, message: 'Không thể đánh giá do dữ liệu chưa hợp lệ.' };
  const c = { ...DEFAULT_CRITERIA, ...criteria };
  if (!(Number.isFinite(c.goodRmse) && c.goodRmse > 0 && Number.isFinite(c.notableRmse) && c.notableRmse >= c.goodRmse && Number.isInteger(c.minPoints) && c.minPoints >= 3)) return { ok: false, errors: ['Ngưỡng tham khảo chưa hợp lệ.'], message: 'Không thể đánh giá.' };
  if (parseMeasurement(temperatureC) !== 25) return { ok: false, errors: ['Engine hiện chỉ được kiểm chứng ở 25 °C.'], message: 'Không thể đánh giá do mô hình không phù hợp nhiệt độ.' };
  if (!['measured', 'simulation'].includes(source)) return { ok: false, errors: ['Cần ghi rõ nguồn là dữ liệu đo hoặc mô phỏng.'] };
  const setup = { ...values, Ka: chemicalById('acetic').Ka, Kb: chemicalById('ammonia').Kb };
  const theory = calculateTheory(setup);
  if (!theory.ok) return { ok: false, errors: Object.values(theory.errors ?? { model: theory.solverError?.message ?? 'Cặp hóa học chưa được hỗ trợ.' }), message: 'Không thể đánh giá do thông số hoặc mô hình không phù hợp.' };
  const details = validation.points.map((point) => { const result = solvePair(withTitrantVolume(theory.input, point.volumeMl)); return result.error ? { ...point, error: result.error } : { ...point, theoreticalPH: result.pH, deltaPH: point.pH - result.pH }; });
  if (details.some((p) => p.error || !Number.isFinite(p.deltaPH))) return { ok: false, errors: ['Engine không giải được một số thể tích.'], message: 'Không thể đánh giá.' };
  const mae = details.reduce((n, p) => n + Math.abs(p.deltaPH), 0) / details.length;
  const rmse = Math.sqrt(details.reduce((n, p) => n + p.deltaPH ** 2, 0) / details.length);
  const maxDeviation = Math.max(...details.map((p) => Math.abs(p.deltaPH)));
  const sufficientlyCovered = details.length >= c.minPoints && details.some((p) => p.volumeMl < theory.equivalenceMl) && details.some((p) => p.volumeMl > theory.equivalenceMl);
  const conclusion = !sufficientlyCovered ? 'Chưa đủ dữ liệu để kết luận' : rmse <= c.goodRmse ? 'Phù hợp tốt với mô hình tại các điểm đã nhập' : rmse >= c.notableRmse ? 'Có sai lệch đáng chú ý so với mô hình' : 'Độ phù hợp trung gian, cần kiểm tra thêm';
  const warnings = [...validation.warnings, 'Ngưỡng là tiêu chí tham khảo của phần mềm, không phải tiêu chuẩn đo lường. Không có phép đo lặp được thiết kế, độ không đảm bảo đo hoặc thông tin thiết bị: chưa đủ cơ sở kết luận độ lặp lại hay độ tin cậy thực nghiệm.'];
  if (!sufficientlyCovered) warnings.push(`Cần ít nhất ${c.minPoints} điểm và phủ hai phía tương đương để nhận xét độ phù hợp tổng quát.`);
  if (source === 'simulation') warnings.push('Đây là dữ liệu mô phỏng, không phải số liệu đo thực nghiệm.');
  const endpoint = theory.pair.id === 'oxalic-naoh' ? null : estimateEquivalence(details, theory.equivalenceMl);
  if (!endpoint) warnings.push('Chưa đủ cơ sở ước lượng điểm tương đương thực nghiệm; hệ hai nấc chưa dùng thuật toán tìm một đỉnh.');
  const curve = buildChartModel(theory.input, Math.max(...details.map((p) => p.volumeMl)));
  if (curve.error) return { ok: false, errors: [curve.error.message] };
  return { ok: true, values: setup, temperatureC: 25, source, note: String(note).slice(0, 4000), criteria: c, count: details.length, details, metrics: { mae, rmse, maxDeviation }, conclusion, warnings, endpoint, theory, curve: curve.points.map(({ volumeMl, pH }) => ({ volumeMl, pH })) };
}
