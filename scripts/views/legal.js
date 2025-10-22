const BASE_CLASSES = 'card view view--legal';
const LEGAL_URL = 'https://5horas.com.br/home/pagina-legal/docs-legais/';

export function renderLegal(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'legal';
  viewRoot.setAttribute('aria-label', 'Documentos legais 5Horas');

  const legalWidget = document.createElement('section');
  legalWidget.className = 'surface-card legal-widget';

  const description = document.createElement('p');
  description.className = 'legal-description';
  description.textContent =
    'Consulte abaixo os termos e documentos legais oficiais do aplicativo 5Horas.';

  const frameWrapper = document.createElement('div');
  frameWrapper.className = 'legal-frame-wrapper';

  const iframe = document.createElement('iframe');
  iframe.className = 'legal-frame';
  iframe.src = LEGAL_URL;
  iframe.title = 'Documentos legais da 5Horas';
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'no-referrer';

  const fallbackLink = document.createElement('a');
  fallbackLink.className = 'legal-fallback';
  fallbackLink.href = LEGAL_URL;
  fallbackLink.target = '_blank';
  fallbackLink.rel = 'noopener noreferrer';
  fallbackLink.textContent =
    'Abrir documentos legais em uma nova aba caso o painel não carregue.';

  frameWrapper.append(iframe);
  legalWidget.append(description, frameWrapper, fallbackLink);
  viewRoot.replaceChildren(legalWidget);
}
