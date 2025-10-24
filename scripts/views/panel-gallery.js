import { registerViewCleanup } from '../view-cleanup.js';
import { getActiveUser, subscribeSession } from '../data/session-store.js';
import { getMiniAppsSnapshot, subscribeMiniApps } from '../data/miniapp-store.js';
import {
  getUserMiniAppPreferences,
  subscribeMiniAppPreferences,
} from '../data/miniapp-preferences-store.js';
import { createPanelPreviewWidget } from './shared/panel-preview-widget.js';
import { renderHome } from './home.js';
import { renderMiniAppStore } from './miniapp-store.js';
import { renderUserPanel } from './user.js';
import { renderAdmin } from './admin.js';
import { renderAdminDesignKit } from './admin-design-kit.js';
import { renderLog } from './log.js';

const BASE_CLASSES = 'card view dashboard-view view--panel-gallery panel-gallery';

const USER_TYPES = ['administrador', 'colaborador', 'usuario'];

const PANEL_DEFINITIONS = [
  {
    id: 'home',
    view: 'home',
    title: 'Painel Início',
    label: 'home',
    description: 'Versão atual do painel principal exibido para usuários autenticados.',
    roles: ['administrador', 'colaborador', 'usuario', 'guest'],
    requiresAuth: false,
    render: renderHome,
  },
  {
    id: 'miniapps',
    view: 'miniapps',
    title: 'MiniApps',
    label: 'miniapps',
    description: 'Catálogo completo de miniapps disponíveis para cada perfil.',
    roles: ['administrador', 'colaborador', 'usuario', 'guest'],
    requiresAuth: false,
    render: renderMiniAppStore,
  },
  {
    id: 'user',
    view: 'user',
    title: 'Painel do usuário',
    label: 'user',
    description: 'Dados da conta, preferências e sincronização do usuário ativo.',
    roles: ['administrador', 'colaborador', 'usuario'],
    requiresAuth: true,
    render: renderUserPanel,
  },
  {
    id: 'admin',
    view: 'admin',
    title: 'Painel administrativo',
    label: 'admin',
    description: 'Indicadores operacionais e gestão das coleções internas.',
    roles: ['administrador'],
    requiresAuth: true,
    render: renderAdmin,
  },
  {
    id: 'admin-design-kit',
    view: 'admin-design-kit',
    title: 'Painel de design',
    label: 'design-kit',
    description: 'Catálogo de modelos homologados para superfícies, controles e feedbacks.',
    roles: ['administrador'],
    requiresAuth: true,
    render: renderAdminDesignKit,
  },
  {
    id: 'log',
    view: 'log',
    title: 'Painel do projeto',
    label: 'log',
    description: 'Registro de versões e mudanças consolidadas do MiniApp Base.',
    roles: ['administrador', 'colaborador', 'usuario', 'guest'],
    requiresAuth: false,
    render: renderLog,
  },
];

function normalizeUserType(user) {
  if (!user) {
    return 'guest';
  }

  const rawType = typeof user.userType === 'string' ? user.userType.trim().toLowerCase() : '';
  if (USER_TYPES.includes(rawType)) {
    return rawType;
  }

  return 'usuario';
}

function getAccessiblePanels(user) {
  const type = normalizeUserType(user);
  const isAuthenticated = Boolean(user);

  return PANEL_DEFINITIONS.filter((definition) => {
    if (definition.requiresAuth && !isAuthenticated) {
      return false;
    }

    return definition.roles.includes(type);
  });
}

