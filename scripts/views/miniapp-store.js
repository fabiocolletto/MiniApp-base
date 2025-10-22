import eventBus from '../events/event-bus.js';
import { getActiveUser, subscribeSession } from '../data/session-store.js';
import {
  MAX_FAVORITE_MINI_APPS,
  getUserMiniAppPreferences,
  subscribeMiniAppPreferences,
  toggleMiniAppFavorite,
  toggleMiniAppSaved,
} from '../data/miniapp-preferences-store.js';
import { registerViewCleanup } from '../view-cleanup.js';

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

function createToggleActionButton({
  defaultLabel,
  activeLabel,
  defaultTitle,
  activeTitle,
  modifier,
  getIsActive,
  onPress,
}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'user-dashboard__summary-edit miniapp-store__action-button';

  if (modifier) {
    button.classList.add(`miniapp-store__action-button--${modifier}`);
    button.dataset.action = modifier;
  }

  const applyState = () => {
    const stateValue = getIsActive ? getIsActive() : false;
    const isActive = stateValue === true;
    const label = isActive ? activeLabel : defaultLabel;
    const title = isActive ? activeTitle : defaultTitle;

    button.textContent = label;
    button.setAttribute('aria-label', title);
    button.title = title;
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    button.dataset.state = isActive ? 'active' : 'idle';
    button.disabled = stateValue === null;
  };

  applyState();

  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof onPress === 'function') {
      onPress({ applyState, button });
    }
  });

  return { button, refresh: applyState };
}

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

