import test from 'node:test';
import assert from 'node:assert/strict';

import { getAllAccounts } from '../core/account-store.js';
import {
  addUser,
  getUsers,
  subscribeUsers,
  getStorageStatus,
  purgeDeviceData,
  resetUserStoreForTests,
} from '../scripts/data/user-store.js';

const baseUser = {
  name: 'Teste Usuário',
  password: 'SenhaForte123!',
  device: 'Node Test Runner',
  profile: {},
  userType: 'usuario',
  preferences: {},
};

test('purgeDeviceData remove cadastros, notifica ouvintes e prepara novas inserções', async (t) => {
  await resetUserStoreForTests();

  const notifications = [];
  const unsubscribe = subscribeUsers((snapshot) => {
    notifications.push(snapshot.map((user) => user.id));
  });
  notifications.length = 0;
  t.after(() => {
    unsubscribe();
  });

  const firstUser = await addUser({ ...baseUser, phone: '11999990001' });
  const secondUser = await addUser({ ...baseUser, phone: '11999990002', name: 'Segundo Usuário' });

  assert.equal(firstUser.id, 1, 'primeiro cadastro deve iniciar identificador em 1');
  assert.equal(secondUser.id, 2, 'segundo cadastro deve incrementar identificador');
  assert.equal(getUsers().length, 2, 'cadastros devem estar disponíveis antes da limpeza');

  notifications.length = 0;
  await purgeDeviceData();

  assert.equal(getUsers().length, 0, 'nenhum cadastro deve permanecer após a limpeza');
  assert.ok(notifications.length >= 1, 'assinantes devem ser notificados após a limpeza');
  const lastNotification = notifications[notifications.length - 1] ?? null;
  assert.deepEqual(lastNotification, [], 'assinantes devem receber uma lista vazia após a limpeza');

  const status = getStorageStatus();
  assert.equal(status.state, 'empty', 'status do armazenamento deve indicar estado vazio após atualização');
  assert.match(
    status.message,
    /Memória atualizada/i,
    'mensagem do status deve indicar que a memória foi atualizada',
  );

  const accounts = await getAllAccounts();
  assert.deepEqual(accounts, [], 'banco global deve ser sincronizado com instantâneo vazio');

  const newUser = await addUser({ ...baseUser, phone: '11999990001' });
  assert.equal(newUser.id, 1, 'identificador deve reiniciar após limpeza completa');
  assert.equal(getUsers().length, 1, 'cadastro deve ser possível após a limpeza');

  t.after(async () => {
    await resetUserStoreForTests();
  });
});
