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
const headerTitle = document.querySelector('.header-title');
const versionButton = document.querySelector('.footer-version');
const loginLink = document.querySelector('.header-login-link');
const registerLink = document.querySelector('.header-register-link');
const headerActions = document.querySelector('.header-actions');
const memoryIndicator = document.querySelector('.footer-memory');
const memoryIndicatorText = memoryIndicator?.querySelector('.footer-memory__text');
const sessionIndicator = document.querySelector('.footer-session');
const sessionIndicatorText = sessionIndicator?.querySelector('.footer-session__text');

let headerUserButton: HTMLButtonElement | null = null;
let allowPreventScrollOption = true;

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

  if (details) {
    sessionIndicator.setAttribute('title', details);
    sessionIndicator.setAttribute('aria-label', `${message}. ${details}`);
  } else {
    sessionIndicator.removeAttribute('title');
    sessionIndicator.setAttribute('aria-label', message);
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

  mainElement?.classList.toggle('main--admin', isAdminView);
  mainElement?.classList.toggle('main--user', isUserView);
  mainElement?.classList.toggle('main--login', isLoginView);
  mainElement?.classList.toggle('main--register', isRegisterView);
}

export function renderView(name: ViewName): void {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  applyMainState(name);

  const view = views[name];

  viewCleanup(viewRoot);

  if (typeof view !== 'function') {
    console.warn(`View "${name}" não encontrada.`);
    renderNotFound(viewRoot, name);
    focusViewRoot();
    return;
  }

  viewRoot.dataset.view = name;
  view(viewRoot);
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

  mainElement?.classList.remove('main--admin', 'main--user', 'main--login', 'main--register');
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

  logo?.addEventListener('click', () => renderView('admin'));
  versionButton?.addEventListener('click', () => renderView('log'));
  headerTitle?.addEventListener('click', () => router.goTo('dashboard'));
  loginLink?.addEventListener('click', (event) => {
    event.preventDefault();
    router.goTo('login');
  });
  registerLink?.addEventListener('click', (event) => {
    event.preventDefault();
    router.goTo('register');
  });

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
}
