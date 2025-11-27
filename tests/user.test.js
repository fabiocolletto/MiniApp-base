import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadLocalUser,
  saveLocalUser,
  syncUserWithFirestore,
} from '../src/core/user.js';
import {
  clearLocalUser,
  syncLocalUserToFirestore,
} from '../src/core/storage.js';
import { getUserDocument } from '../src/services/firestore.js';

const fetchMock = vi.fn(async (url) => {
  const phone = new URL(url).searchParams.get('phone');
  return {
    ok: true,
    json: async () => ({ uniqueId: `uid-${phone}` }),
  };
});

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  localStorage.clear();
  clearLocalUser();
});

describe('user local storage', () => {
  it('saves and loads with defaults', () => {
    saveLocalUser({
      contact: { phone: '+5511999999999' },
      profile: { name: 'Teste' },
    });
    const loaded = loadLocalUser();
    expect(loaded.contact.phone).toBe('+5511999999999');
    expect(loaded.profile.name).toBe('Teste');
    expect(loaded.preferences.theme).toBe('light');
  });
});

describe('user sync', () => {
  it('generates uniqueId and syncs to memory firestore', async () => {
    saveLocalUser({
      contact: { phone: '+5511999999999' },
      profile: { name: 'Ana' },
    });
    const synced = await syncUserWithFirestore();
    expect(synced.uniqueId).toBe('uid-+5511999999999');
    const remote = await getUserDocument('uid-+5511999999999');
    expect(remote.profile.name).toBe('Ana');
  });

  it('marks sync pending when offline', async () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      configurable: true,
    });
    saveLocalUser({
      contact: { phone: '+5511888888888' },
      uniqueId: 'uid-offline',
    });
    const result = await syncLocalUserToFirestore();
    expect(result.synced).toBe(false);
    const stored = loadLocalUser();
    expect(stored.needsSync).toBe(true);
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      configurable: true,
    });
  });
});
