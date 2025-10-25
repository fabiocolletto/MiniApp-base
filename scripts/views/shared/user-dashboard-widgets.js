import { createSystemUsersWidget } from './system-users-widget.js';

function buildTransparentWidget(classes = []) {
  const widget = document.createElement('section');
  widget.className = [
    'surface-card',
    'surface-card--transparent',
    'user-panel__widget',
    'user-dashboard__widget',
    ...classes.filter(Boolean),
  ].join(' ');
  return widget;
}

export function createUserDashboardIntroWidget({
  title = 'Painel do usuário',
  description = 'Gerencie preferências e dados sincronizados com o painel administrativo.',
  extraClasses = [],
} = {}) {
  const widget = buildTransparentWidget(['user-dashboard__widget--intro', ...extraClasses]);

  const titleElement = document.createElement('h2');
  titleElement.className = 'user-widget__title';
  titleElement.textContent = title;

  const descriptionElement = document.createElement('p');
  descriptionElement.className = 'user-widget__description';
  descriptionElement.textContent = description;

  widget.append(titleElement, descriptionElement);
  return widget;
}

export function createUserDashboardLabelWidget({
  title = 'Etiqueta do painel',
  description = 'Compartilhe esta etiqueta para facilitar o acesso rápido ao painel.',
  panelLabel = 'Painel do usuário',
  projectLabel = 'MiniApp Base',
  extraLabels = [],
  extraClasses = [],
} = {}) {
  const widget = buildTransparentWidget(['user-dashboard__widget--label', ...extraClasses]);

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

export function createCollapsibleSection({
  id,
  title,
  description = '',
  defaultExpanded = false,
  classes = [],
  onToggle,
}) {
  const section = document.createElement('section');
  section.className = ['surface-card', 'user-panel__widget', ...classes].filter(Boolean).join(' ');
  section.dataset.sectionId = id;

  const header = document.createElement('div');
  header.className = 'user-panel__widget-header';

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'user-panel__section-toggle';

  const titleElement = document.createElement('span');
  titleElement.className = 'user-widget__title';
  titleElement.textContent = title;

  const contentId = `user-panel-section-${id}`;
  toggleButton.setAttribute('aria-controls', contentId);
  toggleButton.append(titleElement);

  header.append(toggleButton);
  section.append(header);

  const content = document.createElement('div');
  content.className = 'user-panel__widget-content';
  content.id = contentId;

  let descriptionElement = null;
  if (description) {
    descriptionElement = document.createElement('p');
    descriptionElement.className = 'user-widget__description';
    descriptionElement.textContent = description;
    content.append(descriptionElement);
  }

  section.append(content);

  const setSectionState = (state) => {
    const normalized = state === 'expanded' ? 'expanded' : state === 'empty' ? 'empty' : 'collapsed';
    section.dataset.sectionState = normalized;
    const isExpanded = normalized === 'expanded';
    toggleButton.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    content.hidden = !isExpanded;
    if (descriptionElement) {
      descriptionElement.hidden = !isExpanded;
    }
  };

  const setExpanded = (value) => setSectionState(value ? 'expanded' : 'collapsed');

  setSectionState(defaultExpanded ? 'expanded' : 'collapsed');

  const handleToggle = () => {
    const nextExpanded = section.dataset.sectionState !== 'expanded';
    if (typeof onToggle === 'function') {
      const result = onToggle(nextExpanded, {
        setSectionState,
        setExpanded,
      });

      if (result === false) {
        return;
      }
    }

    setExpanded(nextExpanded);
  };

  toggleButton.addEventListener('click', handleToggle);

  const cleanup = () => toggleButton.removeEventListener('click', handleToggle);

  return {
    section,
    header,
    toggleButton,
    content,
    descriptionElement,
    setSectionState,
    setExpanded,
    cleanup,
  };
}

export function createQuickAction({ label, description, onClick, extraClass = '' }) {
  const item = document.createElement('li');
  item.className = 'user-dashboard__quick-action';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = [
    'button',
    'button--secondary',
    'button--stacked',
    'button--block',
    'user-dashboard__quick-action-button',
    extraClass,
  ]
    .filter(Boolean)
    .join(' ');

  const labelElement = document.createElement('span');
  labelElement.className = 'user-dashboard__quick-action-title';
  labelElement.textContent = label;

  const descriptionElement = document.createElement('span');
  descriptionElement.className = 'user-dashboard__quick-action-description';
  descriptionElement.textContent = description;

  button.append(labelElement, descriptionElement);
  item.append(button);

  let cleanup = () => {};

  if (typeof onClick === 'function') {
    button.addEventListener('click', onClick);
    cleanup = () => {
      button.removeEventListener('click', onClick);
    };
  }

  return { item, button, labelElement, descriptionElement, cleanup };
}

export function createQuickActionsWidget({
  id,
  title,
  description,
  defaultExpanded = true,
  extraClasses = [],
  onToggle,
}) {
  const baseClasses = ['user-dashboard__widget', ...extraClasses.filter(Boolean)];
  const controls = createCollapsibleSection({
    id,
    title,
    description,
    defaultExpanded,
    classes: baseClasses,
    onToggle,
  });

  const actionsWrapper = document.createElement('div');
  actionsWrapper.className = 'user-dashboard__actions';

  const actionList = document.createElement('ul');
  actionList.className = 'user-dashboard__action-list';
  actionList.setAttribute('role', 'list');

  actionsWrapper.append(actionList);
  controls.content.append(actionsWrapper);

  return { ...controls, actionsWrapper, actionList };
}

export function createUserDashboardUsersWidget(options = {}) {
  const extraClasses = Array.isArray(options.extraClasses) ? options.extraClasses : [];
  return createSystemUsersWidget({
    ...options,
    extraClasses: ['user-dashboard__widget', 'user-dashboard__widget--user-data', ...extraClasses],
  });
}

function createIntroPreview() {
  return createUserDashboardIntroWidget();
}

function createLabelPreview() {
  return createUserDashboardLabelWidget({
    extraLabels: ['Perfil sincronizado'],
  });
}

function createQuickActionsPreview() {
  const layout = document.createElement('div');
  layout.className = 'user-panel__layout admin-dashboard__layout user-dashboard__layout';

  const themeWidget = createQuickActionsWidget({
    id: 'theme-demo',
    title: 'Preferências de tema',
    description:
      'Atalhos para alternar entre tema claro e escuro mantendo a sessão sincronizada com o painel.',
    defaultExpanded: true,
    extraClasses: ['user-dashboard__widget--theme'],
  });

  [
    {
      label: 'Tema automático',
      description: 'Detecta o modo do dispositivo e aplica o melhor contraste.',
      extraClass: 'user-dashboard__quick-action-button--theme',
    },
    {
      label: 'Indicadores visíveis no rodapé',
      description: 'Exibe status de versão e sincronização sempre ativos.',
      extraClass: 'user-dashboard__quick-action-button--footer',
    },
  ]
    .map((actionConfig) => createQuickAction(actionConfig))
    .forEach((action) => {
      themeWidget.actionList.append(action.item);
    });

  const accessWidget = createQuickActionsWidget({
    id: 'access-demo',
    title: 'Sessão e acesso',
    description: 'Gerencie rapidamente sessão atual, troca de usuário e limpeza local.',
    defaultExpanded: true,
    extraClasses: ['user-panel__widget--access'],
  });

  [
    {
      label: 'Fazer logoff',
      description: 'Encerra a sessão atual sem remover preferências salvas.',
    },
    {
      label: 'Logout da conta',
      description: 'Sai desta conta e retorna à tela inicial.',
      extraClass: 'user-dashboard__quick-action-button--logout',
    },
  ]
    .map((actionConfig) => createQuickAction(actionConfig))
    .forEach((action) => {
      accessWidget.actionList.append(action.item);
    });

  layout.append(themeWidget.section, accessWidget.section);
  return layout;
}

function createUserDataPreview() {
  const widgetInstance = createUserDashboardUsersWidget({
    title: 'Dados do usuário',
    description: 'Resumo sincronizado com os dados principais do painel administrativo.',
    emptyStateMessage: 'Nenhum usuário ativo.',
  });

  widgetInstance.setUsers([
    {
      id: '1',
      name: 'Maria Oliveira',
      phone: '+55 41 99999-0000',
      userType: 'administrador',
      device: 'Chrome • Desktop',
      createdAt: new Date('2025-09-15T09:00:00-03:00'),
      updatedAt: new Date('2025-10-20T18:45:00-03:00'),
      profile: {
        email: 'maria@exemplo.com',
        document: '123.456.789-00',
        addressCity: 'Curitiba',
        addressState: 'PR',
      },
      preferences: {
        theme: 'dark',
      },
    },
    {
      id: '2',
      name: 'Paulo Nascimento',
      phone: '+55 11 98888-1234',
      userType: 'colaborador',
      device: 'Safari • iOS',
      createdAt: new Date('2025-08-10T14:30:00-03:00'),
      updatedAt: new Date('2025-10-18T11:20:00-03:00'),
      profile: {
        email: 'paulo@exemplo.com',
        document: '987.654.321-00',
        addressCity: 'São Paulo',
        addressState: 'SP',
      },
      preferences: {
        theme: 'light',
      },
    },
  ]);

  widgetInstance.setExpandedUser('1', true, { notify: false });
  return widgetInstance.widget;
}

export const USER_DASHBOARD_WIDGET_MODELS = Object.freeze([
  Object.freeze({
    id: 'UD01',
    title: 'Widget de introdução do painel do usuário',
    description: 'Apresentação textual destacando objetivos e contexto do painel de conta.',
    tokens: ['--panel-gap', '--panel-padding', '--panel-stack-gap'],
    create: () => createIntroPreview(),
  }),
  Object.freeze({
    id: 'UD02',
    title: 'Widget de etiqueta do painel do usuário',
    description: 'Etiqueta com chips destacando painel, projeto e estado da sessão ativa.',
    tokens: ['--panel-gap', '--panel-padding', '--panel-stack-gap'],
    create: () => createLabelPreview(),
  }),
  Object.freeze({
    id: 'UD03',
    title: 'Widget de ações rápidas do painel do usuário',
    description:
      'Seção colapsável com atalhos para preferências de tema, indicadores e gerenciamento de sessão.',
    tokens: ['--panel-gap', '--panel-padding', '--panel-stack-gap'],
    create: () => createQuickActionsPreview(),
  }),
  Object.freeze({
    id: 'UD04',
    title: 'Widget de dados do usuário',
    description: 'Tabela com resumo expandível sincronizado ao painel administrativo.',
    tokens: ['--panel-gap', '--panel-padding', '--panel-stack-gap'],
    create: () => createUserDataPreview(),
  }),
]);
