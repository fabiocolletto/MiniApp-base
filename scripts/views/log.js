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
  description.textContent = 'Acompanhe o histórico de versões do MiniApp.';

  const logContent = document.createElement('pre');
  logContent.className = 'log-content';
  logContent.setAttribute('role', 'region');
  logContent.setAttribute('aria-live', 'polite');
  logContent.textContent = 'Carregando Log.md...';

  viewRoot.replaceChildren(heading, description, logContent);

  (async () => {
    try {
      const response = await fetch(LOG_PATH, { cache: 'no-cache' });

      if (!response.ok) {
        throw new Error(`Falha ao carregar Log.md: ${response.status}`);
      }

      const text = await response.text();
      logContent.textContent = text;
    } catch (error) {
      logContent.textContent =
        'Não foi possível carregar o Log.md no momento.';
      console.error(error);
    }
  })();
}
