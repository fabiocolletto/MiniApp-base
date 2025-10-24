import eventBus from '../scripts/events/event-bus.js';
import { renderAdmin } from '../scripts/views/admin.js';
import { renderAdminDesignKit } from '../scripts/views/admin-design-kit.js';
import { renderLog } from '../scripts/views/log.js';
import { renderHome } from '../scripts/views/home.js';
import { renderNotFound } from '../scripts/views/not-found.js';
import { renderUserPanel } from '../scripts/views/user.js';
import { renderMiniAppStore } from '../scripts/views/miniapp-store.js';
import { renderLoginPanel } from '../scripts/views/login.js';
import { renderRegisterPanel } from '../scripts/views/register.js';
import { renderLegal } from '../scripts/views/legal.js';
import { renderPanelGallery } from '../scripts/views/panel-gallery.js';
import { runViewCleanup as defaultRunViewCleanup } from '../scripts/view-cleanup.js';
import {
  clearActiveUser as defaultClearActiveUser,
  getActiveUser as defaultGetActiveUser,
  getSessionStatus as defaultGetSessionStatus,
} from '../scripts/data/session-store.js';
import { getStorageStatus as defaultGetStorageStatus } from '../scripts/data/user-store.js';
import {
  getSystemMetadata,
  getSystemReleaseDate,
  getSystemVersionLabel,
} from '../scripts/data/system-metadata.js';
import { formatSystemReleaseDate } from '../scripts/data/system-info.js';
import { getResolvedTheme, setThemePreference, subscribeThemeChange } from '../scripts/theme/theme-manager.js';
import {
  getActivityStatus as defaultGetActivityStatus,
  subscribeActivityStatus as defaultSubscribeActivityStatus,
} from '../scripts/system/activity-indicator.js';

const viewRoot = document.getElementById('view-root');
const mainElement = document.querySelector('main');
const logo = document.querySelector('.header-logo');
const versionButton = document.querySelector('.footer-version');
const versionButtonText =
  (versionButton && typeof (versionButton as HTMLElement).querySelector === 'function'
    ? (versionButton as HTMLElement).querySelector('.footer-version__text')
    : null) || null;
const loginLink = document.querySelector('.header-login-link');
const homeLink = document.querySelector('.header-home-link');
const storeLink = document.querySelector('.header-store-link');
const headerProjectLink = document.querySelector('.header-project-link');
const headerUserLink = document.querySelector('.header-user-link');
const headerThemeToggle = document.querySelector('.header-theme-toggle');
const headerAdminLink = document.querySelector('.header-admin-link');
const headerDesignKitLink = document.querySelector('.header-design-kit-link');
const headerMenu = document.querySelector('.header-menu');
const headerMenuControls = document.querySelector('.header-menu__controls');
const headerMenuTrigger = document.querySelector<HTMLButtonElement>('.header-menu__trigger');
const headerMenuPanel = document.getElementById('header-navigation-menu');
const headerMenuAdminDivider = document.querySelector<HTMLElement>('.header-menu__separator');
const footerElement = document.querySelector<HTMLElement>('footer');
const footerToggleButton = footerElement?.querySelector<HTMLButtonElement>('[data-footer-toggle]');
const footerBrandIcon = footerElement?.querySelector<HTMLElement>('.footer-brand__icon');
const mobileFooterMediaQuery =
  typeof window === 'object' && window && typeof window.matchMedia === 'function'
    ? window.matchMedia('(max-width: 640px)')
    : null;
const memoryIndicator = document.querySelector('.footer-memory');
const memoryIndicatorText = memoryIndicator?.querySelector('.footer-memory__text');
const sessionIndicator = document.querySelector('.footer-session');
const sessionIndicatorText = sessionIndicator?.querySelector('.footer-session__text');
const sessionIndicatorAnnouncement = sessionIndicator?.querySelector(
  '.footer-session__announcement'
);
const activityIndicator = document.querySelector('.footer-activity');
const activityIndicatorText = activityIndicator?.querySelector('.footer-activity__text');
const activityIndicatorAnnouncement = activityIndicator?.querySelector('.footer-activity__announcement');

const dimmedShellClass = 'app-shell--dimmed';

type SessionStateKey = 'loading' | 'connected' | 'idle' | 'empty';

type SessionLegendItem = {
  state: SessionStateKey;
  label: string;
  description: string;
};

