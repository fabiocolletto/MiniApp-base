import eventBus from '../scripts/events/event-bus.js';
import { renderGreeting } from '../scripts/views/greeting.js';
import { renderAdmin } from '../scripts/views/admin.js';
import { renderLog } from '../scripts/views/log.js';
import { renderHome } from '../scripts/views/home.js';
import { renderNotFound } from '../scripts/views/not-found.js';
import { renderUserPanel } from '../scripts/views/user.js';
import { renderMiniAppStore } from '../scripts/views/miniapp-store.js';
import { renderLoginPanel } from '../scripts/views/login.js';
import { renderRegisterPanel } from '../scripts/views/register.js';
import { renderLegal } from '../scripts/views/legal.js';
import { runViewCleanup as defaultRunViewCleanup } from '../scripts/view-cleanup.js';
import {
  getActiveUser as defaultGetActiveUser,
  getSessionStatus as defaultGetSessionStatus,
} from '../scripts/data/session-store.js';
import {
  getStorageStatus as defaultGetStorageStatus,
  sanitizeUserThemePreference,
} from '../scripts/data/user-store.js';
import {
  getResolvedTheme,
  getThemePreference,
  setThemePreference,
  subscribeThemeChange,
} from '../scripts/theme/theme-manager.js';

const viewRoot = document.getElementById('view-root');
const mainElement = document.querySelector('main');
const headerElement = document.querySelector('header');
const logo = document.querySelector('.header-logo');
const versionButton = document.querySelector('.footer-version');
const loginLink = document.querySelector('.header-login-link');
const registerLink = document.querySelector('.header-register-link');
const homeLink = document.querySelector('.header-home-link');
const adminLink = document.querySelector('.header-admin-link');
const storeLink = document.querySelector('.header-store-link');
const userLink = document.querySelector('.header-user-link');
const headerActions = document.querySelector('.header-actions');
const headerMenu = document.querySelector('.header-menu');
const headerMenuControls = document.querySelector('.header-menu__controls');
const headerMenuTrigger = document.querySelector('.header-menu__trigger');
const headerMenuPanel = document.getElementById('header-navigation-menu');
const headerMobileToggle = document.querySelector('.header-mobile-toggle');
const memoryIndicator = document.querySelector('.footer-memory');
const memoryIndicatorText = memoryIndicator?.querySelector('.footer-memory__text');
const sessionIndicator = document.querySelector('.footer-session');
const sessionIndicatorText = sessionIndicator?.querySelector('.footer-session__text');
const sessionIndicatorAnnouncement = sessionIndicator?.querySelector('.footer-session__announcement');
const footerElement = document.querySelector('footer');
const footerToggleButton = footerElement?.querySelector('[data-footer-toggle]');
const footerBrandIcon = footerElement?.querySelector('.footer-brand__icon');

const rootElement = typeof document === 'object' && document ? document.documentElement : null;

const mobileFooterMediaQuery =
  typeof window === 'object' && window && typeof window.matchMedia === 'function'
    ? window.matchMedia('(max-width: 640px)')
    : null;

