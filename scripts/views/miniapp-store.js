import eventBus from '../events/event-bus.js';

const MINI_APPS = [
  {
    id: 'time-tracker',
    name: 'Time Tracker',
    category: 'Produtividade',
    description: 'Monitore jornadas, exporte relatórios completos e integre com o painel administrativo.',
    version: '1.8.0',
    status: 'Disponível',
    updatedAt: 'Atualizado em 12/10/2025',
  },
  {
    id: 'field-forms',
    name: 'Field Forms',
    category: 'Operações',
    description: 'Colete dados em campo mesmo offline, sincronizando automaticamente quando a sessão estiver ativa.',
    version: '3.2.1',
    status: 'Em validação',
    updatedAt: 'Atualizado em 18/10/2025',
  },
  {
    id: 'insights-hub',
    name: 'Insights Hub',
    category: 'Analytics',
    description: 'Combine métricas de diferentes miniapps em dashboards compartilhados e alertas inteligentes.',
    version: '0.9.5',
    status: 'Pré-lançamento',
    updatedAt: 'Atualizado em 20/10/2025',
  },
];

function createSummaryEntry(term, value) {
  if (!term || !value) {
    return null;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'user-dashboard__summary-item';

  const termElement = document.createElement('dt');
  termElement.className = 'user-dashboard__summary-label';
  termElement.textContent = term;

  const valueElement = document.createElement('dd');
  valueElement.className = 'user-dashboard__summary-value';
  valueElement.textContent = value;

  wrapper.append(termElement, valueElement);
  return wrapper;
}

function renderMiniAppListItem(app) {
  const item = document.createElement('li');
  item.className = 'home-dashboard__list-item';
  item.dataset.appId = app.id;

  const name = document.createElement('h3');
  name.className = 'home-dashboard__action-label';
  name.textContent = app.name;

  const description = document.createElement('p');
  description.className = 'home-dashboard__action-description';
  description.textContent = app.description;

  const metaList = document.createElement('dl');
  metaList.className = 'user-dashboard__summary-list';

  [
    ['Categoria', app.category],
    ['Versão', app.version],
    ['Status', app.status],
    ['Atualização', app.updatedAt],
  ]
    .map(([term, value]) => createSummaryEntry(term, value))
    .filter(Boolean)
    .forEach((entry) => {
      metaList.append(entry);
    });

  const detailsButton = document.createElement('button');
  detailsButton.type = 'button';
  detailsButton.className = 'user-dashboard__summary-edit';
  detailsButton.textContent = 'Ver detalhes';
  detailsButton.addEventListener('click', () => {
    eventBus.emit('app:navigate', { view: 'admin' });
    eventBus.emit('miniapp:details', { appId: app.id });
  });

  item.append(name, description, metaList, detailsButton);
  return item;
}

export function renderMiniAppStore(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = 'card view view--user';
  viewRoot.dataset.view = 'miniapps';

  const heading = document.createElement('h1');
  heading.className = 'user-panel__title home-dashboard__title';
  heading.textContent = 'Mini App Store';

  const intro = document.createElement('p');
  intro.className = 'user-panel__intro home-dashboard__intro';
  intro.textContent =
    'Explore a vitrine de miniapps disponíveis para a sua operação, conheça os destaques de cada solução e solicite acesso quando estiver pronto para ativar.';

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout user-dashboard__layout';

  const catalogSection = document.createElement('section');
  catalogSection.className = 'user-panel__widget user-dashboard__widget';

  const catalogTitle = document.createElement('h2');
  catalogTitle.className = 'user-widget__title';
  catalogTitle.textContent = 'Miniapps disponíveis';

  const catalogDescription = document.createElement('p');
  catalogDescription.className = 'user-widget__description';
  catalogDescription.textContent =
    'Veja os principais dados de cada miniapp disponível. Escolha um deles para abrir o painel administrativo e continuar a configuração.';

  const list = document.createElement('ul');
  list.className = 'home-dashboard__miniapps';

  MINI_APPS.forEach((app) => {
    list.append(renderMiniAppListItem(app));
  });

  catalogSection.append(catalogTitle, catalogDescription, list);
  layout.append(catalogSection);

  viewRoot.replaceChildren(heading, intro, layout);
}
