import test from 'node:test';
import assert from 'node:assert/strict';
import { getSystemReleaseMetadata } from '../../scripts/utils/system-release.js';

class FakeNode {
  constructor() {
    this.selectors = new Map();
  }

  registerSelector(selector, element) {
    if (!this.selectors.has(selector)) {
      this.selectors.set(selector, new Set());
    }
    this.selectors.get(selector).add(element);
  }

  querySelector(selector) {
    const bucket = this.selectors.get(selector);
    if (!bucket || bucket.size === 0) {
      return null;
    }
    const first = bucket.values().next().value;
    return first ?? null;
  }

  querySelectorAll(selector) {
    const bucket = this.selectors.get(selector);
    if (!bucket || bucket.size === 0) {
      return [];
    }
    return Array.from(bucket.values());
  }
}

class FakeElement extends FakeNode {
  constructor(tagName, id = null) {
    super();
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.dataset = {};
    const styleRecord = {};
    this.style = {
      removeProperty: (property) => {
        delete styleRecord[property];
      },
    };
    this.attributes = new Map();
    this.children = [];
    this.classSet = new Set();
    this.classList = {
      add: (...tokens) => {
        tokens.forEach((token) => {
          if (token) {
            this.classSet.add(token);
          }
        });
      },
      remove: (...tokens) => {
        tokens.forEach((token) => {
          if (token) {
            this.classSet.delete(token);
          }
        });
      },
      toggle: (token, force) => {
        if (force === true) {
          this.classSet.add(token);
          return;
        }

        if (force === false) {
          this.classSet.delete(token);
          return;
        }

        if (this.classSet.has(token)) {
          this.classSet.delete(token);
        } else {
          this.classSet.add(token);
        }
      },
      contains: (token) => this.classSet.has(token),
      get value() {
        return Array.from(this.classSet).join(' ');
      },
    };
    this.textContent = '';
    this.hidden = false;
    this.tabIndex = 0;
    this.events = new Map();
    this.parent = null;
    this.isConnected = false;
    this.focused = false;
  }

  set className(value) {
    this.classSet = new Set(value.split(/\s+/).filter(Boolean));
  }

  get className() {
    return Array.from(this.classSet).join(' ');
  }

  append(...nodes) {
    nodes.forEach((node) => {
      if (node instanceof FakeElement) {
        node.parent = this;
        node.isConnected = true;
      }
      this.children.push(node);
    });
  }

  replaceChildren(...nodes) {
    this.children.forEach((child) => {
      if (child instanceof FakeElement) {
        child.isConnected = false;
        child.parent = null;
      }
    });
    this.children = [];
    this.append(...nodes);
  }

  remove() {
    if (this.parent) {
      this.parent.children = this.parent.children.filter((child) => child !== this);
    }
    this.parent = null;
    this.isConnected = false;
  }

  focus() {
    this.focused = true;
  }

  addEventListener(eventName, handler) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    this.events.get(eventName)?.add(handler);
  }

  dispatchEvent(event) {
    const handlers = this.events.get(event.type);
    handlers?.forEach((handler) => handler(event));
  }

  setAttribute(name, value) {
    if (name === 'class') {
      this.className = value;
    }
    this.attributes.set(name, value);
  }

  removeAttribute(name) {
    if (name === 'class') {
      this.classSet.clear();
    }
    this.attributes.delete(name);
  }
}

class FakeDocument extends FakeNode {
  constructor() {
    super();
    this.elementsById = new Map();
    this.events = new Map();
  }

  registerElement(element, options = {}) {
    if (options.id) {
      element.id = options.id;
      this.elementsById.set(options.id, element);
    }
    if (options.selectors) {
      options.selectors.forEach((selector) => {
        this.registerSelector(selector, element);
      });
    }
  }

  getElementById(id) {
    return this.elementsById.get(id) ?? null;
  }

  createElement(tag) {
    return new FakeElement(tag);
  }

  addEventListener(eventName, handler) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    this.events.get(eventName)?.add(handler);
  }

  dispatchEvent(event) {
    const handlers = this.events.get(event.type);
    handlers?.forEach((handler) => handler(event));
  }
}

class FakeCustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
}

function createAppDom() {
  const document = new FakeDocument();

  const viewRoot = new FakeElement('div', 'view-root');
  const main = new FakeElement('main');
  const headerLogo = new FakeElement('img');
  const headerTitle = new FakeElement('span');
  const versionButton = new FakeElement('button');
  const versionButtonText = new FakeElement('span');
  const loginLink = new FakeElement('a');
  const headerActions = new FakeElement('nav');
  const memoryIndicator = new FakeElement('span');
  const memoryIndicatorText = new FakeElement('span');
  const adminMeta = new FakeElement('div');
  const adminVersionChip = new FakeElement('span');
  const adminPublishedChip = new FakeElement('span');

  document.registerElement(viewRoot, { id: 'view-root' });
  document.registerElement(main, { selectors: ['main'] });
  document.registerElement(headerLogo, { selectors: ['.header-logo'] });
  document.registerElement(headerTitle, { selectors: ['.header-title'] });
  document.registerElement(versionButton, { selectors: ['.footer-version'] });
  versionButton.registerSelector('.footer-version__text', versionButtonText);
  document.registerElement(loginLink, { selectors: ['.header-login-link'] });
  document.registerElement(headerActions, { selectors: ['.header-actions'] });
  document.registerElement(memoryIndicator, { selectors: ['.footer-memory'] });
  memoryIndicator.registerSelector('.footer-memory__text', memoryIndicatorText);
  document.registerElement(adminMeta, { selectors: ['.admin-menu__meta'] });
  adminMeta.registerSelector('.miniapp-details__chip[data-type="version"]', adminVersionChip);
  adminMeta.registerSelector('.miniapp-details__chip[data-type="published-at"]', adminPublishedChip);
  document.registerSelector('.admin-menu__meta .miniapp-details__chip[data-type="version"]', adminVersionChip);
  document.registerSelector('.admin-menu__meta .miniapp-details__chip[data-type="published-at"]', adminPublishedChip);

  return {
    document,
    elements: {
      viewRoot,
      main,
      headerLogo,
      headerTitle,
      versionButton,
      versionButtonText,
      loginLink,
      headerActions,
      memoryIndicator,
      memoryIndicatorText,
      adminVersionChip,
      adminPublishedChip,
    },
  };
}

