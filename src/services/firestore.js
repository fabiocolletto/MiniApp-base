let app;
let db;
const memoryDb = new Map();

function getConfig() {
  if (typeof window !== 'undefined' && window.FIREBASE_CONFIG)
    return window.FIREBASE_CONFIG;
  if (typeof globalThis !== 'undefined' && globalThis.FIREBASE_CONFIG)
    return globalThis.FIREBASE_CONFIG;
  return null;
}

async function getDb() {
  const config = getConfig();
  if (!config) return null;
  if (db) return db;
  const { initializeApp } = await import('firebase/app');
  const { getFirestore } = await import('firebase/firestore');
  app = initializeApp(config);
  db = getFirestore(app);
  return db;
}

function getMemoryDoc(uniqueId) {
  return memoryDb.get(uniqueId) || null;
}

function setMemoryDoc(uniqueId, data) {
  memoryDb.set(uniqueId, { ...(data || {}) });
  return memoryDb.get(uniqueId);
}

export async function saveUserDocument(uniqueId, data) {
  const database = await getDb();
  if (!database) {
    return setMemoryDoc(uniqueId, data);
  }
  const { doc, setDoc } = await import('firebase/firestore');
  await setDoc(doc(database, 'users', uniqueId), data, { merge: true });
  return data;
}

export async function getUserDocument(uniqueId) {
  const database = await getDb();
  if (!database) return getMemoryDoc(uniqueId);
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(database, 'users', uniqueId));
  return snap.exists() ? snap.data() : null;
}

export async function updateUserDocument(uniqueId, patch) {
  const existing = (await getUserDocument(uniqueId)) || {};
  const merged = { ...existing, ...patch };
  await saveUserDocument(uniqueId, merged);
  return merged;
}

export async function ensureUserDocumentExists(uniqueId) {
  const existing = await getUserDocument(uniqueId);
  if (existing) return existing;
  const docData = { createdAt: new Date().toISOString(), uniqueId };
  await saveUserDocument(uniqueId, docData);
  return docData;
}
