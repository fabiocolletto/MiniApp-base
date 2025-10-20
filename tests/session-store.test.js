import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.MINIAPP_USE_MEMORY_STORE = '1';

const userStoreModule = await import('../scripts/data/user-store.js');
const sessionStoreModule = await import('../scripts/data/session-store.js');

const { resetUserStoreForTests, addUser, deleteUser } = userStoreModule;
const { getSessionStatus, setActiveUser, clearActiveUser } = sessionStoreModule;

async function flushUpdates() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

async function waitForSessionState(expectedState) {
  for (let attempt = 0; attempt < 15; attempt += 1) {
    const snapshot = getSessionStatus();
    if (snapshot.state === expectedState) {
      return snapshot;
    }
    await flushUpdates();
  }

  const latest = getSessionStatus();
  assert.fail(
    `Status esperado "${expectedState}" não alcançado. Último estado registrado: "${latest.state ?? 'indefinido'}".`
  );
}

await resetUserStoreForTests();

beforeEach(async () => {
  await resetUserStoreForTests();
  clearActiveUser();
  await flushUpdates();
});

test('atualiza o status da sessão conforme o ciclo de autenticação', { concurrency: false }, async () => {
  let status = await waitForSessionState('empty');
  assert.equal(status.message, 'Nenhum usuário');
  assert.match(status.details, /Cadastre um usuário/i);

  const created = await addUser({ name: 'Fabio Augusto', phone: '11999990000', password: 'senha123' });
  status = await waitForSessionState('idle');
  assert.equal(status.message, 'Usuário desconectado');
  assert.match(status.details, /1 cadastro disponível/);

  setActiveUser(created.id);
  status = await waitForSessionState('connected');
  assert.equal(status.message, 'Usuário Fabio logado');
  assert.match(status.details, /Sessão ativa para Fabio Augusto/);

  clearActiveUser();
  status = await waitForSessionState('idle');
  assert.equal(status.message, 'Usuário desconectado');

  await deleteUser(created.id);
  status = await waitForSessionState('empty');
  assert.equal(status.message, 'Nenhum usuário');
});
