import test from 'node:test';
import assert from 'node:assert/strict';

import eventBus from '../scripts/events/event-bus.js';
import { runViewCleanup } from '../scripts/view-cleanup.js';
import { setupFakeDom } from './helpers/fake-dom.js';

async function prepareStores() {
  const [userStoreModule, sessionStoreModule] = await Promise.all([
    import('../scripts/data/user-store.js'),
    import('../scripts/data/session-store.js'),
  ]);

  await userStoreModule.resetUserStoreForTests();
  sessionStoreModule.clearActiveUser();

  return {
    getActiveUserId: sessionStoreModule.getActiveUserId,
  };
}

async function importRegisterView() {
  return import('../scripts/views/register.js');
}

test('renderRegisterPanel exibe mensagem de sucesso e navega apenas após ação do usuário', async (t) => {
  const restoreDom = setupFakeDom();
  globalThis.window = {};
  if (typeof HTMLElement !== 'undefined') {
    HTMLElement.prototype.focus = () => {};
    HTMLElement.prototype.select = () => {};
  }

  const { getActiveUserId } = await prepareStores();
  eventBus.clear();

  const emittedEvents = [];
  const unsubscribe = eventBus.on('app:navigate', (payload) => emittedEvents.push(payload));

  const { renderRegisterPanel } = await importRegisterView();

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

  assert.equal(emittedEvents.length, 0, 'fluxo de sucesso não deve navegar automaticamente');

  assert.equal(viewRoot.dataset.view, 'register-success', 'visão deve indicar estado de sucesso');
  assert.ok(
    viewRoot.className.includes('register-view--success'),
    'classe de sucesso deve ser aplicada ao contêiner',
  );

  const successButton = viewRoot.querySelector('.register-success__action--primary');
  assert.ok(successButton, 'botão principal de sucesso deve estar disponível para navegação');

  successButton.dispatchEvent({ type: 'click' });

  assert.ok(
    emittedEvents.some((payload) => payload && payload.view === 'user'),
    'navegação deve ocorrer quando o usuário aciona o botão de sucesso',
  );

  const activeUserId = typeof getActiveUserId === 'function' ? getActiveUserId() : null;
  assert.ok(Number.isFinite(activeUserId), 'usuário cadastrado deve ser definido como sessão ativa');

  t.after(() => {
    unsubscribe?.();
    runViewCleanup(viewRoot);
    eventBus.clear();
    restoreDom();
    delete globalThis.window;
  });
});
