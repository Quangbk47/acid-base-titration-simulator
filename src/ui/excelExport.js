import { chemicals } from '../data/chemicals.js';
import { buildChartModel, orderedChartData } from './chartView.js';

const encoder = new TextEncoder();
const xml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
const column = (index) => { let label = ''; do { label = String.fromCharCode(65 + index % 26) + label; index = Math.floor(index / 26) - 1; } while (index >= 0); return label; };
const crc32 = (bytes) => { let crc = 0xffffffff; for (const byte of bytes) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); } return (crc ^ 0xffffffff) >>> 0; };
const concat = (items) => { const out = new Uint8Array(items.reduce((n, item) => n + item.length, 0)); let offset = 0; for (const item of items) { out.set(item, offset); offset += item.length; } return out; };
// OOXML ZIP, uncompressed entries: small deterministic exports, no CDN/dependency.
export function zipFiles(files) {
  const locals = []; const centrals = []; let offset = 0;
  for (const [path, content] of Object.entries(files)) {
    const name = encoder.encode(path); const bytes = encoder.encode(content); const crc = crc32(bytes);
    const local = new Uint8Array(30); const view = new DataView(local.buffer);
    view.setUint32(0, 0x04034b50, true); view.setUint16(4, 20, true); view.setUint16(6, 0x800, true); view.setUint16(12, 33, true); view.setUint32(14, crc, true); view.setUint32(18, bytes.length, true); view.setUint32(22, bytes.length, true); view.setUint16(26, name.length, true);
    locals.push(local, name, bytes);
    const central = new Uint8Array(46); const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x800, true); cv.setUint16(14, 33, true); cv.setUint32(16, crc, true); cv.setUint32(20, bytes.length, true); cv.setUint32(24, bytes.length, true); cv.setUint16(28, name.length, true); cv.setUint32(42, offset, true);
    centrals.push(central, name); offset += local.length + name.length + bytes.length;
  }
  const directory = concat(centrals); const end = new Uint8Array(22); const ev = new DataView(end.buffer); const count = Object.keys(files).length;
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, count, true); ev.setUint16(10, count, true); ev.setUint32(12, directory.length, true); ev.setUint32(16, offset, true);
  return concat([...locals, directory, end]);
}

