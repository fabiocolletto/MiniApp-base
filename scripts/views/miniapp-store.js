import eventBus from '../events/event-bus.js';
import { getActiveUser, subscribeSession } from '../data/session-store.js';
import {
  MAX_FAVORITE_MINI_APPS,
  getUserMiniAppPreferences,
  subscribeMiniAppPreferences,
  toggleMiniAppFavorite,
  toggleMiniAppSaved,
} from '../data/miniapp-preferences-store.js';
import {
  getTopMiniAppsByDownloads,
  getTopMiniAppsByFavorites,
  getLatestMiniApps,
  getMiniAppsByFeaturedCategories,
  getMiniAppStatusLabel,
  subscribeMiniApps as subscribeMiniAppCatalog,
} from '../data/miniapp-store.js';
import { registerViewCleanup } from '../view-cleanup.js';

const MINI_APP_SECTIONS = [
  {
    id: 'top-downloads',
    title: 'Mais baixados',
    description: 'Explore os miniapps com maior volume de instalações nesta semana.',
    limit: 12,
    selectMiniApps: ({ limit }) => getTopMiniAppsByDownloads(limit ?? 12),
  },
  {
    id: 'top-favorites',
    title: 'Mais favoritados',
    description: 'Confira os miniapps que estão nas listas de favoritos das equipes.',
    limit: 12,
    selectMiniApps: ({ limit }) => getTopMiniAppsByFavorites(limit ?? 12),
  },
  {
    id: 'new-arrivals',
    title: 'Novidades',
    description: 'Descubra os lançamentos mais recentes adicionados ao catálogo.',
    limit: 12,
    selectMiniApps: ({ limit }) => getLatestMiniApps(limit ?? 12),
  },
  {
    id: 'featured-categories',
    title: 'Destaques por categoria',
    description: 'Passeie pelas principais categorias para encontrar a solução ideal.',
    limit: 12,
    selectMiniApps: ({ limit }) => getMiniAppsByFeaturedCategories({ limit: limit ?? 12 }),
  },
];

const UPDATED_AT_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function formatUpdatedAtLabel(value) {
  if (!value) {
    return 'Atualização pendente';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return 'Atualização pendente';
  }

  return `Atualizado em ${UPDATED_AT_FORMATTER.format(date)}`;
}