function parseMeasurement(value) {
  if (typeof value !== 'string') {
    return 0;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isHtmlElement(element) {
  if (!element || typeof element !== 'object') {
    return false;
  }

  if (typeof HTMLElement === 'function') {
    return element instanceof HTMLElement;
  }

  const nodeType = 'nodeType' in element ? element.nodeType : null;
  return nodeType === 1 || typeof element.getBoundingClientRect === 'function';
}

function getElementBlockSize(element) {
  if (!isHtmlElement(element)) {
    return 0;
  }

  const rect = typeof element.getBoundingClientRect === 'function' ? element.getBoundingClientRect() : null;
  const baseSize = rect ? rect.height : 0;

  if (!(typeof window === 'object' && window && typeof window.getComputedStyle === 'function')) {
    return Math.max(0, baseSize);
  }

  const styles = window.getComputedStyle(element);
  const marginStart = parseMeasurement(styles.marginBlockStart ?? styles.marginTop);
  const marginEnd = parseMeasurement(styles.marginBlockEnd ?? styles.marginBottom);

  return Math.max(0, baseSize + marginStart + marginEnd);
}

let layoutOffsetsScheduled = false;

function applyLayoutOffsets() {
  if (!isHtmlElement(rootElement)) {
    return;
  }

  const style = rootElement.style;
  if (!style || typeof style.setProperty !== 'function') {
    return;
  }

  const headerSize = getElementBlockSize(headerElement);
  const footerSize = getElementBlockSize(footerElement);

  if (headerSize > 0) {
    style.setProperty('--layout-header-offset', `${Math.ceil(headerSize)}px`);
  } else {
    style.removeProperty('--layout-header-offset');
  }

  if (footerSize > 0) {
    style.setProperty('--layout-footer-offset', `${Math.ceil(footerSize)}px`);
  } else {
    style.removeProperty('--layout-footer-offset');
  }
}

function scheduleLayoutOffsetUpdate() {
  if (layoutOffsetsScheduled) {
    return;
  }

  layoutOffsetsScheduled = true;

  const run = () => {
    layoutOffsetsScheduled = false;
    applyLayoutOffsets();
  };

  if (typeof window === 'object' && window) {
    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(run);
      return;
    }

    if (typeof window.setTimeout === 'function') {
      window.setTimeout(run, 16);
      return;
    }
  }

  if (typeof globalThis === 'object' && globalThis && typeof globalThis.setTimeout === 'function') {
    globalThis.setTimeout(run, 16);
    return;
  }

  run();
}

const dimmedShellClass = 'app-shell--dimmed';

const THEME_ASSETS = {
  light: {
    logo: 'https://5horas.com.br/wp-content/uploads/2025/10/Logo-Light-Transparente-2000x500px.webp',
    icon: 'https://5horas.com.br/wp-content/uploads/2025/10/Icone-Light-Transparente-500x500px.webp',
  },
  dark: {
    logo: 'https://5horas.com.br/wp-content/uploads/2025/10/Logo-Dark-Transparente-2000x500px.webp',
    icon: 'https://5horas.com.br/wp-content/uploads/2025/10/Icone-Dark-Transparente-500x500px.webp',
  },
};

let currentBrandTheme = null;
let lastSessionThemePreference = null;

const SESSION_LEGEND_ITEMS = [
  {
    state: 'loading',
    label: 'Sincronizando',
    description: 'Estamos conectando com o servidor para validar a sua sessão.',
  },
  {
    state: 'connected',
    label: 'Conectada',
    description: 'A sessão está ativa e pronta para carregar seus dados.',
  },
  {
    state: 'idle',
    label: 'Inativa',
    description: 'A sessão continua válida, mas não há sincronização em andamento.',
  },
  {
    state: 'empty',
    label: 'Sem sessão',
    description: 'Nenhum usuário autenticado no momento neste dispositivo.',
  },
];

let sessionLegendPanel = null;
let sessionLegendItems = new Map();

let headerUserButton = null;
let allowPreventScrollOption = true;
let shellRouter = null;

let headerMobileMenuPanel = null;
let mobileHomeAction = null;

let headerMenuOpen = false;
let removeHeaderMenuListeners = null;

let appModalBackdrop = null;
let appModalContainer = null;
let appModalOpen = false;
let removeAppModalListeners = null;
let activeModalId = null;
let modalActiveTrigger = null;
let modalCleanup = null;

function updateBrandAssets(theme) {
  const normalizedTheme = theme === 'dark' ? 'dark' : 'light';
  if (currentBrandTheme === normalizedTheme) {
    return;
  }

  currentBrandTheme = normalizedTheme;
  const assets = THEME_ASSETS[normalizedTheme];

  if (assets?.logo && logo) {
    const currentLogo = typeof logo.getAttribute === 'function' ? logo.getAttribute('src') : null;
    if (currentLogo !== assets.logo) {
      if (typeof logo.setAttribute === 'function') {
        logo.setAttribute('src', assets.logo);
      } else if ('src' in logo) {
        logo.src = assets.logo;
      }
    }
  }

  if (assets?.icon && footerBrandIcon) {
    const currentIcon =
      typeof footerBrandIcon.getAttribute === 'function' ? footerBrandIcon.getAttribute('src') : null;
    if (currentIcon !== assets.icon) {
      if (typeof footerBrandIcon.setAttribute === 'function') {
        footerBrandIcon.setAttribute('src', assets.icon);
      } else if ('src' in footerBrandIcon) {
        footerBrandIcon.src = assets.icon;
      }
    }
  }
}

function resolveUserThemePreference(user) {
  if (!user || typeof user !== 'object') {
    return 'system';
  }

  const rawPreference = user.preferences && typeof user.preferences === 'object' ? user.preferences.theme : undefined;
  return sanitizeUserThemePreference(rawPreference);
}

function applySessionThemePreference(user) {
  const preference = resolveUserThemePreference(user);
  if (lastSessionThemePreference === preference && getThemePreference() === preference) {
    return;
  }

  lastSessionThemePreference = preference;
  if (getThemePreference() !== preference) {
    setThemePreference(preference);
  }
}

const rawHooks =
  typeof globalThis === 'object' && globalThis && '__MINIAPP_UI_HOOKS__' in globalThis
    ? globalThis.__MINIAPP_UI_HOOKS__
    : undefined;

const viewOverrides = rawHooks && typeof rawHooks.views === 'object' ? rawHooks.views : null;
const viewCleanup =
  rawHooks && typeof rawHooks.runViewCleanup === 'function' ? rawHooks.runViewCleanup : defaultRunViewCleanup;
const getActiveUserFn =
  rawHooks && typeof rawHooks.getActiveUser === 'function' ? rawHooks.getActiveUser : defaultGetActiveUser;
const getStorageStatusFn =
  rawHooks && typeof rawHooks.getStorageStatus === 'function'
    ? rawHooks.getStorageStatus
    : defaultGetStorageStatus;
const getSessionStatusFn =
  rawHooks && typeof rawHooks.getSessionStatus === 'function'
    ? rawHooks.getSessionStatus
    : defaultGetSessionStatus;

const views = {
  greeting: renderGreeting,
  admin: renderAdmin,
  log: renderLog,
  home: renderHome,
  user: renderUserPanel,
  miniapps: renderMiniAppStore,
  login: renderLoginPanel,
  register: renderRegisterPanel,
  legal: renderLegal,
};

if (viewOverrides) {
  Object.entries(viewOverrides).forEach(([name, renderer]) => {
    if (typeof renderer === 'function') {
      views[name] = renderer;
    }
  });
}

function resolveViewName(payload) {
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    return trimmed ? trimmed : null;
  }

  const view = payload && typeof payload === 'object' ? payload.view : undefined;
  if (typeof view === 'string') {
    const trimmed = view.trim();
    return trimmed ? trimmed : null;
  }

  return null;
}

