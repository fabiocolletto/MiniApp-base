import { saveUserDocument } from '../services/firestore.js';

const STORAGE_KEY = 'miniapp-user';

export function loadLocalUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn('Failed to load local user', err);
    return {};
  }
}

export function saveLocalUser(userData) {
  try {
    const enriched = {
      ...userData,
      meta: {
        ...(userData.meta || {}),
        updatedAt: new Date().toISOString(),
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enriched));
    return enriched;
  } catch (err) {
    console.warn('Failed to save local user', err);
    return userData;
  }
}

export function hasLocalUser() {
  return !!loadLocalUser().uniqueId;
}

export function clearLocalUser() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function syncLocalUserToFirestore() {
  const user = loadLocalUser();
  if (!user.uniqueId) {
    return { synced: false, reason: 'missing-unique-id' };
  }

  if (!navigator.onLine) {
    saveLocalUser({ ...user, needsSync: true });
    return { synced: false, reason: 'offline' };
  }

  try {
    await saveUserDocument(user.uniqueId, user);
    saveLocalUser({
      ...user,
      needsSync: false,
      meta: { ...(user.meta || {}), lastSyncedAt: new Date().toISOString() },
    });
    return { synced: true };
  } catch (err) {
    console.warn('Firestore sync failed', err);
    saveLocalUser({ ...user, needsSync: true });
    return { synced: false, reason: 'firestore-error' };
  }
}
