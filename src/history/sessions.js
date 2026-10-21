export const HISTORY_KEY = 'acid-base-local-history-v1';
export function validateSession(session) {
  if (!session || session.version !== 1 || typeof session.createdAt !== 'string' || !Number.isFinite(Date.parse(session.createdAt)) || !session.simulation?.values || new TextEncoder().encode(JSON.stringify(session)).length > 700000) throw new Error('Phiên lưu không hợp lệ hoặc quá lớn.');
  return session;
}
export function createLocalHistory(storage) {
  const list = () => { const parsed = JSON.parse(storage.getItem(HISTORY_KEY) ?? '[]'); if (!Array.isArray(parsed)) throw new Error('Lịch sử local không hợp lệ; dữ liệu được giữ nguyên.'); return parsed.map(validateSession); };
  return {
    list,
    create(session) { validateSession(session); const records = list(); if (records.length >= 50) throw new Error('Đã đạt 50 phiên local; hãy xuất hoặc tự xóa phiên không cần thiết.'); const record = { ...session, id: crypto.randomUUID() }; storage.setItem(HISTORY_KEY, JSON.stringify([record, ...records])); return record; },
    remove(id) { const records = list(); if (!records.some((r) => r.id === id)) throw new Error('Không tìm thấy phiên.'); storage.setItem(HISTORY_KEY, JSON.stringify(records.filter((r) => r.id !== id))); },
  };
}
export function encodeCloudSession(uid, session, now) {
  if (typeof uid !== 'string' || !uid || uid.includes('/')) throw new Error('UID không hợp lệ.'); validateSession(session);
  return { uid, input: JSON.parse(JSON.stringify(session)), modelVersion: 'lab-session-v1', createdAt: now, updatedAt: now };
}
export function decodeCloudSession(id, data) {
  try { return { ...validateSession(data.input), id }; }
  catch { return { id, unsupported: true, createdAt: data.createdAt?.toDate?.().toISOString() ?? new Date(0).toISOString(), simulation: { values: { pairId: 'Phiên schema cũ/không hỗ trợ (được giữ nguyên)' } } }; }
}
