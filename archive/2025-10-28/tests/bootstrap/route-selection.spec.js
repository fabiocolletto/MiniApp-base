import test from 'node:test';
import assert from 'node:assert/strict';

import { determineInitialRoute } from '../../core/bootstrap.js';

test.afterEach(() => {
  delete globalThis.__MINIAPP_BOOTSTRAP_OVERRIDES__;
});

test('retorna dashboard quando há sessão ativa válida', async () => {
  globalThis.__MINIAPP_BOOTSTRAP_OVERRIDES__ = {
    validateSchemaOrReset: async () => 'ok',
    getAllAccounts: async () => [
      { id: '123', label: 'Conta Principal' },
      { id: '456', label: 'Conta Secundária' },
    ],
    getSession: async () => ({ activeAccountId: '456' }),
  };

  const route = await determineInitialRoute();
  assert.equal(route, 'dashboard');
});

test('retorna login quando existem cadastros sem sessão ativa', async () => {
  globalThis.__MINIAPP_BOOTSTRAP_OVERRIDES__ = {
    validateSchemaOrReset: async () => 'ok',
    getAllAccounts: async () => [
      { id: '123', label: 'Conta Principal' },
      { id: '456', label: 'Conta Secundária' },
    ],
    getSession: async () => ({}),
  };

  const route = await determineInitialRoute();
  assert.equal(route, 'login');
});

test('retorna register quando schema é inválido ou banco indisponível', async () => {
  globalThis.__MINIAPP_BOOTSTRAP_OVERRIDES__ = {
    validateSchemaOrReset: async () => 'reset',
  };

  const route = await determineInitialRoute();
  assert.equal(route, 'register');
});

test('limpa sessão órfã e direciona para login', async () => {
  let clearCalls = 0;
  globalThis.__MINIAPP_BOOTSTRAP_OVERRIDES__ = {
    validateSchemaOrReset: async () => 'ok',
    getAllAccounts: async () => [
      { id: 'abc', label: 'Conta Ativa' },
    ],
    getSession: async () => ({ activeAccountId: 'inexistente' }),
    clearSession: async () => {
      clearCalls += 1;
    },
  };

  const route = await determineInitialRoute();

  assert.equal(route, 'login');
  assert.equal(clearCalls, 1);
});
