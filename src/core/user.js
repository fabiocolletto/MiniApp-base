import { getUniqueId } from '../services/uniqueId.js';
import {
  ensureUserDocumentExists,
  getUserDocument,
  saveUserDocument,
} from '../services/firestore.js';
import {
  loadLocalUser as loadStoredUser,
  saveLocalUser as persistLocalUser,
  syncLocalUserToFirestore,
} from './storage.js';

const DEFAULT_USER = {
  uniqueId: '',
  profile: {
    name: '',
    role: 'aluno',
    birthDate: '',
  },
  contact: {
    phone: '',
    email: '',
    country: 'Brasil',
  },
  preferences: {
    theme: 'light',
    language: 'pt-BR',
    notifications: true,
  },
  accessibility: {
    highContrast: false,
    largeText: false,
  },
  billing: {
    activePlan: null,
    creditBalance: 0,
  },
  subscriptions: [],
  credits: {
    current: 0,
    totalEarned: 0,
  },
  meta: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

function mergeUser(base, incoming = {}) {
  return {
    ...base,
    ...incoming,
    profile: { ...base.profile, ...(incoming.profile || {}) },
    contact: { ...base.contact, ...(incoming.contact || {}) },
    preferences: { ...base.preferences, ...(incoming.preferences || {}) },
    accessibility: { ...base.accessibility, ...(incoming.accessibility || {}) },
    billing: { ...base.billing, ...(incoming.billing || {}) },
    credits: { ...base.credits, ...(incoming.credits || {}) },
    meta: { ...base.meta, ...(incoming.meta || {}) },
  };
}

export function loadLocalUser() {
  const local = loadStoredUser();
  return mergeUser(DEFAULT_USER, local);
}

export function saveLocalUser(userData) {
  const merged = mergeUser(DEFAULT_USER, userData);
  return persistLocalUser(merged);
}

export async function generateUniqueIdIfMissing(userData) {
  if (userData.uniqueId) return userData.uniqueId;
  if (!userData.contact?.phone) return '';
  const uniqueId = await getUniqueId(userData.contact.phone);
  saveLocalUser({ ...userData, uniqueId });
  return uniqueId;
}

export async function syncUserWithFirestore() {
  const local = loadLocalUser();
  const uniqueId = await generateUniqueIdIfMissing(local);
  if (!uniqueId) return local;

  try {
    await ensureUserDocumentExists(uniqueId);
    const remote = await getUserDocument(uniqueId);
    const merged = mergeUser(local, remote || {});
    merged.meta = {
      ...merged.meta,
      updatedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    };
    await saveUserDocument(uniqueId, merged);
    return saveLocalUser({ ...merged, needsSync: false });
  } catch (err) {
    console.warn('Sync with Firestore failed, keeping local copy', err);
    await syncLocalUserToFirestore();
    return saveLocalUser({ ...local, needsSync: true });
  }
}
