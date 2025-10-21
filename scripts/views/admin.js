import eventBus from '../events/event-bus.js';

const BASE_CLASSES = 'card view view--admin admin-dashboard';

function navigateTo(view) {
  if (!view) {
    return;
  }

  eventBus.emit('app:navigate', { view });
}

function createUserAction({ label, description, view }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'admin-dashboard__user-action';

  const labelElement = document.createElement('span');
  labelElement.className = 'admin-dashboard__user-action-label';
  labelElement.textContent = label;

  const descriptionElement = document.createElement('span');
  descriptionElement.className = 'admin-dashboard__user-action-description';
  descriptionElement.textContent = description;

  button.append(labelElement, descriptionElement);
  button.addEventListener('click', () => navigateTo(view));

  return button;
}

function createUserStat({ label, value }) {
  const item = document.createElement('li');
  item.className = 'admin-dashboard__user-stat';

  const valueElement = document.createElement('span');
  valueElement.className = 'admin-dashboard__user-stat-value';
  valueElement.textContent = value;

  const labelElement = document.createElement('span');
  labelElement.className = 'admin-dashboard__user-stat-label';
  labelElement.textContent = label;

  item.append(valueElement, labelElement);

  return item;
}

export function renderAdmin(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'admin';

  const heading = document.createElement('h1');
  heading.className = 'user-panel__title admin-dashboard__title';
  heading.textContent = 'Painel administrativo';

  const intro = document.createElement('p');
  intro.className = 'user-panel__intro admin-dashboard__intro';
  intro.textContent =
    'Gerencie a base de usuários cadastrados, acompanhe indicadores prioritários e mantenha os dados alinhados ao painel do usuário.';

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout admin-dashboard__layout';

  const managementWidget = document.createElement('section');
  managementWidget.className =
    'user-panel__widget admin-dashboard__widget admin-dashboard__widget--user-management';

  const managementTitle = document.createElement('h2');
  managementTitle.className = 'user-widget__title';
  managementTitle.textContent = 'Gestão de usuários cadastrados';

  const managementDescription = document.createElement('p');
  managementDescription.className = 'user-widget__description';
  managementDescription.textContent =
    'Visualize indicadores recentes, organize filas de revisão e acione atalhos para manter o cadastro atualizado.';

  const managementContent = document.createElement('div');
  managementContent.className = 'admin-dashboard__user-management';

  const summarySection = document.createElement('div');
  summarySection.className = 'admin-dashboard__user-summary';

  const summaryTitle = document.createElement('h3');
  summaryTitle.className = 'admin-dashboard__user-section-title';
  summaryTitle.textContent = 'Resumo de cadastros';

  const summaryDescription = document.createElement('p');
  summaryDescription.className = 'admin-dashboard__user-section-description';
  summaryDescription.textContent =
    'Indicadores sincronizados com o painel do usuário ajudam a priorizar revisões e manter a base consistente.';

  const statsList = document.createElement('ul');
  statsList.className = 'admin-dashboard__user-stats';

  [
    { label: 'Usuários ativos', value: '128' },
    { label: 'Perfis aguardando revisão', value: '12' },
    { label: 'Última sincronização', value: 'há 12 minutos' },
  ]
    .map(createUserStat)
    .forEach((item) => statsList.append(item));

  summarySection.append(summaryTitle, summaryDescription, statsList);

  const actionsSection = document.createElement('div');
  actionsSection.className = 'admin-dashboard__user-actions';

  const actionsTitle = document.createElement('h3');
  actionsTitle.className = 'admin-dashboard__user-section-title';
  actionsTitle.textContent = 'Ações de gestão';

  const actionsDescription = document.createElement('p');
  actionsDescription.className = 'admin-dashboard__user-section-description';
  actionsDescription.textContent =
    'Escolha uma ação rápida para atualizar cadastros, registrar novos usuários ou monitorar mudanças recentes.';

  const actionGrid = document.createElement('div');
  actionGrid.className = 'admin-dashboard__user-action-grid';

  [
    {
      label: 'Revisar cadastros completos',
      description: 'Abra o painel do usuário para atualizar dados e preferências em tempo real.',
      view: 'user',
    },
    {
      label: 'Cadastrar novo integrante',
      description: 'Direcione para o formulário de criação de contas e convites.',
      view: 'register',
    },
    {
      label: 'Monitorar atividades recentes',
      description: 'Consulte o registro de alterações para confirmar sincronizações e auditorias.',
      view: 'log',
    },
  ]
    .map(createUserAction)
    .forEach((button) => actionGrid.append(button));

  actionsSection.append(actionsTitle, actionsDescription, actionGrid);

  managementContent.append(summarySection, actionsSection);
  managementWidget.append(managementTitle, managementDescription, managementContent);

  layout.append(managementWidget);

  viewRoot.replaceChildren(heading, intro, layout);
}
