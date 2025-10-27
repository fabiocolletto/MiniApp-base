import test, { after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.MINIAPP_USE_MEMORY_STORE = '1';

import eventBus from '../../scripts/events/event-bus.js';
import { setupFakeDom } from '../helpers/fake-dom.js';

const restoreGlobalDom = setupFakeDom();

const userStoreModule = await import('../../scripts/data/user-store.js');
const { resetUserStoreForTests } = userStoreModule;

const { renderLoginPanel } = await import('../../scripts/views/login.js');

function findElement(root, predicate) {
  if (!(root instanceof HTMLElement) || typeof predicate !== 'function') {
    return null;
  }

  if (predicate(root)) {
    return root;
  }

  for (const child of root.children) {
    if (!(child instanceof HTMLElement)) {
      continue;
    }
    const match = findElement(child, predicate);
    if (match) {
      return match;
    }
  }

  return null;
}

function findInputById(root, id) {
  return findElement(
    root,
    (element) =>
      element.tagName === 'INPUT' &&
      (element.getAttribute('id') === id || element.id === id),
  );
}

function findElementByClass(root, className) {
  return findElement(root, (element) => element.classList.contains(className));
}

function findSubmitButton(root) {
  return findElement(
    root,
    (element) =>
      element.tagName === 'BUTTON' &&
      (element.getAttribute('type') === 'submit' || element.type === 'submit'),
  );
}

beforeEach(async () => {
  eventBus.clear();
  await resetUserStoreForTests();
  document.body.replaceChildren();
});

after(() => {
  eventBus.clear();
  restoreGlobalDom();
});

test('exibe mensagem de erro e mantém o painel de login com credenciais inválidas', async () => {
  const viewRoot = document.createElement('div');
  renderLoginPanel(viewRoot);

  assert.equal(viewRoot.dataset.view, 'login');

  const form = viewRoot.querySelector('form');
  assert.ok(form, 'form deve existir');

  const countryInput = findInputById(form, 'login-phone-country');
  const numberInput = findInputById(form, 'login-phone-number');
  const passwordInput = findInputById(form, 'login-password');
  const feedback = findElementByClass(form, 'auth-panel__feedback');
  const submitButton = findSubmitButton(form);

  assert.ok(countryInput, 'campo de código do país deve existir');
  assert.ok(numberInput, 'campo de telefone deve existir');
  assert.ok(passwordInput, 'campo de senha deve existir');
  assert.ok(feedback, 'área de feedback deve existir');
  assert.ok(submitButton, 'botão de envio deve existir');

  countryInput.value = '55';
  numberInput.value = '11988887777';
  passwordInput.value = 'senha-incorreta';

  const navigations = [];
  const unsubscribe = eventBus.on('app:navigate', (payload) => {
    navigations.push(payload);
  });

  const submitListeners = form.eventListeners.get('submit');
  assert.ok(submitListeners, 'ouvintes de submissão devem existir');
  const submitHandler = submitListeners.values().next().value;
  assert.equal(typeof submitHandler, 'function', 'handler de submissão deve ser função');

  const event = {
    type: 'submit',
    preventDefault() {},
  };

  await submitHandler.call(form, event);

  assert.equal(feedback.hidden, false, 'feedback deve estar visível');
  assert.match(feedback.textContent, /Telefone ou senha inválidos/, 'mensagem deve indicar credenciais inválidas');
  assert.equal(feedback.getAttribute('role'), 'alert', 'feedback de erro deve ter papel de alerta');
  assert.equal(submitButton.disabled, false, 'botão deve ser reativado após erro');
  assert.deepEqual(navigations, [], 'não deve haver navegação após erro de credenciais');
  assert.equal(viewRoot.dataset.view, 'login', 'painel deve permanecer na view de login');

  unsubscribe();
});
