import eventBus from '../scripts/events/event-bus.js';
import { renderGreeting } from '../scripts/views/greeting.js';
import { renderAdmin } from '../scripts/views/admin.js';
import { renderLog } from '../scripts/views/log.js';
import { renderHome } from '../scripts/views/home.js';
import { renderNotFound } from '../scripts/views/not-found.js';
import { renderUserPanel } from '../scripts/views/user.js';
import { renderLoginPanel } from '../scripts/views/login.js';
import { renderRegisterPanel } from '../scripts/views/register.js';
import { renderLegal } from '../scripts/views/legal.js';
import { runViewCleanup as defaultRunViewCleanup } from '../scripts/view-cleanup.js';
import {
  getActiveUser as defaultGetActiveUser,
  getSessionStatus as defaultGetSessionStatus,
} from '../scripts/data/session-store.js';
import { getStorageStatus as defaultGetStorageStatus } from '../scripts/data/user-store.js';

const viewRoot = document.getElementById('view-root');
const mainElement = document.querySelector('main');
const logo = document.querySelector('.header-logo');
const versionButton = document.querySelector('.footer-version');
const loginLink = document.querySelector('.header-login-link');
const registerLink = document.querySelector('.header-register-link');
const homeLink = document.querySelector('.header-home-link');
const headerActions = document.querySelector('.header-actions');
const memoryIndicator = document.querySelector('.footer-memory');
const memoryIndicatorText = memoryIndicator?.querySelector('.footer-memory__text');
const sessionIndicator = document.querySelector('.footer-session');
const sessionIndicatorText = sessionIndicator?.querySelector('.footer-session__text');
const sessionIndicatorAnnouncement = sessionIndicator?.querySelector(
  '.footer-session__announcement'
);

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

type UiHooks = Partial<{
  views: Record<string, (viewRoot: HTMLElement) => void>;
  runViewCleanup: (viewRoot: HTMLElement) => void;
  getActiveUser: typeof defaultGetActiveUser;
  getStorageStatus: typeof defaultGetStorageStatus;
  getSessionStatus: typeof defaultGetSessionStatus;
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

export type RouteName = 'dashboard' | 'login' | 'register';

export interface RouterBridge {
  goTo(route: RouteName): void;
}

type ViewName =
  | 'greeting'
  | 'admin'
  | 'log'
  | 'home'
  | 'user'
  | 'login'
  | 'register'
  | 'legal';

type NavigationPayload = { view?: string } | string | null | undefined;

const views: Record<string, (viewRoot: HTMLElement) => void> = {
  greeting: renderGreeting,
  admin: renderAdmin,
  log: renderLog,
  home: renderHome,
  user: renderUserPanel,
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
  button.className = 'header-action header-action--avatar';
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

function isHomePanelActive(): boolean {
  return viewRoot instanceof HTMLElement && viewRoot.dataset.view === 'home';
}

function getHomeToggleLabel(isActive: boolean): string {
  return isActive ? 'Fechar painel inicial' : 'Abrir painel inicial';
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
  if (isHomePanelActive()) {
    renderView('greeting');
    return;
  }

  shellRouter?.goTo('dashboard');
}

function setLinkVisibility(link: Element | null, isVisible: boolean): void {
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

function updateHeaderSession(user: unknown): void {
  const isAuthenticated = Boolean(user);

  setLinkVisibility(loginLink, !isAuthenticated);
  setLinkVisibility(registerLink, !isAuthenticated);

  if (!isAuthenticated) {
    if (headerUserButton?.isConnected) {
      headerUserButton.remove();
    }
    return;
  }

  const button = getHeaderUserButton();
  const initials = extractInitials(user);
  const label = formatUserLabel(user);

  button.textContent = initials;
  button.setAttribute('aria-label', label);
  button.setAttribute('title', label);

  if (!button.isConnected && headerActions instanceof HTMLElement) {
    headerActions.append(button);
  }
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

export function renderView(name: ViewName): void {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

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
}

function handleNavigationRequest(viewName: string, router: RouterBridge): void {
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

  renderView(viewName as ViewName);
}

export function showSplash(message = 'Carregando painel...'): void {
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

export function initializeAppShell(router: RouterBridge): void {
  if (initialized) {
    return;
  }

  initialized = true;
  shellRouter = router;

  homeLink?.addEventListener('click', (event) => {
    event.preventDefault();
    toggleHomePanel();
  });

  logo?.addEventListener('click', () => renderView('admin'));
  versionButton?.addEventListener('click', () => renderView('log'));
  loginLink?.addEventListener('click', (event) => {
    event.preventDefault();
    router.goTo('login');
  });
  registerLink?.addEventListener('click', (event) => {
    event.preventDefault();
    router.goTo('register');
  });

  registerSessionIndicatorInteractions();

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

  updateHeaderSession(getActiveUserFn());

  eventBus.on('session:changed', (user) => {
    updateHeaderSession(user);
  });

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
}