function getHeaderUserButton() {
  if (headerUserButton) {
    return headerUserButton;
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'header-action header-action--avatar header-menu__user';
  button.addEventListener('click', () => {
    renderView('user');
  });

  headerUserButton = button;
  return headerUserButton;
}

function ensureAppModalElements() {
  const body = document.body;
  if (!(body instanceof HTMLElement)) {
    return { backdrop: null, container: null };
  }

  if (!appModalBackdrop || !appModalBackdrop.isConnected) {
    const backdrop = document.createElement('div');
    backdrop.className = 'app-modal-backdrop';
    backdrop.hidden = true;
    backdrop.addEventListener('click', () => {
      closeAppModal();
    });
    body.append(backdrop);
    appModalBackdrop = backdrop;
  }

  if (!appModalContainer || !appModalContainer.isConnected) {
    const container = document.createElement('div');
    container.className = 'app-modal';
    container.hidden = true;
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-modal', 'true');
    container.setAttribute('aria-hidden', 'true');
    body.append(container);
    appModalContainer = container;
  }

  return { backdrop: appModalBackdrop, container: appModalContainer };
}

function closeAppModal({ restoreFocus = true, id } = {}) {
  if (!appModalOpen) {
    return;
  }

  if (typeof id === 'string' && activeModalId && activeModalId !== id) {
    return;
  }

  appModalOpen = false;

  if (typeof modalCleanup === 'function') {
    modalCleanup();
  }
  modalCleanup = null;

  if (removeAppModalListeners) {
    removeAppModalListeners();
    removeAppModalListeners = null;
  }

  const body = document.body;
  if (body instanceof HTMLElement) {
    body.classList.remove(dimmedShellClass);
  }

  if (appModalBackdrop instanceof HTMLElement) {
    appModalBackdrop.classList.remove('app-modal-backdrop--visible');
    appModalBackdrop.hidden = true;
  }

  if (appModalContainer instanceof HTMLElement) {
    appModalContainer.hidden = true;
    appModalContainer.setAttribute('aria-hidden', 'true');
    appModalContainer.replaceChildren();
    appModalContainer.removeAttribute('aria-labelledby');
    appModalContainer.removeAttribute('aria-describedby');
  }

  const trigger = modalActiveTrigger;
  activeModalId = null;
  modalActiveTrigger = null;

  if (restoreFocus && trigger instanceof HTMLElement) {
    trigger.focus();
  }
}

function getHeaderMenuItems() {
  if (!(headerMenuPanel instanceof HTMLElement)) {
    return [];
  }

  return Array.from(headerMenuPanel.querySelectorAll('.header-menu__item')).filter(
    (item) => item instanceof HTMLElement
  );
}

function setHeaderMenuState(isOpen) {
  if (headerMenu instanceof HTMLElement) {
    headerMenu.dataset.state = isOpen ? 'open' : 'closed';
  }

  if (headerMenuTrigger instanceof HTMLElement) {
    const label = isOpen ? 'Fechar menu de painéis' : 'Abrir menu de painéis';
    headerMenuTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    headerMenuTrigger.setAttribute('aria-label', label);
    headerMenuTrigger.setAttribute('title', label);
  }

  if (headerMenuPanel instanceof HTMLElement) {
    headerMenuPanel.hidden = !isOpen;
  }
}

function closeHeaderMenu({ focusTrigger = false } = {}) {
  if (!headerMenuOpen) {
    return;
  }

  headerMenuOpen = false;
  setHeaderMenuState(false);

  if (typeof removeHeaderMenuListeners === 'function') {
    removeHeaderMenuListeners();
    removeHeaderMenuListeners = null;
  }

  if (focusTrigger && headerMenuTrigger instanceof HTMLElement) {
    headerMenuTrigger.focus();
  }
}

function openHeaderMenu({ focus = 'first' } = {}) {
  if (headerMenuOpen) {
    return;
  }

  headerMenuOpen = true;
  setHeaderMenuState(true);

  const items = getHeaderMenuItems();
  if (focus === 'first' && items.length) {
    items[0].focus();
  } else if (focus === 'last' && items.length) {
    items[items.length - 1].focus();
  }

  const handlePointerDown = (event) => {
    if (!(headerMenu instanceof HTMLElement)) {
      return;
    }

    const target = event?.target;
    if (!isHtmlElement(target) || !headerMenu.contains(target)) {
      closeHeaderMenu();
    }
  };

  const handleFocusIn = (event) => {
    if (!(headerMenu instanceof HTMLElement)) {
      return;
    }

    const target = event?.target;
    if (!isHtmlElement(target) || !headerMenu.contains(target)) {
      closeHeaderMenu();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeHeaderMenu({ focusTrigger: true });
      return;
    }

    if (event.key === 'Tab') {
      closeHeaderMenu();
    }
  };

  if (typeof document === 'object' && document) {
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('keydown', handleKeyDown, true);

    removeHeaderMenuListeners = () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  } else {
    removeHeaderMenuListeners = null;
  }
}

function toggleHeaderMenu() {
  if (headerMenuOpen) {
    closeHeaderMenu({ focusTrigger: true });
    return;
  }

  openHeaderMenu();
}

function focusHeaderMenuItemByOffset(currentIndex, offset) {
  const items = getHeaderMenuItems();
  if (!items.length) {
    return;
  }

  const normalizedIndex = ((currentIndex + offset) % items.length + items.length) % items.length;
  const item = items[normalizedIndex];
  if (item instanceof HTMLElement) {
    item.focus();
  }
}

function handleHeaderMenuItemKeydown(event) {
  const target = event?.target;
  if (!(target instanceof HTMLElement) || !target.classList.contains('header-menu__item')) {
    return;
  }

  const items = getHeaderMenuItems();
  const currentIndex = items.indexOf(target);

  if (currentIndex === -1) {
    return;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    focusHeaderMenuItemByOffset(currentIndex, 1);
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    focusHeaderMenuItemByOffset(currentIndex, -1);
    return;
  }

  if (event.key === 'Home') {
    event.preventDefault();
    const firstItem = items[0];
    if (firstItem instanceof HTMLElement) {
      firstItem.focus();
    }
    return;
  }

  if (event.key === 'End') {
    event.preventDefault();
    const lastItem = items[items.length - 1];
    if (lastItem instanceof HTMLElement) {
      lastItem.focus();
    }
  }
}

function updateFooterMobileAccessibility() {
  if (!(footerToggleButton instanceof HTMLButtonElement)) {
    return;
  }

  const isMobile = Boolean(mobileFooterMediaQuery?.matches);

  if (!(footerElement instanceof HTMLElement) || !isMobile) {
    footerToggleButton.removeAttribute('aria-expanded');
    footerToggleButton.removeAttribute('aria-label');
    footerToggleButton.removeAttribute('aria-controls');
    return;
  }

  const isExpanded = footerElement.dataset.mobileState === 'expanded';
  footerToggleButton.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
  footerToggleButton.setAttribute(
    'aria-label',
    isExpanded ? 'Recolher detalhes do rodapé' : 'Expandir detalhes do rodapé'
  );
  footerToggleButton.setAttribute('aria-controls', 'footer-actions');
}

function setFooterMobileState(state) {
  if (!(footerElement instanceof HTMLElement)) {
    return;
  }

  const normalized = state === 'expanded' ? 'expanded' : 'collapsed';
  footerElement.dataset.mobileState = normalized;
  updateFooterMobileAccessibility();
  scheduleLayoutOffsetUpdate();
}

function applyFooterMobileMode() {
  if (!(footerElement instanceof HTMLElement)) {
    return;
  }

  const isMobile = Boolean(mobileFooterMediaQuery?.matches);

  if (!isMobile) {
    footerElement.removeAttribute('data-mobile-state');
    updateFooterMobileAccessibility();
    return;
  }

  const normalized = footerElement.dataset.mobileState === 'expanded' ? 'expanded' : 'collapsed';
  footerElement.dataset.mobileState = normalized;
  updateFooterMobileAccessibility();
  scheduleLayoutOffsetUpdate();
}

function registerFooterMobileToggle() {
  if (!(footerElement instanceof HTMLElement) || !(footerToggleButton instanceof HTMLButtonElement)) {
    return;
  }

  const handleToggle = (event) => {
    if (!(event instanceof Event)) {
      return;
    }

    if (!mobileFooterMediaQuery?.matches) {
      return;
    }

    event.preventDefault();
    const isExpanded = footerElement.dataset.mobileState === 'expanded';
    setFooterMobileState(isExpanded ? 'collapsed' : 'expanded');
  };

  const handleMediaChange = () => {
    applyFooterMobileMode();
  };

  footerToggleButton.addEventListener('click', handleToggle);

  if (mobileFooterMediaQuery) {
    if (typeof mobileFooterMediaQuery.addEventListener === 'function') {
      mobileFooterMediaQuery.addEventListener('change', handleMediaChange);
    } else if (typeof mobileFooterMediaQuery.addListener === 'function') {
      mobileFooterMediaQuery.addListener(handleMediaChange);
    }
  }

  applyFooterMobileMode();
}

function openAppModal({
  id,
  panel,
  labelledBy,
  describedBy,
  focusSelector,
  trigger,
  onClose,
} = {}) {
  if (!(panel instanceof HTMLElement)) {
    return;
  }

  const { backdrop, container } = ensureAppModalElements();
  if (!(backdrop instanceof HTMLElement) || !(container instanceof HTMLElement)) {
    return;
  }

  if (appModalOpen) {
    closeAppModal({ restoreFocus: false });
  }

  container.replaceChildren(panel);

  if (typeof labelledBy === 'string' && labelledBy) {
    container.setAttribute('aria-labelledby', labelledBy);
  } else {
    container.removeAttribute('aria-labelledby');
  }

  if (typeof describedBy === 'string' && describedBy) {
    container.setAttribute('aria-describedby', describedBy);
  } else {
    container.removeAttribute('aria-describedby');
  }

  appModalOpen = true;
  activeModalId = typeof id === 'string' ? id : null;
  modalActiveTrigger = trigger instanceof HTMLElement ? trigger : null;
  modalCleanup = typeof onClose === 'function' ? onClose : null;

  const body = document.body;
  if (body instanceof HTMLElement) {
    body.classList.add(dimmedShellClass);
  }

  backdrop.hidden = false;
  backdrop.classList.add('app-modal-backdrop--visible');
  container.hidden = false;
  container.setAttribute('aria-hidden', 'false');

  const focusableSelectors =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusableItems = Array.from(container.querySelectorAll(focusableSelectors)).filter(
    (element) => element instanceof HTMLElement && !element.hasAttribute('disabled')
  );
  const firstFocusable = focusableItems[0] || null;
  const lastFocusable = focusableItems[focusableItems.length - 1] || null;

  const handleKeydown = (event) => {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeAppModal({ restoreFocus: true });
      return;
    }

    if (event.key !== 'Tab' || focusableItems.length === 0) {
      return;
    }

    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable?.focus?.();
      }
      return;
    }

    if (document.activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable?.focus?.();
    }
  };

  document.addEventListener('keydown', handleKeydown);
  removeAppModalListeners = () => {
    document.removeEventListener('keydown', handleKeydown);
  };

  let focusTarget = null;
  if (typeof focusSelector === 'string' && focusSelector) {
    focusTarget = container.querySelector(focusSelector);
  } else if (focusSelector instanceof HTMLElement) {
    focusTarget = focusSelector;
  }

  if (!(focusTarget instanceof HTMLElement)) {
    focusTarget =
      focusableItems.find((element) => element.classList.contains('app-modal__action--primary')) ||
      firstFocusable ||
      container;
  }

  setTimeout(() => {
    focusTarget?.focus?.();
  }, 0);
}

