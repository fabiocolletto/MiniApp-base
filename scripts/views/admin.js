const BASE_CLASSES = 'card view view--admin';

export function renderAdmin(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'admin';

  const heading = document.createElement('h1');
  heading.textContent = 'Painel Administrativo';

  const message = document.createElement('p');
  message.textContent = 'Área reservada para ferramentas internas.';

  viewRoot.replaceChildren(heading, message);
}
