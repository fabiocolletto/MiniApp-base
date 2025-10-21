import eventBus from '../events/event-bus.js';

const BASE_CLASSES = 'card view view--admin admin-dashboard';

function navigateTo(view) {
  if (!view) {
    return;
  }

  eventBus.emit('app:navigate', { view });
}

function createActionButton({ label, description, view }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'admin-dashboard__action-button';

  const labelElement = document.createElement('span');
  labelElement.className = 'admin-dashboard__action-label';
  labelElement.textContent = label;

  const descriptionElement = document.createElement('span');
  descriptionElement.className = 'admin-dashboard__action-description';
  descriptionElement.textContent = description;

  button.append(labelElement, descriptionElement);
  button.addEventListener('click', () => navigateTo(view));

  return button;
}

function createHighlight({ title, description }) {
  const item = document.createElement('li');
  item.className = 'admin-dashboard__list-item';

  const titleElement = document.createElement('span');
  titleElement.className = 'admin-dashboard__list-title';
  titleElement.textContent = title;

  const descriptionElement = document.createElement('p');
  descriptionElement.className = 'admin-dashboard__list-description';
  descriptionElement.textContent = description;

  item.append(titleElement, descriptionElement);

  return item;
}

function createInsight({ title, description }) {
  const item = document.createElement('li');
  item.className = 'admin-dashboard__insight';

  const titleElement = document.createElement('span');
  titleElement.className = 'admin-dashboard__insight-title';
  titleElement.textContent = title;

  const descriptionElement = document.createElement('p');
  descriptionElement.className = 'admin-dashboard__insight-description';
  descriptionElement.textContent = description;

  item.append(titleElement, descriptionElement);

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
    'Monitore os bastidores do MiniApp Base, organize as rotinas operacionais e mantenha todos os painéis alinhados.';

  const operationsCallout = document.createElement('section');
  operationsCallout.className = 'user-details__selected admin-dashboard__callout';

  const calloutText = document.createElement('p');
  calloutText.className = 'user-details__selected-text';
  calloutText.textContent =
    'Nenhuma ação emergencial pendente. Utilize os atalhos abaixo para revisar cadastros, políticas e registros.';

  const calloutActions = document.createElement('div');
  calloutActions.className = 'admin-dashboard__callout-actions';

  const userPanelButton = document.createElement('button');
  userPanelButton.type = 'button';
  userPanelButton.className = 'user-details__selected-action admin-dashboard__callout-button';
  userPanelButton.textContent = 'Abrir painel do usuário';
  userPanelButton.addEventListener('click', () => navigateTo('user'));

  const homeButton = document.createElement('button');
  homeButton.type = 'button';
  homeButton.className =
    'user-details__selected-action admin-dashboard__callout-button admin-dashboard__callout-button--secondary';
  homeButton.textContent = 'Voltar ao painel inicial';
  homeButton.addEventListener('click', () => navigateTo('home'));

  calloutActions.append(userPanelButton, homeButton);
  operationsCallout.append(calloutText, calloutActions);

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout admin-dashboard__layout';

  const overviewWidget = document.createElement('section');
  overviewWidget.className = 'user-panel__widget admin-dashboard__widget admin-dashboard__widget--overview';

  const overviewTitle = document.createElement('h2');
  overviewTitle.className = 'user-widget__title';
  overviewTitle.textContent = 'Indicadores principais';

  const overviewDescription = document.createElement('p');
  overviewDescription.className = 'user-widget__description';
  overviewDescription.textContent =
    'Acompanhe rapidamente o status das rotinas administrativas mais importantes antes de aplicar mudanças.';

  const highlightList = document.createElement('ul');
  highlightList.className = 'admin-dashboard__list';

  [
    {
      title: 'Cadastros sincronizados',
      description:
        'Os dados do painel do usuário compartilham a mesma malha responsiva do MiniApp Base e refletem atualizações em tempo real.',
    },
    {
      title: 'Relatórios em ordem',
      description:
        'O histórico de alterações permanece disponível no painel de Log com registros em horário de Brasília.',
    },
    {
      title: 'Políticas alinhadas',
      description:
        'A área legal segue o padrão visual dos painéis centrais e facilita auditorias e revisões de compliance.',
    },
  ]
    .map(createHighlight)
    .forEach((item) => highlightList.append(item));

  overviewWidget.append(overviewTitle, overviewDescription, highlightList);

  const actionsWidget = document.createElement('section');
  actionsWidget.className = 'user-panel__widget admin-dashboard__widget admin-dashboard__widget--actions';

  const actionsTitle = document.createElement('h2');
  actionsTitle.className = 'user-widget__title';
  actionsTitle.textContent = 'Ações recomendadas';

  const actionsDescription = document.createElement('p');
  actionsDescription.className = 'user-widget__description';
  actionsDescription.textContent = 'Escolha o próximo passo para manter a operação sob controle.';

  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'admin-dashboard__actions';

  [
    {
      label: 'Revisar painel do usuário',
      description: 'Verifique cadastros, preferências e feedbacks em tempo real.',
      view: 'user',
    },
    {
      label: 'Consultar painel inicial',
      description: 'Retome a visão geral do MiniApp Base para compartilhar com a equipe.',
      view: 'home',
    },
    {
      label: 'Acessar registro de alterações',
      description: 'Abra o painel de Log para conferir releases e horários oficiais.',
      view: 'log',
    },
    {
      label: 'Revisar termos e políticas',
      description: 'Confira a base legal atualizada antes de habilitar novas rotinas.',
      view: 'legal',
    },
  ]
    .map(createActionButton)
    .forEach((button) => actionsContainer.append(button));

  actionsWidget.append(actionsTitle, actionsDescription, actionsContainer);

  const insightsWidget = document.createElement('section');
  insightsWidget.className = 'user-panel__widget admin-dashboard__widget admin-dashboard__widget--insights';

  const insightsTitle = document.createElement('h2');
  insightsTitle.className = 'user-widget__title';
  insightsTitle.textContent = 'Diretrizes operacionais';

  const insightsDescription = document.createElement('p');
  insightsDescription.className = 'user-widget__description';
  insightsDescription.textContent =
    'Garanta consistência entre equipes reutilizando os mesmos componentes e tokens visuais do painel do usuário.';

  const insightsList = document.createElement('ul');
  insightsList.className = 'admin-dashboard__insights';

  [
    {
      title: 'Layout compartilhado',
      description:
        'Cards, sombras e espaçamentos seguem o padrão do painel do usuário para manter a identidade única do MiniApp Base.',
    },
    {
      title: 'Acessibilidade contínua',
      description:
        'Labels, descrições e estados dinâmicos replicam o comportamento acessível validado no painel inicial.',
    },
    {
      title: 'Fluxos coordenados',
      description:
        'Todos os atalhos utilizam o roteador central para preservar histórico e evitar perdas de contexto.',
    },
  ]
    .map(createInsight)
    .forEach((item) => insightsList.append(item));

  insightsWidget.append(insightsTitle, insightsDescription, insightsList);

  layout.append(overviewWidget, actionsWidget, insightsWidget);

  viewRoot.replaceChildren(heading, intro, operationsCallout, layout);
}