function mapMiniAppToCatalogEntry(app) {
  if (!app) {
    return null;
  }

  return {
    ...app,
    status: getMiniAppStatusLabel(app.status),
    updatedAt: formatUpdatedAtLabel(app.updatedAt ?? app.releaseDate),
  };
}

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
  button.className =
    'button panel-action-tile panel-action-tile--compact panel-action-tile--secondary user-dashboard__summary-edit';

  if (modifier) {
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
  item.className = 'home-dashboard__list-item carousel-item';
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
    'button button--primary panel-action-tile panel-action-tile--compact user-dashboard__summary-edit';
  detailsButton.textContent = 'Saiba Mais';

  item.addEventListener('click', (event) => {
    if (event?.target instanceof HTMLElement && event.target.closest('.panel-action-tile')) {
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
  actions.className = 'card-actions';
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

  viewRoot.className = 'view dashboard-view view--user miniapp-store-view';
  viewRoot.dataset.view = 'miniapps';

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout user-dashboard__layout';

  const catalogSection = document.createElement('section');
  catalogSection.className =
    'surface-card user-panel__widget user-dashboard__widget user-dashboard__widget--full layout-stack layout-stack--lg';

  const catalogTitle = document.createElement('h2');
  catalogTitle.className = 'user-widget__title';
  catalogTitle.textContent = 'Miniapps disponíveis';

  const catalogDescription = document.createElement('p');
  catalogDescription.className = 'user-widget__description';
  catalogDescription.textContent =
    'Veja os principais dados de cada miniapp disponível. Navegue pelas coleções temáticas e toque em um cartão para abrir a ficha técnica completa.';

  const feedback = document.createElement('p');
  feedback.className = 'feedback-banner';
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  feedback.hidden = true;

  const catalogSections = document.createElement('div');
  catalogSections.className = 'layout-stack layout-stack--xl';

  const controlsBySection = new Map();
  const sectionsRegistry = new Map();

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
      delete feedback.dataset.variant;
      feedback.hidden = true;
      return;
    }

    feedback.textContent = message.trim();
    feedback.dataset.variant = ['success', 'warning', 'error'].includes(type) ? type : 'info';
    feedback.hidden = false;
  }

  function refreshControls() {
    controlsBySection.forEach((appsRegistry) => {
      if (!(appsRegistry instanceof Map)) {
        return;
      }

      appsRegistry.forEach((registry) => {
        try {
          registry?.favorite?.refresh?.();
          registry?.saved?.refresh?.();
        } catch (error) {
          console.error('Não foi possível atualizar o estado dos controles de mini-app.', error);
        }
      });
    });
  }

  function refreshSection(sectionId) {
    const registry = sectionsRegistry.get(sectionId);
    if (!registry) {
      return;
    }

    const { config, list } = registry;
    const limit = typeof config.limit === 'number' ? config.limit : 12;
    const controlsByApp = new Map();

    const apps =
      typeof config.selectMiniApps === 'function'
        ? config.selectMiniApps({
            limit,
            user: state.user,
            preferences: state.preferences,
          }) || []
        : [];

    list.replaceChildren();

    apps
      .map((app) => mapMiniAppToCatalogEntry(app))
      .filter((app) => app !== null)
      .forEach((app) => {
        const { element, controls } = renderMiniAppListItem({
          app,
          getIsFavorite: getIsFavorite,
          getIsSaved: getIsSaved,
          onToggleFavorite: handleFavoriteToggle,
          onToggleSaved: handleSavedToggle,
        });

        controlsByApp.set(app.id, controls);
        list.append(element);
      });

    controlsBySection.set(config.id, controlsByApp);
    registry.controls = controlsByApp;

    if (typeof registry.updateNavigationState === 'function') {
      registry.updateNavigationState();
    }
  }

  function refreshAllSections() {
    MINI_APP_SECTIONS.forEach((section) => {
      refreshSection(section.id);
    });
    refreshControls();
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

  MINI_APP_SECTIONS.forEach((sectionConfig) => {
    const sectionElement = document.createElement('article');
    sectionElement.className = 'layout-stack layout-stack--md';
    sectionElement.dataset.sectionId = sectionConfig.id;

    const sectionHeader = document.createElement('header');
    sectionHeader.className = 'section-header';

    const sectionInfo = document.createElement('div');
    sectionInfo.className = 'section-header__info';

    const sectionTitle = document.createElement('h3');
    sectionTitle.className = 'section-title';
    sectionTitle.textContent = sectionConfig.title;

    const sectionDescription = document.createElement('p');
    sectionDescription.className = 'section-description';
    sectionDescription.textContent = sectionConfig.description;

    sectionInfo.append(sectionTitle, sectionDescription);

    const navigation = document.createElement('div');
    navigation.className = 'section-header__actions';

    const createNavButton = (direction, label) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'button button--icon';
      button.setAttribute('aria-label', label);
      button.title = label;
      button.textContent = direction === 'prev' ? '‹' : '›';
      button.disabled = true;
      return button;
    };

    const prevButton = createNavButton('prev', `Ver miniapps anteriores em ${sectionConfig.title}`);
    const nextButton = createNavButton('next', `Avançar miniapps em ${sectionConfig.title}`);

    navigation.append(prevButton, nextButton);
    sectionHeader.append(sectionInfo, navigation);

    const list = document.createElement('ul');
    list.className = 'home-dashboard__miniapps carousel-list';
    list.dataset.sectionId = sectionConfig.id;
    list.setAttribute('aria-label', sectionConfig.title);
    list.dataset.emptyMessage = 'Nenhum miniapp disponível nesta seção no momento.';

    const controlsByApp = new Map();
    controlsBySection.set(sectionConfig.id, controlsByApp);

    const schedule =
      typeof window === 'object' && window && typeof window.requestAnimationFrame === 'function'
        ? window.requestAnimationFrame.bind(window)
        : (callback) => {
            setTimeout(() => {
              if (typeof callback === 'function') {
                callback();
              }
            }, 0);
          };

    const updateNavigationState = () => {
      const maxScrollLeft = Math.max(0, list.scrollWidth - list.clientWidth);
      const currentScroll = list.scrollLeft;

      prevButton.disabled = maxScrollLeft === 0 || currentScroll <= 1;
      nextButton.disabled = maxScrollLeft === 0 || currentScroll >= maxScrollLeft - 1;

      const shouldHideNavigation = maxScrollLeft === 0;
      navigation.hidden = shouldHideNavigation;
    };

    const scrollByAmount = (direction) => {
      const distance = list.clientWidth > 0 ? list.clientWidth * 0.9 : 320;
      const offset = direction === 'prev' ? -distance : distance;
      list.scrollBy({ left: offset, behavior: 'smooth' });
    };

    prevButton.addEventListener('click', () => {
      scrollByAmount('prev');
    });

    nextButton.addEventListener('click', () => {
      scrollByAmount('next');
    });

    const handleScroll = () => {
      updateNavigationState();
    };

    list.addEventListener('scroll', handleScroll, { passive: true });
    cleanupHandlers.push(() => {
      list.removeEventListener('scroll', handleScroll);
    });

    const handleResize = () => {
      schedule(updateNavigationState);
    };

    if (typeof window === 'object' && window) {
      window.addEventListener('resize', handleResize);
      cleanupHandlers.push(() => {
        window.removeEventListener('resize', handleResize);
      });
    }

    sectionsRegistry.set(sectionConfig.id, {
      config: sectionConfig,
      element: sectionElement,
      list,
      controls: controlsByApp,
      updateNavigationState: () => {
        schedule(updateNavigationState);
      },
    });

    schedule(updateNavigationState);

    sectionElement.append(sectionHeader, list);
    catalogSections.append(sectionElement);
  });

  refreshAllSections();

  catalogSection.append(catalogTitle, catalogDescription, feedback, catalogSections);
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

  const unsubscribeCatalog = subscribeMiniAppCatalog(() => {
    refreshAllSections();
  });

  if (typeof unsubscribeCatalog === 'function') {
    cleanupHandlers.push(unsubscribeCatalog);
  }
}