function ensureHeaderMobileMenu() {
  if (headerMobileMenuPanel && headerMobileMenuPanel.isConnected) {
    return headerMobileMenuPanel;
  }

  const panel = document.createElement('div');
  panel.className = 'app-modal__panel app-modal__panel--mobile-menu';
  panel.id = 'mobile-access-menu';

  const header = document.createElement('div');
  header.className = 'app-modal__header header-mobile-menu__header';

  const title = document.createElement('h2');
  title.className = 'app-modal__title header-mobile-menu__title';
  title.id = 'mobile-access-menu-title';
  title.textContent = 'Acesso rápido';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'app-modal__close header-mobile-menu__close';
  closeButton.setAttribute('aria-label', 'Fechar menu de acesso');
  closeButton.textContent = '×';
  closeButton.addEventListener('click', () => {
    closeHeaderMobileMenu(true);
  });

  header.append(title, closeButton);

  const description = document.createElement('p');
  description.className = 'app-modal__description header-mobile-menu__description';
  description.id = 'mobile-access-menu-description';
  description.textContent = 'Escolha a opção desejada para continuar.';

  const actions = document.createElement('div');
  actions.className = 'app-modal__actions header-mobile-menu__actions';

  const homeAction = document.createElement('button');
  homeAction.type = 'button';
  homeAction.id = 'mobile-access-menu-home';
  homeAction.className = 'app-modal__action header-mobile-menu__action header-mobile-menu__action--home';
  homeAction.setAttribute('aria-pressed', 'false');
  homeAction.addEventListener('click', () => {
    closeHeaderMobileMenu();
    toggleHomePanel();
  });

  const adminAction = document.createElement('button');
  adminAction.type = 'button';
  adminAction.id = 'mobile-access-menu-admin';
  adminAction.className = 'app-modal__action header-mobile-menu__action';
  adminAction.textContent = 'Painel administrativo';
  adminAction.addEventListener('click', () => {
    closeHeaderMobileMenu();
    renderView('admin');
  });

  const storeAction = document.createElement('button');
  storeAction.type = 'button';
  storeAction.id = 'mobile-access-menu-store';
  storeAction.className = 'app-modal__action header-mobile-menu__action';
  storeAction.textContent = 'Mini App Store';
  storeAction.addEventListener('click', () => {
    closeHeaderMobileMenu();
    renderView('miniapps');
  });

  const userAction = document.createElement('button');
  userAction.type = 'button';
  userAction.id = 'mobile-access-menu-user';
  userAction.className = 'app-modal__action header-mobile-menu__action';
  userAction.textContent = 'Painel do usuário';
  userAction.addEventListener('click', () => {
    closeHeaderMobileMenu();
    renderView('user');
  });

  const registerAction = document.createElement('button');
  registerAction.type = 'button';
  registerAction.id = 'mobile-access-menu-register';
  registerAction.className =
    'app-modal__action app-modal__action--primary header-mobile-menu__action header-mobile-menu__action--primary';
  registerAction.textContent = 'Cadastro';
  registerAction.addEventListener('click', () => {
    closeHeaderMobileMenu();
    shellRouter?.goTo?.('register');
  });

  const loginAction = document.createElement('button');
  loginAction.type = 'button';
  loginAction.className = 'app-modal__action header-mobile-menu__action';
  loginAction.textContent = 'Login';
  loginAction.addEventListener('click', () => {
    closeHeaderMobileMenu();
    shellRouter?.goTo?.('login');
  });

  actions.append(homeAction, adminAction, storeAction, userAction, registerAction, loginAction);

  panel.append(header, description, actions);
  headerMobileMenuPanel = panel;
  mobileHomeAction = homeAction;
  syncHomeToggleStateFromDom();

  return headerMobileMenuPanel;
}

