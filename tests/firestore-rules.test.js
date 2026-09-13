import test from 'node:test';
import assert from 'node:assert/strict';

// Kiểm tra logic cốt lõi của Firestore Rules:
// 1. Guest không được phép lưu (phải có auth)
// 2. User chỉ được phép tạo document khi uid trong dữ liệu khớp với uid đăng nhập
test('Phase 6 - Security Rules Logic Validation', async (t) => {
  
  const evaluateCreateRule = ({ auth, resourceData }) => {
    const signedIn = auth !== null;
    if (!signedIn) return false;
    // Luật bắt buộc: request.auth.uid == request.resource.data.uid
    return auth.uid === resourceData.uid;
  };

  await t.test('1. Guest không có auth -> Từ chối', () => {
    const allowed = evaluateCreateRule({ auth: null, resourceData: { uid: 'user_123' } });
    assert.equal(allowed, false);
  });

  await t.test('2. Mạo danh UID người khác -> Từ chối', () => {
    const allowed = evaluateCreateRule({ 
      auth: { uid: 'hacker_uid' }, 
      resourceData: { uid: 'admin_uid' } // Khác nhau -> Chặn
    });
    assert.equal(allowed, false);
  });

  await t.test('3. Đăng nhập đúng UID của mình -> Cho phép', () => {
    const allowed = evaluateCreateRule({ 
      auth: { uid: 'user_123' }, 
      resourceData: { uid: 'user_123' } // Khớp tuyệt đối -> Pass
    });
    assert.equal(allowed, true);
  });
});