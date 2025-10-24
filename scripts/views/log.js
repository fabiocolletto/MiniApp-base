import {
  createSystemLogPanelLabelWidget,
  createSystemLogTitleWidget,
} from './shared/system-log-widgets.js';

const BASE_CLASSES = 'card view dashboard-view view--log log-panel';
const LOG_PATH = 'Log.md';

export function renderLog(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'log';

  const layout = document.createElement('div');
  layout.className = 'log-panel__layout';

  const titleWidget = createSystemLogTitleWidget();
  const panelLabelWidget = createSystemLogPanelLabelWidget();
  const { widget: logWidget, content: logContent } = createLogContentWidget();

  viewRoot.setAttribute('aria-busy', 'true');
  viewRoot.setAttribute('aria-label', 'Histórico de versões do MiniApp Base');

  layout.append(titleWidget, panelLabelWidget, logWidget);
  viewRoot.replaceChildren(layout);

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

function createLogContentWidget() {
  const widget = document.createElement('section');
  widget.className = ['surface-card', 'log-panel__widget', 'log-panel__widget--full'].join(' ');

  const logContent = document.createElement('pre');
  logContent.className = 'log-content';
  logContent.setAttribute('role', 'region');
  logContent.setAttribute('aria-live', 'polite');
  logContent.setAttribute('aria-label', 'Histórico de versões do projeto');
  logContent.setAttribute('tabindex', '0');
  logContent.dataset.state = 'loading';
  logContent.textContent = 'Carregando histórico do projeto…';

  widget.append(logContent);
  return { widget, content: logContent };
}