function closeHeaderMobileMenu(focusToggle = false) {
  closeAppModal({ restoreFocus: focusToggle, id: 'mobile-menu' });
}

function openHeaderMobileMenu() {
  const panel = ensureHeaderMobileMenu();
  if (!(panel instanceof HTMLElement)) {
    return;
  }

  openAppModal({
    id: 'mobile-menu',
    panel,
    labelledBy: 'mobile-access-menu-title',
    describedBy: 'mobile-access-menu-description',
    focusSelector: '#mobile-access-menu-register',
    trigger: headerMobileToggle instanceof HTMLElement ? headerMobileToggle : null,
    onClose: () => {
      headerMobileToggle?.setAttribute('aria-expanded', 'false');
    },
  });

  if (headerMobileToggle instanceof HTMLElement) {
    headerMobileToggle.setAttribute('aria-expanded', 'true');
  }
}

function extractInitials(user) {
  const name = typeof user?.name === 'string' ? user.name.trim() : '';
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : parts[0]?.[1] ?? '';
    return `${first}${last}`.toUpperCase();
  }

  const phone = typeof user?.phone === 'string' ? user.phone.replace(/\D+/g, '') : '';
  if (phone.length >= 2) {
    return phone.slice(-2).toUpperCase();
  }

  return 'US';
}