const SESSION_LEGEND_ITEMS: SessionLegendItem[] = [
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

let sessionPopover: HTMLDivElement | null = null;
let sessionPopoverBackdrop: HTMLDivElement | null = null;
let sessionPopoverItems = new Map<SessionStateKey, HTMLLIElement>();
let sessionPopoverOpen = false;
let removeSessionPopoverListeners: (() => void) | null = null;

let headerUserButton: HTMLButtonElement | null = null;
let allowPreventScrollOption = true;
let shellRouter: RouterBridge | null = null;

let headerMenuOpen = false;
let removeHeaderMenuListeners: (() => void) | null = null;

type UiHooks = Partial<{
  views: Record<string, (viewRoot: HTMLElement) => void>;
  runViewCleanup: (viewRoot: HTMLElement) => void;
  getActiveUser: typeof defaultGetActiveUser;
  getStorageStatus: typeof defaultGetStorageStatus;
  getSessionStatus: typeof defaultGetSessionStatus;
  getActivityStatus: typeof defaultGetActivityStatus;
  subscribeActivityStatus: typeof defaultSubscribeActivityStatus;
  clearActiveUser: typeof defaultClearActiveUser;
}>;

const rawHooks =
  typeof globalThis === 'object' && globalThis && '__MINIAPP_UI_HOOKS__' in globalThis
    ? ((globalThis as { __MINIAPP_UI_HOOKS__?: unknown }).__MINIAPP_UI_HOOKS__ as UiHooks | undefined)
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
const clearActiveUserFn =
  rawHooks && typeof rawHooks.clearActiveUser === 'function'
    ? rawHooks.clearActiveUser
    : defaultClearActiveUser;
const getActivityStatusFn =
  rawHooks && typeof rawHooks.getActivityStatus === 'function'
    ? rawHooks.getActivityStatus
    : defaultGetActivityStatus;
const subscribeActivityStatusFn =
  rawHooks && typeof rawHooks.subscribeActivityStatus === 'function'
    ? rawHooks.subscribeActivityStatus
    : defaultSubscribeActivityStatus;

const LAST_VIEW_STORAGE_KEY = 'miniapp:last-view';

function getNavigationStorage(): Storage | null {
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

function sanitizePersistedViewName(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function persistActiveViewName(viewName: string): void {
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

function clearPersistedViewName(): void {
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

export function getPersistedViewName(): string | null {
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

function applySystemVersionMetadata(): void {
  if (!(versionButton instanceof HTMLElement)) {
    return;
  }

  const versionLabel = getSystemVersionLabel();
  if (versionButtonText instanceof HTMLElement) {
    versionButtonText.textContent = versionLabel;
  }

  const metadata = getSystemMetadata();
  const releaseDate = getSystemReleaseDate();
  const formattedDate = formatSystemReleaseDate(releaseDate);

  const labelParts = [`versão ${versionLabel}`];
  if (formattedDate) {
    labelParts.push(`publicada em ${formattedDate}`);
  }

  const accessibleLabel = labelParts.join(' ');
  versionButton.setAttribute('aria-label', `Abrir registro de alterações da ${accessibleLabel}`);
  versionButton.setAttribute('title', `Exibir mudanças da ${accessibleLabel}`);
  versionButton.dataset.version = versionLabel;

  const changelogPath = typeof metadata?.changelogPath === 'string' ? metadata.changelogPath.trim() : '';
  if (changelogPath) {
    versionButton.dataset.changelog = changelogPath;
  } else {
    delete versionButton.dataset.changelog;
  }
}

applySystemVersionMetadata();

export type RouteName = 'dashboard' | 'login' | 'register' | 'catalog';

export interface RouterBridge {
  goTo(route: RouteName): void;
}

type ViewName =
  | 'admin'
  | 'admin-design-kit'
  | 'log'
  | 'home'
  | 'panel-gallery'
  | 'user'
  | 'miniapps'
  | 'login'
  | 'register'
  | 'legal';

type MenuViewName = ViewName | 'splash' | 'not-found';

const NEUTRAL_MENU_VIEWS = new Set<MenuViewName>(['home', 'panel-gallery', 'splash']);

const MENU_LABEL_FALLBACKS: Partial<Record<MenuViewName, string>> = {
  admin: 'Painel administrativo',
  'admin-design-kit': 'Painel de design',
  'panel-gallery': 'Galeria de painéis',
  miniapps: 'MiniApps',
  user: 'Painel do usuário',
  login: 'Painel de Login',
  register: 'Crie sua conta',
  log: 'Painel do projeto',
  legal: 'Documentos legais',
  'not-found': 'Conteúdo não disponível',
};

type NavigationPayload = { view?: string } | string | null | undefined;

const views: Record<string, (viewRoot: HTMLElement) => void> = {
  admin: renderAdmin,
  'admin-design-kit': renderAdminDesignKit,
  log: renderLog,
  home: renderHome,
  'panel-gallery': renderPanelGallery,
  user: renderUserPanel,
  miniapps: renderMiniAppStore,
  login: renderLoginPanel,
  register: renderRegisterPanel,
  legal: renderLegal,
};

if (viewOverrides) {
  Object.entries(viewOverrides).forEach(([name, renderer]) => {
    if (typeof renderer === 'function') {
      views[name] = renderer as (viewRoot: HTMLElement) => void;
    }
  });
}

function resolveViewName(payload: NavigationPayload): string | null {
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    return trimmed ? trimmed : null;
  }

  const view = payload?.view;
  if (typeof view === 'string') {
    const trimmed = view.trim();
    return trimmed ? trimmed : null;
  }

  return null;
}

function getHeaderUserButton(): HTMLButtonElement {
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

function extractInitials(user: unknown): string {
  const name = typeof (user as { name?: string })?.name === 'string' ? (user as { name?: string }).name.trim() : '';
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : parts[0]?.[1] ?? '';
    return `${first}${last}`.toUpperCase();
  }

  const phone = typeof (user as { phone?: string })?.phone === 'string'
    ? (user as { phone?: string }).phone.replace(/\D+/g, '')
    : '';
  if (phone.length >= 2) {
    return phone.slice(-2).toUpperCase();
  }

  return 'US';
}

function formatUserLabel(user: unknown): string {
  const rawName = typeof (user as { name?: string })?.name === 'string' ? (user as { name?: string }).name.trim() : '';
  const rawPhone = typeof (user as { phone?: string })?.phone === 'string' ? (user as { phone?: string }).phone.trim() : '';

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

function isHtmlElement(element: unknown): element is HTMLElement {
  return element instanceof HTMLElement;
}

function isHomePanelActive(): boolean {
  return viewRoot instanceof HTMLElement && viewRoot.dataset.view === 'home';
}

function getHomeToggleLabel(isActive: boolean): string {
  return isActive ? 'Fechar Início' : 'Abrir Início';
}

function applyHomeToggleState(isActive: boolean): void {
  if (!(homeLink instanceof HTMLElement)) {
    return;
  }

  const label = getHomeToggleLabel(isActive);
  homeLink.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  homeLink.setAttribute('aria-label', label);
  homeLink.setAttribute('title', label);
}

function updateHomeToggleStateForView(viewName: string): void {
  applyHomeToggleState(viewName === 'home');
}

function syncHomeToggleStateFromDom(): void {
  if (!(viewRoot instanceof HTMLElement)) {
    applyHomeToggleState(false);
    return;
  }

  updateHomeToggleStateForView(viewRoot.dataset.view ?? '');
}

function toggleHomePanel(): void {
  closeHeaderMenu();

  if (isHomePanelActive()) {
    return;
  }

  shellRouter?.goTo('dashboard');
}

type HeaderMenuFocusTarget = 'first' | 'last' | null;

function getHeaderMenuItems(): HTMLElement[] {
  if (!(headerMenuPanel instanceof HTMLElement)) {
    return [];
  }

  return Array.from(headerMenuPanel.querySelectorAll<HTMLElement>('.header-menu__item')).filter(
    (item): item is HTMLElement => {
      if (!(item instanceof HTMLElement)) {
        return false;
      }

      if (item.hidden || item.getAttribute('aria-hidden') === 'true') {
        return false;
      }

      const display = typeof item.style?.display === 'string' ? item.style.display.trim() : '';
      return display !== 'none';
    }
  );
}

function extractViewHeading(): string {
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

function updateHeaderMenuTriggerLabel(viewName: string): void {
  if (!(headerMenuTrigger instanceof HTMLElement)) {
    return;
  }

  const labelElement = headerMenuTrigger.querySelector<HTMLElement>('.header-menu__label');
  if (!(labelElement instanceof HTMLElement)) {
    return;
  }

  const normalizedView = typeof viewName === 'string' ? viewName.trim() : '';
  const isNeutral = NEUTRAL_MENU_VIEWS.has(normalizedView as MenuViewName);

  let labelText = '';
  if (!isNeutral) {
    const headingText = extractViewHeading();
    labelText = headingText || MENU_LABEL_FALLBACKS[normalizedView as MenuViewName] || '';

    if (!labelText) {
      labelText = 'Painéis';
    }
  }

  const normalizedLabel = labelText.trim();
  const hasLabel = !isNeutral && Boolean(normalizedLabel);

  labelElement.textContent = hasLabel ? normalizedLabel : '';
  headerMenuTrigger.dataset.hasLabel = hasLabel ? 'true' : 'false';
}

function syncHeaderMenuTriggerLabelFromDom(): void {
  const currentView = viewRoot instanceof HTMLElement ? viewRoot.dataset.view ?? '' : '';
  updateHeaderMenuTriggerLabel(currentView);
}

function setHeaderMenuState(isOpen: boolean): void {
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

function closeHeaderMenu({ focusTrigger = false }: { focusTrigger?: boolean } = {}): void {
  if (!headerMenuOpen) {
    return;
  }

  headerMenuOpen = false;
  setHeaderMenuState(false);

  removeHeaderMenuListeners?.();
  removeHeaderMenuListeners = null;

  if (focusTrigger && headerMenuTrigger instanceof HTMLElement) {
    headerMenuTrigger.focus();
  }
}

function openHeaderMenu({ focus = 'first' }: { focus?: HeaderMenuFocusTarget } = {}): void {
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

  const handlePointerDown = (event: Event) => {
    if (!(headerMenu instanceof HTMLElement)) {
      return;
    }

    const target = event.target;
    if (!isHtmlElement(target) || !headerMenu.contains(target)) {
      closeHeaderMenu();
    }
  };

  const handleFocusIn = (event: FocusEvent) => {
    if (!(headerMenu instanceof HTMLElement)) {
      return;
    }

    const target = event.target;
    if (!isHtmlElement(target) || !headerMenu.contains(target)) {
      closeHeaderMenu();
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
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
    document.addEventListener('focusin', handleFocusIn as EventListener);
    document.addEventListener('keydown', handleKeyDown, true);

    removeHeaderMenuListeners = () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('focusin', handleFocusIn as EventListener);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  } else {
    removeHeaderMenuListeners = null;
  }
}

function toggleHeaderMenu(): void {
  if (headerMenuOpen) {
    closeHeaderMenu({ focusTrigger: true });
    return;
  }

  openHeaderMenu();
}

function focusHeaderMenuItemByOffset(currentIndex: number, offset: number): void {
  const items = getHeaderMenuItems();
  if (!items.length) {
    return;
  }

  const normalizedIndex = ((currentIndex + offset) % items.length + items.length) % items.length;
  items[normalizedIndex]?.focus();
}

function handleHeaderMenuItemKeydown(event: KeyboardEvent): void {
  const target = event.target;
  if (!isHtmlElement(target) || !target.classList.contains('header-menu__item')) {
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
    items[0]?.focus();
    return;
  }

  if (event.key === 'End') {
    event.preventDefault();
    items[items.length - 1]?.focus();
  }
}

function setLinkVisibility(link: Element | null, isVisible: boolean): void {
  if (!(link instanceof HTMLElement)) {
    return;
  }

  if (isVisible) {
    link.hidden = false;
    link.removeAttribute('aria-hidden');
    link.removeAttribute('tabindex');
    if (typeof link.style?.removeProperty === 'function') {
      link.style.removeProperty('display');
    } else {
      link.style.display = '';
    }
    return;
  }

  link.hidden = true;
  link.setAttribute('aria-hidden', 'true');
  link.setAttribute('tabindex', '-1');
  link.style.display = 'none';
}

function normalizeTheme(theme: unknown): 'light' | 'dark' {
  return theme === 'dark' ? 'dark' : 'light';
}

function getThemeToggleLabel(theme: unknown): string {
  return normalizeTheme(theme) === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro';
}

function updateThemeToggleState(theme: unknown): void {
  const label = getThemeToggleLabel(theme);
  const pressed = normalizeTheme(theme) === 'dark';

  if (headerThemeToggle instanceof HTMLElement) {
    headerThemeToggle.textContent = label;
    headerThemeToggle.setAttribute('aria-label', label);
    headerThemeToggle.setAttribute('title', label);
    headerThemeToggle.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  }
}

function toggleThemePreference(): void {
  const currentTheme = normalizeTheme(getResolvedTheme());
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setThemePreference(nextTheme);
  updateThemeToggleState(nextTheme);
}

function updateHeaderSession(user: unknown): void {
  const isAuthenticated = Boolean(user);
  const normalizedType =
    typeof (user as { userType?: string | null })?.userType === 'string'
      ? ((user as { userType?: string }).userType ?? '').trim().toLowerCase()
      : '';
  const isAdmin = normalizedType === 'administrador';
  const showAdminLink = isAuthenticated && isAdmin;
  const showDesignKitLink = isAuthenticated;
  const menuControls = headerMenuControls instanceof HTMLElement ? headerMenuControls : null;

  setLinkVisibility(loginLink, true);
  setLinkVisibility(homeLink, isAuthenticated);
  setLinkVisibility(headerProjectLink, true);
  setLinkVisibility(headerUserLink, isAuthenticated);
  setLinkVisibility(headerThemeToggle, !isAuthenticated);
  setLinkVisibility(headerAdminLink, showAdminLink);
  setLinkVisibility(headerDesignKitLink, showDesignKitLink);

  if (headerMenuAdminDivider) {
    headerMenuAdminDivider.hidden = !(showDesignKitLink || showAdminLink);
  }

  if (menuControls) {
    menuControls.dataset.session = isAuthenticated ? 'authenticated' : 'guest';
  }

  if (loginLink instanceof HTMLElement) {
    const label = isAuthenticated ? 'Logout' : 'Login';
    const description = isAuthenticated
      ? 'Encerrar sessão e voltar para o painel de login'
      : 'Ir para o painel de login';

    loginLink.textContent = label;
    loginLink.setAttribute('aria-label', description);
    loginLink.setAttribute('title', description);
  }

  if (!isAuthenticated) {
    if (headerUserLink instanceof HTMLElement) {
      headerUserLink.setAttribute('aria-label', 'Abrir painel do usuário');
      headerUserLink.setAttribute('title', 'Abrir painel do usuário');
    }

    if (headerUserButton?.isConnected) {
      headerUserButton.remove();
    }
    updateThemeToggleState(getResolvedTheme());
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

  if (!button.isConnected && menuControls) {
    menuControls.append(button);
  }

  updateThemeToggleState(getResolvedTheme());
}

function ensureSessionPopover(): HTMLDivElement | null {
  if (sessionPopover && sessionPopover.isConnected) {
    return sessionPopover;
  }

  const body = document.body;
  if (!(body instanceof HTMLElement)) {
    return null;
  }

  if (!sessionPopoverBackdrop || !sessionPopoverBackdrop.isConnected) {
    const backdrop = document.createElement('div');
    backdrop.className = 'footer-session__backdrop';
    backdrop.hidden = true;
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.addEventListener('click', () => {
      closeSessionPopover();
    });
    body.append(backdrop);
    sessionPopoverBackdrop = backdrop;
  }

  sessionPopoverItems = new Map();

  const popover = document.createElement('div');
  popover.id = 'session-status-popover';
  popover.className = 'footer-session__popover';
  popover.setAttribute('role', 'dialog');
  popover.setAttribute('aria-modal', 'false');
  popover.setAttribute('aria-hidden', 'true');
  popover.hidden = true;

  const heading = document.createElement('p');
  heading.className = 'footer-session__popover-title';
  heading.textContent = 'Status da sessão';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'footer-session__popover-close';
  closeButton.setAttribute('aria-label', 'Fechar legenda de status da sessão');
  closeButton.setAttribute('title', 'Fechar');
  const closeIcon = document.createElement('span');
  closeIcon.className = 'footer-session__popover-close-icon';
  closeIcon.setAttribute('aria-hidden', 'true');
  closeIcon.textContent = '×';
  closeButton.append(closeIcon);
  closeButton.addEventListener('click', () => {
    closeSessionPopover(true);
  });

  const headingWrapper = document.createElement('div');
  headingWrapper.className = 'footer-session__popover-header';
  headingWrapper.append(heading, closeButton);

  const legend = document.createElement('ul');
  legend.className = 'footer-session__legend';

  SESSION_LEGEND_ITEMS.forEach(({ state, label, description }) => {
    const item = document.createElement('li');
    item.className = 'footer-session__legend-item';
    item.dataset.state = state;

    const itemDot = document.createElement('span');
    itemDot.className = 'footer-session__legend-dot';
    itemDot.setAttribute('aria-hidden', 'true');

    const content = document.createElement('div');
    content.className = 'footer-session__legend-content';

    const itemLabel = document.createElement('span');
    itemLabel.className = 'footer-session__legend-label';
    itemLabel.textContent = label;

    const itemDescription = document.createElement('span');
    itemDescription.className = 'footer-session__legend-description';
    itemDescription.textContent = description;

    content.append(itemLabel, itemDescription);
    item.append(itemDot, content);
    legend.append(item);
    sessionPopoverItems.set(state, item);
  });

  popover.append(headingWrapper, legend);
  body.append(popover);

  sessionPopover = popover;

  return sessionPopover;
}

function highlightSessionPopoverState(state: string): void {
  sessionPopoverItems.forEach((item, key) => {
    const isActive = key === state;
    item.classList.toggle('footer-session__legend-item--active', isActive);
    if (isActive) {
      item.setAttribute('aria-current', 'true');
    } else {
      item.removeAttribute('aria-current');
    }
  });
}

function positionSessionPopover(): void {
  if (!(sessionIndicator instanceof HTMLElement) || !(sessionPopover instanceof HTMLElement)) {
    return;
  }

  const rect = sessionIndicator.getBoundingClientRect();
  const viewportPadding = 12;
  const popoverRect = sessionPopover.getBoundingClientRect();

  let left = rect.left + rect.width / 2 - popoverRect.width / 2;
  const maxLeft = window.innerWidth - popoverRect.width - viewportPadding;
  left = Math.min(Math.max(viewportPadding, left), Math.max(viewportPadding, maxLeft));

  const offset = 16;
  const desiredTop = rect.top - popoverRect.height - offset;
  const top = Math.max(viewportPadding, desiredTop);

  const arrowOffset = rect.left + rect.width / 2 - left;
  const arrowMin = 16;
  const arrowMax = Math.max(arrowMin, popoverRect.width - arrowMin);
  const arrowPosition = Math.min(Math.max(arrowMin, arrowOffset), arrowMax);
  sessionPopover.style.setProperty('--arrow-inline-offset', `${Math.round(arrowPosition)}px`);

  sessionPopover.style.left = `${Math.round(left)}px`;
  sessionPopover.style.top = `${Math.round(top)}px`;
}

function closeSessionPopover(focusButton = false): void {
  const body = document.body;
  if (body instanceof HTMLElement) {
    body.classList.remove(dimmedShellClass);
  }

  if (!sessionPopoverOpen) {
    return;
  }

  sessionPopoverOpen = false;

  if (removeSessionPopoverListeners) {
    removeSessionPopoverListeners();
    removeSessionPopoverListeners = null;
  }

  if (sessionPopover) {
    sessionPopover.hidden = true;
    sessionPopover.setAttribute('aria-hidden', 'true');
  }

  if (sessionPopoverBackdrop instanceof HTMLElement) {
    sessionPopoverBackdrop.classList.remove('footer-session__backdrop--visible');
    sessionPopoverBackdrop.setAttribute('aria-hidden', 'true');
    sessionPopoverBackdrop.hidden = true;
  }

  if (sessionIndicator instanceof HTMLElement) {
    sessionIndicator.setAttribute('aria-expanded', 'false');
    sessionIndicator.classList.remove('footer-session--open');
  }

  if (focusButton && sessionIndicator instanceof HTMLElement) {
    sessionIndicator.focus();
  }
}

function openSessionPopover(): void {
  if (!(sessionIndicator instanceof HTMLElement)) {
    return;
  }

  const popover = ensureSessionPopover();
  if (!(popover instanceof HTMLElement)) {
    return;
  }

  if (sessionPopoverOpen) {
    positionSessionPopover();
    return;
  }

  sessionPopoverOpen = true;

  const body = document.body;
  if (body instanceof HTMLElement) {
    body.classList.add(dimmedShellClass);
  }

  if (sessionPopoverBackdrop instanceof HTMLElement) {
    sessionPopoverBackdrop.hidden = false;
    sessionPopoverBackdrop.setAttribute('aria-hidden', 'false');
    sessionPopoverBackdrop.classList.add('footer-session__backdrop--visible');
  }

  const onPointerDown = (event: PointerEvent) => {
    const target = event.target as Node | null;
    if (sessionIndicator.contains(target) || popover.contains(target)) {
      return;
    }
    closeSessionPopover();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeSessionPopover(true);
    }
  };

  const onViewportChange = () => {
    positionSessionPopover();
  };

  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', onViewportChange);
  window.addEventListener('scroll', onViewportChange, true);

  removeSessionPopoverListeners = () => {
    document.removeEventListener('pointerdown', onPointerDown, true);
    document.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
  };

  popover.hidden = false;
  popover.setAttribute('aria-hidden', 'false');
  popover.style.visibility = 'hidden';
  popover.style.pointerEvents = 'none';

  highlightSessionPopoverState(sessionIndicator.dataset.state ?? 'loading');
  positionSessionPopover();

  popover.style.visibility = '';
  popover.style.pointerEvents = '';

  sessionIndicator.setAttribute('aria-expanded', 'true');
  sessionIndicator.classList.add('footer-session--open');
}

function toggleSessionPopover(): void {
  if (sessionPopoverOpen) {
    closeSessionPopover();
  } else {
    openSessionPopover();
  }
}

function registerSessionIndicatorInteractions(): void {
  if (!(sessionIndicator instanceof HTMLButtonElement)) {
    return;
  }

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

function updateMemoryStatus(status: unknown): void {
  if (!(memoryIndicator instanceof HTMLElement) || !(memoryIndicatorText instanceof HTMLElement)) {
    return;
  }

  const typedStatus = status as { state?: string; message?: string; details?: string } | null | undefined;
  const state = typeof typedStatus?.state === 'string' ? typedStatus.state : 'loading';
  const message =
    typeof typedStatus?.message === 'string' && typedStatus.message.trim()
      ? typedStatus.message.trim()
      : 'Memória carregando';
  const details =
    typeof typedStatus?.details === 'string' && typedStatus.details.trim() ? typedStatus.details.trim() : '';
  const accessibleHighlight =
    state === 'updated' ? 'Dados sincronizados automaticamente.' : '';

  memoryIndicator.dataset.state = state;
  memoryIndicatorText.textContent = message;

  if (details) {
    const joined = accessibleHighlight ? `${message}. ${accessibleHighlight} ${details}` : `${message}. ${details}`;
    memoryIndicator.setAttribute('title', details);
    memoryIndicator.setAttribute('aria-label', joined);
  } else {
    memoryIndicator.removeAttribute('title');
    const fallbackLabel = accessibleHighlight ? `${message}. ${accessibleHighlight}` : message;
    memoryIndicator.setAttribute('aria-label', fallbackLabel);
  }
}

function updateSessionStatus(status: unknown): void {
  if (!(sessionIndicator instanceof HTMLElement) || !(sessionIndicatorText instanceof HTMLElement)) {
    return;
  }

  const payload = (status ?? {}) as { state?: unknown; message?: unknown; details?: unknown };
  const state = typeof payload.state === 'string' ? payload.state : 'loading';
  const message =
    typeof payload.message === 'string' && payload.message.trim()
      ? payload.message.trim()
      : 'Sessão sincronizando';
  const details = typeof payload.details === 'string' && payload.details.trim() ? payload.details.trim() : '';

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

  highlightSessionPopoverState(state);
  if (sessionPopoverOpen) {
    positionSessionPopover();
  }
}

function updateActivityStatus(status: unknown): void {
  if (!(activityIndicator instanceof HTMLElement) || !(activityIndicatorText instanceof HTMLElement)) {
    return;
  }

  const payload = (status ?? {}) as { state?: unknown; message?: unknown; details?: unknown; source?: unknown };
  const state = typeof payload.state === 'string' ? payload.state : 'idle';
  const message =
    typeof payload.message === 'string' && payload.message.trim()
      ? payload.message.trim()
      : 'Nenhuma alteração pendente';
  const details = typeof payload.details === 'string' ? payload.details.trim() : '';
  const source = typeof payload.source === 'string' && payload.source.trim() ? payload.source.trim() : 'global';

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

function focusViewRoot(): void {
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

function applyMainState(view: string): void {
  const isAdminView = view === 'admin' || view === 'admin-design-kit';
  const isUserView = view === 'user' || view === 'miniapps';
  const isLoginView = view === 'login';
  const isRegisterView = view === 'register';

  mainElement?.classList.toggle('main--admin', isAdminView);
  mainElement?.classList.toggle('main--user', isUserView);
  mainElement?.classList.toggle('main--login', isLoginView);
  mainElement?.classList.toggle('main--register', isRegisterView);
}

export function renderView(name: ViewName): void {
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
    updateHeaderMenuTriggerLabel(activeViewName);
    focusViewRoot();
    return;
  }

  viewRoot.dataset.view = name;
  view(viewRoot);
  const activeViewName = viewRoot.dataset.view ?? name;
  persistActiveViewName(activeViewName);
  updateHomeToggleStateForView(activeViewName);
  updateHeaderMenuTriggerLabel(activeViewName);
  focusViewRoot();
}

function handleNavigationRequest(viewName: string, router: RouterBridge): void {
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

  renderView(viewName as ViewName);
}

export function showSplash(message = 'Carregando painel...'): void {
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

  updateHeaderMenuTriggerLabel('splash');
}

let initialized = false;

export function initializeAppShell(router: RouterBridge): void {
  if (initialized) {
    return;
  }

  initialized = true;
  shellRouter = router;

  applySystemVersionMetadata();

  homeLink?.addEventListener('click', (event) => {
    event.preventDefault();
    toggleHomePanel();
  });

  storeLink?.addEventListener('click', (event) => {
    event.preventDefault();
    renderView('miniapps');
    closeHeaderMenu();
  });

  headerProjectLink?.addEventListener('click', (event) => {
    event.preventDefault();
    closeHeaderMenu();
    renderView('log');
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
      shellRouter.goTo('catalog');
      return;
    }

    renderView('panel-gallery');
  });
  versionButton?.addEventListener('click', () => {
    closeHeaderMenu();
    renderView('log');
  });
  loginLink?.addEventListener('click', (event) => {
    event.preventDefault();
    closeHeaderMenu();

    if (
      headerMenuControls instanceof HTMLElement &&
      headerMenuControls.dataset.session === 'authenticated'
    ) {
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

  registerSessionIndicatorInteractions();

  const handleFooterBrandShortcut = (event: Event): void => {
    const isMobile = Boolean(mobileFooterMediaQuery?.matches);
    if (isMobile) {
      return;
    }

    const target = event.target;
    const isFromBrandIcon =
      footerBrandIcon instanceof HTMLElement && target instanceof Node && footerBrandIcon.contains(target);

    if (isFromBrandIcon) {
      event.preventDefault();
      event.stopPropagation();
    }

    closeHeaderMenu();
    renderView('admin');
  };

  footerBrandIcon?.addEventListener('click', handleFooterBrandShortcut);
  footerToggleButton?.addEventListener('click', handleFooterBrandShortcut);

  document.addEventListener('app:navigate', (event) => {
    const viewName = resolveViewName((event as CustomEvent)?.detail);
    if (viewName) {
      eventBus.emit('app:navigate', { view: viewName });
    }
  });

  eventBus.on('app:navigate', (detail) => {
    const viewName = resolveViewName(detail as NavigationPayload);
    if (viewName) {
      handleNavigationRequest(viewName, router);
    }
  });

  updateThemeToggleState(getResolvedTheme());
  subscribeThemeChange((payload) => {
    const theme =
      typeof (payload as { theme?: unknown })?.theme === 'string'
        ? ((payload as { theme?: string }).theme ?? '')
        : undefined;
    const resolvedTheme = theme ?? getResolvedTheme();
    updateThemeToggleState(resolvedTheme);
  });

  updateHeaderSession(getActiveUserFn());

  eventBus.on('session:changed', (user) => {
    updateHeaderSession(user);
  });

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
}

export const __TEST_ONLY__ = {
  updateHeaderSession,
  toggleThemePreference,
  updateThemeToggleState,
};