function renderMiniAppListItem({
  app,
  getIsFavorite,
  getIsSaved,
  onToggleFavorite,
  onToggleSaved,
}) {
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

  const openDetails = (trigger) => {
    const detail = trigger instanceof HTMLElement ? trigger : item;
    eventBus.emit('miniapp:details', { app, trigger: detail });
  };

  const favoriteControl = createToggleActionButton({
    defaultLabel: 'Favoritar',
    activeLabel: 'Favorito',
    defaultTitle: `Adicionar ${app.name} aos favoritos`,
    activeTitle: `Remover ${app.name} dos favoritos`,
    modifier: 'favorite',
    getIsActive: () => (typeof getIsFavorite === 'function' ? getIsFavorite(app.id) : false),
    onPress: ({ applyState, button }) => {
      if (typeof onToggleFavorite === 'function') {
        onToggleFavorite({ app, applyState, button });
      }
    },
  });

  const savedControl = createToggleActionButton({
    defaultLabel: 'Salvar',
    activeLabel: 'Salvo',
    defaultTitle: `Salvar ${app.name} para ver depois`,
    activeTitle: `Remover ${app.name} dos salvos`,
    modifier: 'saved',
    getIsActive: () => (typeof getIsSaved === 'function' ? getIsSaved(app.id) : false),
    onPress: ({ applyState, button }) => {
      if (typeof onToggleSaved === 'function') {
        onToggleSaved({ app, applyState, button });
      }
    },
  });

  const detailsButton = document.createElement('button');
  detailsButton.type = 'button';
  detailsButton.className =
    'user-dashboard__summary-edit miniapp-store__action-button miniapp-store__action-button--details miniapp-store__action-button--primary';
  detailsButton.textContent = 'Saiba Mais';

  item.addEventListener('click', (event) => {
    if (event?.target instanceof HTMLElement && event.target.closest('.miniapp-store__action-button')) {
      return;
    }
    openDetails(item);
  });

  item.addEventListener('keydown', (event) => {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }

    if (event.target !== item) {
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

  const actions = document.createElement('div');
  actions.className = 'miniapp-store__actions';
  actions.append(favoriteControl.button, savedControl.button, detailsButton);

  item.append(name, description, metaList, actions);
  return {
    element: item,
    controls: {
      favorite: favoriteControl,
      saved: savedControl,
    },
  };
}

export function renderMiniAppStore(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  const cleanupHandlers = [];

  registerViewCleanup(viewRoot, () => {
    while (cleanupHandlers.length > 0) {
      const cleanup = cleanupHandlers.pop();
      try {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      } catch (error) {
        console.error('Erro ao limpar a Mini App Store.', error);
      }
    }
  });

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

  const feedback = document.createElement('p');
  feedback.className = 'miniapp-store__feedback';
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  feedback.hidden = true;

  const list = document.createElement('ul');
  list.className = 'home-dashboard__miniapps miniapp-store__miniapps';

  const controlsByAppId = new Map();

  const state = {
    user: getActiveUser(),
    preferences: { favorites: [], saved: [] },
  };

  function refreshUserPreferences() {
    if (!state.user) {
      state.preferences = { favorites: [], saved: [] };
      return;
    }

    state.preferences = getUserMiniAppPreferences(state.user.id);
  }

  function getIsFavorite(appId) {
    if (!state.user || !state.preferences || !Array.isArray(state.preferences.favorites)) {
      return null;
    }

    return state.preferences.favorites.includes(appId);
  }

  function getIsSaved(appId) {
    if (!state.user || !state.preferences || !Array.isArray(state.preferences.saved)) {
      return null;
    }

    return state.preferences.saved.includes(appId);
  }

  function showFeedback(message, type = 'info') {
    if (typeof message !== 'string' || message.trim() === '') {
      feedback.textContent = '';
      feedback.dataset.state = 'idle';
      feedback.hidden = true;
      return;
    }

    feedback.textContent = message.trim();
    feedback.dataset.state = type;
    feedback.hidden = false;
  }

  function refreshControls() {
    controlsByAppId.forEach((registry) => {
      try {
        registry?.favorite?.refresh?.();
        registry?.saved?.refresh?.();
      } catch (error) {
        console.error('Não foi possível atualizar o estado dos controles de mini-app.', error);
      }
    });
  }

  function handleFavoriteToggle({ app, applyState, button }) {
    if (!state.user) {
      showFeedback('Entre com sua conta para favoritar mini-apps.', 'warning');
      applyState();
      return;
    }

    const result = toggleMiniAppFavorite(state.user.id, app.id);

    if (!result?.success) {
      if (result?.reason === 'favorite-limit-exceeded') {
        showFeedback(
          `Você pode favoritar até ${MAX_FAVORITE_MINI_APPS} mini-apps. Remova um favorito antes de adicionar outro.`,
          'error',
        );
      } else {
        showFeedback('Não foi possível atualizar seus favoritos. Tente novamente mais tarde.', 'error');
      }
      applyState();
      return;
    }

    refreshUserPreferences();
    refreshControls();
    applyState();
    showFeedback('Lista de favoritos atualizada com sucesso.', 'success');
    eventBus.emit('miniapp:favorite', { app, active: result.added, trigger: button });
  }

  function handleSavedToggle({ app, applyState, button }) {
    if (!state.user) {
      showFeedback('Entre com sua conta para salvar mini-apps.', 'warning');
      applyState();
      return;
    }

    const result = toggleMiniAppSaved(state.user.id, app.id);

    if (!result?.success) {
      showFeedback('Não foi possível atualizar seus mini-apps salvos. Tente novamente mais tarde.', 'error');
      applyState();
      return;
    }

    refreshUserPreferences();
    refreshControls();
    applyState();
    showFeedback('Lista de mini-apps salvos atualizada com sucesso.', 'success');
    eventBus.emit('miniapp:saved', { app, active: result.added, trigger: button });
  }

  refreshUserPreferences();

  MINI_APPS.forEach((app) => {
    const { element, controls } = renderMiniAppListItem({
      app,
      getIsFavorite: getIsFavorite,
      getIsSaved: getIsSaved,
      onToggleFavorite: handleFavoriteToggle,
      onToggleSaved: handleSavedToggle,
    });

    controlsByAppId.set(app.id, controls);
    list.append(element);
  });

  refreshControls();

  catalogSection.append(catalogTitle, catalogDescription, feedback, list);
  layout.append(catalogSection);

  viewRoot.replaceChildren(layout);

  const unsubscribeSession = subscribeSession((user) => {
    state.user = user;
    refreshUserPreferences();
    refreshControls();
    showFeedback('', 'info');
  });

  if (typeof unsubscribeSession === 'function') {
    cleanupHandlers.push(unsubscribeSession);
  }

  const unsubscribePreferences = subscribeMiniAppPreferences((event) => {
    if (!state.user) {
      return;
    }

    const normalizedUserId = String(state.user.id ?? '').trim();
    if (!normalizedUserId) {
      return;
    }

    if (event?.userId && event.userId !== normalizedUserId) {
      return;
    }

    refreshUserPreferences();
    refreshControls();
  });

  if (typeof unsubscribePreferences === 'function') {
    cleanupHandlers.push(unsubscribePreferences);
  }
}
