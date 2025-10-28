import test from 'node:test';
import assert from 'node:assert/strict';

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }

  clear() {
    this.map.clear();
  }

  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }

  setItem(key, value) {
    this.map.set(String(key), String(value));
  }

  removeItem(key) {
    this.map.delete(key);
  }
}

test('toggleMiniAppFavorite respeita limite de quatro itens por usuário', async (t) => {
  const storage = new MemoryStorage();
  global.window = { localStorage: storage };

  const {
    MAX_FAVORITE_MINI_APPS,
    getUserMiniAppPreferences,
    toggleMiniAppFavorite,
    resetMiniAppPreferences,
  } = await import('../scripts/data/miniapp-preferences-store.js');

  t.after(() => {
    delete global.window;
  });

  resetMiniAppPreferences();

  const userId = 101;
  const appIds = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];

  appIds.slice(0, MAX_FAVORITE_MINI_APPS).forEach((appId) => {
    const result = toggleMiniAppFavorite(userId, appId);
    assert.equal(result.success, true, `inclusão de ${appId} deve ser permitida`);
    assert.equal(result.added, true, `${appId} deve ser registrado como favorito`);
  });

  const limitResult = toggleMiniAppFavorite(userId, appIds[4]);
  assert.equal(limitResult.success, false, 'quinto favorito deve ser rejeitado');
  assert.equal(limitResult.reason, 'favorite-limit-exceeded');
  assert.equal(limitResult.limit, MAX_FAVORITE_MINI_APPS);

  let preferences = getUserMiniAppPreferences(userId);
  assert.deepEqual(preferences.favorites, appIds.slice(0, MAX_FAVORITE_MINI_APPS));

  const removal = toggleMiniAppFavorite(userId, appIds[0]);
  assert.equal(removal.success, true, 'remoção deve ser permitida');
  assert.equal(removal.added, false, 'remoção deve sinalizar added=false');

  const inclusion = toggleMiniAppFavorite(userId, appIds[4]);
  assert.equal(inclusion.success, true, 'favorito liberado após remoção deve ser aceito');
  assert.equal(inclusion.added, true, 'novo favorito deve ser marcado como adicionado');

  preferences = getUserMiniAppPreferences(userId);
  assert.deepEqual(
    preferences.favorites,
    ['beta', 'gamma', 'delta', 'epsilon'],
    'lista deve preservar ordem remanescente dos favoritos',
  );
});

test('toggleMiniAppSaved permite quantos itens forem necessários e notifica assinantes', async (t) => {
  const storage = new MemoryStorage();
  global.window = { localStorage: storage };

  const {
    getUserMiniAppPreferences,
    toggleMiniAppSaved,
    subscribeMiniAppPreferences,
    resetMiniAppPreferences,
  } = await import('../scripts/data/miniapp-preferences-store.js');

  const events = [];

  t.after(() => {
    delete global.window;
  });

  resetMiniAppPreferences();

  const unsubscribe = subscribeMiniAppPreferences((payload) => {
    events.push(payload);
  });

  t.after(() => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  });

  const userId = '502';
  const savedIds = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta'];

  savedIds.forEach((appId) => {
    const result = toggleMiniAppSaved(userId, appId);
    assert.equal(result.success, true, `salvo ${appId} deve ser permitido`);
    assert.equal(result.added, true);
  });

  const preferences = getUserMiniAppPreferences(userId);
  assert.deepEqual(
    preferences.saved,
    savedIds,
    'todos os mini-apps salvos devem permanecer registrados na ordem de inclusão',
  );

  const relevantEvents = events.filter((event) => event?.userId === String(userId));
  assert.notEqual(relevantEvents.length, 0, 'assinantes devem ser notificados para o usuário afetado');
});
