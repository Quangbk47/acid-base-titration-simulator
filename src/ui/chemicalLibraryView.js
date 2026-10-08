import { chemicals, constantDescription } from '../data/chemicals.js';
import { titrationPairs } from '../data/titrationPairs.js';
import { normalizeSearch } from '../data/learning.js';
import { escapeHtml } from './htmlSafety.js';

const searchable = (value) => normalizeSearch(value).replace(/[²³⁺⁻−]/g, (c) => ({ '²': '2', '³': '3', '⁺': '+', '⁻': '-', '−': '-' })[c]).replace(/\^/g, '').replace(/\s+/g, '');
export const supportedPairs = (chemical) => titrationPairs.filter((pair) => pair.analyteId === chemical.id || pair.titrantId === chemical.id);
export function findChemicals(query = '', filter = '') {
  const key = searchable(query);
  return chemicals.filter((c) => (!filter || c.category === filter || c.strength + '-' + c.category === filter || (filter === 'polyacid' && c.category === 'acid' && c.steps > 1) || (filter === 'ion' && c.ion)) && [c.name, c.englishName, c.formula, c.formulaAscii, ...c.aliases].some((text) => searchable(text).includes(key)));
}
export function simulationLink(pair) {
  if (!titrationPairs.includes(pair)) throw new Error('Cặp chưa được hỗ trợ.');
  return '/simulate?' + new URLSearchParams({ pairId: pair.id, analyteConcentrationM: pair.id === 'hcl-calcium' ? 0.01 : 0.1, analyteVolumeMl: 25, titrantConcentrationM: pair.id === 'hcl-calcium' ? 0.005 : 0.1 });
}
const sourceLink = (url, label) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
export function chemicalDetailHtml(c) {
  const pairs = supportedPairs(c);
  const steps = c.equilibria.map((step) => {
    const key = step.constantKey; const value = c[key];
    const constant = step.mode === 'strong' ? 'Phân ly mạnh trong nước; không gán Ka/Kb hữu hạn.' : step.mode === 'pending' ? `${key}: Cần xác minh` : `${key} = ${value.toExponential(3)}; p${key} = ${c['p' + key].toFixed(4)}`;
    return `<details class="equilibrium-step" open><summary>Nấc ${step.step} · ${escapeHtml(constant)}</summary><p class="chemical-equation">${escapeHtml(step.equation)}</p><p>${step.mode === 'pending' ? 'Chưa đủ dữ liệu cùng điều kiện để công bố hằng số cho nấc này.' : step.mode === 'strong' ? 'Trong dung dịch loãng, cân bằng này nghiêng mạnh về phía sản phẩm.' : 'Hằng số mô tả cân bằng của riêng nấc này, không phải tổng các nấc.'}</p></details>`;
  }).join('');
  const explanation = c.category === 'acid' ? 'Ka lớn hơn nghĩa là xu hướng tạo H⁺ lớn hơn trong cùng dung môi, nhiệt độ và quy ước. pKa = −log₁₀(Ka): Ka càng lớn thì pKa càng nhỏ. Không suy trực tiếp pH nếu chưa biết nồng độ và các cân bằng khác.' : 'Kb mô tả phản ứng nhận proton từ nước và tạo OH⁻. pKb = −log₁₀(Kb): Kb lớn hơn ứng với pKb nhỏ hơn trong cùng điều kiện. Ví dụ NH₃ + H₂O ⇌ NH₄⁺ + OH⁻; NH₃ không phân ly hoàn toàn như NaOH.';
  const alternatives = c.alternatives.length ? '<p>Giá trị đối chiếu, không dùng trong phép tính:</p><ul>' + c.alternatives.map((entry) => '<li>' + escapeHtml(entry.key + ' = ' + entry.value.toExponential(3) + ' ở ' + entry.temperatureC + ' °C') + ' · ' + sourceLink(entry.source, 'Nguồn đối chiếu') + '</li>').join('') + '</ul>' : '';
  const poly = c.category === 'acid' && c.steps > 1 ? '<details><summary>Vì sao có nhiều nấc phân ly?</summary><p>Mỗi nấc tách một proton từ một loài hóa học khác. Điện tích thay đổi làm khả năng nhường proton tiếp theo khác đi; phải dùng từng Ka riêng. Ví dụ H₃PO₄ tạo lần lượt H₂PO₄⁻, HPO₄²⁻ và PO₄³⁻. Không cộng Ka và không mặc định mỗi nấc có cùng pH tương đương.</p></details>' : '';
  return `<button type="button" class="button button-quiet" data-close-chemical>Quay lại danh sách</button><h3 tabindex="-1" data-detail-title>${escapeHtml(c.name)} · ${escapeHtml(c.formula)}</h3><p>${escapeHtml(c.englishName)} · ${escapeHtml(c.kind)} · ${c.steps} cân bằng được trình bày · ${c.protonCapacity} đương lượng proton/mol${c.mechanism === 'Lewis' ? ' (cơ chế Lewis)' : ''}</p><p class="chemical-status">${pairs.length ? 'Có thể mô phỏng' : 'Chỉ tra cứu — Hiện chỉ hỗ trợ tra cứu'}${c.verification === 'pending' || c.pendingConstants.length ? ' · Có dữ liệu cần xác minh' : ''}</p><p>${escapeHtml(constantDescription(c))}</p>${steps}<details><summary>Hiểu Ka/Kb và pKa/pKb</summary><p>${explanation}</p><p>Ví dụ: Ka = 10⁻⁵ thì pKa = 5; Ka = 10⁻⁴ thì pKa = 4. Đây là so sánh hằng số, không phải hai giá trị pH.</p></details>${poly}<details open><summary>Điều kiện, nguồn và lưu ý</summary><p>${escapeHtml(c.temperatureC === null ? 'Chưa xác minh hằng số ở 25 °C.' : `${c.temperatureC} °C · ${c.medium}`)}</p><p>${escapeHtml(c.derivation ?? '')}</p><p>${escapeHtml(c.notes)}</p>${alternatives}<p>${sourceLink(c.source, c.source.includes('webassign') ? 'Brown–LeMay–Bursten, bảng D.1/D.2 (25 °C)' : c.source.includes('umbc') ? 'Bảng UMBC: xem nhiệt độ từng mục' : 'OpenStax Chemistry 2e: nguồn dữ liệu chọn dùng')}${c.contextSource ? ' · ' + sourceLink(c.contextSource, 'Nguồn đối chiếu / giải thích điều kiện') : ''}</p></details><div class="chemical-simulation-links">${pairs.map((pair) => `<a class="button button-secondary" data-chemical-simulate href="${escapeHtml(simulationLink(pair))}">Thử mô phỏng: bình ${escapeHtml(pair.analyte)} – buret ${escapeHtml(pair.titrant)}</a>`).join('')}</div>`;
}
export function initChemicalLibrary(root = document) {
  const search = root.querySelector('#chemical-search'); const filter = root.querySelector('#chemical-filter'); const catalog = root.querySelector('[data-chemical-catalog]'); const detail = root.querySelector('[data-chemical-detail]');
  let selected;
  const render = () => {
    detail.hidden = true;
    const found = findChemicals(search.value, filter.value);
    catalog.innerHTML = found.map((c) => `<article class="chemical-card"><span class="eyebrow">${escapeHtml(c.kind)}</span><h3>${escapeHtml(c.formula)}</h3><p>${escapeHtml(c.name)}<br /><small>${escapeHtml(c.englishName)}</small></p><p class="chemical-constant">${escapeHtml(constantDescription(c))}</p><p class="chemical-status">${supportedPairs(c).length ? 'Có thể mô phỏng' : 'Chỉ tra cứu'}</p><button type="button" class="button button-secondary" data-chemical-id="${escapeHtml(c.id)}" aria-controls="chemical-detail">Xem chi tiết ${escapeHtml(c.formula)}</button></article>`).join('') || '<p role="status">Không tìm thấy hóa chất phù hợp. Thử tên Việt, tên Anh hoặc công thức khác.</p>';
    root.querySelector('[data-catalog-count]').textContent = `${found.length} hóa chất`;
  };
  search.addEventListener('input', render); filter.addEventListener('change', render);
  catalog.addEventListener('click', (event) => {
    const button = event.target.closest('[data-chemical-id]'); if (!button) return;
    selected = button; const chemical = chemicals.find((c) => c.id === button.dataset.chemicalId);
    detail.innerHTML = chemicalDetailHtml(chemical); detail.hidden = false; detail.querySelector('[data-detail-title]').focus(); detail.scrollIntoView({ block: 'start' });
  });
  detail.addEventListener('click', (event) => { if (event.target.closest('[data-close-chemical]')) { detail.hidden = true; selected?.focus(); } });
  render();
}