const renderStub = (name) => (element) => {
  if (element instanceof FakeElement) {
    element.dataset.view = name;
    element.__lastRendered = name;
  }
};

globalThis.__MINIAPP_UI_HOOKS__ = {
  views: {
    admin: renderStub('admin'),
    log: renderStub('log'),
    home: renderStub('home'),
    user: renderStub('user'),
    login: renderStub('login'),
    register: renderStub('register'),
    legal: renderStub('legal'),
  },
  runViewCleanup: () => {},
  getActiveUser: () => null,
  getStorageStatus: () => ({ state: 'loading', message: 'Memória carregando' }),
};

const dom = createAppDom();

globalThis.document = dom.document;
globalThis.window = { document: dom.document };
globalThis.HTMLElement = FakeElement;
globalThis.HTMLButtonElement = FakeElement;
globalThis.Element = FakeElement;
globalThis.CustomEvent = FakeCustomEvent;

const { bootstrapApp } = await import('../../app/main.js');
const { router } = await import('../../router/index.js');
const { renderView } = await import('../../ui/app-shell.js');

function resetDomState() {
  const { viewRoot, main, headerActions } = dom.elements;
  viewRoot.classSet.clear();
  viewRoot.dataset = {};
  viewRoot.textContent = '';
  viewRoot.replaceChildren();
  viewRoot.__lastRendered = undefined;
  main.classSet.clear();
  headerActions.children = [];
}

function primeRouter(expected) {
  const fallback = expected === 'dashboard' ? 'login' : 'dashboard';
  router.goTo(fallback);
  resetDomState();
}

async function runBootstrapScenario(options) {
  resetDomState();

  globalThis.__MINIAPP_BOOTSTRAP_OVERRIDES__ = {
    validateSchemaOrReset: async () => options.validation,
    getAllAccounts: async () => options.accounts,
    getSession: async () => options.session,
    clearSession: async () => {
      options.onClearSession?.();
    },
  };

  const expected = options.validation === 'reset'
    ? 'register'
    : options.session.activeAccountId && options.accounts.some((account) => account.id === options.session.activeAccountId)
      ? 'dashboard'
      : options.accounts.length > 0
        ? 'login'
        : 'register';

  primeRouter(expected);

  const start = Date.now();
  await bootstrapApp();
  const elapsed = Date.now() - start;

  assert(elapsed < 1500);
  delete globalThis.__MINIAPP_BOOTSTRAP_OVERRIDES__;

  return expected;
}

test('bootstrap direciona para dashboard quando há sessão ativa', async () => {
  const expected = await runBootstrapScenario({
    validation: 'ok',
    accounts: [
      { id: 'a1' },
      { id: 'a2' },
    ],
    session: { activeAccountId: 'a2' },
  });

  assert.equal(router.currentRoute, expected);
  assert.equal(dom.elements.viewRoot.__lastRendered, 'home');
});

test('bootstrap direciona para login quando existem cadastros sem sessão', async () => {
  const expected = await runBootstrapScenario({
    validation: 'ok',
    accounts: [
      { id: 'a1' },
      { id: 'a2' },
    ],
    session: {},
  });

  assert.equal(router.currentRoute, expected);
  assert.equal(dom.elements.viewRoot.__lastRendered, 'login');
});

test('bootstrap direciona para register quando validação falha', async () => {
  const expected = await runBootstrapScenario({
    validation: 'reset',
    accounts: [],
    session: {},
  });

  assert.equal(router.currentRoute, expected);
  assert.equal(dom.elements.viewRoot.__lastRendered, 'register');
});

test('router recarrega o Início quando a rota já está ativa', () => {
  resetDomState();

  router.goTo('dashboard');
  assert.equal(dom.elements.viewRoot.__lastRendered, 'home');

  renderView('admin');
  assert.equal(dom.elements.viewRoot.__lastRendered, 'admin');

  router.goTo('dashboard');
  assert.equal(dom.elements.viewRoot.__lastRendered, 'home');
});

test('sincroniza indicadores de versão com metadados do sistema', async () => {
  const expectedLabel = getSystemReleaseMetadata().versionLabel;

  await runBootstrapScenario({
    validation: 'ok',
    accounts: [{ id: 'a1' }],
    session: { activeAccountId: 'a1' },
  });

  const { versionButton, versionButtonText, adminVersionChip } = dom.elements;

  assert.equal(versionButtonText.textContent, expectedLabel);
  assert.equal(versionButton.dataset.version, expectedLabel);
  assert.equal(adminVersionChip.textContent, `Versão ${expectedLabel}`);
});

test.after(() => {
  delete globalThis.__MINIAPP_BOOTSTRAP_OVERRIDES__;
  delete globalThis.__MINIAPP_UI_HOOKS__;
  delete globalThis.document;
  delete globalThis.window;
  delete globalThis.HTMLElement;
  delete globalThis.HTMLButtonElement;
  delete globalThis.Element;
  delete globalThis.CustomEvent;
});