export function experimentSheets({ values, theory, state, history = [] }) {
  const settings = [['Thông số', 'Giá trị', 'Đơn vị / nguồn'], ['Cặp chuẩn độ', theory.pair.analyte + ' – ' + theory.pair.titrant, ''], ['Loại chuẩn độ', theory.pair.systemType, 'Phân loại theo cặp bình – buret'], ['Chất trong bình', theory.analyte, ''], ['Chất trong buret', theory.titrant, ''], ['Nồng độ chất phân tích', Number(values.analyteConcentrationM), 'mol/L'], ['Thể tích ban đầu', Number(values.analyteVolumeMl), 'mL'], ['Nồng độ chất chuẩn', Number(values.titrantConcentrationM), 'mol/L'], ['Buret ban đầu', state?.initialBuretVolumeMl ?? Number(values.buretVolumeMl), 'mL'], ['Nhiệt độ', 25, '°C'], ['Kw', 1e-14, '25 °C'], ['Giả định', 'Dung dịch lý tưởng; không mô phỏng hoạt độ, CO₂, sai số thiết bị hay huyền phù.', ''], ['Nguồn dữ liệu', 'Mô phỏng tính toán, không phải phép đo thực nghiệm.', '']];
  for (const chemical of chemicals.filter((c) => [theory.pair.analyteId, theory.pair.titrantId].includes(c.id))) {
    for (const key of ['Ka', 'Kb', 'Ka1', 'Ka2', 'Ksp']) if (chemical[key]) settings.push([chemical.formula + ' ' + key, chemical[key], chemical.source]);
    settings.push([chemical.formula + ' tham khảo', chemical.notes, chemical.source]);
  }
  const theoretical = [['Đại lượng', 'Giá trị', 'Đơn vị / diễn giải'], ['Phương trình', theory.reaction, ''], ['Số mol chất phân tích', theory.analyteMoles, 'mol'], ['Hệ số n(chuẩn) / n(phân tích)', theory.ratio, 'mol/mol'], ['Công thức', 'V(chuẩn) = hệ số × C(phân tích) × V(phân tích) / C(chuẩn)', 'V cùng đơn vị'], ['Chỉ thị', 'Phenolphthalein: khoảng chuyển màu pH 8,2–10; điểm kết thúc khác điểm tương đương.', '']];
  theory.equivalents.forEach((point, i) => theoretical.push(['V tương đương ' + (i + 1), point.volumeMl, 'mL'], ['pH tương đương ' + (i + 1), point.pH, point.pH < 6.99 ? 'axit' : point.pH > 7.01 ? 'bazơ' : 'trung tính']));
  const rows = [['V chất chuẩn đã thêm (mL)', 'pH', 'Nguồn', 'Giai đoạn / mốc']];
  if (!state) rows.push(['', '', 'Chưa chạy mô phỏng', 'Chỉ có dữ liệu lý thuyết bên dưới']);
  for (const row of orderedChartData(history)) rows.push([row.volumeMl, row.pH, 'Mô phỏng', row.stage]);
  const curve = buildChartModel(theory.input, state?.addedVolumeMl ?? 0);
  if (curve.error) throw new Error(curve.error.message);
  for (const row of curve.points) {
    const equivalentIndex = theory.equivalents.findIndex((point) => Math.abs(point.volumeMl - row.volumeMl) < 1e-9);
    const mark = equivalentIndex >= 0 ? 'Điểm tương đương ' + (equivalentIndex + 1) : row.volumeMl === 0 ? 'Ban đầu' : Math.abs(row.volumeMl - curve.milestones.halfEqMl) < 1e-9 ? 'Nửa V tương đương cuối' : Number.isFinite(curve.milestones.endpointMl) && Math.abs(row.volumeMl - curve.milestones.endpointMl) < 1e-9 ? 'Ngưỡng chỉ thị pH 8,2 (không phải tương đương)' : row.stage;
    rows.push([row.volumeMl, row.pH, 'Lý thuyết', mark]);
  }
  return [{ name: 'Thông số', rows: settings }, { name: 'Lý thuyết', rows: theoretical }, { name: 'Dữ liệu pH-V', rows }];
}

export function createWorkbook(sheets) {
  const ns = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  const files = {
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`,
    '_rels/.rels': '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml': `<workbook xmlns="${ns}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((sheet, i) => `<sheet name="${xml(sheet.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`,
    'xl/_rels/workbook.xml.rels': `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="styles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    'xl/styles.xml': `<styleSheet xmlns="${ns}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF176B64"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFill="1" applyFont="1"><alignment wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
  };
  sheets.forEach((sheet, index) => {
    const rows = sheet.rows.map((row, r) => `<row r="${r + 1}">${row.map((value, c) => { const ref = column(c) + (r + 1); if (typeof value === 'number') { if (!Number.isFinite(value)) throw new Error('Giá trị Excel không hữu hạn'); return `<c r="${ref}" s="${r === 0 ? 1 : 0}"><v>${value}</v></c>`; } return `<c r="${ref}" s="${r === 0 ? 1 : 0}" t="inlineStr"><is><t xml:space="preserve">${xml(value)}</t></is></c>`; }).join('')}</row>`).join('');
    files[`xl/worksheets/sheet${index + 1}.xml`] = `<worksheet xmlns="${ns}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="38" customWidth="1"/><col min="2" max="2" width="50" customWidth="1"/><col min="3" max="4" width="55" customWidth="1"/></cols><sheetData>${rows}</sheetData><autoFilter ref="A1:${column(Math.max(...sheet.rows.map((r) => r.length)) - 1)}${sheet.rows.length}"/></worksheet>`;
  });
  return zipFiles(files);
}
export function downloadExperiment(snapshot) {
  const blob = new Blob([createWorkbook(experimentSheets(snapshot))], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `chuan-do-${snapshot.theory.pair.id}.xlsx`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
