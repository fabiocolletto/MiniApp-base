const BASE_CLASSES = 'card view view--error';

export function renderNotFound(viewRoot, viewName) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'not-found';

  const errorWidget = document.createElement('section');
  errorWidget.className = 'surface-card error-view__widget';

  const message = document.createElement('p');
  message.textContent =
    viewName
      ? `Não encontramos a tela "${viewName}" neste aplicativo.`
      : 'Não encontramos a tela solicitada neste aplicativo.';

  const hint = document.createElement('p');
  hint.textContent = 'Use os atalhos do cabeçalho e rodapé para navegar pelas páginas disponíveis.';

  errorWidget.append(message, hint);

  viewRoot.setAttribute('aria-label', 'Conteúdo não disponível');
  viewRoot.replaceChildren(errorWidget);
}
