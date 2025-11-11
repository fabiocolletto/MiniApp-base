const FIREBASE_BASE = 'https://www.gstatic.com/firebasejs/11.6.1/';

const MODULES = {
  'firebase-app.js': `export const initializeApp = () => ({ appId: 'stub-app' });`,
  'firebase-auth.js': `export const getAuth = () => ({ uid: 'stub-auth' });
export const signInAnonymously = async () => ({ user: { uid: 'anon' } });
export const signInWithCustomToken = async () => ({ user: { uid: 'custom' } });
export const onAuthStateChanged = (auth, cb) => { cb && cb({ uid: 'stub' }); return () => {}; };`,
  'firebase-firestore.js': `export const setLogLevel = () => {};
export const getFirestore = () => ({ db: 'stub' });
export const doc = (...segments) => ({ path: segments.join('/') });
export const onSnapshot = (ref, onNext, onError) => {
  const unsubscribe = () => {};
  Promise.resolve().then(() => {
    if (typeof onNext === 'function') {
      onNext({
        exists: () => false,
        data: () => ({ items: [] }),
      });
    }
  }).catch((error) => typeof onError === 'function' && onError(error));
  return unsubscribe;
};
export const getDoc = async () => ({ exists: () => false });
export const setDoc = async () => undefined;`,
};

async function stubFirebase(page) {
  for (const [module, body] of Object.entries(MODULES)) {
    const url = `${FIREBASE_BASE}${module}`;
    await page.route(url, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body,
      });
    });
  }
}

module.exports = { stubFirebase };
