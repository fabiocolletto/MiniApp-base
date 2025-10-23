import test from 'node:test';
import assert from 'node:assert/strict';

import eventBus from '../scripts/events/event-bus.js';
import { runViewCleanup } from '../scripts/view-cleanup.js';
import { setupFakeDom } from './helpers/fake-dom.js';

async function importHomeView() {
  return import('../scripts/views/home.js');
}

async function resetSession() {
  const { clearActiveUser } = await import('../scripts/data/session-store.js');
  clearActiveUser();
}

test('renderHome exibe painel de convidado com navegação para login e cadastro', async (t) => {
  const restoreDom = setupFakeDom();
  globalThis.window = {};

  await resetSession();
  eventBus.clear();

  const { renderHome } = await importHomeView();

  const viewRoot = document.createElement('div');
  renderHome(viewRoot);

  assert.equal(
    viewRoot.className,
    'card view auth-view view--home view--home-guest',
    'view root deve usar o layout de autenticação para convidados',
  );

  const guestPanel = viewRoot.querySelector('.home-guest__panel');
  assert.ok(guestPanel, 'painel de convidado deve ser renderizado');

  const loginButton = guestPanel.querySelector('.home-guest__action--primary');
  const registerButton = guestPanel.querySelector('.home-guest__action--secondary');
  const registerLink = guestPanel.querySelector('.auth-panel__redirect-link');

  assert.ok(loginButton, 'botão de login deve estar presente');
  assert.ok(registerButton, 'botão de cadastro deve estar presente');
  assert.ok(registerLink, 'link de cadastro adicional deve estar presente');

  const emittedEvents = [];
  const unsubscribe = eventBus.on('app:navigate', (payload) => emittedEvents.push(payload));

  loginButton.dispatchEvent({ type: 'click' });
  registerButton.dispatchEvent({ type: 'click' });
  registerLink.dispatchEvent({
    type: 'click',
    preventDefault() {},
  });

  assert.deepEqual(
    emittedEvents,
    [{ view: 'login' }, { view: 'register' }, { view: 'register' }],
    'ações de convidado devem emitir navegação para login e cadastro',
  );

  unsubscribe?.();

  t.after(() => {
    runViewCleanup(viewRoot);
    eventBus.clear();
    restoreDom();
    delete globalThis.window;
  });
});
