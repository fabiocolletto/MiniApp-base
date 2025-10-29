import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addUser,
  resetUserStoreForTests,
} from '../scripts/data/user-store.js';
import { setActiveUser, clearActiveUser } from '../scripts/data/session-store.js';
import {
  getActiveMiniAppPreferences,
  toggleMiniAppSaved,
  toggleMiniAppFavorite,
  MINIAPP_FAVORITE_LIMIT,
} from '../scripts/data/miniapp-preferences.js';

const baseUser = {
  name: 'Usuário Teste',
  password: 'SenhaForte!123',
  device: 'Node Test Runner',
  profile: {},
  userType: 'usuario',
  preferences: {},
};

async function prepareActiveUser(t, phoneSuffix = '0001') {
  await resetUserStoreForTests();
  const user = await addUser({ ...baseUser, phone: `1199999${phoneSuffix}` });
  setActiveUser(user.id);
  await new Promise((resolve) => setTimeout(resolve, 0));

  t.after(async () => {
    clearActiveUser();
    await resetUserStoreForTests();
  });

  return user;
}

test('toggleMiniAppSaved persiste IDs únicos e remove favoritos ao limpar', async (t) => {
  await prepareActiveUser(t, '1001');

  let snapshot = getActiveMiniAppPreferences();
  assert.deepEqual(snapshot.saved, [], 'estado inicial deve conter lista vazia de MiniApps salvos');

  const toggleOn = await toggleMiniAppSaved('  Analytics  ', { targetState: true });
  assert.equal(toggleOn.saved, true, 'deve confirmar MiniApp salvo');

  snapshot = getActiveMiniAppPreferences();
  assert.deepEqual(snapshot.saved, ['analytics'], 'identificador deve ser normalizado e único');

  await toggleMiniAppSaved('analytics', { targetState: true });
  snapshot = getActiveMiniAppPreferences();
  assert.equal(snapshot.saved.length, 1, 'não deve duplicar MiniApps já salvos');

  await toggleMiniAppFavorite('analytics', { targetState: true });
  snapshot = getActiveMiniAppPreferences();
  assert.ok(snapshot.favorites.includes('analytics'), 'MiniApp favoritado deve constar na lista de favoritos');

  await toggleMiniAppSaved('analytics', { targetState: false });
  snapshot = getActiveMiniAppPreferences();
  assert.deepEqual(snapshot.saved, [], 'MiniApp removido deve desaparecer da lista de salvos');
  assert.deepEqual(snapshot.favorites, [], 'remover MiniApp salvo deve limpar favoritos associados');
});

test('toggleMiniAppFavorite respeita limite e mantém sincronismo com salvos', async (t) => {
  await prepareActiveUser(t, '2002');

  for (let index = 0; index < MINIAPP_FAVORITE_LIMIT; index += 1) {
    const id = `mini-${index}`;
    const result = await toggleMiniAppFavorite(id, { targetState: true });
    assert.equal(result.favorite, true, `MiniApp ${id} deve ser marcado como favorito`);
  }

  await assert.rejects(
    () => toggleMiniAppFavorite('overflow-app', { targetState: true }),
    (error) => {
      assert.equal(error.reason, 'favorite-limit-exceeded', 'deve sinalizar limite excedido');
      assert.equal(
        error.details?.limit,
        MINIAPP_FAVORITE_LIMIT,
        'detalhes do erro devem informar o limite configurado',
      );
      return true;
    },
  );

  let snapshot = getActiveMiniAppPreferences();
  assert.equal(
    snapshot.favorites.length,
    MINIAPP_FAVORITE_LIMIT,
    'total de favoritos deve respeitar limite configurado',
  );
  snapshot.favorites.forEach((id) => {
    assert.ok(snapshot.saved.includes(id), 'cada favorito deve existir entre os MiniApps salvos');
  });

  await toggleMiniAppFavorite('mini-0', { targetState: false });
  snapshot = getActiveMiniAppPreferences();
  assert.ok(!snapshot.favorites.includes('mini-0'), 'MiniApp removido dos favoritos não deve permanecer na lista');

  const recovered = await toggleMiniAppFavorite('overflow-app', { targetState: true });
  assert.equal(recovered.favorite, true, 'novo favorito deve ser adicionado após liberar espaço');
  snapshot = getActiveMiniAppPreferences();
  assert.ok(snapshot.favorites.includes('overflow-app'), 'novo favorito deve constar no snapshot atualizado');
  assert.ok(snapshot.saved.includes('overflow-app'), 'novo favorito deve permanecer sincronizado com salvos');
});

test('ações de favoritos e salvos exigem sessão ativa', async () => {
  await resetUserStoreForTests();
  clearActiveUser();

  await assert.rejects(() => toggleMiniAppSaved('sample-app', { targetState: true }), (error) => {
    assert.equal(error.reason, 'inactive-session');
    return true;
  });

  await assert.rejects(() => toggleMiniAppFavorite('sample-app', { targetState: true }), (error) => {
    assert.equal(error.reason, 'inactive-session');
    return true;
  });
});
