import eventBusDefault from '../events/event-bus.js';
import { registerServiceWorker as registerServiceWorkerDefault } from '../pwa/register-service-worker.js';
import { renderRegisterPanel as renderRegisterPanelDefault } from '../views/register.js';
import {
  renderMiniAppStore as renderMiniAppStoreDefault,
  normalizeMiniAppId as normalizeMiniAppIdFromStore,
  buildMiniAppDocPath as buildMiniAppDocPathFromStore,
} from '../views/miniapp-store.js';
import { renderAccountDashboard as renderAccountDashboardDefault } from '../views/account-dashboard.js';
import {
  getMiniAppsSnapshot as getMiniAppsSnapshotDefault,
  subscribeMiniApps as subscribeMiniAppsDefault,
} from '../data/miniapp-store.js';

const APP_QUERY_PARAM = 'app';
const VIEW_CLEANUP_KEY = '__viewCleanup';

export const normalizeMiniAppId = normalizeMiniAppIdFromStore;
export const buildMiniAppDocPath = buildMiniAppDocPathFromStore;

let preferencesPanelModulePromise = null;

async function openPreferencesPanelLazy({ doc, win } = {}) {
  try {
    if (!preferencesPanelModulePromise) {
      preferencesPanelModulePromise = import('../../components/preferences/panel.js');
    }

    const module = await preferencesPanelModulePromise;
    if (!module || typeof module.openPreferencesPanel !== 'function') {
      throw new Error('Módulo do painel de preferências indisponível.');
    }

    await module.openPreferencesPanel({ document: doc, window: win });
  } catch (error) {
    console.error('Não foi possível abrir o painel de preferências.', error);
  }
}

function resolveRuntime(input = {}) {
  if (input && typeof input === 'object' && input.document && !input.window) {
    return { ...input, window: input.window ?? input };
  }

  if (input && typeof input === 'object' && !input.window && input.defaultView) {
    return { document: input, window: input.defaultView };
  }

  if (input && typeof input === 'object') {
    return input;
  }

  return {};
}

function getDocument(runtime) {
  if (runtime.document) {
    return runtime.document;
  }

  if (runtime.window && runtime.window.document) {
    return runtime.window.document;
  }

  if (typeof document !== 'undefined') {
    return document;
  }

  return null;
}

function getWindow(runtime) {
  if (runtime.window) {
    return runtime.window;
  }

  if (typeof window !== 'undefined') {
    return window;
  }

  return null;
}

function focusWithoutScreenShift(doc, win, element) {
  const HTMLElementRef = doc?.defaultView?.HTMLElement ?? (typeof HTMLElement !== 'undefined' ? HTMLElement : null);
  if (!HTMLElementRef || !(element instanceof HTMLElementRef)) {
    return;
  }

  const scrollingElement = doc.scrollingElement;
  const previousScrollTop = scrollingElement ? scrollingElement.scrollTop : win?.scrollY ?? 0;
  const previousScrollLeft = scrollingElement ? scrollingElement.scrollLeft : win?.scrollX ?? 0;

  try {
    element.focus({ preventScroll: true });
  } catch (error) {
    element.focus();
  }

  const nextScrollTop = scrollingElement ? scrollingElement.scrollTop : win?.scrollY ?? 0;
  const nextScrollLeft = scrollingElement ? scrollingElement.scrollLeft : win?.scrollX ?? 0;

  if (nextScrollTop !== previousScrollTop || nextScrollLeft !== previousScrollLeft) {
    if (scrollingElement && typeof scrollingElement.scrollTo === 'function') {
      scrollingElement.scrollTo({ top: previousScrollTop, left: previousScrollLeft });
    } else if (win && typeof win.scrollTo === 'function') {
      win.scrollTo(previousScrollLeft, previousScrollTop);
    }
  }
}

function normalizeOptions(options) {
  const runtime = resolveRuntime(options);
  const doc = getDocument(runtime);
  const win = getWindow(runtime);
  const queueTask =
    typeof runtime.queueMicrotask === 'function'
      ? runtime.queueMicrotask
      : typeof queueMicrotask === 'function'
      ? queueMicrotask
      : (cb) => Promise.resolve().then(cb);

  return {
    doc,
    win,
    queueTask,
    eventBus: runtime.eventBus ?? eventBusDefault,
    registerServiceWorker: runtime.registerServiceWorker ?? registerServiceWorkerDefault,
    renderRegisterPanel: runtime.renderRegisterPanel ?? renderRegisterPanelDefault,
    renderMiniAppStore: runtime.renderMiniAppStore ?? renderMiniAppStoreDefault,
    renderAccountDashboard: runtime.renderAccountDashboard ?? renderAccountDashboardDefault,
    getMiniAppsSnapshot: runtime.getMiniAppsSnapshot ?? getMiniAppsSnapshotDefault,
    subscribeMiniApps: runtime.subscribeMiniApps ?? subscribeMiniAppsDefault,
    fetch: runtime.fetch ?? win?.fetch ?? (typeof fetch === 'function' ? fetch : null),
    URL: runtime.URL ?? win?.URL ?? (typeof URL !== 'undefined' ? URL : null),
  };
}

function ensureHtmlElement(doc, element) {
  const HTMLElementRef = doc?.defaultView?.HTMLElement ?? (typeof HTMLElement !== 'undefined' ? HTMLElement : null);
  return Boolean(HTMLElementRef) && element instanceof HTMLElementRef;
}

export function findMiniAppById(id, { getMiniAppsSnapshot = getMiniAppsSnapshotDefault } = {}) {
  const normalized = normalizeMiniAppId(id);
  if (!normalized) {
    return null;
  }

  try {
    return (
      getMiniAppsSnapshot().find((app) => normalizeMiniAppId(app?.id) === normalized) ?? null
    );
  } catch (error) {
    console.error('Erro ao localizar MiniApp pelo id.', error);
    return null;
  }
}

export function openMiniAppShortcut(
  id,
  { window: win = typeof window !== 'undefined' ? window : null, getMiniAppsSnapshot = getMiniAppsSnapshotDefault } = {},
) {
  const normalized = normalizeMiniAppId(id);
  if (!normalized) {
    return false;
  }

  const target = findMiniAppById(normalized, { getMiniAppsSnapshot });
  if (!target) {
    return false;
  }

  const docPath = buildMiniAppDocPath(normalized);
  if (!docPath || !win?.location) {
    return false;
  }

  try {
    win.location.replace(docPath);
    return true;
  } catch (error) {
    console.error('Não foi possível abrir o atalho do MiniApp.', error);
    return false;
  }
}

