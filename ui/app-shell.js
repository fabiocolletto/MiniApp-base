import eventBus from '../scripts/events/event-bus.js';
import { renderAdmin } from '../scripts/views/admin.js';
import { renderAdminDesignKit } from '../scripts/views/admin-design-kit.js';
import { renderLog } from '../scripts/views/log.js';
import { renderTemporaryProjects } from '../scripts/views/temporary-projects.js';
import { renderHome } from '../scripts/views/home.js';
import { renderNotFound } from '../scripts/views/not-found.js';
import { renderUserPanel } from '../scripts/views/user.js';
import { renderMiniAppStore } from '../scripts/views/miniapp-store.js';
import { renderLoginPanel } from '../scripts/views/login.js';
import { renderRegisterPanel } from '../scripts/views/register.js';
import { renderLegal } from '../scripts/views/legal.js';
import { renderTaskDashboard } from '../scripts/views/tasks.js';
import { renderExamDashboard } from '../scripts/views/exams.js';
import { runViewCleanup as defaultRunViewCleanup } from '../scripts/view-cleanup.js';
import {
  clearActiveUser as defaultClearActiveUser,
  getActiveUser as defaultGetActiveUser,
  getSessionStatus as defaultGetSessionStatus,
} from '../scripts/data/session-store.js';
import {
  getStorageStatus as defaultGetStorageStatus,
  sanitizeUserThemePreference,
  updateUser as updateUserRecord,
} from '../scripts/data/user-store.js';
import { getSystemReleaseMetadata } from '../scripts/utils/system-release.js';
import {
  getResolvedTheme,
  getThemePreference,
  setThemePreference,
  subscribeThemeChange,
} from '../scripts/theme/theme-manager.js';
import {
  initializeFooterIndicatorsPreference,
  getFooterIndicatorsPreference,
  setFooterIndicatorsPreference,
  subscribeFooterIndicatorsChange,
  sanitizeFooterIndicatorsPreference,
} from '../scripts/preferences/footer-indicators.js';
import {
  getActivityStatus as defaultGetActivityStatus,
  subscribeActivityStatus as defaultSubscribeActivityStatus,
} from '../scripts/system/activity-indicator.js';
import { syncSystemReleaseIndicators } from '../sys/tools/log.js';
import {
  DEFAULT_BRANDING_LOGOS,
  getBrandingSnapshot,
  subscribeBranding,
} from '../scripts/data/branding-store.js';
import { recordMiniAppAccess } from '../scripts/data/miniapp-activity-store.js';

const viewRoot = document.getElementById('view-root');
const mainElement = document.querySelector('main');
const headerElement = document.querySelector('header');
const logo = document.querySelector('.header-logo');
const logoImage =
  (logo && typeof logo.querySelector === 'function'
    ? logo.querySelector('.header-logo__image')
    : null) || document.querySelector('.header-logo__image');
const headerTitle = document.querySelector('.header-title');
const headerTitleText =
  (headerTitle && typeof headerTitle.querySelector === 'function'
    ? headerTitle.querySelector('.header-title__text')
    : null) || document.querySelector('.header-title__text');
const versionButton = document.querySelector('.footer-version');
const loginLink = document.querySelector('.header-login-link');
const homeLink = document.querySelector('.header-home-link');
const storeLink = document.querySelector('.header-store-link');
const headerTasksLink = document.querySelector('.header-tasks-link');
const headerExamsLink = document.querySelector('.header-exams-link');
const headerProjectLink = document.querySelector('.header-project-link');
const headerTemporaryLink = document.querySelector('.header-temporary-link');
const headerUserLink = document.querySelector('.header-user-link');
const headerThemeToggle = document.querySelector('.header-theme-toggle');
const headerAdminLink = document.querySelector('.header-admin-link');
const headerDesignKitLink = document.querySelector('.header-design-kit-link');
const headerMenu = document.querySelector('.header-menu');
const headerMenuControls = document.querySelector('.header-menu__controls');
const headerMenuTrigger = document.querySelector('.header-menu__trigger');
const headerMenuPanel = document.getElementById('header-navigation-menu');
const headerMenuPrimarySeparator = document.querySelector('.header-menu__separator--primary');
const headerMenuSecondarySeparator = document.querySelector('.header-menu__separator--secondary');
const headerMobileToggle = document.querySelector('.header-mobile-toggle');
const memoryIndicator = document.querySelector('.footer-memory');
const memoryIndicatorText = memoryIndicator?.querySelector('.footer-memory__text');
const sessionIndicator = document.querySelector('.footer-session');
const sessionIndicatorText = sessionIndicator?.querySelector('.footer-session__text');
const sessionIndicatorAnnouncement = sessionIndicator?.querySelector('.footer-session__announcement');
const activityIndicator = document.querySelector('.footer-activity');
const activityIndicatorText = activityIndicator?.querySelector('.footer-activity__text');
const activityIndicatorAnnouncement = activityIndicator?.querySelector('.footer-activity__announcement');
const footerElement = document.querySelector('footer');
const footerToggleButton = footerElement?.querySelector('[data-footer-toggle]');
const footerBrandIcon = footerElement?.querySelector('.footer-brand__icon');
const footerActions = footerElement?.querySelector('.footer-actions');

const rootElement = typeof document === 'object' && document ? document.documentElement : null;

const mobileFooterMediaQuery =
  typeof window === 'object' && window && typeof window.matchMedia === 'function'
    ? window.matchMedia('(max-width: 640px)')
    : null;

function applySystemVersionMetadata() {
  const metadata = getSystemReleaseMetadata();
  syncSystemReleaseIndicators(metadata);
}

applySystemVersionMetadata();

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