function formatUserLabel(user) {
  const rawName = typeof user?.name === 'string' ? user.name.trim() : '';
  const rawPhone = typeof user?.phone === 'string' ? user.phone.trim() : '';

  if (rawName && rawPhone) {
    return `Abrir painel do usuário ${rawName} (${rawPhone})`;
  }

  if (rawName) {
    return `Abrir painel do usuário ${rawName}`;
  }

  if (rawPhone) {
    return `Abrir painel do usuário com telefone ${rawPhone}`;
  }

  return 'Abrir painel do usuário';
}

function isHomePanelActive() {
  return viewRoot instanceof HTMLElement && viewRoot.dataset.view === 'home';
}

function getHomeToggleLabel(isActive) {
  return isActive ? 'Fechar painel inicial' : 'Abrir painel inicial';
}

function applyHomeToggleState(isActive) {
  const label = getHomeToggleLabel(isActive);

  if (homeLink instanceof HTMLElement) {
    homeLink.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    homeLink.setAttribute('aria-label', label);
    homeLink.setAttribute('title', label);
  }

  if (mobileHomeAction instanceof HTMLElement) {
    mobileHomeAction.textContent = label;
    mobileHomeAction.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  }
}

function updateHomeToggleStateForView(viewName) {
  applyHomeToggleState(viewName === 'home');
}

function syncHomeToggleStateFromDom() {
  if (!(viewRoot instanceof HTMLElement)) {
    applyHomeToggleState(false);
    return;
  }

  updateHomeToggleStateForView(viewRoot.dataset.view ?? '');
}

function toggleHomePanel() {
  closeHeaderMenu();

  if (isHomePanelActive()) {
    renderView('greeting');
    return;
  }

  shellRouter?.goTo?.('dashboard');
}

function setLinkVisibility(link, isVisible) {
  if (!(link instanceof HTMLElement)) {
    return;
  }

  if (isVisible) {
    link.hidden = false;
    link.removeAttribute('aria-hidden');
    link.removeAttribute('tabindex');
    link.style.removeProperty('display');
    return;
  }

  link.hidden = true;
  link.setAttribute('aria-hidden', 'true');
  link.setAttribute('tabindex', '-1');
  link.style.display = 'none';
}

function updateHeaderSession(user) {
  const isAuthenticated = Boolean(user);
  const menuControls = headerMenuControls instanceof HTMLElement ? headerMenuControls : null;

  setLinkVisibility(loginLink, !isAuthenticated);
  setLinkVisibility(registerLink, !isAuthenticated);

  if (headerActions instanceof HTMLElement) {
    headerActions.dataset.mobile = isAuthenticated ? 'user' : 'guest';
  }

  if (menuControls) {
    menuControls.dataset.session = isAuthenticated ? 'authenticated' : 'guest';
  }

  if (headerMobileToggle instanceof HTMLElement) {
    if (isAuthenticated) {
      headerMobileToggle.hidden = true;
      headerMobileToggle.setAttribute('aria-hidden', 'true');
      headerMobileToggle.setAttribute('aria-expanded', 'false');
      closeHeaderMobileMenu();
    } else {
      headerMobileToggle.hidden = false;
      headerMobileToggle.removeAttribute('aria-hidden');
      headerMobileToggle.setAttribute('aria-expanded', 'false');
    }
  }

  if (!isAuthenticated) {
    if (headerUserButton?.isConnected) {
      headerUserButton.remove();
    }
    scheduleLayoutOffsetUpdate();
    return;
  }

  const button = getHeaderUserButton();
  const initials = extractInitials(user);
  const label = formatUserLabel(user);

  button.textContent = initials;
  button.setAttribute('aria-label', label);
  button.setAttribute('title', label);

  if (!button.isConnected) {
    if (menuControls) {
      menuControls.append(button);
    } else if (headerActions instanceof HTMLElement) {
      headerActions.append(button);
    }
  }

  scheduleLayoutOffsetUpdate();
}

function ensureSessionLegendPanel() {
  if (sessionLegendPanel && sessionLegendPanel.isConnected) {
    return sessionLegendPanel;
  }

  const panel = document.createElement('div');
  panel.className = 'app-modal__panel app-modal__panel--session';
  panel.id = 'session-status-panel';

  const header = document.createElement('div');
  header.className = 'app-modal__header footer-session__header';

  const title = document.createElement('h2');
  title.className = 'app-modal__title footer-session__title';
  title.id = 'session-status-title';
  title.textContent = 'Status da sessão';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'app-modal__close footer-session__close';
  closeButton.setAttribute('aria-label', 'Fechar legenda de status da sessão');
  closeButton.textContent = '×';
  closeButton.addEventListener('click', () => {
    closeSessionPopover(true);
  });

  header.append(title, closeButton);

  const description = document.createElement('p');
  description.className = 'app-modal__description footer-session__description';
  description.id = 'session-status-description';
  description.textContent = 'Consulte os estados disponíveis para entender a sincronização da sua conta.';

  const legend = document.createElement('ul');
  legend.className = 'footer-session__legend';

  sessionLegendItems = new Map();
  SESSION_LEGEND_ITEMS.forEach(({ state, label, description: itemDescription }) => {
    const item = document.createElement('li');
    item.className = 'footer-session__legend-item';
    item.dataset.state = state;

    const dot = document.createElement('span');
    dot.className = 'footer-session__legend-dot';
    dot.setAttribute('aria-hidden', 'true');

    const content = document.createElement('div');
    content.className = 'footer-session__legend-content';

    const itemLabel = document.createElement('span');
    itemLabel.className = 'footer-session__legend-label';
    itemLabel.textContent = label;

    const itemText = document.createElement('span');
    itemText.className = 'footer-session__legend-description';
    itemText.textContent = itemDescription;

    content.append(itemLabel, itemText);
    item.append(dot, content);
    legend.append(item);
    sessionLegendItems.set(state, item);
  });

  panel.append(header, description, legend);
  sessionLegendPanel = panel;
  return sessionLegendPanel;
}

