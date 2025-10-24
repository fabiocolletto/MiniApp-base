const BASE_WIDGET_CLASSES = Object.freeze([
  'surface-card',
  'surface-card--transparent',
  'log-panel__widget',
]);

export function createSystemLogTitleWidget({
  title = 'Log do projeto',
  description = 'Acompanhe o histórico de versões e mudanças registradas para o MiniApp Base.',
} = {}) {
  const widget = document.createElement('section');
  widget.className = [...BASE_WIDGET_CLASSES, 'log-panel__widget--intro'].join(' ');

  const titleElement = document.createElement('h2');
  titleElement.className = 'user-widget__title';
  titleElement.textContent = title;

  const descriptionElement = document.createElement('p');
  descriptionElement.className = 'user-widget__description';
  descriptionElement.textContent = description;

  widget.append(titleElement, descriptionElement);
  return widget;
}

export function createSystemLogPanelLabelWidget({
  title = 'Etiqueta do painel',
  description = 'Compartilhe esta etiqueta para facilitar o acesso rápido ao histórico.',
  panelLabel = 'Painel Log',
  projectLabel = 'MiniApp Base',
  extraLabels = [],
} = {}) {
  const widget = document.createElement('section');
  widget.className = [...BASE_WIDGET_CLASSES, 'log-panel__widget--label'].join(' ');

  const titleElement = document.createElement('h2');
  titleElement.className = 'user-widget__title';
  titleElement.textContent = title;

  const descriptionElement = document.createElement('p');
  descriptionElement.className = 'user-widget__description';
  descriptionElement.textContent = description;

  const labelGroup = document.createElement('div');
  labelGroup.className = 'miniapp-details__highlights';

  [panelLabel, projectLabel, ...extraLabels]
    .filter((label) => typeof label === 'string' && label.trim() !== '')
    .forEach((label) => {
      const chip = document.createElement('span');
      chip.className = 'miniapp-details__chip';
      chip.textContent = label;
      labelGroup.append(chip);
    });

  widget.append(titleElement, descriptionElement, labelGroup);
  return widget;
}

export const SYSTEM_LOG_WIDGET_MODELS = Object.freeze([
  Object.freeze({
    id: 'W01',
    title: 'Widget de título do painel Log',
    description:
      'Widget introdutório com título e descrição para abrir o painel Log em cartões transparentes.',
    tokens: ['--panel-gap', '--panel-padding', '--panel-stack-gap'],
    create: () => createSystemLogTitleWidget(),
  }),
  Object.freeze({
    id: 'W02',
    title: 'Widget de etiqueta do painel Log',
    description:
      'Etiqueta em formato de chips alinhada ao padrão do painel Log com variações para nome do painel e projeto.',
    tokens: ['--panel-gap', '--panel-padding', '--panel-stack-gap'],
    create: () =>
      createSystemLogPanelLabelWidget({ panelLabel: 'Painel Log', projectLabel: 'MiniApp Base' }),
  }),
]);
