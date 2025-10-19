const BASE_CLASSES = 'card view view--log';
const LOG_PATH = 'Log.md';

export function renderLog(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'log';

  const heading = document.createElement('h1');
  heading.textContent = 'Log do Projeto';

  const description = document.createElement('p');
  description.className = 'log-description';
  description.textContent = 'Acompanhe o histórico de versões do MiniApp.';

  const logContent = document.createElement('pre');
  logContent.className = 'log-content';
  logContent.setAttribute('role', 'region');
  logContent.setAttribute('aria-live', 'polite');
  logContent.setAttribute('aria-label', 'Histórico de versões do projeto');
  logContent.setAttribute('tabindex', '0');
  logContent.dataset.state = 'loading';
  logContent.textContent = 'Carregando histórico do projeto…';

  viewRoot.setAttribute('aria-busy', 'true');
  viewRoot.replaceChildren(heading, description, logContent);

  (async () => {
    try {
      const response = await fetch(LOG_PATH, { cache: 'no-cache' });

      if (!response.ok) {
        throw new Error(`Falha ao carregar Log.md: ${response.status}`);
      }

      const text = await response.text();
      logContent.dataset.state = 'ready';
      logContent.textContent = text;
    } catch (error) {
      logContent.dataset.state = 'error';
      logContent.textContent =
        'Não foi possível carregar o Log.md no momento. Atualize a página ou tente novamente.';
      console.error(error);
    } finally {
      viewRoot.removeAttribute('aria-busy');
    }
  })();
}
