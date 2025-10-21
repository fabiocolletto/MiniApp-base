import test from 'node:test';
import assert from 'node:assert/strict';

import { createPersistUserChanges } from '../scripts/views/user.js';

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