function blockPreviewInteractions(frame) {
  if (!(frame instanceof HTMLElement)) {
    return () => {};
  }

  const events = [
    'click',
    'dblclick',
    'auxclick',
    'contextmenu',
    'submit',
    'reset',
    'keydown',
    'keyup',
    'keypress',
    'pointerdown',
    'pointerup',
    'pointerenter',
    'pointerleave',
    'touchstart',
    'touchend',
    'touchmove',
    'wheel',
  ];

  const handler = (event) => {
    if (event.type === 'keydown' && event.key !== 'Tab') {
      // Permite rolagem através do teclado quando necessário.
      return;
    }

    event.stopImmediatePropagation();
    event.preventDefault();
  };

  events.forEach((eventName) => {
    frame.addEventListener(eventName, handler, true);
  });

  frame.setAttribute('tabindex', '-1');
  frame.setAttribute('aria-hidden', 'false');
  frame.dataset.previewLocked = 'true';

  return () => {
    events.forEach((eventName) => {
      frame.removeEventListener(eventName, handler, true);
    });
  };
}

function isMiniAppAccessible(app, userType) {
  if (!app || typeof app !== 'object') {
    return false;
  }

  const accessList = Array.isArray(app.access) ? app.access : [];
  if (accessList.length === 0) {
    return true;
  }

  return accessList.includes(userType);
}

function getSavedMiniApps(user, preferences, miniApps) {
  if (!user) {
    return [];
  }

  const type = normalizeUserType(user);
  const savedIds = Array.isArray(preferences?.saved) ? preferences.saved : [];
  if (savedIds.length === 0) {
    return [];
  }

  const accessible = new Map();
  (Array.isArray(miniApps) ? miniApps : []).forEach((app) => {
    if (app && typeof app.id === 'string' && app.id.trim() !== '' && isMiniAppAccessible(app, type)) {
      accessible.set(app.id.trim(), app);
    }
  });

  const seen = new Set();
  const entries = [];

  savedIds.forEach((id) => {
    if (typeof id !== 'string') {
      return;
    }

    const normalized = id.trim();
    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    const app = accessible.get(normalized);
    if (app) {
      entries.push(app);
    }
  });

  return entries;
}

function createSection({ title, description, sectionClass = '' }) {
  const section = document.createElement('section');
  section.className = `panel-gallery__section ${sectionClass}`.trim();

  const header = document.createElement('header');
  header.className = 'panel-gallery__section-header';

  const heading = document.createElement('h2');
  heading.className = 'panel-gallery__section-title';
  heading.textContent = title;
  header.append(heading);

  if (description) {
    const subtitle = document.createElement('p');
    subtitle.className = 'panel-gallery__section-description';
    subtitle.textContent = description;
    header.append(subtitle);
  }

  const grid = document.createElement('div');
  grid.className = 'panel-gallery__grid';

  const emptyState = document.createElement('p');
  emptyState.className = 'panel-gallery__empty';
  emptyState.textContent = 'Nenhum item disponível no momento.';
  emptyState.hidden = true;

  section.append(header, grid, emptyState);

  return { section, grid, emptyState, heading, subtitle: header.lastElementChild };
}

function renderMiniAppPreview(frame, app) {
  if (!(frame instanceof HTMLElement)) {
    return;
  }

  frame.replaceChildren();

  const card = document.createElement('article');
  card.className = 'panel-miniapp-preview';

  const header = document.createElement('div');
  header.className = 'panel-miniapp-preview__header';

  const avatar = document.createElement('span');
  avatar.className = 'panel-miniapp-preview__avatar';
  avatar.setAttribute('aria-hidden', 'true');
  const nameInitial = typeof app?.name === 'string' && app.name.trim() ? app.name.trim().charAt(0).toUpperCase() : 'M';
  avatar.textContent = nameInitial;

  header.append(avatar);

  const title = document.createElement('h3');
  title.className = 'panel-miniapp-preview__title';
  title.textContent = typeof app?.name === 'string' && app.name.trim() ? app.name.trim() : 'Miniapp salvo';

  const description = document.createElement('p');
  description.className = 'panel-miniapp-preview__description';
  description.textContent =
    typeof app?.description === 'string' && app.description.trim()
      ? app.description.trim()
      : 'Descrição ainda não cadastrada para este miniapp.';

  const metaList = document.createElement('dl');
  metaList.className = 'panel-miniapp-preview__meta';

  const fields = [
    ['Categoria', typeof app?.category === 'string' && app.category.trim() ? app.category.trim() : '—'],
    ['Status', typeof app?.status === 'string' && app.status.trim() ? app.status.trim() : '—'],
    ['Versão', typeof app?.version === 'string' && app.version.trim() ? app.version.trim() : '—'],
  ];

  fields.forEach(([term, value]) => {
    if (!term || !value) {
      return;
    }

    const dt = document.createElement('dt');
    dt.className = 'panel-miniapp-preview__meta-term';
    dt.textContent = term;

    const dd = document.createElement('dd');
    dd.className = 'panel-miniapp-preview__meta-value';
    dd.textContent = value;

    metaList.append(dt, dd);
  });

  card.append(header, title, description, metaList);
  frame.append(card);
}

