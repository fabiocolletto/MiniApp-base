const BASE_CLASSES = 'card view view--home';

export function renderHome(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'home';

  const heading = document.createElement('h1');
  heading.textContent = 'Painel Inicial';

  viewRoot.replaceChildren(heading);
}
