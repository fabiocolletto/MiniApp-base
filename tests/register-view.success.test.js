import test from 'node:test';
import assert from 'node:assert/strict';

import eventBus from '../scripts/events/event-bus.js';
import { resetUserStoreForTests } from '../scripts/data/user-store.js';
import { clearActiveUser, getActiveUserId } from '../scripts/data/session-store.js';
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

test('renderRegisterPanel envia usuário à MiniApp Store após cadastro bem-sucedido', async (t) => {
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

  await resetUserStoreForTests();
  clearActiveUser();
  eventBus.clear();

  const emittedEvents = [];
  const unsubscribe = eventBus.on('app:navigate', (payload) => emittedEvents.push(payload));

  const { renderRegisterPanel } = await import('../scripts/views/register.js');

  const viewRoot = document.createElement('div');
  renderRegisterPanel(viewRoot);

  const form = viewRoot.querySelector('form');
  assert.ok(form, 'formulário deve ser renderizado');

  const countryInputWrapper = form.querySelector('.auth-panel__phone-subfield--country');
  const numberInputWrapper = form.querySelector('.auth-panel__phone-subfield--number');
  const formInputs = form.querySelectorAll('.form-input');
  const passwordInput = formInputs.find((input) => input.type === 'password');
  const legalCheckbox = form.querySelector('.register-panel__legal-checkbox');

  assert.ok(countryInputWrapper, 'campo de código do país deve estar presente');
  assert.ok(numberInputWrapper, 'campo de telefone deve estar presente');
  assert.ok(passwordInput, 'campo de senha deve estar presente');
  assert.ok(legalCheckbox, 'campo de aceite legal deve estar presente');

  const phoneCountryInput = countryInputWrapper.querySelector('.form-input');
  const phoneNumberInput = numberInputWrapper.querySelector('.form-input');

  assert.ok(phoneCountryInput, 'input do código do país deve estar acessível');
  assert.ok(phoneNumberInput, 'input do número de telefone deve estar acessível');

  phoneCountryInput.value = '55';
  phoneNumberInput.value = '11988887777';
  passwordInput.value = 'SenhaForte123!';
  legalCheckbox.checked = true;
  legalCheckbox.dispatchEvent({ type: 'change' });

  form.dispatchEvent({
    type: 'submit',
    preventDefault() {},
  });

  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.ok(
    emittedEvents.some((payload) => payload?.view === 'miniapps' && payload?.source === 'register:success'),
    'fluxo de sucesso deve navegar automaticamente para a MiniApp Store',
  );

  assert.equal(viewRoot.dataset.view, 'register-success', 'visão deve indicar estado de sucesso');
  assert.ok(
    viewRoot.className.includes('register-view--success'),
    'classe de sucesso deve ser aplicada ao contêiner',
  );

  const successButton = viewRoot.querySelector('.register-success__action--primary');
  assert.ok(successButton, 'botão principal de sucesso deve estar disponível para navegação');

  successButton.dispatchEvent({ type: 'click' });

  const manualNavigations = emittedEvents.filter(
    (payload) => payload?.view === 'miniapps' && payload?.source === 'register:success:cta',
  );
  assert.ok(manualNavigations.length >= 1, 'botão de sucesso deve encaminhar para a MiniApp Store');

  const autoNavigations = emittedEvents.filter(
    (payload) => payload?.view === 'miniapps' && payload?.source === 'register:success',
  );
  assert.ok(autoNavigations.length === 1, 'navegação automática deve ocorrer uma única vez');

  const activeUserId = typeof getActiveUserId === 'function' ? getActiveUserId() : null;
  assert.ok(Number.isFinite(activeUserId), 'usuário cadastrado deve ser definido como sessão ativa');

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