const DEFAULT_THEME_ASSETS = {
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
let brandingAssets = getBrandingSnapshot();
let lastAppliedLogo = null;
let lastAppliedIcon = null;

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

let lastSessionFooterIndicatorsPreference = null;

let headerMobileMenuPanel = null;
let mobileHomeAction = null;
let mobileStoreAction = null;
let mobileProjectAction = null;
let mobileTasksAction = null;
let mobileExamsAction = null;
let mobileTemporaryAction = null;
let mobileUserAction = null;
let mobileLoginAction = null;
let mobileThemeAction = null;
let mobileAdminAction = null;

let headerMenuOpen = false;
let removeHeaderMenuListeners = null;

let appModalBackdrop = null;
let appModalContainer = null;
let appModalOpen = false;
let removeAppModalListeners = null;
let activeModalId = null;
let modalActiveTrigger = null;
let modalCleanup = null;

function resolveBrandLogo(theme) {
  const normalizedTheme = theme === 'dark' ? 'dark' : 'light';
  const mode = brandingAssets?.mode === 'shared' ? 'shared' : 'individual';
  const logos = brandingAssets?.logos && typeof brandingAssets.logos === 'object' ? brandingAssets.logos : {};

  if (mode === 'shared') {
    const sharedLogo = typeof logos.shared === 'string' ? logos.shared.trim() : '';
    if (sharedLogo) {
      return sharedLogo;
    }

    return DEFAULT_BRANDING_LOGOS.light;
  }

  const themedLogo = typeof logos[normalizedTheme] === 'string' ? logos[normalizedTheme].trim() : '';
  if (themedLogo) {
    return themedLogo;
  }

  return DEFAULT_BRANDING_LOGOS[normalizedTheme] ?? DEFAULT_BRANDING_LOGOS.light;
}

function resolveBrandIcon(theme) {
  const normalizedTheme = theme === 'dark' ? 'dark' : 'light';
  const assets = DEFAULT_THEME_ASSETS[normalizedTheme];
  return assets?.icon ?? null;
}

function updateBrandAssets(theme) {
  const normalizedTheme = theme === 'dark' ? 'dark' : 'light';
  const nextLogo = resolveBrandLogo(normalizedTheme);
  const nextIcon = resolveBrandIcon(normalizedTheme);

  if (logoImage && typeof nextLogo === 'string' && nextLogo && nextLogo !== lastAppliedLogo) {
    if (typeof logoImage.setAttribute === 'function') {
      logoImage.setAttribute('src', nextLogo);
    } else if ('src' in logoImage) {
      logoImage.src = nextLogo;
    }
    lastAppliedLogo = nextLogo;
  }

  if (footerBrandIcon && typeof nextIcon === 'string' && nextIcon && nextIcon !== lastAppliedIcon) {
    if (typeof footerBrandIcon.setAttribute === 'function') {
      footerBrandIcon.setAttribute('src', nextIcon);
    } else if ('src' in footerBrandIcon) {
      footerBrandIcon.src = nextIcon;
    }
    lastAppliedIcon = nextIcon;
  }

  currentBrandTheme = normalizedTheme;
}

function normalizeTheme(theme) {
  return theme === 'dark' ? 'dark' : 'light';
}

function getThemeToggleLabel(theme) {
  return normalizeTheme(theme) === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro';
}

function updateThemeToggleState(theme) {
  const label = getThemeToggleLabel(theme);
  const pressed = normalizeTheme(theme) === 'dark';

  if (headerThemeToggle instanceof HTMLElement) {
    headerThemeToggle.textContent = label;
    headerThemeToggle.setAttribute('aria-label', label);
    headerThemeToggle.setAttribute('title', label);
    headerThemeToggle.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  }

  if (mobileThemeAction instanceof HTMLElement) {
    mobileThemeAction.textContent = label;
    mobileThemeAction.setAttribute('aria-label', label);
    mobileThemeAction.setAttribute('title', label);
    mobileThemeAction.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  }
}

function toggleThemePreference() {
  const currentTheme = normalizeTheme(getResolvedTheme());
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setThemePreference(nextTheme);
  updateThemeToggleState(nextTheme);
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

function resolveUserFooterIndicatorsPreference(user) {
  if (!user || typeof user !== 'object') {
    return sanitizeFooterIndicatorsPreference(getFooterIndicatorsPreference());
  }

  const rawPreference =
    user.preferences && typeof user.preferences === 'object' ? user.preferences.footerIndicators : undefined;
  return sanitizeFooterIndicatorsPreference(rawPreference);
}

function applySessionFooterIndicatorsPreference(user) {
  const preference = resolveUserFooterIndicatorsPreference(user);
  const currentPreference = sanitizeFooterIndicatorsPreference(getFooterIndicatorsPreference());

  if (lastSessionFooterIndicatorsPreference === preference && currentPreference === preference) {
    return;
  }

  lastSessionFooterIndicatorsPreference = preference;
  if (currentPreference !== preference) {
    setFooterIndicatorsPreference(preference);
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
const getActivityStatusFn =
  rawHooks && typeof rawHooks.getActivityStatus === 'function'
    ? rawHooks.getActivityStatus
    : defaultGetActivityStatus;
const subscribeActivityStatusFn =
  rawHooks && typeof rawHooks.subscribeActivityStatus === 'function'
    ? rawHooks.subscribeActivityStatus
    : defaultSubscribeActivityStatus;
const clearActiveUserFn =
  rawHooks && typeof rawHooks.clearActiveUser === 'function'
    ? rawHooks.clearActiveUser
    : defaultClearActiveUser;

const LAST_VIEW_STORAGE_KEY = 'miniapp:last-view';

function getNavigationStorage() {
  if (typeof window !== 'object' || !window) {
    return null;
  }

  try {
    return window.localStorage ?? null;
  } catch (error) {
    console.error('Não foi possível acessar o armazenamento de navegação.', error);
    return null;
  }
}

function sanitizePersistedViewName(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function persistActiveViewName(viewName) {
  const sanitized = sanitizePersistedViewName(viewName);
  if (!sanitized) {
    return;
  }

  const storage = getNavigationStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(LAST_VIEW_STORAGE_KEY, sanitized);
  } catch (error) {
    console.error('Não foi possível persistir a última view ativa.', error);
  }
}

function clearPersistedViewName() {
  const storage = getNavigationStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(LAST_VIEW_STORAGE_KEY);
  } catch (error) {
    console.error('Não foi possível limpar a última view ativa persistida.', error);
  }
}

export function getPersistedViewName() {
  const storage = getNavigationStorage();
  if (!storage) {
    return null;
  }

  try {
    const storedValue = storage.getItem(LAST_VIEW_STORAGE_KEY);
    return sanitizePersistedViewName(storedValue);
  } catch (error) {
    console.error('Não foi possível ler a última view ativa persistida.', error);
    return null;
  }
}

const views = {
  admin: renderAdmin,
  'admin-design-kit': renderAdminDesignKit,
  log: renderLog,
  'temporary-projects': renderTemporaryProjects,
  home: renderHome,
  tasks: renderTaskDashboard,
  exams: renderExamDashboard,
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

const MENU_LABEL_FALLBACKS = {
  admin: 'Painel administrativo',
  'admin-design-kit': 'Painel de design',
  miniapps: 'MiniApps',
  user: 'Painel do usuário',
  login: 'Painel de Login',
  register: 'Crie sua conta',
  log: 'Painel do projeto',
  'temporary-projects': 'Projetos temporários',
  tasks: 'Painel de tarefas',
  exams: 'Painel de provas',
  legal: 'Documentos legais',
  home: 'Início',
  dashboard: 'Início',
  splash: 'Carregando painel',
  'not-found': 'Conteúdo não disponível',
};

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
    appModalContainer.className = 'app-modal';
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

  return Array.from(headerMenuPanel.querySelectorAll('.header-menu__item')).filter((item) => {
    if (!(item instanceof HTMLElement)) {
      return false;
    }

    if (item.hidden || item.getAttribute('aria-hidden') === 'true') {
      return false;
    }

    const display = item.style?.display;
    return typeof display !== 'string' || display.trim() !== 'none';
  });
}

function extractViewHeading() {
  if (!(viewRoot instanceof HTMLElement)) {
    return '';
  }

  const heading = viewRoot.querySelector('h1');
  if (!(heading instanceof HTMLElement)) {
    return '';
  }

  const text = heading.textContent;
  return typeof text === 'string' ? text.trim() : '';
}

function resolveHeaderTitle(viewName) {
  const headingText = extractViewHeading();
  if (headingText) {
    return headingText;
  }

  const normalizedView = typeof viewName === 'string' ? viewName.trim() : '';
  if (normalizedView) {
    const fallback = MENU_LABEL_FALLBACKS[normalizedView];
    if (typeof fallback === 'string' && fallback.trim() !== '') {
      return fallback.trim();
    }
  }

  return MENU_LABEL_FALLBACKS.home;
}

function updateHeaderTitle(viewName) {
  if (!(headerTitleText instanceof HTMLElement)) {
    return;
  }

  const title = resolveHeaderTitle(viewName);
  headerTitleText.textContent = title;

  const container = headerTitleText.closest('.header-title');
  if (container instanceof HTMLElement) {
    if (title) {
      container.hidden = false;
      container.removeAttribute('aria-hidden');
    } else {
      container.hidden = true;
      container.setAttribute('aria-hidden', 'true');
    }
  }
}

function updateHeaderMenuTriggerLabel() {
  if (!(headerMenuTrigger instanceof HTMLElement)) {
    return;
  }

  const labelElement = headerMenuTrigger.querySelector('.header-menu__label');
  if (!(labelElement instanceof HTMLElement)) {
    return;
  }

  labelElement.textContent = 'Painéis';
  headerMenuTrigger.dataset.hasLabel = 'true';
}

function syncHeaderMenuTriggerLabelFromDom() {
  const currentView = viewRoot instanceof HTMLElement ? viewRoot.dataset.view ?? '' : '';
  updateHeaderMenuTriggerLabel();
  updateHeaderTitle(currentView);
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

function updateFooterMobileAccessibility(currentPreference) {
  if (!(footerToggleButton instanceof HTMLButtonElement)) {
    return;
  }

  const normalizedPreference = sanitizeFooterIndicatorsPreference(
    currentPreference ?? getFooterIndicatorsPreference(),
  );
  const isVisible = normalizedPreference === 'visible';
  const label = isVisible ? 'Ocultar indicadores do rodapé' : 'Exibir indicadores do rodapé';

  footerToggleButton.setAttribute('aria-controls', 'footer-actions');
  footerToggleButton.setAttribute('aria-expanded', isVisible ? 'true' : 'false');
  footerToggleButton.setAttribute('aria-label', label);
  footerToggleButton.setAttribute('title', label);
  footerToggleButton.setAttribute('aria-pressed', isVisible ? 'true' : 'false');
  footerToggleButton.dataset.footerIndicatorsPreference = normalizedPreference;
}

function applyFooterIndicatorsVisibility(preference) {
  if (!(footerElement instanceof HTMLElement)) {
    return;
  }

  const normalizedPreference = sanitizeFooterIndicatorsPreference(preference);
  const isVisible = normalizedPreference === 'visible';

  footerElement.dataset.footerIndicators = normalizedPreference;

  if (footerActions instanceof HTMLElement) {
    footerActions.hidden = !isVisible;
    footerActions.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
  }

  if (mobileFooterMediaQuery?.matches) {
    footerElement.dataset.mobileState = isVisible ? 'expanded' : 'collapsed';
  } else {
    footerElement.removeAttribute('data-mobile-state');
  }

  updateFooterMobileAccessibility(normalizedPreference);
  scheduleLayoutOffsetUpdate();
}

function registerFooterMobileToggle() {
  if (!(footerElement instanceof HTMLElement) || !(footerToggleButton instanceof HTMLButtonElement)) {
    return;
  }

  const handleToggle = async (event) => {
    if (!(event instanceof Event)) {
      return;
    }

    event.preventDefault();
    const currentPreference = sanitizeFooterIndicatorsPreference(getFooterIndicatorsPreference());
    const nextPreference = currentPreference === 'visible' ? 'hidden' : 'visible';
    setFooterIndicatorsPreference(nextPreference);

    const activeUser = getActiveUserFn();
    const activeUserId = activeUser && typeof activeUser === 'object' ? activeUser.id : null;

    if (activeUserId != null) {
      try {
        await updateUserRecord(activeUserId, { preferences: { footerIndicators: nextPreference } });
      } catch (error) {
        console.error('Não foi possível atualizar a preferência de indicadores do rodapé.', error);
      }
    }
  };

  const handleMediaChange = () => {
    applyFooterIndicatorsVisibility(getFooterIndicatorsPreference());
  };

  footerToggleButton.addEventListener('click', handleToggle);

  if (mobileFooterMediaQuery) {
    if (typeof mobileFooterMediaQuery.addEventListener === 'function') {
      mobileFooterMediaQuery.addEventListener('change', handleMediaChange);
    } else if (typeof mobileFooterMediaQuery.addListener === 'function') {
      mobileFooterMediaQuery.addListener(handleMediaChange);
    }
  }
}

function normalizeContainerClasses(containerClass) {
  if (typeof containerClass === 'string') {
    return containerClass
      .split(' ')
      .map((className) => className.trim())
      .filter(Boolean);
  }

  if (Array.isArray(containerClass)) {
    return containerClass
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter(Boolean);
  }

  return [];
}

function openAppModal({
  id,
  panel,
  labelledBy,
  describedBy,
  focusSelector,
  trigger,
  onClose,
  containerClass,
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

  container.className = 'app-modal';
  const containerClasses = normalizeContainerClasses(containerClass);
  if (containerClasses.length > 0) {
    container.classList.add(...containerClasses);
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

  const storeAction = document.createElement('button');
  storeAction.type = 'button';
  storeAction.id = 'mobile-access-menu-store';
  storeAction.className = 'app-modal__action header-mobile-menu__action';
  storeAction.textContent = 'MiniApps';
  storeAction.addEventListener('click', () => {
    closeHeaderMobileMenu();
    renderView('miniapps');
  });

  const projectAction = document.createElement('button');
  projectAction.type = 'button';
  projectAction.id = 'mobile-access-menu-project';
  projectAction.className = 'app-modal__action header-mobile-menu__action';
  projectAction.textContent = 'Painel do projeto';
  projectAction.addEventListener('click', () => {
    closeHeaderMobileMenu();
    renderView('log');
  });

  const tasksAction = document.createElement('button');
  tasksAction.type = 'button';
  tasksAction.id = 'mobile-access-menu-tasks';
  tasksAction.className = 'app-modal__action header-mobile-menu__action';
  tasksAction.textContent = 'Painel de tarefas';
  tasksAction.addEventListener('click', () => {
    closeHeaderMobileMenu();
    renderView('tasks');
  });

  const examsAction = document.createElement('button');
  examsAction.type = 'button';
  examsAction.id = 'mobile-access-menu-exams';
  examsAction.className = 'app-modal__action header-mobile-menu__action';
  examsAction.textContent = 'Criador de Provas';
  examsAction.addEventListener('click', () => {
    closeHeaderMobileMenu();
    renderView('exams');
  });

  const temporaryAction = document.createElement('button');
  temporaryAction.type = 'button';
  temporaryAction.id = 'mobile-access-menu-temporary';
  temporaryAction.className = 'app-modal__action header-mobile-menu__action';
  temporaryAction.textContent = 'Projetos temporários';
  temporaryAction.hidden = true;
  temporaryAction.addEventListener('click', () => {
    closeHeaderMobileMenu();
    renderView('temporary-projects');
  });

  const userAction = document.createElement('button');
  userAction.type = 'button';
  userAction.id = 'mobile-access-menu-user';
  userAction.className = 'app-modal__action header-mobile-menu__action';
  userAction.textContent = 'Painel do usuário';
  userAction.hidden = true;
  userAction.addEventListener('click', () => {
    closeHeaderMobileMenu();
    renderView('user');
  });

  const loginAction = document.createElement('button');
  loginAction.type = 'button';
  loginAction.id = 'mobile-access-menu-auth';
  loginAction.className =
    'app-modal__action app-modal__action--primary header-mobile-menu__action header-mobile-menu__action--primary';
  loginAction.textContent = 'Login';
  loginAction.setAttribute('aria-label', 'Gerenciar sessão');
  loginAction.setAttribute('title', 'Gerenciar sessão');
  loginAction.addEventListener('click', () => {
    closeHeaderMobileMenu();
    if (headerMenuControls instanceof HTMLElement && headerMenuControls.dataset.session === 'authenticated') {
      clearActiveUserFn();
    }
    shellRouter?.goTo?.('login');
  });

  const themeAction = document.createElement('button');
  themeAction.type = 'button';
  themeAction.id = 'mobile-access-menu-theme';
  themeAction.className = 'app-modal__action header-mobile-menu__action';
  themeAction.setAttribute('aria-pressed', 'false');
  themeAction.textContent = 'Alternar tema';
  themeAction.addEventListener('click', () => {
    toggleThemePreference();
    closeHeaderMobileMenu();
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

  actions.append(
    homeAction,
    storeAction,
    projectAction,
    tasksAction,
    examsAction,
    temporaryAction,
    userAction,
    loginAction,
    themeAction,
    adminAction
  );

  panel.append(header, description, actions);
  headerMobileMenuPanel = panel;
  mobileHomeAction = homeAction;
  mobileStoreAction = storeAction;
  mobileProjectAction = projectAction;
  mobileTasksAction = tasksAction;
  mobileExamsAction = examsAction;
  mobileTemporaryAction = temporaryAction;
  mobileUserAction = userAction;
  mobileLoginAction = loginAction;
  mobileThemeAction = themeAction;
  mobileAdminAction = adminAction;
  syncHomeToggleStateFromDom();
  updateThemeToggleState(getResolvedTheme());

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
    focusSelector: '#mobile-access-menu-auth',
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
  return isActive ? 'Fechar Início' : 'Abrir Início';
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
    if (link.style && typeof link.style.removeProperty === 'function') {
      link.style.removeProperty('display');
    } else if (link.style) {
      link.style.display = '';
    }
    return;
  }

  link.hidden = true;
  link.setAttribute('aria-hidden', 'true');
  link.setAttribute('tabindex', '-1');
  if (link.style) {
    link.style.display = 'none';
  }
}

function updateHeaderSession(user) {
  const isAuthenticated = Boolean(user);
  const normalizedType =
    typeof user?.userType === 'string' ? user.userType.trim().toLowerCase() : '';
  const isAdmin = normalizedType === 'administrador';
  const showAdminLink = isAuthenticated && isAdmin;
  const showTemporaryProjectsLink = isAuthenticated && isAdmin;
  const showDesignKitLink = isAuthenticated;
  const menuControls = headerMenuControls instanceof HTMLElement ? headerMenuControls : null;

  setLinkVisibility(loginLink, true);
  setLinkVisibility(homeLink, isAuthenticated);
  setLinkVisibility(headerTasksLink, true);
  setLinkVisibility(headerExamsLink, true);
  setLinkVisibility(headerProjectLink, true);
  setLinkVisibility(headerTemporaryLink, showTemporaryProjectsLink);
  setLinkVisibility(headerUserLink, isAuthenticated);
  setLinkVisibility(headerThemeToggle, !isAuthenticated);
  setLinkVisibility(headerAdminLink, showAdminLink);
  setLinkVisibility(headerDesignKitLink, showDesignKitLink);

  const shouldShowAdminSection =
    showDesignKitLink || showAdminLink || showTemporaryProjectsLink;
  if (headerMenuPrimarySeparator instanceof HTMLElement) {
    headerMenuPrimarySeparator.hidden = !shouldShowAdminSection;
    if (shouldShowAdminSection) {
      headerMenuPrimarySeparator.removeAttribute('aria-hidden');
    } else {
      headerMenuPrimarySeparator.setAttribute('aria-hidden', 'true');
    }
  }

  if (headerMenuSecondarySeparator instanceof HTMLElement) {
    headerMenuSecondarySeparator.hidden = !shouldShowAdminSection;
    if (shouldShowAdminSection) {
      headerMenuSecondarySeparator.removeAttribute('aria-hidden');
    } else {
      headerMenuSecondarySeparator.setAttribute('aria-hidden', 'true');
    }
  }

  const panel = ensureHeaderMobileMenu();
  if (panel instanceof HTMLElement) {
    setLinkVisibility(mobileHomeAction, isAuthenticated);
    setLinkVisibility(mobileStoreAction, true);
    setLinkVisibility(mobileProjectAction, true);
    setLinkVisibility(mobileTasksAction, true);
    setLinkVisibility(mobileExamsAction, true);
    setLinkVisibility(mobileTemporaryAction, showTemporaryProjectsLink);
    setLinkVisibility(mobileUserAction, isAuthenticated);
    setLinkVisibility(mobileLoginAction, true);
    setLinkVisibility(mobileThemeAction, !isAuthenticated);
    setLinkVisibility(mobileAdminAction, showAdminLink);
  }

  if (menuControls) {
    menuControls.dataset.session = isAuthenticated ? 'authenticated' : 'guest';
  }

  const authLabel = isAuthenticated ? 'Logout' : 'Login';
  const authDescription = isAuthenticated
    ? 'Encerrar sessão e voltar para o painel de login'
    : 'Ir para o painel de login';

  if (loginLink instanceof HTMLElement) {
    loginLink.textContent = authLabel;
    loginLink.setAttribute('aria-label', authDescription);
    loginLink.setAttribute('title', authDescription);
  }

  if (mobileLoginAction instanceof HTMLElement) {
    mobileLoginAction.textContent = authLabel;
    mobileLoginAction.setAttribute('aria-label', authDescription);
    mobileLoginAction.setAttribute('title', authDescription);
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
    if (headerUserLink instanceof HTMLElement) {
      headerUserLink.setAttribute('aria-label', 'Abrir painel do usuário');
      headerUserLink.setAttribute('title', 'Abrir painel do usuário');
    }

    if (mobileUserAction instanceof HTMLElement) {
      mobileUserAction.textContent = 'Painel do usuário';
      mobileUserAction.setAttribute('aria-label', 'Abrir painel do usuário');
      mobileUserAction.setAttribute('title', 'Abrir painel do usuário');
    }

    if (headerUserButton?.isConnected) {
      headerUserButton.remove();
    }

    updateThemeToggleState(getResolvedTheme());
    scheduleLayoutOffsetUpdate();
    return;
  }

  const button = getHeaderUserButton();
  const initials = extractInitials(user);
  const label = formatUserLabel(user);

  button.textContent = initials;
  button.setAttribute('aria-label', label);
  button.setAttribute('title', label);

  if (headerUserLink instanceof HTMLElement) {
    headerUserLink.setAttribute('aria-label', label);
    headerUserLink.setAttribute('title', label);
  }

  if (mobileUserAction instanceof HTMLElement) {
    mobileUserAction.textContent = 'Painel do usuário';
    mobileUserAction.setAttribute('aria-label', label);
    mobileUserAction.setAttribute('title', label);
  }

  if (!button.isConnected && menuControls) {
    menuControls.append(button);
  }

  updateThemeToggleState(getResolvedTheme());
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

function createMiniAppMetaEntry(term, value, { isStatus = false } = {}) {
  if (!term || !value) {
    return null;
  }

  const item = document.createElement('div');
  item.className = 'miniapp-details__meta-item';

  const label = document.createElement('dt');
  label.className = 'miniapp-details__meta-label';
  label.textContent = term;

  const detail = document.createElement('dd');
  detail.className = 'miniapp-details__meta-value';
  if (isStatus) {
    detail.classList.add('miniapp-details__meta-value--status');
  }
  detail.textContent = value;

  item.append(label, detail);
  return item;
}

function buildMiniAppDetailsPanel(app) {
  const panel = document.createElement('div');
  const safeId = typeof app?.id === 'string' && app.id ? app.id : 'miniapp';
  panel.className = 'app-modal__panel app-modal__panel--miniapp miniapp-details';
  panel.id = `miniapp-details-${safeId}`;

  const header = document.createElement('div');
  header.className = 'app-modal__header miniapp-details__header';

  const title = document.createElement('h2');
  title.className = 'app-modal__title miniapp-details__title';
  title.id = `miniapp-details-title-${safeId}`;
  title.textContent = app?.name ?? 'Miniapp disponível';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'app-modal__close miniapp-details__close';
  closeButton.setAttribute('aria-label', 'Fechar ficha técnica do miniapp');
  closeButton.textContent = '×';
  closeButton.addEventListener('click', () => {
    closeAppModal({ restoreFocus: true, id: panel.id });
  });

  header.append(title, closeButton);

  const lead = document.createElement('p');
  lead.className = 'app-modal__description miniapp-details__lead';
  lead.id = `miniapp-details-description-${safeId}`;
  lead.textContent =
    app?.description ?? 'Conheça os detalhes técnicos do miniapp selecionado.';

  const highlights = document.createElement('div');
  highlights.className = 'miniapp-details__highlights';

  if (app?.category) {
    const category = document.createElement('span');
    category.className = 'miniapp-details__chip';
    category.textContent = app.category;
    highlights.append(category);
  }

  if (highlights.childElementCount === 0) {
    highlights.hidden = true;
  }

  const metaList = document.createElement('dl');
  metaList.className = 'miniapp-details__meta';

  [
    ['Versão', app?.version ?? '—'],
    ['Status', app?.status ?? '—', { isStatus: true }],
    ['Última atualização', app?.updatedAt ?? '—'],
  ]
    .map(([term, value, options]) => createMiniAppMetaEntry(term, value, options))
    .filter(Boolean)
    .forEach((entry) => metaList.append(entry));

  panel.append(header, lead);

  if (!highlights.hidden) {
    panel.append(highlights);
  }

  panel.append(metaList);

  return {
    panel,
    title,
    lead,
    closeButton,
  };
}

function openMiniAppDetailsModal({ app, trigger } = {}) {
  if (!app || typeof app !== 'object') {
    return;
  }

  const { panel, title, lead, closeButton } = buildMiniAppDetailsPanel(app);

  openAppModal({
    id: panel.id,
    panel,
    labelledBy: title.id,
    describedBy: lead.id,
    focusSelector: closeButton,
    trigger: trigger instanceof HTMLElement ? trigger : null,
    containerClass: 'app-modal--miniapp',
  });
}

const taskModalIdPrefix = 'task-details';

function createTaskMetaEntry(term, description) {
  if (!term || !description) {
    return null;
  }

  const container = document.createElement('div');
  container.className = 'task-dashboard__modal-meta-item';

  const dt = document.createElement('dt');
  dt.className = 'task-dashboard__modal-meta-term';
  dt.textContent = term;

  const dd = document.createElement('dd');
  dd.className = 'task-dashboard__modal-meta-value';
  dd.textContent = description;

  container.append(dt, dd);
  return container;
}

function buildTaskDetailsPanel(task) {
  const rawId = typeof task?.id === 'string' && task.id.trim() ? task.id.trim() : 'task';
  const panelId = `${taskModalIdPrefix}-${rawId}`;

  const panel = document.createElement('section');
  panel.className = 'app-modal__panel app-modal__panel--task task-dashboard__modal';
  panel.id = panelId;
  panel.setAttribute('role', 'document');

  if (typeof task?.status === 'string') {
    panel.dataset.status = task.status;
  }

  if (typeof task?.dueState === 'string') {
    panel.dataset.dueState = task.dueState;
  }

  const header = document.createElement('div');
  header.className = 'app-modal__header task-dashboard__modal-header';

  const title = document.createElement('h3');
  title.className = 'app-modal__title task-dashboard__modal-title';
  title.id = `${panelId}-title`;
  title.textContent = typeof task?.title === 'string' && task.title.trim() ? task.title.trim() : 'Detalhes da tarefa';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'app-modal__close task-dashboard__modal-close';
  closeButton.textContent = 'Fechar';
  closeButton.setAttribute('aria-label', 'Fechar detalhes da tarefa');
  closeButton.addEventListener('click', () => {
    closeAppModal({ restoreFocus: true, id: panelId });
  });

  header.append(title, closeButton);

  const statusRow = document.createElement('div');
  statusRow.className = 'task-dashboard__modal-status-row';

  const statusBadge = document.createElement('span');
  statusBadge.className = 'task-dashboard__status task-dashboard__modal-status';
  if (typeof task?.status === 'string') {
    statusBadge.dataset.status = task.status;
  }
  statusBadge.textContent =
    typeof task?.statusLabel === 'string' && task.statusLabel.trim()
      ? task.statusLabel.trim()
      : 'Status não definido';

  const priorityBadge = document.createElement('span');
  priorityBadge.className = 'task-dashboard__priority task-dashboard__modal-priority';
  if (typeof task?.priority === 'string') {
    priorityBadge.dataset.priority = task.priority;
  }
  priorityBadge.textContent = `Prioridade ${
    typeof task?.priorityLabel === 'string' && task.priorityLabel.trim() ? task.priorityLabel.trim() : 'padrão'
  }`;

  const dueBadge = document.createElement('span');
  dueBadge.className = 'task-dashboard__due-badge';
  if (typeof task?.dueState === 'string') {
    dueBadge.dataset.dueState = task.dueState;
  }
  dueBadge.textContent =
    typeof task?.dueRelative === 'string' && task.dueRelative.trim()
      ? task.dueRelative.trim()
      : typeof task?.dueLabel === 'string' && task.dueLabel.trim()
        ? task.dueLabel.trim()
        : 'Sem prazo definido';

  statusRow.append(statusBadge, priorityBadge, dueBadge);

  const lead = document.createElement('p');
  lead.className = 'task-dashboard__modal-lead';
  lead.id = `${panelId}-lead`;
  lead.textContent =
    typeof task?.summary === 'string' && task.summary.trim() ? task.summary.trim() : 'Nenhum resumo disponível para esta tarefa.';

  const metaWrapper = document.createElement('div');
  metaWrapper.className = 'task-dashboard__modal-meta';

  const metaEntries = [];
  const dueAbsolute =
    typeof task?.dueAbsolute === 'string' && task.dueAbsolute.trim()
      ? `${task.dueAbsolute.trim()} · ${
          typeof task?.dueRelative === 'string' && task.dueRelative.trim() ? task.dueRelative.trim() : 'Sem prazo definido'
        }`
      : null;
  const ownerLabel =
    typeof task?.ownerName === 'string' && task.ownerName.trim()
      ? `${task.ownerName.trim()} · ${
          typeof task?.ownerRole === 'string' && task.ownerRole.trim() ? task.ownerRole.trim() : 'Responsável não informado'
        }`
      : null;
  const updateLabel =
    typeof task?.lastUpdateRelative === 'string' && task.lastUpdateRelative.trim()
      ? `Atualizado ${task.lastUpdateRelative.trim()}`
      : null;
  const checklistLabel = Number.isFinite(task?.completedChecklist) && Array.isArray(task?.checklist)
    ? `${task.completedChecklist} de ${task.checklist.length} subtarefas concluídas`
    : null;

  if (dueAbsolute) {
    metaEntries.push(createTaskMetaEntry('Prazo', dueAbsolute));
  }

  if (ownerLabel) {
    metaEntries.push(createTaskMetaEntry('Responsável', ownerLabel));
  }

  if (updateLabel) {
    metaEntries.push(createTaskMetaEntry('Última atualização', updateLabel));
  }

  if (checklistLabel) {
    metaEntries.push(createTaskMetaEntry('Checklist', checklistLabel));
  }

  metaEntries.filter(Boolean).forEach((entry) => metaWrapper.append(entry));

  const progressValue = Number.isFinite(task?.progress) ? Math.max(0, Math.min(100, Math.round(task.progress))) : 0;
  const progressContainer = document.createElement('div');
  progressContainer.className = 'task-dashboard__modal-progress';
  progressContainer.setAttribute('role', 'group');

  const progressHeader = document.createElement('div');
  progressHeader.className = 'task-dashboard__modal-progress-header';

  const progressLabel = document.createElement('span');
  progressLabel.className = 'task-dashboard__modal-progress-label';
  progressLabel.textContent = 'Progresso';

  const progressValueLabel = document.createElement('span');
  progressValueLabel.className = 'task-dashboard__modal-progress-value';
  progressValueLabel.textContent = `${progressValue}%`;

  progressHeader.append(progressLabel, progressValueLabel);

  const progressTrack = document.createElement('div');
  progressTrack.className = 'task-dashboard__modal-progress-track';
  progressTrack.setAttribute('role', 'progressbar');
  progressTrack.setAttribute('aria-valuemin', '0');
  progressTrack.setAttribute('aria-valuemax', '100');
  progressTrack.setAttribute('aria-valuenow', String(progressValue));
  progressTrack.setAttribute('aria-label', 'Progresso da tarefa');

  const progressBar = document.createElement('span');
  progressBar.className = 'task-dashboard__modal-progress-bar';
  progressBar.style.width = `${progressValue}%`;
  progressTrack.append(progressBar);

  progressContainer.append(progressHeader, progressTrack);

  const description = document.createElement('p');
  description.className = 'task-dashboard__modal-description';
  description.textContent =
    typeof task?.description === 'string' && task.description.trim()
      ? task.description.trim()
      : 'Nenhum detalhe adicional registrado.';

  const highlight = document.createElement('p');
  highlight.className = 'task-dashboard__modal-highlight';
  if (typeof task?.statusContext === 'string' && task.statusContext.trim()) {
    highlight.textContent = task.statusContext.trim();
  } else {
    highlight.hidden = true;
  }

  const checklistSection = document.createElement('section');
  checklistSection.className = 'task-dashboard__modal-section';

  const checklistTitle = document.createElement('h4');
  checklistTitle.className = 'task-dashboard__modal-section-title';
  checklistTitle.textContent = 'Subtarefas';

  let checklistContent = null;
  if (Array.isArray(task?.checklist) && task.checklist.length > 0) {
    const list = document.createElement('ul');
    list.className = 'task-dashboard__modal-checklist';
    task.checklist.forEach((item) => {
      const listItem = document.createElement('li');
      listItem.className = 'task-dashboard__modal-checklist-item';
      listItem.dataset.state = item.done ? 'done' : 'pending';

      const marker = document.createElement('span');
      marker.className = 'task-dashboard__modal-check';
      marker.setAttribute('aria-hidden', 'true');

      const label = document.createElement('span');
      label.className = 'task-dashboard__modal-check-label';
      label.textContent = item.label;

      listItem.append(marker, label);
      list.append(listItem);
    });
    checklistContent = list;
  } else {
    const empty = document.createElement('p');
    empty.className = 'task-dashboard__modal-empty';
    empty.textContent = 'Nenhuma subtarefa cadastrada.';
    checklistContent = empty;
  }

  checklistSection.append(checklistTitle, checklistContent);

  const activitySection = document.createElement('section');
  activitySection.className = 'task-dashboard__modal-section';

  const activityTitle = document.createElement('h4');
  activityTitle.className = 'task-dashboard__modal-section-title';
  activityTitle.textContent = 'Últimas atualizações';

  let activityContent = null;
  if (Array.isArray(task?.activities) && task.activities.length > 0) {
    const timeline = document.createElement('ol');
    timeline.className = 'task-dashboard__modal-activity';

    task.activities.forEach((entry) => {
      const activityItem = document.createElement('li');
      activityItem.className = 'task-dashboard__modal-activity-item';

      const time = document.createElement('p');
      time.className = 'task-dashboard__modal-activity-time';
      time.textContent = entry.relative ? entry.relative : entry.absolute;

      const descriptionText = document.createElement('p');
      descriptionText.className = 'task-dashboard__modal-activity-description';
      descriptionText.textContent = entry.label;

      const absolute = document.createElement('p');
      absolute.className = 'task-dashboard__modal-activity-absolute';
      absolute.textContent = entry.absolute;

      activityItem.append(time, descriptionText, absolute);
      timeline.append(activityItem);
    });

    activityContent = timeline;
  } else {
    const emptyActivity = document.createElement('p');
    emptyActivity.className = 'task-dashboard__modal-empty';
    emptyActivity.textContent = 'Nenhuma atualização registrada ainda.';
    activityContent = emptyActivity;
  }

  activitySection.append(activityTitle, activityContent);

  const tagsSection = document.createElement('div');
  tagsSection.className = 'task-dashboard__modal-tags';

  if (Array.isArray(task?.tags) && task.tags.length > 0) {
    const tagsLabel = document.createElement('span');
    tagsLabel.className = 'task-dashboard__modal-tags-label';
    tagsLabel.textContent = 'Etiquetas:';

    const tagList = document.createElement('ul');
    tagList.className = 'task-dashboard__modal-tags-list';

    task.tags.forEach((tag) => {
      const item = document.createElement('li');
      item.className = 'task-dashboard__modal-tag';
      item.textContent = tag;
      tagList.append(item);
    });

    tagsSection.append(tagsLabel, tagList);
  } else {
    tagsSection.hidden = true;
  }

  panel.append(
    header,
    statusRow,
    lead,
    metaWrapper,
    progressContainer,
    description,
    highlight,
    checklistSection,
    activitySection,
    tagsSection,
  );

  return { panel, title, lead, closeButton };
}

function openTaskDetailsModal(payload = {}) {
  const task = payload && typeof payload === 'object' ? payload.task : null;
  if (!task || typeof task !== 'object') {
    return;
  }

  const { panel, title, lead, closeButton } = buildTaskDetailsPanel(task);

  openAppModal({
    id: panel.id,
    panel,
    labelledBy: title.id,
    describedBy: lead.id,
    focusSelector: closeButton,
    trigger: payload?.trigger instanceof HTMLElement ? payload.trigger : null,
  });
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

function updateActivityStatus(status) {
  if (!(activityIndicator instanceof HTMLElement) || !(activityIndicatorText instanceof HTMLElement)) {
    return;
  }

  const state = typeof status?.state === 'string' ? status.state : 'idle';
  const message =
    typeof status?.message === 'string' && status.message.trim()
      ? status.message.trim()
      : 'Nenhuma alteração pendente';
  const details = typeof status?.details === 'string' ? status.details.trim() : '';
  const source =
    typeof status?.source === 'string' && status.source.trim() ? status.source.trim() : 'global';

  activityIndicator.dataset.state = state;
  activityIndicator.dataset.source = source;
  activityIndicatorText.textContent = message;

  if (activityIndicatorAnnouncement instanceof HTMLElement) {
    activityIndicatorAnnouncement.textContent = details ? `${message}. ${details}` : message;
  }

  if (details) {
    activityIndicator.setAttribute('title', details);
    activityIndicator.setAttribute('aria-label', `${message}. ${details}`);
  } else {
    activityIndicator.removeAttribute('title');
    activityIndicator.setAttribute('aria-label', message);
  }
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
  const isAdminView =
    view === 'admin' || view === 'admin-design-kit' || view === 'tasks' || view === 'exams';
  const isUserView = view === 'user' || view === 'miniapps';
  const isLoginView = view === 'login';
  const isRegisterView = view === 'register';

  mainElement?.classList.toggle('main--admin', isAdminView);
  mainElement?.classList.toggle('main--user', isUserView);
  mainElement?.classList.toggle('main--login', isLoginView);
  mainElement?.classList.toggle('main--register', isRegisterView);
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
    clearPersistedViewName();
    const activeViewName = viewRoot.dataset.view ?? name;
    updateHomeToggleStateForView(activeViewName);
    updateHeaderMenuTriggerLabel();
    updateHeaderTitle(activeViewName);
    focusViewRoot();
    return;
  }

  viewRoot.dataset.view = name;
  view(viewRoot);
  const activeViewName = viewRoot.dataset.view ?? name;
  persistActiveViewName(activeViewName);
  updateHomeToggleStateForView(activeViewName);
  updateHeaderMenuTriggerLabel();
  updateHeaderTitle(activeViewName);
  focusViewRoot();
  scheduleLayoutOffsetUpdate();
}

function handleNavigationRequest(viewName, router) {
  if (viewName === 'home' || viewName === 'dashboard') {
    router.goTo('dashboard');
    return;
  }

  if (viewName === 'login') {
    clearActiveUserFn();
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

  mainElement?.classList.remove('main--admin', 'main--user', 'main--login', 'main--register');
  viewRoot.className = 'card view view--splash';
  viewRoot.dataset.view = 'splash';

  const loader = document.createElement('div');
  loader.className = 'splash__loader';
  loader.setAttribute('role', 'status');
  loader.setAttribute('aria-live', 'polite');
  loader.textContent = message;

  viewRoot.replaceChildren(loader);
  updateHeaderMenuTriggerLabel();
  updateHeaderTitle('splash');
}

let initialized = false;

export function initializeAppShell(router) {
  if (initialized) {
    return;
  }

  initialized = true;
  shellRouter = router;

  applySystemVersionMetadata();

  const initialFooterPreference = sanitizeFooterIndicatorsPreference(
    getActiveUserFn()?.preferences?.footerIndicators ?? getFooterIndicatorsPreference(),
  );
  initializeFooterIndicatorsPreference({ preference: initialFooterPreference });

  subscribeFooterIndicatorsChange((payload) => {
    const preference = sanitizeFooterIndicatorsPreference(payload?.preference);
    applyFooterIndicatorsVisibility(preference);
  });

  homeLink?.addEventListener('click', (event) => {
    event.preventDefault();
    toggleHomePanel();
  });

  storeLink?.addEventListener('click', (event) => {
    event.preventDefault();
    renderView('miniapps');
    closeHeaderMenu();
  });

  headerTasksLink?.addEventListener('click', (event) => {
    event.preventDefault();
    closeHeaderMenu();
    renderView('tasks');
  });

  headerExamsLink?.addEventListener('click', (event) => {
    event.preventDefault();
    closeHeaderMenu();
    renderView('exams');
  });

  headerProjectLink?.addEventListener('click', (event) => {
    event.preventDefault();
    closeHeaderMenu();
    renderView('log');
  });

  headerTemporaryLink?.addEventListener('click', (event) => {
    event.preventDefault();
    closeHeaderMenu();
    renderView('temporary-projects');
  });

  headerUserLink?.addEventListener('click', (event) => {
    event.preventDefault();
    closeHeaderMenu();
    renderView('user');
  });

  headerThemeToggle?.addEventListener('click', (event) => {
    event.preventDefault();
    toggleThemePreference();
    closeHeaderMenu();
  });

  headerAdminLink?.addEventListener('click', (event) => {
    event.preventDefault();
    closeHeaderMenu();
    renderView('admin');
  });

  headerDesignKitLink?.addEventListener('click', (event) => {
    event.preventDefault();
    closeHeaderMenu();
    renderView('admin-design-kit');
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
    if (headerMenuControls instanceof HTMLElement && headerMenuControls.dataset.session === 'authenticated') {
      clearActiveUserFn();
    }
    router.goTo('login');
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

  eventBus.on('miniapp:details', (payload) => {
    const app = payload && typeof payload === 'object' ? payload.app : null;
    const appId = typeof app?.id === 'string' ? app.id : null;
    const activeUser = getActiveUserFn();
    const userId = activeUser && 'id' in activeUser ? activeUser.id : null;

    if (appId && userId !== null && userId !== undefined) {
      recordMiniAppAccess(userId, appId);
    }

    openMiniAppDetailsModal(payload);
  });

  eventBus.on('tasks:details', (payload) => {
    openTaskDetailsModal(payload);
  });

  updateBrandAssets(getResolvedTheme());
  updateThemeToggleState(getResolvedTheme());
  subscribeBranding((snapshot) => {
    brandingAssets = snapshot;
    const theme = currentBrandTheme ?? getResolvedTheme();
    updateBrandAssets(theme);
  });
  subscribeThemeChange((payload) => {
    const theme = payload && typeof payload === 'object' ? payload.theme : undefined;
    const resolvedTheme = theme ?? getResolvedTheme();
    updateBrandAssets(resolvedTheme);
    updateThemeToggleState(resolvedTheme);
  });

  updateHeaderSession(getActiveUserFn());

  eventBus.on('session:changed', (user) => {
    updateHeaderSession(user);
    applySessionThemePreference(user);
    applySessionFooterIndicatorsPreference(user);
  });

  applySessionThemePreference(getActiveUserFn());
  applySessionFooterIndicatorsPreference(getActiveUserFn());

  if (activityIndicator instanceof HTMLElement && activityIndicatorText instanceof HTMLElement) {
    updateActivityStatus(getActivityStatusFn());
    subscribeActivityStatusFn((status) => {
      updateActivityStatus(status);
    });
  }

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
  syncHeaderMenuTriggerLabelFromDom();

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

export const __TEST_ONLY__ = {
  updateHeaderSession,
  toggleThemePreference,
  updateThemeToggleState,
};
