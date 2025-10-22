import eventBus from '../events/event-bus.js';

const BASE_CLASSES = 'card view view--home';

function navigateTo(view) {
  if (!view) {
    return;
  }

  eventBus.emit('app:navigate', { view });
}

function createActionButton({ label, description, view }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'home-dashboard__action-button';

  const labelElement = document.createElement('span');
  labelElement.className = 'home-dashboard__action-label';
  labelElement.textContent = label;

  const descriptionElement = document.createElement('span');
  descriptionElement.className = 'home-dashboard__action-description';
  descriptionElement.textContent = description;

  button.append(labelElement, descriptionElement);
  button.addEventListener('click', () => navigateTo(view));

  return button;
}

function createHighlight({ title, description }) {
  const item = document.createElement('li');
  item.className = 'home-dashboard__list-item';

  const titleElement = document.createElement('span');
  titleElement.className = 'home-dashboard__list-title';
  titleElement.textContent = title;

  const descriptionElement = document.createElement('p');
  descriptionElement.className = 'home-dashboard__list-description';
  descriptionElement.textContent = description;

  item.append(titleElement, descriptionElement);

  return item;
}

function createInsight({ title, description }) {
  const item = document.createElement('li');
  item.className = 'home-dashboard__insight';

  const titleElement = document.createElement('span');
  titleElement.className = 'home-dashboard__insight-title';
  titleElement.textContent = title;

  const descriptionElement = document.createElement('p');
  descriptionElement.className = 'home-dashboard__insight-description';
  descriptionElement.textContent = description;

  item.append(titleElement, descriptionElement);

  return item;
}

