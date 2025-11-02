import test from 'node:test';
import assert from 'node:assert/strict';

import eventBus from '../scripts/events/event-bus.js';
import { getActiveUserId } from '../scripts/data/session-store.js';
import { setupFakeDom } from './helpers/fake-dom.js';

function createLocalStorageMock() {
  const store = new Map();
  return {
    getItem(key) {
      const normalizedKey = typeof key === 'string' ? key : String(key ?? '');
      return store.has(normalizedKey) ? store.get(normalizedKey) : null;
    },
    setItem(key, value) {
      const normalizedKey = typeof key === 'string' ? key : String(key ?? '');
      const normalizedValue = typeof value === 'string' ? value : String(value ?? '');
      store.set(normalizedKey, normalizedValue);
    },
    removeItem(key) {
      const normalizedKey = typeof key === 'string' ? key : String(key ?? '');
      store.delete(normalizedKey);
    },
    clear() {
      store.clear();
    },
  };
}

test('renderRegisterPanel informa que o cadastro está desativado e retorna ao painel principal', async (t) => {
  const restoreDom = setupFakeDom();

  const originalWindow = globalThis.window;
  const originalNavigator = globalThis.navigator;

  const localStorage = createLocalStorageMock();
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { localStorage },
  });
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { platform: 'Test', language: 'pt-BR', userAgent: 'TestAgent/1.0' },
  });

  if (typeof HTMLElement !== 'undefined') {
    HTMLElement.prototype.focus = () => {};
    HTMLElement.prototype.select = () => {};
  }

  eventBus.clear();

  const emittedEvents = [];
  const unsubscribe = eventBus.on('app:navigate', (payload) => emittedEvents.push(payload));

  const { renderRegisterPanel } = await import('../scripts/views/register.js');

  const viewRoot = document.createElement('div');
  renderRegisterPanel(viewRoot);

  assert.equal(viewRoot.dataset.view, 'register-disabled');
  assert.ok(viewRoot.classList.contains('register-view--disabled'));

  const message = viewRoot.querySelector('.register-disabled__message');
  const hint = viewRoot.querySelector('.register-disabled__hint');
  const actionButton = viewRoot.querySelector('.register-disabled__action');

  assert.ok(message, 'mensagem explicativa deve ser exibida');
  assert.ok(hint, 'dica complementar deve ser exibida');
  assert.ok(actionButton, 'ação para abrir o painel principal deve estar disponível');

  actionButton.dispatchEvent({ type: 'click' });

  assert.ok(
    emittedEvents.some((payload) => payload?.view === 'guest' && payload?.source === 'register:disabled'),
    'botão deve encaminhar para o painel principal como convidado',
  );

  const activeUserId = typeof getActiveUserId === 'function' ? getActiveUserId() : null;
  assert.equal(activeUserId, null, 'nenhuma sessão deve ser criada ao abrir o painel desativado');

  t.after(() => {
    unsubscribe?.();
    eventBus.clear();
    localStorage.clear();
    restoreDom();

    if (originalWindow === undefined) {
      delete globalThis.window;
    } else {
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: originalWindow,
      });
    }

    if (originalNavigator === undefined) {
      delete globalThis.navigator;
    } else {
      Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: originalNavigator,
      });
    }
  });
});