function highlightSessionLegendState(state) {
  sessionLegendItems.forEach((item, key) => {
    const isActive = key === state;
    item.classList.toggle('footer-session__legend-item--active', isActive);
    if (isActive) {
      item.setAttribute('aria-current', 'true');
    } else {
      item.removeAttribute('aria-current');
    }
  });
}

function closeSessionPopover(focusButton = false) {
  closeAppModal({ restoreFocus: focusButton, id: 'session-legend' });
  if (sessionIndicator instanceof HTMLElement) {
    sessionIndicator.setAttribute('aria-expanded', 'false');
    sessionIndicator.classList.remove('footer-session--open');
  }
}

function openSessionPopover() {
  if (!(sessionIndicator instanceof HTMLElement)) {
    return;
  }

  const panel = ensureSessionLegendPanel();
  if (!(panel instanceof HTMLElement)) {
    return;
  }

  highlightSessionLegendState(sessionIndicator.dataset.state);

  openAppModal({
    id: 'session-legend',
    panel,
    labelledBy: 'session-status-title',
    describedBy: 'session-status-description',
    focusSelector: '.footer-session__legend-item--active',
    trigger: sessionIndicator,
    onClose: () => {
      sessionIndicator.setAttribute('aria-expanded', 'false');
      sessionIndicator.classList.remove('footer-session--open');
    },
  });

  sessionIndicator.setAttribute('aria-expanded', 'true');
  sessionIndicator.classList.add('footer-session--open');
}

function toggleSessionPopover() {
  if (appModalOpen && activeModalId === 'session-legend') {
    closeSessionPopover(true);
    return;
  }

  openSessionPopover();
}

function registerSessionIndicatorInteractions() {
  if (!(sessionIndicator instanceof HTMLButtonElement)) {
    return;
  }

  sessionIndicator.setAttribute('aria-controls', 'session-status-panel');

  sessionIndicator.addEventListener('click', (event) => {
    event.preventDefault();
    toggleSessionPopover();
  });

  sessionIndicator.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleSessionPopover();
    }
  });
}

function updateMemoryStatus(status) {
  if (!(memoryIndicator instanceof HTMLElement) || !(memoryIndicatorText instanceof HTMLElement)) {
    return;
  }

  const state = typeof status?.state === 'string' ? status.state : 'loading';
  const message =
    typeof status?.message === 'string' && status.message.trim()
      ? status.message.trim()
      : 'Memória carregando';
  const details =
    typeof status?.details === 'string' && status.details.trim() ? status.details.trim() : '';

  memoryIndicator.dataset.state = state;
  memoryIndicatorText.textContent = message;

  if (details) {
    memoryIndicator.setAttribute('title', details);
    memoryIndicator.setAttribute('aria-label', `${message}. ${details}`);
  } else {
    memoryIndicator.removeAttribute('title');
    memoryIndicator.setAttribute('aria-label', message);
  }
}

function updateSessionStatus(status) {
  if (!(sessionIndicator instanceof HTMLElement) || !(sessionIndicatorText instanceof HTMLElement)) {
    return;
  }

  const state = typeof status?.state === 'string' ? status.state : 'loading';
  const message =
    typeof status?.message === 'string' && status.message.trim()
      ? status.message.trim()
      : 'Sessão sincronizando';
  const details =
    typeof status?.details === 'string' && status.details.trim() ? status.details.trim() : '';

  sessionIndicator.dataset.state = state;
  sessionIndicatorText.textContent = message;
  if (sessionIndicatorAnnouncement instanceof HTMLElement) {
    sessionIndicatorAnnouncement.textContent = details ? `${message}. ${details}` : message;
  }

  if (details) {
    sessionIndicator.setAttribute('title', details);
    sessionIndicator.setAttribute('aria-label', `${message}. ${details}`);
  } else {
    sessionIndicator.removeAttribute('title');
    sessionIndicator.setAttribute('aria-label', message);
  }

  highlightSessionLegendState(state);
}

function focusViewRoot() {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  if (allowPreventScrollOption) {
    try {
      viewRoot.focus({ preventScroll: true });
      return;
    } catch (error) {
      allowPreventScrollOption = false;
    }
  }

  viewRoot.focus();
}

function applyMainState(view) {
  const isAdminView = view === 'admin';
  const isUserView = view === 'user';
  const isLoginView = view === 'login';
  const isRegisterView = view === 'register';
  const isGreetingView = view === 'greeting';

  mainElement?.classList.toggle('main--admin', isAdminView);
  mainElement?.classList.toggle('main--user', isUserView);
  mainElement?.classList.toggle('main--login', isLoginView);
  mainElement?.classList.toggle('main--register', isRegisterView);
  mainElement?.classList.toggle('main--greeting', isGreetingView);
}

