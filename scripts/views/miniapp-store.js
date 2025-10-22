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
  item.tabIndex = 0;
  item.setAttribute('role', 'button');
  item.setAttribute('aria-haspopup', 'dialog');
  item.setAttribute('aria-label', `Abrir ficha técnica de ${app.name}`);

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
  detailsButton.textContent = 'Saiba Mais';

  const openDetails = (trigger) => {
    const detail = trigger instanceof HTMLElement ? trigger : item;
    eventBus.emit('miniapp:details', { app, trigger: detail });
  };

  item.addEventListener('click', (event) => {
    if (event?.target instanceof HTMLElement && detailsButton.contains(event.target)) {
      return;
    }
    openDetails(item);
  });

  item.addEventListener('keydown', (event) => {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDetails(item);
    }
  });

  detailsButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openDetails(detailsButton);
  });

  item.append(name, description, metaList, detailsButton);
  return item;
}

export function renderMiniAppStore(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  viewRoot.className = 'card view view--user miniapp-store-view';
  viewRoot.dataset.view = 'miniapps';

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout user-dashboard__layout miniapp-store__layout';

  const catalogSection = document.createElement('section');
  catalogSection.className = 'user-panel__widget user-dashboard__widget miniapp-store__catalog';

  const catalogTitle = document.createElement('h2');
  catalogTitle.className = 'user-widget__title';
  catalogTitle.textContent = 'Miniapps disponíveis';

  const catalogDescription = document.createElement('p');
  catalogDescription.className = 'user-widget__description';
  catalogDescription.textContent =
    'Veja os principais dados de cada miniapp disponível. Toque em um cartão para abrir a ficha técnica com as informações completas.';

  const list = document.createElement('ul');
  list.className = 'home-dashboard__miniapps miniapp-store__miniapps';

  MINI_APPS.forEach((app) => {
    list.append(renderMiniAppListItem(app));
  });

  catalogSection.append(catalogTitle, catalogDescription, list);
  layout.append(catalogSection);

  viewRoot.replaceChildren(layout);
}
