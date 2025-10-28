import test from 'node:test';
import assert from 'node:assert/strict';

import eventBus from '../scripts/events/event-bus.js';
import { runViewCleanup } from '../scripts/view-cleanup.js';
import { setupFakeDom } from './helpers/fake-dom.js';

test('renderRegisterPanel mantém formulário e informa quando telefone já existe', async (t) => {
  const restoreDom = setupFakeDom();
  globalThis.window = {};
  if (typeof HTMLElement !== 'undefined') {
    HTMLElement.prototype.focus = () => {};
    HTMLElement.prototype.select = () => {};
  }

  const [userStoreModule, sessionStoreModule] = await Promise.all([
    import('../scripts/data/user-store.js'),
    import('../scripts/data/session-store.js'),
  ]);

  const { addUser, resetUserStoreForTests, DUPLICATE_PHONE_ERROR_MESSAGE } = userStoreModule;
  await resetUserStoreForTests();
  sessionStoreModule.clearActiveUser();

  const seededUser = await addUser({
    phone: '11988887777',
    password: 'SenhaInicial123!',
  });
  assert.ok(seededUser?.id, 'deve ser possível cadastrar o usuário inicial');

  eventBus.clear();
  const emittedEvents = [];
  const unsubscribe = eventBus.on('app:navigate', (payload) => emittedEvents.push(payload));

  const { renderRegisterPanel } = await import('../scripts/views/register.js');

  const viewRoot = document.createElement('div');
  renderRegisterPanel(viewRoot);

  assert.equal(viewRoot.dataset.view, 'register', 'visão inicial deve ser o formulário de cadastro');

  const form = viewRoot.querySelector('form');
  assert.ok(form, 'formulário deve estar presente');

  const countryInputWrapper = form.querySelector('.auth-panel__phone-subfield--country');
  const numberInputWrapper = form.querySelector('.auth-panel__phone-subfield--number');
  const formInputs = form.querySelectorAll('.form-input');
  const passwordInput = formInputs.find((input) => input.type === 'password');
  const legalCheckbox = form.querySelector('.register-panel__legal-checkbox');

  assert.ok(countryInputWrapper, 'campo de código do país deve estar disponível');
  assert.ok(numberInputWrapper, 'campo de telefone deve estar disponível');
  assert.ok(passwordInput, 'campo de senha deve estar disponível');
  assert.ok(legalCheckbox, 'checkbox de aceite legal deve estar disponível');

  const phoneCountryInput = countryInputWrapper.querySelector('.form-input');
  const phoneNumberInput = numberInputWrapper.querySelector('.form-input');

  assert.ok(phoneCountryInput, 'input do código do país deve existir');
  assert.ok(phoneNumberInput, 'input do número de telefone deve existir');

  phoneCountryInput.value = '55';
  phoneNumberInput.value = '11988887777';
  passwordInput.value = 'SenhaInicial123!';
  legalCheckbox.checked = true;
  legalCheckbox.dispatchEvent({ type: 'change' });

  form.dispatchEvent({
    type: 'submit',
    preventDefault() {},
  });

  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(viewRoot.dataset.view, 'register', 'deve permanecer no formulário ao detectar duplicidade');
  assert.equal(emittedEvents.length, 0, 'não deve navegar para outra visão em caso de duplicidade');

  const feedback = form.querySelector('.user-form__feedback');
  assert.ok(feedback, 'mensagem de feedback deve estar disponível');
  assert.equal(feedback.textContent, DUPLICATE_PHONE_ERROR_MESSAGE);
  assert.equal(feedback.hidden, false);
  assert.ok(feedback.classList.contains('user-form__feedback--error'), 'feedback deve ser marcado como erro');

  const activeUserId = sessionStoreModule.getActiveUserId?.();
  assert.equal(activeUserId, null, 'usuário duplicado não deve ser autenticado automaticamente');

  t.after(async () => {
    unsubscribe?.();
    runViewCleanup(viewRoot);
    eventBus.clear();
    sessionStoreModule.clearActiveUser();
    await resetUserStoreForTests();
    restoreDom();
    delete globalThis.window;
  });
});
