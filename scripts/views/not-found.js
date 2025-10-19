const BASE_CLASSES = 'card view view--error';

export function renderNotFound(viewRoot, viewName) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'not-found';

  const heading = document.createElement('h1');
  heading.textContent = 'Conteúdo não disponível';

  const message = document.createElement('p');
  message.textContent =
    viewName
      ? `Não encontramos a tela "${viewName}" neste aplicativo.`
      : 'Não encontramos a tela solicitada neste aplicativo.';

  const hint = document.createElement('p');
  hint.textContent = 'Use os atalhos do cabeçalho e rodapé para navegar pelas páginas disponíveis.';

  viewRoot.replaceChildren(heading, message, hint);
}
