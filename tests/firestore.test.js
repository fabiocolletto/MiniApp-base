import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveUserDocument,
  getUserDocument,
  updateUserDocument,
} from '../src/services/firestore.js';

beforeEach(() => {
  // memory map is internal; saving a stub clears previous state
});

describe('firestore memory fallback', () => {
  it('stores and retrieves user documents', async () => {
    await saveUserDocument('uid-1', { profile: { name: 'Beta' } });
    const loaded = await getUserDocument('uid-1');
    expect(loaded.profile.name).toBe('Beta');
  });

  it('updates documents with patch', async () => {
    await saveUserDocument('uid-2', {
      profile: { name: 'Ana' },
      credits: { current: 1 },
    });
    const merged = await updateUserDocument('uid-2', {
      credits: { current: 5 },
    });
    expect(merged.credits.current).toBe(5);
  });
});
