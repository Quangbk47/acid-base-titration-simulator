import { MAX_POINTS } from './assessment.js';

export function parseCSV(text) {
  if (text.length > 5 * 1024 * 1024) throw new Error('CSV quá lớn (tối đa 5 MB).');
  text = text.replace(/^\uFEFF/, '');
  const firstLine = text.split(/\r?\n/)[0]; const delimiter = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ',';
  const rows = []; let row = []; let cell = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') { if (quoted && text[i + 1] === '"') { cell += '"'; i++; } else if (quoted || cell === '') quoted = !quoted; else throw new Error('Dấu ngoặc kép CSV không hợp lệ.'); }
    else if (!quoted && (char === delimiter || char === '\n' || char === '\r')) { row.push(cell); cell = ''; if (char !== delimiter) { if (row.length > 1 || row.some((v) => v.trim())) rows.push(row); row = []; if (char === '\r' && text[i + 1] === '\n') i++; } }
    else cell += char;
  }
  if (quoted) throw new Error('CSV chưa đóng dấu ngoặc kép.');
  row.push(cell); if (row.length > 1 || row.some((v) => v.trim())) rows.push(row);
  if (rows.length > MAX_POINTS + 1) throw new Error(`Tối đa ${MAX_POINTS} hàng số liệu.`);
  return rows;
}
export function tableToMeasurements(table, hasHeader = true) {
  if (!Array.isArray(table) || table.length > MAX_POINTS + 1) throw new Error('Bảng vượt giới hạn hàng.');
  return table.slice(hasHeader ? 1 : 0).map((row) => ({ volumeMl: String(row[0] ?? ''), pH: String(row[1] ?? '') }));
}
export async function unzipWorkbook(buffer) {
  const bytes = new Uint8Array(buffer); if (bytes.length > 5 * 1024 * 1024) throw new Error('Excel tối đa 5 MB.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength); let end = bytes.length - 22;
  while (end >= Math.max(0, bytes.length - 65557) && view.getUint32(end, true) !== 0x06054b50) end--;
  if (end < Math.max(0, bytes.length - 65557)) throw new Error('Không phải tệp .xlsx ZIP hợp lệ.');
  const count = view.getUint16(end + 10, true); let offset = view.getUint32(end + 16, true); const files = {}; let total = 0;
  if (count > 300) throw new Error('Workbook có quá nhiều tài nguyên.');
  for (let i = 0; i < count; i++) {
    if (view.getUint32(offset, true) !== 0x02014b50) throw new Error('ZIP directory không hợp lệ.');
    const flags = view.getUint16(offset + 8, true); const method = view.getUint16(offset + 10, true); const size = view.getUint32(offset + 24, true); const compressed = view.getUint32(offset + 20, true);
    const nameLen = view.getUint16(offset + 28, true); const extra = view.getUint16(offset + 30, true); const comment = view.getUint16(offset + 32, true); const local = view.getUint32(offset + 42, true);
    const name = new TextDecoder().decode(bytes.slice(offset + 46, offset + 46 + nameLen)); offset += 46 + nameLen + extra + comment;
    if (flags & 1 || size > 10 * 1024 * 1024 || (total += size) > 20 * 1024 * 1024 || name.includes('..') || name.startsWith('/') || name.includes('\\') || Object.hasOwn(files, name)) throw new Error('Workbook mã hóa, quá lớn hoặc chứa đường dẫn không an toàn.');
    if (!/\.xml$|\.rels$/.test(name)) continue;
    if (view.getUint32(local, true) !== 0x04034b50) throw new Error('ZIP entry không hợp lệ.');
    const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true); const data = bytes.slice(start, start + compressed);
    let decoded = data;
    if (method === 8) {
      const reader = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader(); const chunks = []; let length = 0;
      while (true) { const next = await reader.read(); if (next.done) break; length += next.value.length; if (length > size || length > 10 * 1024 * 1024) { await reader.cancel(); throw new Error('Dữ liệu nén vượt giới hạn.'); } chunks.push(next.value); }
      decoded = new Uint8Array(length); let at = 0; for (const chunk of chunks) { decoded.set(chunk, at); at += chunk.length; }
    } else if (method !== 0) throw new Error('Kiểu nén Excel chưa hỗ trợ.');
    if (decoded.length !== size) throw new Error('Độ dài ZIP không đúng.');
    files[name] = new TextDecoder().decode(decoded);
  }
  return files;
}
export async function parseXlsx(buffer) {
  const files = await unzipWorkbook(buffer);
  const parse = (path) => { const text = files[path]; if (!text || /<!DOCTYPE|<!ENTITY/i.test(text)) throw new Error('XML thiếu hoặc chứa khai báo không được hỗ trợ.'); const doc = new DOMParser().parseFromString(text, 'application/xml'); if (doc.querySelector('parsererror')) throw new Error('XML Excel không hợp lệ.'); return doc; };
  const texts = (node) => [...node.getElementsByTagNameNS('*', 't')].map((n) => n.textContent).join('');
  const shared = files['xl/sharedStrings.xml'] ? [...parse('xl/sharedStrings.xml').getElementsByTagNameNS('*', 'si')].map(texts) : [];
  const relationships = [...parse('xl/_rels/workbook.xml.rels').getElementsByTagNameNS('*', 'Relationship')];
  return [...parse('xl/workbook.xml').getElementsByTagNameNS('*', 'sheet')].map((sheet) => {
    const relation = relationships.find((r) => r.getAttribute('Id') === sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id'));
    const target = relation?.getAttribute('Target') ?? ''; if (relation?.getAttribute('TargetMode') === 'External' || target.includes('..')) throw new Error('Không đọc worksheet tham chiếu ngoài.');
    const path = target.startsWith('/xl/') ? target.slice(1) : 'xl/' + target.replace(/^\//, '');
    const rows = [...parse(path).getElementsByTagNameNS('*', 'row')]; if (rows.length > MAX_POINTS + 1) throw new Error(`Worksheet tối đa ${MAX_POINTS} hàng.`);
    return { name: sheet.getAttribute('name'), rows: rows.map((row) => { const values = []; for (const cell of row.getElementsByTagNameNS('*', 'c')) { const reference = cell.getAttribute('r') ?? ''; const col = reference.match(/^[A-Z]+/)?.[0]; if (!col) throw new Error('Địa chỉ ô không hợp lệ.'); const index = [...col].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1; if (index > 100) throw new Error('Worksheet có quá nhiều cột.'); const value = cell.getElementsByTagNameNS('*', 'v')[0]?.textContent ?? ''; if (cell.getElementsByTagNameNS('*', 'f').length && !value) throw new Error('Ô công thức chưa có giá trị cache. Hãy tính và lưu lại bằng Excel.'); values[index] = cell.getAttribute('t') === 's' ? shared[Number(value)] ?? '' : cell.getAttribute('t') === 'inlineStr' ? texts(cell) : value; } return values; }) };
  });
}
