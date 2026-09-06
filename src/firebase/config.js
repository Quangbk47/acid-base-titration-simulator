const requiredKeys = Object.freeze([
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
]);

export const firebaseConfig = Object.freeze({
  apiKey: globalThis.__FIREBASE_CONFIG__?.apiKey ?? 'AIzaSyCJecQeCGGI-Hy29xJh-B3GPdOmgzEpNG8',
  authDomain: globalThis.__FIREBASE_CONFIG__?.authDomain ?? 'acid-base-titration-simulator.firebaseapp.com',
  projectId: globalThis.__FIREBASE_CONFIG__?.projectId ?? 'acid-base-titration-simulator',
  storageBucket: globalThis.__FIREBASE_CONFIG__?.storageBucket ?? 'acid-base-titration-simulator.firebasestorage.app',
  messagingSenderId: globalThis.__FIREBASE_CONFIG__?.messagingSenderId ?? '864242339291',
  appId: globalThis.__FIREBASE_CONFIG__?.appId ?? '1:864242339291:web:9d9a1fba546a986b892bfe',
});

export const validateFirebaseConfig = (config = firebaseConfig) => {
  const missing = requiredKeys.filter((key) => !config[key]);
  return Object.freeze({ ok: missing.length === 0, missing });
};

export const firebaseConfigStatus = validateFirebaseConfig();