export function renderView(name) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  closeHeaderMenu();
  closeSessionPopover();

  applyMainState(name);

  const view = views[name];

  viewCleanup(viewRoot);

  if (typeof view !== 'function') {
    console.warn(`View "${name}" não encontrada.`);
    renderNotFound(viewRoot, name);
    updateHomeToggleStateForView(name);
    focusViewRoot();
    return;
  }

  viewRoot.dataset.view = name;
  view(viewRoot);
  updateHomeToggleStateForView(name);
  focusViewRoot();
  scheduleLayoutOffsetUpdate();
}

function handleNavigationRequest(viewName, router) {
  if (viewName === 'home' || viewName === 'dashboard') {
    router.goTo('dashboard');
    return;
  }

  if (viewName === 'login') {
    router.goTo('login');
    return;
  }

  if (viewName === 'register') {
    router.goTo('register');
    return;
  }

  renderView(viewName);
}

export function showSplash(message = 'Carregando painel...') {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  mainElement?.classList.remove('main--admin', 'main--user', 'main--login', 'main--register', 'main--greeting');
  viewRoot.className = 'card view view--splash';
  viewRoot.dataset.view = 'splash';

  const loader = document.createElement('div');
  loader.className = 'splash__loader';
  loader.setAttribute('role', 'status');
  loader.setAttribute('aria-live', 'polite');
  loader.textContent = message;

  viewRoot.replaceChildren(loader);
}

let initialized = false;

export function initializeAppShell(router) {
  if (initialized) {
    return;
  }

  initialized = true;
  shellRouter = router;

  homeLink?.addEventListener('click', (event) => {
    event.preventDefault();
    toggleHomePanel();
  });

  adminLink?.addEventListener('click', (event) => {
    event.preventDefault();
    renderView('admin');
    closeHeaderMenu();
  });

  storeLink?.addEventListener('click', (event) => {
    event.preventDefault();
    renderView('miniapps');
    closeHeaderMenu();
  });

  userLink?.addEventListener('click', (event) => {
    event.preventDefault();
    renderView('user');
    closeHeaderMenu();
  });

  logo?.addEventListener('click', () => {
    closeHeaderMenu();

    if (shellRouter && typeof shellRouter.goTo === 'function') {
      shellRouter.goTo('dashboard');
      return;
    }

    renderView('home');
  });
  versionButton?.addEventListener('click', () => {
    closeHeaderMenu();
    renderView('log');
  });
  loginLink?.addEventListener('click', (event) => {
    event.preventDefault();
    closeHeaderMenu();
    router.goTo('login');
  });
  registerLink?.addEventListener('click', (event) => {
    event.preventDefault();
    closeHeaderMenu();
    router.goTo('register');
  });

  if (headerMenuTrigger instanceof HTMLElement) {
    headerMenuTrigger.addEventListener('click', (event) => {
      event.preventDefault();
      toggleHeaderMenu();
    });

    headerMenuTrigger.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        openHeaderMenu({ focus: 'first' });
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        openHeaderMenu({ focus: 'last' });
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleHeaderMenu();
      }
    });
  }

  if (headerMenuPanel instanceof HTMLElement) {
    headerMenuPanel.addEventListener('keydown', handleHeaderMenuItemKeydown);
  }

  if (headerMobileToggle instanceof HTMLButtonElement) {
    headerMobileToggle.setAttribute('aria-controls', 'mobile-access-menu');
  }

  headerMobileToggle?.addEventListener('click', (event) => {
    event.preventDefault();
    if (appModalOpen && activeModalId === 'mobile-menu') {
      closeHeaderMobileMenu(true);
    } else {
      openHeaderMobileMenu();
    }
  });

  registerSessionIndicatorInteractions();

  registerFooterMobileToggle();

  document.addEventListener('app:navigate', (event) => {
    const detail = event && typeof event === 'object' ? event.detail : undefined;
    const viewName = resolveViewName(detail);
    if (viewName) {
      eventBus.emit('app:navigate', { view: viewName });
    }
  });

  eventBus.on('app:navigate', (detail) => {
    const viewName = resolveViewName(detail);
    if (viewName) {
      handleNavigationRequest(viewName, router);
    }
  });

  updateBrandAssets(getResolvedTheme());
  subscribeThemeChange((payload) => {
    const theme = payload && typeof payload === 'object' ? payload.theme : undefined;
    updateBrandAssets(theme ?? getResolvedTheme());
  });

  updateHeaderSession(getActiveUserFn());

  eventBus.on('session:changed', (user) => {
    updateHeaderSession(user);
    applySessionThemePreference(user);
  });

  applySessionThemePreference(getActiveUserFn());

  if (memoryIndicator instanceof HTMLElement && memoryIndicatorText instanceof HTMLElement) {
    updateMemoryStatus(getStorageStatusFn());
    eventBus.on('storage:status', (status) => {
      updateMemoryStatus(status);
    });
  }

  if (sessionIndicator instanceof HTMLElement && sessionIndicatorText instanceof HTMLElement) {
    updateSessionStatus(getSessionStatusFn());
    eventBus.on('session:status', (status) => {
      updateSessionStatus(status);
    });
  }

  syncHomeToggleStateFromDom();

  scheduleLayoutOffsetUpdate();

  if (
    typeof window === 'object' &&
    window &&
    typeof window.addEventListener === 'function'
  ) {
    window.addEventListener('resize', scheduleLayoutOffsetUpdate, { passive: true });
    window.addEventListener('orientationchange', scheduleLayoutOffsetUpdate);
  }
}
