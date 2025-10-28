import {
  createSystemLogPanelLabelWidget,
  createSystemLogTitleWidget,
} from './shared/system-log-widgets.js';
import { createTemporaryProjectsWidget } from './log.js';

const BASE_CLASSES = 'card view dashboard-view view--temporary-projects log-panel';

export function renderTemporaryProjects(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'temporary-projects';
  viewRoot.setAttribute('aria-label', 'Painel com projetos temporários do MiniApp Base');
  viewRoot.removeAttribute('aria-busy');

  const heading = document.createElement('h1');
  heading.className = 'sr-only';
  heading.textContent = 'Projetos temporários';

  const layout = document.createElement('div');
  layout.className = 'log-panel__layout';

  const titleWidget = createSystemLogTitleWidget({
    title: 'Projetos temporários',
    description:
      'Prototótipos ativos na pasta temporária do projeto disponíveis para avaliação antes da implantação.',
  });

  const panelLabelWidget = createSystemLogPanelLabelWidget({
    title: 'Etiqueta do painel',
    description: 'Compartilhe a etiqueta para acesso rápido aos protótipos ainda em homologação.',
    panelLabel: 'Projetos temporários',
    projectLabel: 'MiniApp Base',
    extraLabels: ['Acesso restrito'],
  });

  const temporaryProjectsWidget = createTemporaryProjectsWidget();
  const widgets = [titleWidget, panelLabelWidget];

  if (temporaryProjectsWidget) {
    widgets.push(temporaryProjectsWidget);
  } else {
    widgets.push(createEmptyTemporaryProjectsState());
  }

  layout.append(...widgets);
  viewRoot.replaceChildren(heading, layout);
}

function createEmptyTemporaryProjectsState() {
  const widget = document.createElement('section');
  widget.className = [
    'surface-card',
    'log-panel__widget',
    'log-panel__widget--deployments',
  ].join(' ');

  const titleElement = document.createElement('h2');
  titleElement.className = 'user-widget__title';
  titleElement.textContent = 'Projetos temporários';

  const descriptionElement = document.createElement('p');
  descriptionElement.className = 'user-widget__description';
  descriptionElement.textContent = 'Nenhum protótipo temporário disponível no momento.';

  widget.append(titleElement, descriptionElement);
  return widget;
}
