import { pairForValues } from '../data/titrationPairs.js';
import { solverForInput, withTitrantVolume } from '../chemistry/pairSolver.js';
export { solverForInput, withTitrantVolume } from '../chemistry/pairSolver.js';
import { TITRATION_SYSTEMS, toChemistryInput, validateTitrationForm } from './validation.js';


// Stoichiometry comes from the selected pair; equivalent pH uses its solver.
export function calculateTheory(values) {
  const validation = validateTitrationForm({ ...values, addedVolumeMl: 0 });
  if (!validation.ok) return validation;
  const value = validation.value;
  const input = toChemistryInput(value);
  const pair = pairForValues(value);
  const equivalenceMl = value.analyteConcentrationM * value.analyteVolumeMl * pair.ratio / value.titrantConcentrationM;
  if (equivalenceMl === null || !Number.isFinite(equivalenceMl)) return { ok: false };
  const result = solverForInput(input)(withTitrantVolume(input, equivalenceMl));
  if (result.error) return { ok: false, solverError: result.error };
  const system = TITRATION_SYSTEMS[value.systemType];
  const reaction = pair.reaction;
  const equivalentVolumesMl = pair.id === 'oxalic-naoh' ? [equivalenceMl / 2, equivalenceMl] : [equivalenceMl];
  const equivalents = equivalentVolumesMl.map((volumeMl) => ({ volumeMl, pH: solverForInput(input)(withTitrantVolume(input, volumeMl)).pH }));
  if (equivalents.some((point) => !Number.isFinite(point.pH))) return { ok: false, solverError: { message: 'Không hội tụ tại một trong các điểm tương đương.' } };
  return { ok: true, ...system, analyte: pair.analyte, titrant: pair.titrant, pair, input, equivalents, ratio: pair.ratio, equivalenceMl, pH: result.pH, analyteMoles: value.analyteConcentrationM * value.analyteVolumeMl / 1000, analyteVolumeL: value.analyteVolumeMl / 1000, analyteConcentrationM: value.analyteConcentrationM, titrantConcentrationM: value.titrantConcentrationM, reaction };
}

const decimal = (value, digits = 2) => (value !== 0 && (Math.abs(value) < 0.01 || Math.abs(value) >= 1e6) ? value.toExponential(4) : value.toFixed(digits)).replace('.', ',');
export function renderTheoryView(root, theory) {
  const panel = root.querySelector('[data-theory]');
  if (!panel) return;
  panel.dataset.status = theory?.ok ? 'ready' : 'stale';
  const text = (key, value) => { const element = panel.querySelector('[data-theory-' + key + ']'); if (element) element.textContent = value; };
  text('status', theory?.ok ? 'Điểm tương đương lý thuyết · 25 °C · số mol theo hệ số phản ứng' : 'Thông số đã thay đổi hoặc chưa hợp lệ. Nhấn “Dự đoán điểm tương đương” để tính lại trước khi chạy.');
  for (const key of ['reaction', 'moles', 'balance', 'formula', 'volume', 'ph', 'notes']) text(key, '—');
  if (!theory?.ok) return;
  text('reaction', theory.reaction);
  text('moles', 'n(' + theory.analyte + ') = ' + theory.analyteConcentrationM + ' mol/L × ' + theory.analyteVolumeL + ' L = ' + theory.analyteMoles.toPrecision(6).replace('.', ',') + ' mol');
  text('balance', 'Tại tương đương cuối: n(' + theory.titrant + ') = ' + theory.ratio + ' × n(' + theory.analyte + ')');
  text('formula', 'V(' + theory.titrant + ') = ' + theory.ratio + ' × C(' + theory.analyte + ') × V(' + theory.analyte + ') / C(' + theory.titrant + ') = ' + decimal(theory.equivalenceMl) + ' mL');
  text('volume', theory.equivalents.map((point, i) => (theory.equivalents.length > 1 ? 'Nấc ' + (i + 1) + ': ' : '') + decimal(point.volumeMl) + ' mL').join(' · '));
  text('ph', theory.equivalents.map((point) => decimal(point.pH) + (point.pH < 6.99 ? ' (axit)' : point.pH > 7.01 ? ' (bazơ)' : ' (trung tính)')).join(' · ') + ' · 25 °C');
  text('notes', theory.pair.base === 'ammonia' ? 'Phenolphthalein không phù hợp để nhận biết điểm tương đương của hệ này. pH được giải từ cân bằng NH₃/NH₄⁺.' : theory.pair.id === 'hcl-calcium' ? 'Ca(OH)₂: mỗi mol cung cấp 2 OH⁻; chỉ dùng dung dịch đã hòa tan trong giới hạn độ tan lý tưởng.' : theory.pair.id === 'oxalic-naoh' ? 'Hai nấc được giải đồng thời; mốc thứ hai là tương đương toàn phần. Đương lượng axit còn chuẩn độ không phải nồng độ H⁺ tự do.' : 'Điểm kết thúc màu chỉ thị phụ thuộc khoảng chuyển màu; không đồng nhất với tương đương lý thuyết.');
  if (Math.min(theory.analyteConcentrationM, theory.titrantConcentrationM) < 1e-4 || Math.max(theory.analyteConcentrationM, theory.titrantConcentrationM) > 1) {
    const note = panel.querySelector('[data-theory-notes]');
    if (note) note.textContent += ' Cảnh báo: nồng độ rất loãng hoặc rất đặc nằm ngoài miền diễn giải tin cậy của mô hình lý tưởng; hệ mạnh dùng xấp xỉ ion dư ngoài tương đương.';
  }
}
