import eventBus from '../../events/event-bus.js';
import { runViewCleanup } from '../../view-cleanup.js';

const BASE_WIDGET_CLASSES = Object.freeze([
  'surface-card',
  'surface-card--transparent',
  'panel-preview-widget',
  'user-panel__widget',
]);

function createHeader({ title, viewLabel, description }) {
  const header = document.createElement('div');
  header.className = 'panel-preview-widget__header';

  if (title) {
    const heading = document.createElement('h3');
    heading.className = 'panel-preview-widget__title';
    heading.textContent = title;
    header.append(heading);
  }

  if (viewLabel) {
    const badge = document.createElement('span');
    badge.className = 'panel-preview-widget__badge miniapp-details__chip';
    badge.textContent = viewLabel;
    header.append(badge);
  }

  if (description) {
    const descriptionElement = document.createElement('p');
    descriptionElement.className = 'panel-preview-widget__description';
    descriptionElement.textContent = description;
    header.append(descriptionElement);
  }

  return header;
}

export function createPanelPreviewWidget({
  title = 'Pré-visualização',
  viewName = '',
  viewLabel = '',
  description = '',
} = {}) {
  const widget = document.createElement('section');
  widget.className = BASE_WIDGET_CLASSES.join(' ');
  widget.dataset.previewView = viewName ?? '';

  const normalizedViewName = typeof viewName === 'string' ? viewName.trim() : '';
  const canNavigateToView = normalizedViewName !== '' && !normalizedViewName.includes(':');

  const navigationCleanups = [];

  if (canNavigateToView) {
    widget.classList.add('panel-preview-widget--interactive');
    widget.dataset.navigateToView = normalizedViewName;
    widget.setAttribute('role', 'button');
    widget.tabIndex = 0;

    const handleNavigation = () => {
      eventBus.emit('app:navigate', { view: normalizedViewName });
    };

    const handleClick = (event) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();
      handleNavigation();
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleNavigation();
      }
    };

    widget.addEventListener('click', handleClick);
    widget.addEventListener('keydown', handleKeyDown);

    navigationCleanups.push(() => {
      widget.removeEventListener('click', handleClick);
      widget.removeEventListener('keydown', handleKeyDown);
    });
  }

  const header = createHeader({ title, viewLabel, description });

  const windowElement = document.createElement('div');
  windowElement.className = 'panel-preview-widget__window';
  windowElement.setAttribute('role', 'group');
  if (title) {
    windowElement.setAttribute('aria-label', `Pré-visualização do painel ${title}`);
  }

  const frame = document.createElement('div');
  frame.className = 'panel-preview-widget__frame';
  if (viewName) {
    frame.dataset.previewView = viewName;
  }

  windowElement.append(frame);
  widget.append(header, windowElement);

  let activeCleanup = null;

  function destroyPreview() {
    if (typeof activeCleanup === 'function') {
      try {
        activeCleanup();
      } catch (error) {
        console.error('Erro ao limpar pré-visualização do painel.', error);
      }
    }
    activeCleanup = null;
    runViewCleanup(frame);
    frame.replaceChildren();
  }

  function setPreview(renderPreview) {
    destroyPreview();

    if (typeof renderPreview !== 'function') {
      return;
    }

    const result = renderPreview(frame);
    if (typeof result === 'function') {
      activeCleanup = result;
    }
  }

  function destroy() {
    destroyPreview();
    while (navigationCleanups.length > 0) {
      const cleanup = navigationCleanups.pop();
      if (typeof cleanup === 'function') {
        cleanup();
      }
    }
    widget.remove();
  }

  return {
    element: widget,
    frame,
    setPreview,
    destroy,
  };
}

export const PANEL_PREVIEW_WIDGET_MODELS = Object.freeze([
  Object.freeze({
    id: 'PW01',
    title: 'Widget padrão de painel',
    description:
      'Replica uma tela interna em miniatura mantendo título, etiqueta do destino e janela de renderização.',
    tokens: ['--panel-gap', '--panel-padding', '--panel-radius', '--panel-shadow', '--panel-stack-gap'],
    create(options = {}) {
      const {
        title = 'Painel Início',
        viewName = 'home',
        viewLabel = 'home',
        description = 'Janela padrão para embutir a tela selecionada.',
      } = options;

      const { element, frame, setPreview } = createPanelPreviewWidget({
        title,
        viewName,
        viewLabel,
        description,
      });

      setPreview(() => {
        const placeholder = document.createElement('div');
        placeholder.className = 'panel-preview-widget__placeholder';
        placeholder.textContent = 'Renderize aqui a tela escolhida para o painel.';
        frame.append(placeholder);
        return () => {
          placeholder.remove();
        };
      });

      return element;
    },
  }),
]);