export function renderPanelGallery(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  const cleanupHandlers = [];
  const panelWidgetRecords = [];
  const miniAppWidgetRecords = [];

  function applyPitchColumns(grid, itemCount) {
    if (!(grid instanceof HTMLElement)) {
      return;
    }

    if (!Number.isFinite(itemCount) || itemCount <= 0) {
      grid.removeAttribute('data-pitch-columns');
      return;
    }

    let columns = 1;
    if (itemCount >= 3) {
      columns = 3;
    } else if (itemCount === 2) {
      columns = 2;
    }

    grid.dataset.pitchColumns = String(columns);
  }

  function clearRecords(records) {
    while (records.length > 0) {
      const record = records.pop();
      try {
        if (record && typeof record.destroy === 'function') {
          record.destroy();
        }
      } catch (error) {
        console.error('Erro ao limpar pré-visualização registrada.', error);
      }
    }
  }

  registerViewCleanup(viewRoot, () => {
    clearRecords(panelWidgetRecords);
    clearRecords(miniAppWidgetRecords);
    while (cleanupHandlers.length > 0) {
      const cleanup = cleanupHandlers.pop();
      try {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      } catch (error) {
        console.error('Erro ao limpar a galeria de painéis.', error);
      }
    }
  });

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout panel-gallery__layout';

  const introWidget = document.createElement('section');
  introWidget.className = 'surface-card surface-card--transparent panel-gallery__intro user-panel__widget';

  const title = document.createElement('h1');
  title.className = 'panel-gallery__title';
  title.textContent = 'Galeria de painéis';

  const introDescription = document.createElement('p');
  introDescription.className = 'panel-gallery__intro-description';
  introDescription.textContent =
    'Visualize miniaturas atualizadas de cada painel disponível e dos miniapps salvos para o seu perfil.';

  introWidget.append(title, introDescription);

  const panelsSection = createSection({
    title: 'Painéis ativos',
    description: 'Miniaturas sincronizadas com as telas liberadas para o seu perfil atual.',
    sectionClass: 'panel-gallery__section--panels',
  });

  const miniAppsSection = createSection({
    title: 'Miniapps salvos',
    description: 'Cada miniapp salvo exibe aqui uma prévia da tela inicial correspondente.',
    sectionClass: 'panel-gallery__section--miniapps',
  });

  layout.append(introWidget, panelsSection.section, miniAppsSection.section);

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'panel-gallery';
  viewRoot.setAttribute('aria-label', 'Galeria de painéis disponíveis');
  viewRoot.replaceChildren(layout);

  const state = {
    user: getActiveUser(),
    miniApps: getMiniAppsSnapshot(),
    preferences: { favorites: [], saved: [] },
  };

  function refreshPreferences() {
    if (!state.user) {
      state.preferences = { favorites: [], saved: [] };
      return;
    }

    state.preferences = getUserMiniAppPreferences(state.user.id);
  }

  refreshPreferences();

  function destroyPanelWidgets() {
    clearRecords(panelWidgetRecords);
    panelsSection.grid.replaceChildren();
    panelsSection.grid.removeAttribute('data-pitch-columns');
  }

  function destroyMiniAppWidgets() {
    clearRecords(miniAppWidgetRecords);
    miniAppsSection.grid.replaceChildren();
    miniAppsSection.grid.removeAttribute('data-pitch-columns');
  }

  function renderPanels() {
    destroyPanelWidgets();

    const panels = getAccessiblePanels(state.user);
    if (panels.length === 0) {
      panelsSection.emptyState.hidden = false;
      panelsSection.emptyState.textContent = state.user
        ? 'Nenhum painel está habilitado para o seu perfil no momento.'
        : 'Entre na sua conta para visualizar os painéis disponíveis.';
      applyPitchColumns(panelsSection.grid, 0);
      return;
    }

    panelsSection.emptyState.hidden = true;

    panels.forEach((definition) => {
      const { element, frame, setPreview, destroy } = createPanelPreviewWidget({
        title: definition.title,
        viewName: definition.view,
        viewLabel: definition.label,
        description: definition.description,
      });

      const releaseInteractions = blockPreviewInteractions(frame);

      setPreview((container) => {
        definition.render(container);
      });

      panelsSection.grid.append(element);

      panelWidgetRecords.push({
        destroy() {
          releaseInteractions();
          destroy();
        },
      });
    });

    applyPitchColumns(panelsSection.grid, panels.length);
  }

  function renderMiniApps() {
    destroyMiniAppWidgets();

    const savedApps = getSavedMiniApps(state.user, state.preferences, state.miniApps);

    if (!state.user) {
      miniAppsSection.emptyState.hidden = false;
      miniAppsSection.emptyState.textContent =
        'Faça login para carregar os miniapps salvos no seu painel.';
      applyPitchColumns(miniAppsSection.grid, 0);
      return;
    }

    if (savedApps.length === 0) {
      miniAppsSection.emptyState.hidden = false;
      miniAppsSection.emptyState.textContent =
        'Salve miniapps na loja para visualizar as prévias aqui.';
      applyPitchColumns(miniAppsSection.grid, 0);
      return;
    }

    miniAppsSection.emptyState.hidden = true;

    savedApps.forEach((app) => {
      const { element, frame, setPreview, destroy } = createPanelPreviewWidget({
        title: typeof app?.name === 'string' && app.name.trim() ? app.name.trim() : 'Miniapp salvo',
        viewName: `miniapp:${app?.id ?? ''}`,
        viewLabel: typeof app?.category === 'string' && app.category.trim() ? app.category.trim() : 'miniapp',
        description: 'Prévia da tela inicial deste miniapp salvo.',
      });

      const releaseInteractions = blockPreviewInteractions(frame);

      setPreview((container) => {
        renderMiniAppPreview(container, app);
      });

      miniAppsSection.grid.append(element);

      miniAppWidgetRecords.push({
        destroy() {
          releaseInteractions();
          destroy();
        },
      });
    });

    applyPitchColumns(miniAppsSection.grid, savedApps.length);
  }

  function updateLayout() {
    renderPanels();
    renderMiniApps();
  }

  updateLayout();

  const unsubscribeSession = subscribeSession(() => {
    state.user = getActiveUser();
    refreshPreferences();
    updateLayout();
  });

  const unsubscribeMiniApps = subscribeMiniApps(() => {
    state.miniApps = getMiniAppsSnapshot();
    updateLayout();
  });

  const unsubscribePreferences = subscribeMiniAppPreferences((payload) => {
    if (!state.user) {
      return;
    }

    const activeId = state.user?.id;
    if (payload && typeof payload.userId !== 'undefined') {
      const normalizedId = String(payload.userId ?? '');
      if (String(activeId ?? '') !== normalizedId) {
        return;
      }
    }

    refreshPreferences();
    renderMiniApps();
  });

  cleanupHandlers.push(unsubscribeSession, unsubscribeMiniApps, unsubscribePreferences);
}
