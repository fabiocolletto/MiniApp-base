import eventBus from '../events/event-bus.js';

export const BASE_CLASSES = 'card view auth-view view--register';

export function renderRegisterPanel(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = `${BASE_CLASSES} register-view--disabled`;
  viewRoot.dataset.view = 'register-disabled';
  viewRoot.setAttribute('aria-label', 'Cadastro desativado');

  const container = document.createElement('section');
  container.className = 'surface-card register-disabled__container';

  const title = document.createElement('h2');
  title.className = 'register-disabled__title';
  title.textContent = 'Cadastro desativado';

  const message = document.createElement('p');
  message.className = 'register-disabled__message';
  message.textContent =
    'Todos os recursos desta experiência estão liberados para navegação como convidado. Os dados permanecem somente neste dispositivo.';

  const hint = document.createElement('p');
  hint.className = 'register-disabled__hint';
  hint.textContent = 'Use o painel principal para abrir o MiniApp configurado e ajustar preferências de forma local.';

  const actions = document.createElement('div');
  actions.className = 'register-disabled__actions';

  const openGuestButton = document.createElement('button');
  openGuestButton.type = 'button';
  openGuestButton.className = 'button button--primary button--pill register-disabled__action';
  openGuestButton.textContent = 'Abrir painel principal';
  openGuestButton.addEventListener('click', () => {
    eventBus.emit('app:navigate', { view: 'guest', source: 'register:disabled' });
  });

  actions.append(openGuestButton);

  container.append(title, message, hint, actions);
  viewRoot.replaceChildren(container);

  setTimeout(() => {
    title.focus?.();
  }, 0);
}
