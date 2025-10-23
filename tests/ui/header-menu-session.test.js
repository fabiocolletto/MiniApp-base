import test from 'node:test';
import assert from 'node:assert/strict';

import { FakeDocument, FakeElement } from '../helpers/fake-dom.js';

test('header menu updates visibility by session and toggles theme for guests', async () => {
  const document = new FakeDocument();
  document.body.style = {
    display: '',
    setProperty() {},
    removeProperty() {},
  };

  const elementsById = new Map();
  document.getElementById = (id) => elementsById.get(id) ?? null;
  document.documentElement = document.body;

  const registerId = (element, id) => {
    if (id) {
      elementsById.set(id, element);
    }
    return element;
  };

  const createElement = (tagName, className = '') => {
    const element = document.createElement(tagName);
    element.className = className;
    element.style = {
      display: '',
      removeProperty(property) {
        if (property === 'display') {
          this.display = '';
        }
      },
      setProperty() {},
    };
    return element;
  };

  const header = createElement('header');
  document.body.append(header);

  const logo = createElement('button', 'header-logo');
  header.append(logo);

  const headerMenu = createElement('div', 'header-menu');
  header.append(headerMenu);

  const headerMenuControls = createElement('div', 'header-menu__controls');
  headerMenu.append(headerMenuControls);

  const headerMenuTrigger = createElement('button', 'header-menu__trigger');
  headerMenuControls.append(headerMenuTrigger);

  const headerMobileToggle = createElement('button', 'header-mobile-toggle');
  header.append(headerMobileToggle);

  const headerMenuPanel = registerId(createElement('div', 'header-menu__panel'), 'header-navigation-menu');
  headerMenu.append(headerMenuPanel);

  const createMenuButton = (className) => {
    const button = createElement('button', `header-menu__item ${className}`);
    headerMenuPanel.append(button);
    return button;
  };

  const homeLink = createMenuButton('header-home-link');
  const storeLink = createMenuButton('header-store-link');
  const themeToggle = createMenuButton('header-theme-toggle');
  const loginLink = createMenuButton('header-login-link');
  const designKitLink = createMenuButton('header-design-kit-link');
  designKitLink.hidden = true;
  const adminLink = createMenuButton('header-admin-link');
  adminLink.hidden = true;

  const main = createElement('main');
  document.body.append(main);

  const viewRoot = registerId(createElement('div'), 'view-root');
  main.append(viewRoot);

  const windowStub = {
    document,
    matchMedia: () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    }),
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {},
      removeItem() {},
    },
    requestAnimationFrame: (callback) => {
      if (typeof callback === 'function') {
        callback();
      }
    },
    setTimeout,
    clearTimeout,
  };

  globalThis.window = windowStub;
  globalThis.document = document;
  globalThis.HTMLElement = FakeElement;
  globalThis.HTMLButtonElement = FakeElement;
  globalThis.Element = FakeElement;
  globalThis.Node = FakeElement;
  globalThis.CustomEvent = class {
    constructor(type, options = {}) {
      this.type = type;
      this.detail = options.detail;
    }
  };

  globalThis.__MINIAPP_UI_HOOKS__ = {
    views: {},
    runViewCleanup: () => {},
    getActiveUser: () => null,
    getStorageStatus: () => ({ state: 'loading', message: 'Memória carregando' }),
    getSessionStatus: () => ({ state: 'loading', message: 'Sessão sincronizando' }),
  };

  const { __TEST_ONLY__ } = await import('../../ui/app-shell.js');

  __TEST_ONLY__.updateHeaderSession(null);

  assert.strictEqual(homeLink.hidden, true, 'home link should be hidden for guests');
  assert.strictEqual(themeToggle.hidden, false, 'theme toggle should be visible for guests');
  assert.strictEqual(
    themeToggle.textContent,
    'Alternar para tema escuro',
    'theme toggle should invite switching to dark theme initially'
  );
  assert.strictEqual(adminLink.hidden, true, 'admin link should be hidden for guests');
  assert.strictEqual(designKitLink.hidden, true, 'design kit link should be hidden for guests');
  assert.strictEqual(headerMenuControls.dataset.session, 'guest', 'menu dataset must reflect guest session');
  assert.strictEqual(loginLink.hidden, false, 'login must remain visible');
  assert.strictEqual(loginLink.textContent, 'Login', 'login label should invite authentication for guests');
  assert.strictEqual(
    loginLink.getAttribute('aria-label'),
    'Ir para o painel de login',
    'login aria-label must describe the guest action'
  );

  __TEST_ONLY__.toggleThemePreference();

  assert.strictEqual(themeToggle.hidden, false, 'theme toggle stays visible for guests after toggle');
  assert.strictEqual(
    themeToggle.getAttribute('aria-pressed'),
    'true',
    'theme toggle reflects active dark theme'
  );
  assert.strictEqual(
    themeToggle.textContent,
    'Alternar para tema claro',
    'theme toggle should invite switching back to light theme'
  );

  const user = { name: 'Maria Teste', userType: 'cliente' };
  __TEST_ONLY__.updateHeaderSession(user);

  assert.strictEqual(homeLink.hidden, false, 'home link should appear for authenticated users');
  assert.strictEqual(themeToggle.hidden, true, 'theme toggle should hide for authenticated users');
  assert.strictEqual(adminLink.hidden, true, 'admin link remains hidden for non-admin users');
  assert.strictEqual(designKitLink.hidden, false, 'design kit link should be visible for authenticated users');
  assert.strictEqual(
    designKitLink.getAttribute('aria-hidden'),
    null,
    'design kit link should remove aria-hidden when visible'
  );
  assert.strictEqual(
    headerMenuControls.dataset.session,
    'authenticated',
    'menu dataset must reflect authenticated session'
  );
  assert.strictEqual(loginLink.hidden, false, 'login stays visible even when authenticated');
  assert.strictEqual(loginLink.textContent, 'Logout', 'login label should switch to logout for authenticated users');
  assert.strictEqual(
    loginLink.getAttribute('aria-label'),
    'Encerrar sessão e voltar para o painel de login',
    'logout aria-label must describe the sign-out action'
  );

  const adminUser = { name: 'Ana Admin', userType: 'Administrador' };
  __TEST_ONLY__.updateHeaderSession(adminUser);

  assert.strictEqual(
    adminLink.hidden,
    false,
    'admin link should be visible for administrator accounts'
  );
  assert.strictEqual(
    adminLink.getAttribute('aria-hidden'),
    null,
    'admin link should remove aria-hidden when visible'
  );
  assert.strictEqual(designKitLink.hidden, false, 'design kit link should remain visible for administrators');

  delete globalThis.__MINIAPP_UI_HOOKS__;
  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.HTMLElement;
  delete globalThis.HTMLButtonElement;
  delete globalThis.Element;
  delete globalThis.Node;
  delete globalThis.CustomEvent;
});
