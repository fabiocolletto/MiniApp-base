export function normalizeSeed(seed?: number): number {
  if (typeof seed === 'number' && Number.isFinite(seed)) {
    return Math.abs(Math.floor(seed)) % 0xffffffff;
  }

  return Math.floor(Math.random() * 0xffffffff);
}

export function createSeededGenerator(seed: number): () => number {
  let state = (seed || 1) >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
