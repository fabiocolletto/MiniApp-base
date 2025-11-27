import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUniqueId } from '../src/services/uniqueId.js';

beforeEach(() => {
  vi.resetAllMocks();
});

describe('uniqueId service', () => {
  it('returns deterministic id for same phone', async () => {
    vi.stubGlobal('fetch', async (url) => {
      const phone = new URL(url).searchParams.get('phone');
      return { ok: true, json: async () => ({ uniqueId: `uid-${phone}` }) };
    });

    const first = await getUniqueId('+5511999999999');
    const second = await getUniqueId('+5511999999999');
    expect(first).toBe('uid-+5511999999999');
    expect(second).toBe('uid-+5511999999999');
  });
});
