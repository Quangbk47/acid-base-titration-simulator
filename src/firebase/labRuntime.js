import { firebaseConfig } from './config.js';
import { encodeCloudSession, decodeCloudSession } from '../history/sessions.js';
import { labAccountOptions } from './labOptions.js';

// Explicit opt-in only after provider/rules/CSP have been reviewed. No production probing.
export async function connectLabAccount(onUser) {
  const options = globalThis.__LAB_FIREBASE__ ?? labAccountOptions;
  if (!options?.enabled) return { configured: false };
  if (!options.rulesConfirmed && !options.emulators) throw new Error('Chưa xác nhận Rules lịch sử; đồng bộ tài khoản chưa được bật.');
  const sdk = await import('../../assets/vendor/firebase-lab.js');
  const app = sdk.initializeApp(options.config ?? firebaseConfig, 'lab-history');
  const auth = sdk.getAuth(app); const db = sdk.getFirestore(app);
  if (options.emulators) {
    const hostname = location.hostname;
    if (!['localhost', '127.0.0.1'].includes(hostname) || !(options.config?.projectId ?? '').startsWith('demo-')) throw new Error('Emulator chỉ dùng localhost và project demo.');
    sdk.connectAuthEmulator(auth, 'http://127.0.0.1:' + options.emulators.auth, { disableWarnings: true }); sdk.connectFirestoreEmulator(db, '127.0.0.1', options.emulators.firestore);
  }
  const unsubscribe = sdk.onAuthStateChanged(auth, onUser);
  const owner = () => { if (!auth.currentUser) throw new Error('Cần đăng nhập.'); return auth.currentUser.uid; };
  const collection = () => sdk.collection(db, 'users', owner(), 'savedExperiments');
  return {
    configured: true, allowRegistration: options.allowRegistration === true, unsubscribe,
    signIn: (email, password) => sdk.signInWithEmailAndPassword(auth, email, password),
    register: (email, password) => { if (!options.allowRegistration) throw new Error('Đăng ký chưa bật.'); return sdk.createUserWithEmailAndPassword(auth, email, password); },
    signOut: () => sdk.signOut(auth),
    async list() { const uid = owner(); const result = await sdk.getDocs(sdk.query(collection(), sdk.where('uid', '==', uid), sdk.limit(50))); return result.docs.map((d) => decodeCloudSession(d.id, d.data())).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); },
    async create(session) { const uid = owner(); const result = await sdk.addDoc(collection(), encodeCloudSession(uid, session, sdk.serverTimestamp())); return result.id; },
    async remove(id) { if (typeof id !== 'string' || id.includes('/')) throw new Error('ID không hợp lệ.'); await sdk.deleteDoc(sdk.doc(db, 'users', owner(), 'savedExperiments', id)); },
  };
}