export function renderHome(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'home';

  const heading = document.createElement('h1');
  heading.className = 'user-panel__title home-dashboard__title';
  heading.textContent = 'Painel inicial';

  const intro = document.createElement('p');
  intro.className = 'user-panel__intro home-dashboard__intro';
  intro.textContent =
    'Acompanhe o progresso do MiniApp Base, acione os principais painéis e descubra o que mudou nesta edição.';

  const sessionCallout = document.createElement('section');
  sessionCallout.className = 'user-details__selected home-dashboard__callout';

  const sessionText = document.createElement('p');
  sessionText.className = 'user-details__selected-text';
  sessionText.textContent = 'Nenhuma sessão ativa. Escolha um painel para começar a navegar.';

  const sessionActions = document.createElement('div');
  sessionActions.className = 'home-dashboard__callout-actions';

  const loginButton = document.createElement('button');
  loginButton.type = 'button';
  loginButton.className = 'user-details__selected-action home-dashboard__callout-button';
  loginButton.textContent = 'Fazer login';
  loginButton.addEventListener('click', () => navigateTo('login'));

  const registerButton = document.createElement('button');
  registerButton.type = 'button';
  registerButton.className =
    'user-details__selected-action home-dashboard__callout-button home-dashboard__callout-button--secondary';
  registerButton.textContent = 'Criar conta';
  registerButton.addEventListener('click', () => navigateTo('register'));

  sessionActions.append(loginButton, registerButton);
  sessionCallout.append(sessionText, sessionActions);

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout home-dashboard__layout';

  const overviewWidget = document.createElement('section');
  overviewWidget.className = 'user-panel__widget home-dashboard__widget home-dashboard__widget--overview';

  const overviewTitle = document.createElement('h2');
  overviewTitle.className = 'user-widget__title';
  overviewTitle.textContent = 'Visão geral do MiniApp';

  const overviewDescription = document.createElement('p');
  overviewDescription.className = 'user-widget__description';
  overviewDescription.textContent =
    'Os painéis compartilham a mesma base responsiva do painel do usuário, garantindo uma experiência consistente.';

  const highlightsList = document.createElement('ul');
  highlightsList.className = 'home-dashboard__list';

  [
    {
      title: 'Painel do usuário alinhado',
      description:
        'Widgets organizados em cartões permitem atualizar dados pessoais, preferências e tema em tempo real.',
    },
    {
      title: 'Fluxos de autenticação integrados',
      description:
        'Acesse login e cadastro diretamente do cabeçalho ou pelos atalhos abaixo, sem perder o contexto.',
    },
    {
      title: 'Histórico completo de releases',
      description:
        'O painel de Log reúne cada atualização registrada no horário de Brasília para facilitar auditorias.',
    },
  ].map(createHighlight)
    .forEach((item) => highlightsList.append(item));

  overviewWidget.append(overviewTitle, overviewDescription, highlightsList);

  const actionsWidget = document.createElement('section');
  actionsWidget.className = 'user-panel__widget home-dashboard__widget home-dashboard__widget--actions';

  const actionsTitle = document.createElement('h2');
  actionsTitle.className = 'user-widget__title';
  actionsTitle.textContent = 'Ações rápidas';

  const actionsDescription = document.createElement('p');
  actionsDescription.className = 'user-widget__description';
  actionsDescription.textContent = 'Escolha para onde ir em seguida e mantenha sua sessão sempre atualizada.';

  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'home-dashboard__actions';

  [
    {
      label: 'Abrir painel do usuário',
      description: 'Gerencie dados de acesso, perfil completo e preferências de tema.',
      view: 'user',
    },
    {
      label: 'Ir para o painel administrativo',
      description: 'Revise cadastros, filtros e relatórios com a mesma malha visual.',
      view: 'admin',
    },
    {
      label: 'Consultar registro de alterações',
      description: 'Veja o histórico completo no painel de Log sem sair do app.',
      view: 'log',
    },
    {
      label: 'Revisar termos e condições',
      description: 'Acesse a base legal atualizada antes de concluir novos cadastros.',
      view: 'legal',
    },
  ].map(createActionButton)
    .forEach((button) => actionsContainer.append(button));

  actionsWidget.append(actionsTitle, actionsDescription, actionsContainer);

  const miniAppsWidget = document.createElement('section');
  miniAppsWidget.className = 'user-panel__widget home-dashboard__widget home-dashboard__widget--miniapps';

  const miniAppsTitle = document.createElement('h2');
  miniAppsTitle.className = 'user-widget__title';
  miniAppsTitle.textContent = 'Mini-apps disponíveis';

  const miniAppsDescription = document.createElement('p');
  miniAppsDescription.className = 'user-widget__description';
  miniAppsDescription.textContent =
    'A lista abaixo será preenchida automaticamente com os mini-apps liberados para você.';

  const miniAppsList = document.createElement('ul');
  miniAppsList.className = 'home-dashboard__miniapps';
  miniAppsList.setAttribute('aria-live', 'polite');
  miniAppsList.setAttribute('aria-label', 'Mini-apps disponíveis');

  miniAppsWidget.append(miniAppsTitle, miniAppsDescription, miniAppsList);

  const insightsWidget = document.createElement('section');
  insightsWidget.className = 'user-panel__widget home-dashboard__widget home-dashboard__widget--insights';

  const insightsTitle = document.createElement('h2');
  insightsTitle.className = 'user-widget__title';
  insightsTitle.textContent = 'Boas práticas em destaque';

  const insightsDescription = document.createElement('p');
  insightsDescription.className = 'user-widget__description';
  insightsDescription.textContent =
    'Explore recursos inspirados no painel do usuário para manter o MiniApp Base consistente em cada view.';

  const insightsList = document.createElement('ul');
  insightsList.className = 'home-dashboard__insights';

  [
    {
      title: 'Grade compartilhada',
      description:
        'Os cartões utilizam o mesmo espaçamento, sombras e bordas do painel do usuário para reforçar familiaridade.',
    },
    {
      title: 'Feedback visível',
      description:
        'Alertas e chamadas para ação reaproveitam o destaque do painel do usuário para orientar o próximo passo.',
    },
    {
      title: 'Experiência responsiva',
      description:
        'O layout se ajusta automaticamente entre celulares, tablets e desktops mantendo legibilidade e hierarquia.',
    },
  ].map(createInsight)
    .forEach((item) => insightsList.append(item));

  insightsWidget.append(insightsTitle, insightsDescription, insightsList);

  layout.append(overviewWidget, actionsWidget, miniAppsWidget, insightsWidget);

  viewRoot.replaceChildren(heading, intro, sessionCallout, layout);
}
