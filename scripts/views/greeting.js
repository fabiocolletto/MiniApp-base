const BASE_CLASSES = 'card view view--greeting';

export function renderGreeting(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'greeting';

  const sun = document.createElement('div');
  sun.className = 'sun';
  sun.setAttribute('role', 'presentation');

  viewRoot.setAttribute('aria-label', 'Painel de boas-vindas');
  viewRoot.replaceChildren(sun);
}
