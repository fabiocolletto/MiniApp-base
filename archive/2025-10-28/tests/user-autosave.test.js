import test from 'node:test';
import assert from 'node:assert/strict';

import { createPersistUserChanges } from '../scripts/views/user.js';
import {
  subscribeActivityStatus,
  getActivityStatus,
  __TEST_ONLY__ as activityTestUtils,
} from '../scripts/system/activity-indicator.js';

class FakeHTMLElement {}
class FakeElement extends FakeHTMLElement {
  constructor({ disabled = false } = {}) {
    super();
    this.disabled = Boolean(disabled);
    this.attributes = new Map();
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }
}

globalThis.HTMLElement = FakeHTMLElement;

function createFakeElement(options) {
  return new FakeElement(options);
}

test.beforeEach(() => {
  activityTestUtils.reset();
});

test('persistUserChanges reports missing session without calling update', async () => {
  const feedbackLog = [];
  const feedback = {
    reset: () => {
      feedbackLog.push({ type: 'reset' });
    },
    show: (message, options) => {
      feedbackLog.push({ type: 'show', message, options });
    },
  };

  let updateCalled = false;
  const helper = createPersistUserChanges(() => null, () => {
    updateCalled = true;
  });

  const result = await helper(
    { phone: '11999998888' },
    {
      feedback,
      busyTargets: [createFakeElement()],
      missingSessionMessage: 'Sessão inativa',
    },
  );

  assert.equal(result.status, 'no-session');
  assert.equal(updateCalled, false);
  assert.equal(feedbackLog[0]?.type, 'reset');
  assert.deepEqual(feedbackLog[1], {
    type: 'show',
    message: 'Sessão inativa',
    options: { isError: true },
  });
});

test('persistUserChanges toggles busy state and restores original disabled flags', async () => {
  const busyElement = createFakeElement();
  const initiallyDisabled = createFakeElement({ disabled: true });
  const feedbackLog = [];

  const helper = createPersistUserChanges(
    () => ({ id: 42 }),
    async (id, updates) => {
      assert.equal(id, 42);
      assert.deepEqual(updates, { profile: { city: 'São Paulo' } });
    },
  );

  const result = await helper(
    { profile: { city: 'São Paulo' } },
    {
      feedback: {
        reset: () => feedbackLog.push({ type: 'reset' }),
        show: (message, options) => feedbackLog.push({ type: 'show', message, options }),
      },
      busyTargets: [busyElement, initiallyDisabled],
      successMessage: 'Atualizado automaticamente',
    },
  );

  assert.equal(result.status, 'success');
  assert.equal(busyElement.disabled, false);
  assert.equal(initiallyDisabled.disabled, true);
  assert.equal(busyElement.attributes.has('aria-busy'), false);
  assert.equal(initiallyDisabled.attributes.has('aria-busy'), false);

  const [, showEvent] = feedbackLog;
  assert.deepEqual(showEvent, {
    type: 'show',
    message: 'Atualizado automaticamente',
    options: { isError: false },
  });
});

test('persistUserChanges surfaces errors and clears busy state', async () => {
  const busyElement = createFakeElement();
  const feedbackMessages = [];
  const helper = createPersistUserChanges(
    () => ({ id: 7 }),
    async () => {
      throw new Error('Falha simulada');
    },
  );

  const result = await helper(
    { password: 'Senha@123' },
    {
      feedback: {
        reset: () => {},
        show: (message, options) => feedbackMessages.push({ message, options }),
      },
      busyTargets: [busyElement],
      errorMessage: 'Não foi possível salvar',
    },
  );

  assert.equal(result.status, 'error');
  assert.equal(busyElement.disabled, false);
  assert.equal(busyElement.attributes.has('aria-busy'), false);
  assert.deepEqual(feedbackMessages.at(-1), {
    message: 'Não foi possível salvar',
    options: { isError: true },
  });
});

test('persistUserChanges atualiza indicador de atividade durante salvamento', async () => {
  const events = [];
  const unsubscribe = subscribeActivityStatus((status) => {
    events.push(status);
  });

  const helper = createPersistUserChanges(
    () => ({ id: 11 }),
    async () => {
      return undefined;
    },
  );

  const result = await helper(
    { name: 'Usuário de Teste' },
    {
      activity: {
        source: 'user-panel-test',
        savingMessage: 'Salvando teste',
        savingDetails: 'Sincronizando dados fictícios.',
        savedMessage: 'Teste salvo',
        savedDetails: 'Dados de teste sincronizados.',
        errorMessage: 'Erro teste',
        errorDetails: 'Falha fictícia.',
        missingSessionMessage: 'Sessão ausente',
        missingSessionDetails: 'Entre para continuar.',
        noChangesMessage: 'Nenhuma alteração de teste',
        noChangesDetails: 'Nada para salvar agora.',
      },
    },
  );

  unsubscribe();

  assert.equal(result.status, 'success');
  const savingEvent = events.find((entry) => entry.state === 'saving' && entry.source === 'user-panel-test');
  assert.ok(savingEvent, 'deve registrar estado de salvamento');
  assert.equal(savingEvent?.message, 'Salvando teste');
  const savedEvent = events.find((entry) => entry.state === 'saved' && entry.source === 'user-panel-test');
  assert.ok(savedEvent, 'deve registrar estado salvo');
  assert.equal(savedEvent?.details, 'Dados de teste sincronizados.');
  const snapshot = getActivityStatus();
  assert.equal(snapshot.state, 'saved');
  assert.equal(snapshot.source, 'user-panel-test');
});