export function initAuthShell(options = {}) {
  const runtime = normalizeOptions(options);
  const { doc, win } = runtime;

  if (!doc) {
    throw new Error('initAuthShell requer um objeto document.');
  }

  const HTMLElementRef = doc.defaultView?.HTMLElement ?? (typeof HTMLElement !== 'undefined' ? HTMLElement : null);
  const KeyboardEventRef = doc.defaultView?.KeyboardEvent ?? (typeof KeyboardEvent !== 'undefined' ? KeyboardEvent : null);
  const NodeRef = doc.defaultView?.Node ?? (typeof Node !== 'undefined' ? Node : null);
  const HTMLInputElementRef =
    doc.defaultView?.HTMLInputElement ?? (typeof HTMLInputElement !== 'undefined' ? HTMLInputElement : null);

  const viewRoot = doc.getElementById('authViewRoot');
  const authCard = doc.querySelector('.auth-card');
  const selector = doc.querySelector('.auth-selector');
  const selectorButtons = Array.from(doc.querySelectorAll('.auth-selector__button'));
  const statusHint = doc.getElementById('statusHint');
  const footer = doc.querySelector('.auth-shell__footer');
  const footerMenu = doc.querySelector('.auth-shell__footer-nav');
  const footerMenuButton = doc.querySelector('.auth-shell__menu-button');
  const footerMenuPanel = doc.getElementById('authFooterMenu');
  const footerMenuOverlay = doc.querySelector('[data-menu-overlay]');
  const footerMenuLabel = footerMenuButton?.querySelector('[data-menu-button-label]');
  const footerToggle = doc.querySelector('[data-footer-toggle]');
  const footerActiveViewLabel = doc.querySelector('[data-active-view-label]');
  const footerActiveViewDivider = doc.querySelector('[data-active-view-divider]');
  const footerMenuViewsList = footerMenuPanel?.querySelector('[data-menu-group="views"]');
  const footerMenuMiniAppsTitle = footerMenuPanel?.querySelector('[data-menu-title="miniapps"]');
  const footerMenuMiniAppsEmpty = footerMenuPanel?.querySelector('[data-menu-empty="miniapps"]');
  const footerMenuMiniAppsList = footerMenuPanel?.querySelector('[data-menu-group="miniapps"]');
  const footerMenuMiniAppsDivider = footerMenuPanel?.querySelector('.auth-shell__menu-divider');
  const widgetBoard = doc.querySelector('[data-widget-board]');
  const widgetGrid = widgetBoard?.querySelector('[data-widget-grid]');
  const widgetEmptyState = widgetBoard?.querySelector('[data-widget-empty]');
  const footerViewportQuery =
    typeof win?.matchMedia === 'function' ? win.matchMedia('(max-width: 48rem)') : null;
  const ResizeObserverRef = win?.ResizeObserver ?? (typeof ResizeObserver !== 'undefined' ? ResizeObserver : null);
  const BodyElementRef = doc.defaultView?.HTMLBodyElement ?? (typeof HTMLBodyElement !== 'undefined' ? HTMLBodyElement : null);
  const rootElement = doc.body && (!BodyElementRef || doc.body instanceof BodyElementRef) ? doc.body : null;
  const FOOTER_TOGGLE_LABELS = {
    expand: 'Mostrar detalhes do rodapé',
    collapse: 'Ocultar detalhes do rodapé',
  };

  const FOOTER_MENU_STRUCTURE = [
    {
      id: 'shell-access',
      label: 'Shell principal',
      types: [
        {
          id: 'guided-journeys',
          label: 'Jornadas guiadas',
          entries: [
            {
              id: 'view-guest',
              label: 'Explorar como convidado',
              description: 'Acesse os MiniApps liberados para visitantes sem cadastro.',
              view: 'guest',
              widgetId: 'widget-guest-overview',
              widgetTitle: 'Explorar como convidado',
              widgetDescription: 'Lista os MiniApps liberados e os destaques para visitantes.',
            },
            {
              id: 'view-miniapps',
              label: 'MiniApp Store',
              description: 'Abra o catálogo completo com destaques das miniaplicações ativas.',
              view: 'miniapps',
              widgetId: 'widget-miniapp-store',
              widgetTitle: 'Catálogo de MiniApps',
              widgetDescription: 'Acompanhe novidades, destaques e jornadas do catálogo oficial.',
            },
          ],
        },
        {
          id: 'account-management',
          label: 'Conta e segurança',
          entries: [
            {
              id: 'view-register',
              label: 'Criar uma nova conta',
              description: 'Inicie o cadastro com validações assistidas e etapas orientadas.',
              view: 'register',
              widgetId: 'widget-register-flow',
              widgetTitle: 'Cadastro rápido',
              widgetDescription: 'Resumo das etapas do fluxo de cadastro e próximos passos sugeridos.',
            },
            {
              id: 'view-account-dashboard',
              label: 'Painel da conta',
              description: 'Gerencie cadastros locais, sessões e limpeza de dados neste dispositivo.',
              view: 'account-dashboard',
              widgetId: 'widget-account-dashboard',
              widgetTitle: 'Painel da conta',
              widgetDescription: 'Monitore dados armazenados localmente e ações de manutenção de sessão.',
            },
          ],
        },
      ],
    },
    {
      id: 'preferences',
      label: 'Configurações',
      types: [
        {
          id: 'personalization',
          label: 'Preferências e acessibilidade',
          entries: [
            {
              id: 'action-preferences',
              label: 'Preferências do usuário',
              description: 'Ajuste tema, idioma e privacidade específicos deste dispositivo.',
              action: 'preferences',
              widgetId: 'widget-preferences',
              widgetTitle: 'Preferências do shell',
              widgetDescription: 'Centraliza atalhos de idioma, acessibilidade e privacidade.',
            },
          ],
        },
      ],
    },
  ];

  const FOOTER_WIDGET_LIBRARY = new Map();

  FOOTER_MENU_STRUCTURE.forEach((category) => {
    category.types.forEach((type) => {
      type.entries.forEach((entry) => {
        if (!entry.widgetId || FOOTER_WIDGET_LIBRARY.has(entry.widgetId)) {
          return;
        }

        FOOTER_WIDGET_LIBRARY.set(entry.widgetId, {
          id: entry.widgetId,
          label: entry.label,
          title: entry.widgetTitle ?? entry.label,
          description: entry.widgetDescription ?? entry.description ?? '',
          view: entry.view ?? null,
          action: entry.action ?? null,
          categoryId: category.id,
          categoryLabel: category.label,
          typeId: type.id,
          typeLabel: type.label,
        });
      });
    });
  });

  if (!ensureHtmlElement(doc, viewRoot)) {
    throw new Error('Elemento raiz da view de autenticação não encontrado.');
  }

  if (ensureHtmlElement(doc, footerMenuPanel) && !footerMenuPanel.hasAttribute('tabindex')) {
    footerMenuPanel.tabIndex = -1;
  }

  const teardownCallbacks = [];
  const activeWidgetIds = new Set();
  let footerMenuOpen = false;
  let footerDetailsExpanded = false;

  const FOOTER_OFFSET_TOKEN = '--layout-footer-offset';

  function applyFooterOffset(value) {
    if (!rootElement) {
      return;
    }

    const style = rootElement.style;

    if (style && typeof style.setProperty === 'function') {
      style.setProperty(FOOTER_OFFSET_TOKEN, value);
      return;
    }

    if (style && typeof style === 'object') {
      style[FOOTER_OFFSET_TOKEN] = value;
      return;
    }

    if (typeof rootElement.getAttribute === 'function' && typeof rootElement.setAttribute === 'function') {
      const existing = rootElement.getAttribute('style') ?? '';
      const filtered = existing
        .split(';')
        .map((entry) => entry.trim())
        .filter((entry) => entry && !entry.startsWith(`${FOOTER_OFFSET_TOKEN}:`));
      filtered.push(`${FOOTER_OFFSET_TOKEN}: ${value}`);
      rootElement.setAttribute('style', `${filtered.join('; ')};`);
    }
  }

  function clearFooterOffset() {
    if (!rootElement) {
      return;
    }

    const style = rootElement.style;

    if (style && typeof style.removeProperty === 'function') {
      style.removeProperty(FOOTER_OFFSET_TOKEN);
      return;
    }

    if (style && typeof style === 'object') {
      delete style[FOOTER_OFFSET_TOKEN];
      return;
    }

    if (typeof rootElement.getAttribute === 'function' && typeof rootElement.setAttribute === 'function') {
      const existing = rootElement.getAttribute('style');
      if (!existing) {
        return;
      }

      const filtered = existing
        .split(';')
        .map((entry) => entry.trim())
        .filter((entry) => entry && !entry.startsWith(`${FOOTER_OFFSET_TOKEN}:`));

      if (filtered.length > 0) {
        rootElement.setAttribute('style', `${filtered.join('; ')};`);
      } else {
        rootElement.removeAttribute('style');
      }
    }
  }

  function updateFooterOffset() {
    if (!rootElement || !ensureHtmlElement(doc, footer)) {
      return;
    }

    const isMobileViewport = Boolean(footerViewportQuery?.matches);
    const footerRect = isMobileViewport ? footer.getBoundingClientRect() : null;
    const footerHeight = footerRect ? Math.ceil(footerRect.height) : 0;

    if (footerHeight > 0) {
      applyFooterOffset(`${footerHeight}px`);
    } else {
      clearFooterOffset();
    }
  }

  function setFooterDetailsExpanded(isExpanded) {
    footerDetailsExpanded = Boolean(isExpanded);

    if (ensureHtmlElement(doc, footer)) {
      if (footerDetailsExpanded) {
        footer.setAttribute('data-footer-expanded', 'true');
      } else {
        footer.removeAttribute('data-footer-expanded');
      }
    }

    if (ensureHtmlElement(doc, footerToggle)) {
      footerToggle.setAttribute('aria-expanded', footerDetailsExpanded ? 'true' : 'false');
      footerToggle.setAttribute(
        'aria-label',
        footerDetailsExpanded ? FOOTER_TOGGLE_LABELS.collapse : FOOTER_TOGGLE_LABELS.expand,
      );
    }

    updateFooterOffset();
  }

  function collapseFooterDetails() {
    setFooterDetailsExpanded(false);
  }

  function syncFooterToggleVisibility() {
    if (ensureHtmlElement(doc, footerToggle)) {
      footerToggle.hidden = false;
      footerToggle.removeAttribute('aria-hidden');
    }

    updateFooterOffset();
  }

  collapseFooterDetails();
  syncFooterToggleVisibility();

  if (footerViewportQuery) {
    const handleFooterViewportChange = () => {
      syncFooterToggleVisibility();
    };

    if (typeof footerViewportQuery.addEventListener === 'function') {
      footerViewportQuery.addEventListener('change', handleFooterViewportChange);
      teardownCallbacks.push(() => {
        footerViewportQuery.removeEventListener('change', handleFooterViewportChange);
      });
    } else if (typeof footerViewportQuery.addListener === 'function') {
      footerViewportQuery.addListener(handleFooterViewportChange);
      teardownCallbacks.push(() => {
        footerViewportQuery.removeListener(handleFooterViewportChange);
      });
    }
  } else if (ensureHtmlElement(doc, footerToggle)) {
    footerToggle.hidden = false;
    footerToggle.removeAttribute('aria-hidden');
  }

  if (ensureHtmlElement(doc, footerToggle)) {
    const handleFooterToggleClick = () => {
      setFooterDetailsExpanded(!footerDetailsExpanded);
    };

    const handleFooterToggleKeydown = (event) => {
      if (!KeyboardEventRef || !(event instanceof KeyboardEventRef)) {
        return;
      }

      if (event.key === 'Escape' && footerDetailsExpanded) {
        event.preventDefault();
        collapseFooterDetails();
      }
    };

    footerToggle.addEventListener('click', handleFooterToggleClick);
    footerToggle.addEventListener('keydown', handleFooterToggleKeydown);

    teardownCallbacks.push(() => {
      footerToggle.removeEventListener('click', handleFooterToggleClick);
      footerToggle.removeEventListener('keydown', handleFooterToggleKeydown);
    });
  }

  if (ensureHtmlElement(doc, footer) && ResizeObserverRef) {
    const footerObserver = new ResizeObserverRef(() => {
      updateFooterOffset();
    });

    footerObserver.observe(footer);

    teardownCallbacks.push(() => {
      footerObserver.disconnect();
    });
  }

  if (rootElement) {
    teardownCallbacks.push(() => {
      clearFooterOffset();
    });
  }

  function getFooterMenuItems() {
    if (!(footerMenuPanel instanceof HTMLElementRef)) {
      return [];
    }

    return Array.from(footerMenuPanel.querySelectorAll('.auth-shell__menu-item')).filter(
      (item) => item instanceof HTMLElementRef && !item.disabled,
    );
  }

  function setFooterMenuState(isOpen) {
    if (ensureHtmlElement(doc, footerMenu)) {
      footerMenu.dataset.state = isOpen ? 'open' : 'closed';
    }

    if (ensureHtmlElement(doc, footerMenuButton)) {
      footerMenuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    if (ensureHtmlElement(doc, footerMenuPanel)) {
      footerMenuPanel.hidden = !isOpen;
    }

    if (ensureHtmlElement(doc, footerMenuOverlay)) {
      footerMenuOverlay.hidden = !isOpen;
    }

    if (doc.body instanceof (doc.defaultView?.HTMLBodyElement ?? (typeof HTMLBodyElement !== 'undefined' ? HTMLBodyElement : HTMLElementRef))) {
      doc.body.classList.toggle('auth-shell--menu-open', isOpen);
    }

    updateFooterOffset();
  }

  const footerMenuListeners = new Set();

  function registerFooterMenuListener(remove) {
    if (typeof remove === 'function') {
      remove.__footerMenuListener = true;
      footerMenuListeners.add(remove);
      teardownCallbacks.push(remove);
    }
  }

  function cleanupFooterMenuListeners() {
    footerMenuListeners.forEach((remove) => {
      try {
        remove();
      } catch (error) {
        console.error('Erro ao remover listener do menu do rodapé.', error);
      }

      const index = teardownCallbacks.indexOf(remove);
      if (index >= 0) {
        teardownCallbacks.splice(index, 1);
      }
    });
    footerMenuListeners.clear();
  }

  function closeFooterMenu({ focusToggle = false } = {}) {
    if (!footerMenuOpen) {
      return;
    }

    footerMenuOpen = false;
    setFooterMenuState(false);

    cleanupFooterMenuListeners();

    if (focusToggle && ensureHtmlElement(doc, footerMenuButton)) {
      focusWithoutScreenShift(doc, win, footerMenuButton);
    }
  }

  function focusFooterMenuItemByOffset(currentIndex, offset) {
    const items = getFooterMenuItems();

    if (!items.length) {
      return;
    }

    const normalizedIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (normalizedIndex + offset + items.length) % items.length;
    const nextItem = items[nextIndex];

    if (nextItem) {
      focusWithoutScreenShift(doc, win, nextItem);
    }
  }

  function handleFooterMenuItemKeydown(event) {
    if (!KeyboardEventRef || !(event instanceof KeyboardEventRef)) {
      return;
    }

    const target = event.target instanceof HTMLElementRef ? event.target.closest('.auth-shell__menu-item') : null;

    if (!(target instanceof HTMLElementRef)) {
      return;
    }

    const items = getFooterMenuItems();
    const currentIndex = items.indexOf(target);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusFooterMenuItemByOffset(currentIndex, 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusFooterMenuItemByOffset(currentIndex, -1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusFooterMenuItemByOffset(0, 0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusFooterMenuItemByOffset(items.length - 1, 0);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeFooterMenu({ focusToggle: true });
    }
  }

  function registerFooterMenuListeners(listeners) {
    listeners.forEach(({ target, type, handler, options }) => {
      if (!target || typeof target.addEventListener !== 'function') {
        return;
      }

      target.addEventListener(type, handler, options);

      const remove = () => {
        target.removeEventListener(type, handler, options);
      };

      registerFooterMenuListener(remove);
    });
  }

  function openFooterMenu({ focus = 'first' } = {}) {
    if (footerMenuOpen) {
      return;
    }

    collapseFooterDetails();
    footerMenuOpen = true;
    setFooterMenuState(true);

    const handlePointerDown = (event) => {
      if (!NodeRef || !(event.target instanceof NodeRef)) {
        return;
      }

      const isInsidePanel = ensureHtmlElement(doc, footerMenuPanel) && footerMenuPanel.contains(event.target);
      const isToggle = ensureHtmlElement(doc, footerMenuButton) && footerMenuButton.contains(event.target);

      if (!isInsidePanel && !isToggle) {
        closeFooterMenu();
      }
    };

    const handleFocusIn = (event) => {
      if (!NodeRef || !(event.target instanceof NodeRef)) {
        return;
      }

      const isInsidePanel = ensureHtmlElement(doc, footerMenuPanel) && footerMenuPanel.contains(event.target);
      const isToggle = ensureHtmlElement(doc, footerMenuButton) && footerMenuButton.contains(event.target);

      if (!isInsidePanel && !isToggle) {
        closeFooterMenu();
      }
    };

    const handleKeydown = (event) => {
      if (KeyboardEventRef && event instanceof KeyboardEventRef && event.key === 'Escape') {
        event.preventDefault();
        closeFooterMenu({ focusToggle: true });
      }
    };

    registerFooterMenuListeners([
      { target: doc, type: 'pointerdown', handler: handlePointerDown },
      { target: doc, type: 'focusin', handler: handleFocusIn },
      { target: doc, type: 'keydown', handler: handleKeydown },
    ]);

    const items = getFooterMenuItems();

    if (!items.length) {
      if (ensureHtmlElement(doc, footerMenuPanel)) {
        focusWithoutScreenShift(doc, win, footerMenuPanel);
      }
      return;
    }

    let targetItem = items[0];

    if (focus === 'last') {
      targetItem = items[items.length - 1];
    }

    if (targetItem) {
      focusWithoutScreenShift(doc, win, targetItem);
    }
  }

  function toggleFooterMenu() {
    if (footerMenuOpen) {
      closeFooterMenu({ focusToggle: true });
    } else {
      openFooterMenu();
    }
  }

  function setActiveFooterMenuItem(viewName) {
    const items = getFooterMenuItems();
    let activeLabel = '';

    items.forEach((item) => {
      if (!(item instanceof HTMLElementRef)) {
        return;
      }

      const isActive = item.dataset.view === viewName;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-current', isActive ? 'page' : 'false');

      if (isActive) {
        const categoryId = item.dataset.categoryId;
        const typeId = item.dataset.typeId;

        if (categoryId) {
          expandedCategories.add(categoryId);

          if (footerMenuViewsList instanceof HTMLElementRef) {
            const categoryToggle = footerMenuViewsList.querySelector(
              `[data-category-toggle="${categoryId}"]`,
            );
            const categoryContent = footerMenuViewsList.querySelector(
              `[data-category-content="${categoryId}"]`,
            );

            if (ensureHtmlElement(doc, categoryToggle)) {
              categoryToggle.setAttribute('aria-expanded', 'true');
            }

            if (ensureHtmlElement(doc, categoryContent)) {
              categoryContent.hidden = false;
            }
          }
        }

        if (categoryId && typeId) {
          const typeKey = getTypeKey(categoryId, typeId);
          expandedTypes.add(typeKey);

          if (footerMenuViewsList instanceof HTMLElementRef) {
            const typeToggle = footerMenuViewsList.querySelector(`[data-type-toggle="${typeKey}"]`);
            const typeContent = footerMenuViewsList.querySelector(`[data-type-content="${typeKey}"]`);

            if (ensureHtmlElement(doc, typeToggle)) {
              typeToggle.setAttribute('aria-expanded', 'true');
            }

            if (ensureHtmlElement(doc, typeContent)) {
              typeContent.hidden = false;
            }
          }
        }

        activeLabel = item.textContent?.trim() || '';
      }
    });

    if (ensureHtmlElement(doc, footerMenuLabel)) {
      footerMenuLabel.textContent = activeLabel
        ? `Menu principal — painel atual: ${activeLabel}`
        : 'Menu principal';
    }

    if (ensureHtmlElement(doc, footerActiveViewLabel)) {
      if (activeLabel) {
        footerActiveViewLabel.textContent = `Painel atual: ${activeLabel}`;
        footerActiveViewLabel.hidden = false;
      } else {
        footerActiveViewLabel.textContent = '';
        footerActiveViewLabel.hidden = true;
      }
    }

    if (ensureHtmlElement(doc, footerActiveViewDivider)) {
      footerActiveViewDivider.hidden = !activeLabel;
    }

    if (ensureHtmlElement(doc, footerMenuButton)) {
      footerMenuButton.setAttribute(
        'aria-label',
        activeLabel ? `Abrir menu principal. Painel atual: ${activeLabel}` : 'Abrir menu principal',
      );
    }
  }

  function renderGuestAccessPanel(root, options = {}) {
    if (!(root instanceof HTMLElementRef)) {
      return;
    }

    root.className = 'card view auth-view view--guest';
    root.dataset.view = 'guest';

    const panel = doc.createElement('section');
    panel.className = 'auth-panel__form guest-panel';

    const highlightAppId = normalizeMiniAppId(options.highlightAppId);
    let highlightedLink = null;
    let highlightedApp = null;

    const title = doc.createElement('h2');
    title.className = 'auth-panel__title guest-panel__title';
    title.textContent = 'MiniApps gratuitos';

    const intro = doc.createElement('p');
    intro.className = 'auth-panel__intro guest-panel__intro';
    intro.textContent =
      'Explore uma seleção de MiniApps liberados sem cadastro. Você pode abrir e testar imediatamente.';

    const list = doc.createElement('ul');
    list.className = 'guest-panel__list';

    const snapshot = runtime.getMiniAppsSnapshot();
    const guestApps = Array.isArray(snapshot) ? snapshot : [];

    guestApps
      .filter((app) => normalizeMiniAppId(app?.id))
      .filter(
        (app) =>
          Array.isArray(app?.access) &&
          app.access.includes('usuario') &&
          String(app?.status ?? '').trim().toLowerCase() === 'active',
      )
      .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'pt-BR'))
      .forEach((app) => {
        const item = doc.createElement('li');
        item.className = 'guest-panel__item';

        const appTitle = doc.createElement('strong');
        appTitle.className = 'guest-panel__app-name';
        appTitle.textContent = app?.name ?? 'MiniApp';

        const description = doc.createElement('p');
        description.className = 'guest-panel__app-description';
        description.textContent =
          typeof app?.description === 'string' && app.description.trim() !== ''
            ? app.description.trim()
            : 'MiniApp ativo disponível para convidados.';

        const link = doc.createElement('a');
        link.className = 'guest-panel__cta';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        const appId = normalizeMiniAppId(app?.id);
        if (!appId) {
          return;
        }

        item.dataset.appId = appId;
        link.href = buildMiniAppDocPath(appId) || '#';
        link.textContent = 'Abrir documentação do MiniApp';
        link.title = `Ver detalhes do MiniApp ${appTitle.textContent}`;

        if (appId === highlightAppId) {
          item.classList.add('guest-panel__item--active');
          highlightedLink = link;
          highlightedApp = app;
        }

        item.append(appTitle, description, link);
        list.append(item);
      });

    const note = doc.createElement('p');
    note.className = 'guest-panel__note';
    note.textContent =
      'Para salvar progresso e sincronizar preferências entre dispositivos, crie uma conta quando estiver pronto.';

    panel.append(title, intro, list, note);
    root.replaceChildren(panel);

    if (highlightedLink) {
      runtime.queueTask(() => {
        try {
          highlightedLink.focus();
        } catch (error) {
          console.warn('Não foi possível focar o atalho solicitado.', error);
        }
      });

      if (typeof options.onHighlight === 'function') {
        options.onHighlight({ app: highlightedApp, link: highlightedLink, id: highlightAppId });
      }
    }
  }

  const VIEW_RENDERERS = {
    register: {
      render: runtime.renderRegisterPanel,
      hint: 'Preencha os dados abaixo para criar sua conta com segurança.',
    },
    guest: {
      render: renderGuestAccessPanel,
      hint: 'Conheça os MiniApps liberados para convidados sem precisar de credenciais.',
    },
    miniapps: {
      render: runtime.renderMiniAppStore,
      hint: 'Explore o catálogo completo de MiniApps e abra as documentações disponíveis.',
    },
    'account-dashboard': {
      render: runtime.renderAccountDashboard,
      hint: 'Gerencie cadastros locais, revise detalhes e limpe dados salvos neste dispositivo.',
    },
  };

  let currentView = null;
  const expandedCategories = new Set();
  const expandedTypes = new Set();

  function getTypeKey(categoryId, typeId) {
    return `${categoryId}::${typeId}`;
  }

  if (FOOTER_MENU_STRUCTURE.length > 0) {
    const firstCategory = FOOTER_MENU_STRUCTURE[0];
    if (firstCategory?.id) {
      expandedCategories.add(firstCategory.id);
      const firstType = Array.isArray(firstCategory.types) ? firstCategory.types[0] : null;
      if (firstType?.id) {
        expandedTypes.add(getTypeKey(firstCategory.id, firstType.id));
      }
    }
  }

  function renderFooterViewItems() {
    if (!(footerMenuViewsList instanceof HTMLElementRef)) {
      return;
    }

    const fragment = doc.createDocumentFragment();

    FOOTER_MENU_STRUCTURE.forEach((category) => {
      const categoryItem = doc.createElement('li');
      categoryItem.className = 'auth-shell__menu-category';

      const categoryToggle = doc.createElement('button');
      categoryToggle.type = 'button';
      categoryToggle.className = 'auth-shell__menu-category-title auth-shell__menu-category-toggle';
      categoryToggle.dataset.categoryToggle = category.id;
      categoryToggle.textContent = category.label;

      const categoryContentId = `authFooterMenuCategory-${category.id}`;
      categoryToggle.setAttribute('aria-controls', categoryContentId);

      const categoryContent = doc.createElement('div');
      categoryContent.id = categoryContentId;
      categoryContent.className = 'auth-shell__menu-category-content';
      categoryContent.dataset.categoryContent = category.id;

      const isCategoryExpanded = expandedCategories.has(category.id);
      categoryToggle.setAttribute('aria-expanded', isCategoryExpanded ? 'true' : 'false');
      categoryContent.hidden = !isCategoryExpanded;

      categoryToggle.addEventListener('click', () => {
        const currentlyExpanded = expandedCategories.has(category.id);
        if (currentlyExpanded) {
          expandedCategories.delete(category.id);
        } else {
          expandedCategories.add(category.id);
        }

        categoryToggle.setAttribute('aria-expanded', currentlyExpanded ? 'false' : 'true');
        categoryContent.hidden = currentlyExpanded;
      });

      category.types.forEach((type) => {
        const typeSection = doc.createElement('section');
        typeSection.className = 'auth-shell__menu-type';

        const typeKey = getTypeKey(category.id, type.id);
        const typeToggle = doc.createElement('button');
        typeToggle.type = 'button';
        typeToggle.className = 'auth-shell__menu-type-title auth-shell__menu-type-toggle';
        typeToggle.dataset.typeToggle = typeKey;
        typeToggle.textContent = type.label;

        const typeContentId = `authFooterMenuType-${category.id}-${type.id}`;
        typeToggle.setAttribute('aria-controls', typeContentId);

        const typeContent = doc.createElement('div');
        typeContent.id = typeContentId;
        typeContent.className = 'auth-shell__menu-type-content';
        typeContent.dataset.typeContent = typeKey;

        const isTypeExpanded = expandedTypes.has(typeKey);
        typeToggle.setAttribute('aria-expanded', isTypeExpanded ? 'true' : 'false');
        typeContent.hidden = !isTypeExpanded;

        typeToggle.addEventListener('click', () => {
          const currentlyExpanded = expandedTypes.has(typeKey);
          if (currentlyExpanded) {
            expandedTypes.delete(typeKey);
          } else {
            expandedTypes.add(typeKey);
          }

          typeToggle.setAttribute('aria-expanded', currentlyExpanded ? 'false' : 'true');
          typeContent.hidden = currentlyExpanded;
        });

        const sublist = doc.createElement('ul');
        sublist.className = 'auth-shell__menu-sublist';

        type.entries.forEach((entry) => {
          const entryItem = doc.createElement('li');
          entryItem.className = 'auth-shell__menu-entry';

          const button = doc.createElement('button');
          button.type = 'button';
          button.className = 'auth-shell__menu-item';
          button.dataset.categoryId = category.id;
          button.dataset.typeId = type.id;
          button.textContent = entry.label;

          if (entry.view) {
            button.dataset.view = entry.view;
          }

          if (entry.action) {
            button.dataset.action = entry.action;
          }

          if (entry.widgetId) {
            button.dataset.widgetId = entry.widgetId;
          }

          let descriptionId = null;

          if (entry.description) {
            descriptionId = `${entry.id}-description`;
            button.setAttribute('aria-describedby', descriptionId);
          }

          entryItem.append(button);

          if (entry.description) {
            const description = doc.createElement('p');
            description.id = descriptionId;
            description.className = 'auth-shell__menu-item-description';
            description.textContent = entry.description;
            entryItem.append(description);
          }

          if (entry.widgetId) {
            const toggle = doc.createElement('label');
            toggle.className = 'auth-shell__menu-toggle';

            const checkbox = doc.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'auth-shell__menu-toggle-input';
            checkbox.dataset.widgetToggle = entry.widgetId;
            checkbox.checked = activeWidgetIds.has(entry.widgetId);

            const toggleText = doc.createElement('span');
            toggleText.className = 'auth-shell__menu-toggle-label';
            toggleText.textContent = 'Fixar no painel principal';

            toggle.append(checkbox, toggleText);
            entryItem.append(toggle);
          }

          sublist.append(entryItem);
        });

        typeContent.append(sublist);
        typeSection.append(typeToggle, typeContent);
        categoryContent.append(typeSection);
      });

      categoryItem.append(categoryToggle, categoryContent);
      fragment.append(categoryItem);
    });

    footerMenuViewsList.replaceChildren(fragment);
    setActiveFooterMenuItem(currentView);
  }

  function renderFooterMiniAppItems(apps) {
    if (!(footerMenuMiniAppsList instanceof HTMLElementRef)) {
      return;
    }

    footerMenuMiniAppsList.replaceChildren();

    const normalized = Array.isArray(apps)
      ? apps
          .filter(
            (app) =>
              app &&
              Array.isArray(app.access) &&
              app.access.includes('usuario') &&
              String(app.status ?? '').trim().toLowerCase() === 'active',
          )
          .map((app) => ({
            id: normalizeMiniAppId(app.id),
            name: typeof app.name === 'string' && app.name.trim() ? app.name.trim() : 'MiniApp ativo',
          }))
          .filter((entry) => entry.id)
          .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      : [];

    if (ensureHtmlElement(doc, footerMenuMiniAppsTitle)) {
      footerMenuMiniAppsTitle.hidden = normalized.length === 0;
    }

    if (ensureHtmlElement(doc, footerMenuMiniAppsEmpty)) {
      footerMenuMiniAppsEmpty.hidden = normalized.length > 0;
    }

    if (ensureHtmlElement(doc, footerMenuMiniAppsList)) {
      footerMenuMiniAppsList.hidden = normalized.length === 0;
    }

    if (ensureHtmlElement(doc, footerMenuMiniAppsDivider)) {
      footerMenuMiniAppsDivider.hidden = normalized.length === 0;
    }

    if (normalized.length === 0) {
      return;
    }

    const items = normalized.map((entry) => {
      const listItem = doc.createElement('li');
      const button = doc.createElement('button');
      button.type = 'button';
      button.className = 'auth-shell__menu-item auth-shell__menu-item--miniapp';
      button.dataset.miniappId = entry.id;
      button.textContent = entry.name;
      button.title = `Abrir destaque para o MiniApp ${entry.name}`;
      listItem.append(button);
      return listItem;
    });

    footerMenuMiniAppsList.append(...items);
  }

  function syncMenuToggleState(widgetId, isActive) {
    if (!(footerMenuPanel instanceof HTMLElementRef)) {
      return;
    }

    const toggles = footerMenuPanel.querySelectorAll('.auth-shell__menu-toggle-input');
    toggles.forEach((toggle) => {
      if (!toggle) {
        return;
      }

      if (HTMLInputElementRef && toggle instanceof HTMLInputElementRef) {
        if (toggle.dataset.widgetToggle === widgetId) {
          toggle.checked = Boolean(isActive);
        }
        return;
      }

      if (typeof toggle === 'object' && 'dataset' in toggle && toggle.dataset?.widgetToggle === widgetId) {
        if ('checked' in toggle) {
          try {
            toggle.checked = Boolean(isActive);
          } catch (error) {
            // noop
          }
        }
      }
    });
  }

  function renderWidgetBoard() {
    if (!(widgetGrid instanceof HTMLElementRef) || !(widgetEmptyState instanceof HTMLElementRef)) {
      return;
    }

    const entries = Array.from(activeWidgetIds)
      .map((id) => FOOTER_WIDGET_LIBRARY.get(id))
      .filter(Boolean);

    widgetEmptyState.hidden = entries.length > 0;
    widgetGrid.hidden = entries.length === 0;

    if (entries.length === 0) {
      widgetGrid.replaceChildren();
      return;
    }

    const fragment = doc.createDocumentFragment();

    entries.forEach((entry) => {
      const card = doc.createElement('article');
      card.className = 'auth-widget';
      card.dataset.widget = entry.id;

      if (entry.view && entry.view === currentView) {
        card.classList.add('auth-widget--active');
      }

      const badge = doc.createElement('span');
      badge.className = 'auth-widget__badge';
      badge.textContent = `${entry.categoryLabel} • ${entry.typeLabel}`;

      const title = doc.createElement('h3');
      title.className = 'auth-widget__title';
      title.textContent = entry.title;

      const description = doc.createElement('p');
      description.className = 'auth-widget__description';
      description.textContent = entry.description;

      const actions = doc.createElement('div');
      actions.className = 'auth-widget__actions';

      if (entry.view || entry.action) {
        const openButton = doc.createElement('button');
        openButton.type = 'button';
        openButton.className = 'auth-widget__action';
        openButton.dataset.widgetAction = 'open';
        openButton.dataset.widgetId = entry.id;
        openButton.textContent = entry.view ? 'Abrir painel' : 'Abrir configurações';
        actions.append(openButton);
      }

      const removeButton = doc.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'auth-widget__action';
      removeButton.dataset.widgetAction = 'remove';
      removeButton.dataset.widgetId = entry.id;
      removeButton.textContent = 'Remover do painel';
      actions.append(removeButton);

      card.append(badge, title, description, actions);
      fragment.append(card);
    });

    widgetGrid.replaceChildren(fragment);
  }

  function activateWidget(widgetId) {
    if (!widgetId || !FOOTER_WIDGET_LIBRARY.has(widgetId)) {
      return;
    }

    if (!activeWidgetIds.has(widgetId)) {
      activeWidgetIds.add(widgetId);
    }

    syncMenuToggleState(widgetId, true);
    renderWidgetBoard();
  }

  function deactivateWidget(widgetId) {
    if (!widgetId || !FOOTER_WIDGET_LIBRARY.has(widgetId)) {
      return;
    }

    if (activeWidgetIds.has(widgetId)) {
      activeWidgetIds.delete(widgetId);
    }

    syncMenuToggleState(widgetId, false);
    renderWidgetBoard();
  }

  function refreshFooterMenuItems() {
    renderFooterViewItems();
    renderFooterMiniAppItems(runtime.getMiniAppsSnapshot());
  }

  if (ensureHtmlElement(doc, footerMenuButton)) {
    const handleFooterMenuClick = () => {
      toggleFooterMenu();
    };

    const handleFooterMenuKeydown = (event) => {
      if (!KeyboardEventRef || !(event instanceof KeyboardEventRef)) {
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        openFooterMenu({ focus: 'first' });
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        openFooterMenu({ focus: 'last' });
      } else if (event.key === 'Escape' && footerMenuOpen) {
        event.preventDefault();
        closeFooterMenu({ focusToggle: true });
      }
    };

    footerMenuButton.addEventListener('click', handleFooterMenuClick);
    footerMenuButton.addEventListener('keydown', handleFooterMenuKeydown);

    teardownCallbacks.push(() => {
      footerMenuButton.removeEventListener('click', handleFooterMenuClick);
      footerMenuButton.removeEventListener('keydown', handleFooterMenuKeydown);
    });
  }

  function handleFooterMenuItemAction(item) {
    if (!(item instanceof HTMLElementRef)) {
      return;
    }

    const viewName = item.dataset.view;
    const highlightAppId = item.dataset.highlightAppId || item.dataset.miniappId;
    const action = item.dataset.action;

    if (viewName) {
      closeFooterMenu();
      renderAuthView(viewName, {
        shouldFocus: true,
        viewProps: highlightAppId ? { highlightAppId } : {},
      });
      return;
    }

    if (action === 'preferences') {
      closeFooterMenu();
      openPreferencesPanelLazy({ doc, win });
      return;
    }

    if (item.dataset.miniappId) {
      closeFooterMenu();
      renderAuthView('miniapps', {
        shouldFocus: true,
        viewProps: { highlightAppId },
      });
    }
  }

  if (ensureHtmlElement(doc, footerMenuPanel)) {
    const handlePanelClick = (event) => {
      const target = event.target instanceof HTMLElementRef ? event.target.closest('.auth-shell__menu-item') : null;
      if (!target) {
        return;
      }

      event.preventDefault();
      handleFooterMenuItemAction(target);
    };

    const handlePanelKeydown = (event) => {
      handleFooterMenuItemKeydown(event);
    };

    const handlePanelChange = (event) => {
      const rawTarget = event.target;

      let input = null;

      if (HTMLInputElementRef && rawTarget instanceof HTMLInputElementRef) {
        input = rawTarget;
      } else if (rawTarget && typeof rawTarget === 'object' && 'dataset' in rawTarget && 'checked' in rawTarget) {
        input = rawTarget;
      }

      if (!input || !input.dataset || input.dataset.widgetToggle === undefined) {
        return;
      }

      if (typeof input.matches === 'function' && !input.matches('.auth-shell__menu-toggle-input')) {
        return;
      }

      const widgetId = input.dataset.widgetToggle;
      if (!widgetId) {
        return;
      }

      const isChecked = Boolean(input.checked);
      if (isChecked) {
        activateWidget(widgetId);
      } else {
        deactivateWidget(widgetId);
      }
    };

    footerMenuPanel.addEventListener('click', handlePanelClick);
    footerMenuPanel.addEventListener('keydown', handlePanelKeydown);
    footerMenuPanel.addEventListener('change', handlePanelChange);

    teardownCallbacks.push(() => {
      footerMenuPanel.removeEventListener('click', handlePanelClick);
      footerMenuPanel.removeEventListener('keydown', handlePanelKeydown);
      footerMenuPanel.removeEventListener('change', handlePanelChange);
    });
  }

  if (ensureHtmlElement(doc, widgetGrid)) {
    const handleWidgetActionClick = (event) => {
      const trigger = event.target instanceof HTMLElementRef ? event.target.closest('[data-widget-action]') : null;
      if (!trigger) {
        return;
      }

      const widgetId = trigger.dataset.widgetId;
      const action = trigger.dataset.widgetAction;

      if (!widgetId || !action) {
        return;
      }

      if (action === 'open') {
        const widget = FOOTER_WIDGET_LIBRARY.get(widgetId);
        if (!widget) {
          return;
        }

        if (widget.view) {
          renderAuthView(widget.view, { shouldFocus: true });
        } else if (widget.action === 'preferences') {
          closeFooterMenu();
          openPreferencesPanelLazy({ doc, win });
        }
      } else if (action === 'remove') {
        deactivateWidget(widgetId);
      }
    };

    widgetGrid.addEventListener('click', handleWidgetActionClick);

    teardownCallbacks.push(() => {
      widgetGrid.removeEventListener('click', handleWidgetActionClick);
    });
  }

  refreshFooterMenuItems();
  renderWidgetBoard();

  const unsubscribeMiniApps = runtime.subscribeMiniApps((apps) => {
    renderFooterMiniAppItems(apps);
  });

  if (typeof unsubscribeMiniApps === 'function') {
    teardownCallbacks.push(unsubscribeMiniApps);
  }

  function focusFirstInteractiveElement(root) {
    if (!(root instanceof HTMLElementRef)) {
      return;
    }

    const focusable = root.querySelector(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );

    if (focusable instanceof HTMLElementRef) {
      focusWithoutScreenShift(doc, win, focusable);
    }
  }

  function updateHint(viewName) {
    if (!(statusHint instanceof HTMLElementRef)) {
      return;
    }

    const viewConfig = VIEW_RENDERERS[viewName];
    if (viewConfig?.hint) {
      statusHint.textContent = viewConfig.hint;
    }
  }

  function setActiveButton(viewName) {
    selectorButtons.forEach((button) => {
      if (!(button instanceof HTMLElementRef)) {
        return;
      }

      const isActive = button.dataset.view === viewName;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });
  }

  function renderAuthView(viewName, { shouldFocus = true, viewProps = {} } = {}) {
    closeFooterMenu();

    if (!(viewRoot instanceof HTMLElementRef)) {
      return;
    }

    const viewConfig = VIEW_RENDERERS[viewName];
    if (!viewConfig) {
      return;
    }

    const teardown = viewRoot[VIEW_CLEANUP_KEY];
    if (typeof teardown === 'function') {
      try {
        teardown();
      } catch (error) {
        console.error('Erro ao encerrar a view anterior.', error);
      }
    }
    viewRoot[VIEW_CLEANUP_KEY] = null;

    viewRoot.replaceChildren();
    viewConfig.render(viewRoot, viewProps);
    currentView = viewName;
    renderWidgetBoard();

    setActiveButton(viewName);
    setActiveFooterMenuItem(viewName);
    updateHint(viewName);

    if (ensureHtmlElement(doc, authCard)) {
      authCard.setAttribute('data-active-view', viewName);
    }

    if (shouldFocus) {
      runtime.queueTask(() => focusFirstInteractiveElement(viewRoot));
    }
  }

  function handleAppNavigate(payload) {
    if (!payload || typeof payload !== 'object') {
      return;
    }

    const { view, viewProps, shouldFocus = true } = payload;
    if (typeof view !== 'string') {
      return;
    }

    if (Object.prototype.hasOwnProperty.call(VIEW_RENDERERS, view)) {
      renderAuthView(view, { shouldFocus, viewProps });
    }
  }

  selectorButtons.forEach((button) => {
    if (!(button instanceof HTMLElementRef)) {
      return;
    }

    const handleClick = () => {
      const viewName = button.dataset.view;
      if (viewName) {
        renderAuthView(viewName, { shouldFocus: true });
      }
    };

    button.addEventListener('click', handleClick);
    teardownCallbacks.push(() => {
      button.removeEventListener('click', handleClick);
    });
  });

  if (ensureHtmlElement(doc, selector)) {
    const handleSelectorKeydown = (event) => {
      if (!KeyboardEventRef || !(event instanceof KeyboardEventRef)) {
        return;
      }

      const views = selectorButtons.map((button) => button.dataset.view).filter(Boolean);
      if (!views.length) {
        return;
      }

      const currentIndex = views.indexOf(currentView ?? '');
      const lastIndex = views.length - 1;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = currentIndex < 0 ? 0 : Math.min(currentIndex + 1, lastIndex);
        const nextButton = selectorButtons[nextIndex];
        if (nextButton) {
          nextButton.click();
        }
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : 0;
        const prevButton = selectorButtons[prevIndex];
        if (prevButton) {
          prevButton.click();
        }
      }
    };

    selector.addEventListener('keydown', handleSelectorKeydown);
    teardownCallbacks.push(() => {
      selector.removeEventListener('keydown', handleSelectorKeydown);
    });
  }

  const unsubscribeAppNavigate = runtime.eventBus?.on('app:navigate', handleAppNavigate);
  if (typeof unsubscribeAppNavigate === 'function') {
    teardownCallbacks.push(unsubscribeAppNavigate);
  }

  renderAuthView('guest', { shouldFocus: false });

  const versionTarget = doc.querySelector('[data-app-version]');
  const currentYearTarget = doc.querySelector('[data-current-year]');

  if (ensureHtmlElement(doc, currentYearTarget)) {
    currentYearTarget.textContent = String(new Date().getFullYear());
  }

  async function loadAppVersion() {
    if (!runtime.fetch) {
      if (ensureHtmlElement(doc, versionTarget)) {
        versionTarget.textContent = 'indisponível';
      }
      return null;
    }

    const VERSION_RESOURCE = './meta/app-version.json';

    try {
      const response = await runtime.fetch(VERSION_RESOURCE, { cache: 'no-store' });

      if (!response.ok) {
        if (ensureHtmlElement(doc, versionTarget)) {
          versionTarget.textContent = 'indisponível';
        }
        return null;
      }

      const payload = await response.json();
      const version = typeof payload?.version === 'string' ? payload.version.trim() : '';

      if (ensureHtmlElement(doc, versionTarget)) {
        versionTarget.textContent = version ? `v${version}` : 'em desenvolvimento';
      }

      return version || null;
    } catch (error) {
      console.warn('Não foi possível carregar a versão do aplicativo.', error);
      if (ensureHtmlElement(doc, versionTarget)) {
        versionTarget.textContent = 'indisponível';
      }
      return null;
    }
  }

  async function setupPwaSupport() {
    const version = await loadAppVersion();
    try {
      await runtime.registerServiceWorker(version);
    } catch (error) {
      console.error('Falha ao configurar os recursos PWA.', error);
    }
  }

  setupPwaSupport();

  const currentUrl = runtime.URL && win?.location?.href ? new runtime.URL(win.location.href) : null;
  const requestedMiniApp = currentUrl ? normalizeMiniAppId(currentUrl.searchParams.get(APP_QUERY_PARAM)) : '';

  if (requestedMiniApp) {
    const redirected = openMiniAppShortcut(requestedMiniApp, {
      window: win,
      getMiniAppsSnapshot: runtime.getMiniAppsSnapshot,
    });

    if (!redirected) {
      renderAuthView('miniapps', {
        shouldFocus: true,
        viewProps: {
          highlightAppId: requestedMiniApp,
          onHighlight({ app }) {
            if (ensureHtmlElement(doc, statusHint) && app) {
              statusHint.textContent = `MiniApp "${app.name}" destacado. Use o atalho para abrir a documentação oficial.`;
            }
          },
        },
      });
    }
  }

  return {
    destroy() {
      while (teardownCallbacks.length) {
        const teardown = teardownCallbacks.pop();
        try {
          teardown?.();
        } catch (error) {
          console.error('Erro ao encerrar listener da shell de autenticação.', error);
        }
      }
    },
  };
}

export default {
  initAuthShell,
  normalizeMiniAppId,
  buildMiniAppDocPath,
  openMiniAppShortcut,
  findMiniAppById,
};
