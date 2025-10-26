import test from 'node:test';
import assert from 'node:assert/strict';
import { getSystemReleaseMetadata } from '../../scripts/utils/system-release.js';

type EventHandler = (event?: unknown) => void;

type ViewRenderer = (viewRoot: HTMLElement) => void;

type BootstrapOverrideFunctions = {
  validateSchemaOrReset: () => Promise<'ok' | 'reset'>;
  getAllAccounts: () => Promise<Array<{ id: string }>>;
  getSession: () => Promise<{ activeAccountId?: string }>;
  clearSession: () => Promise<void>;
};

class FakeNode {
  protected selectors: Map<string, Set<FakeElement>>;

  constructor() {
    this.selectors = new Map();
  }

  registerSelector(selector: string, element: FakeElement): void {
    if (!this.selectors.has(selector)) {
      this.selectors.set(selector, new Set());
    }
    this.selectors.get(selector)!.add(element);
  }

  querySelector(selector: string): FakeElement | null {
    const bucket = this.selectors.get(selector);
    if (!bucket || bucket.size === 0) {
      return null;
    }
    const first = bucket.values().next().value;
    return first ?? null;
  }

  querySelectorAll(selector: string): FakeElement[] {
    const bucket = this.selectors.get(selector);
    if (!bucket || bucket.size === 0) {
      return [];
    }
    return Array.from(bucket.values());
  }
}

class FakeElement extends FakeNode {
  tagName: string;
  id: string | null;
  dataset: Record<string, string>;
  style: { [key: string]: string | ((property: string) => void) };
  attributes: Map<string, string>;
  children: unknown[];
  classSet: Set<string>;
  classList: {
    add: (...tokens: string[]) => void;
    remove: (...tokens: string[]) => void;
    toggle: (token: string, force?: boolean) => void;
    contains: (token: string) => boolean;
    readonly value: string;
  };
  textContent: string;
  hidden: boolean;
  tabIndex: number;
  events: Map<string, Set<EventHandler>>;
  parent: FakeElement | null;
  isConnected: boolean;
  focused: boolean;
  __lastRendered?: string;

  constructor(tagName: string, id: string | null = null) {
    super();
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.dataset = {};
    const styleRecord: Record<string, string> = {};
    this.style = {
      removeProperty: (property: string) => {
        delete styleRecord[property];
      },
    } as { [key: string]: string | ((property: string) => void) };
    this.attributes = new Map();
    this.children = [];
    this.classSet = new Set();
    this.classList = {
      add: (...tokens: string[]) => {
        tokens.forEach((token) => {
          if (token) {
            this.classSet.add(token);
          }
        });
      },
      remove: (...tokens: string[]) => {
        tokens.forEach((token) => {
          if (token) {
            this.classSet.delete(token);
          }
        });
      },
      toggle: (token: string, force?: boolean) => {
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
      contains: (token: string) => this.classSet.has(token),
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

  set className(value: string) {
    this.classSet = new Set(value.split(/\s+/).filter(Boolean));
  }

  get className(): string {
    return Array.from(this.classSet).join(' ');
  }

  append(...nodes: unknown[]): void {
    nodes.forEach((node) => {
      if (node instanceof FakeElement) {
        node.parent = this;
        node.isConnected = true;
      }
      this.children.push(node);
    });
  }

  replaceChildren(...nodes: unknown[]): void {
    this.children.forEach((child) => {
      if (child instanceof FakeElement) {
        child.isConnected = false;
        child.parent = null;
      }
    });
    this.children = [];
    this.append(...nodes);
  }

  remove(): void {
    if (this.parent) {
      this.parent.children = this.parent.children.filter((child) => child !== this);
    }
    this.parent = null;
    this.isConnected = false;
  }

  focus(): void {
    this.focused = true;
  }

  addEventListener(eventName: string, handler: EventHandler): void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    this.events.get(eventName)?.add(handler);
  }

  dispatchEvent(event: { type: string; detail?: unknown }): void {
    const handlers = this.events.get(event.type);
    handlers?.forEach((handler) => handler(event));
  }

  setAttribute(name: string, value: string): void {
    if (name === 'class') {
      this.className = value;
    }
    this.attributes.set(name, value);
  }

  removeAttribute(name: string): void {
    if (name === 'class') {
      this.classSet.clear();
    }
    this.attributes.delete(name);
  }
}

class FakeDocument extends FakeNode {
  elementsById: Map<string, FakeElement>;
  events: Map<string, Set<EventHandler>>;

  constructor() {
    super();
    this.elementsById = new Map();
    this.events = new Map();
  }

  registerElement(element: FakeElement, options: { id?: string; selectors?: string[] } = {}): void {
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

  getElementById(id: string): FakeElement | null {
    return this.elementsById.get(id) ?? null;
  }

  createElement(tag: string): FakeElement {
    return new FakeElement(tag);
  }

  addEventListener(eventName: string, handler: EventHandler): void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    this.events.get(eventName)?.add(handler);
  }

  dispatchEvent(event: { type: string; detail?: unknown }): void {
    const handlers = this.events.get(event.type);
    handlers?.forEach((handler) => handler(event));
  }
}

class FakeCustomEvent<T = unknown> {
  type: string;
  detail: T | undefined;

  constructor(type: string, options: { detail?: T } = {}) {
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

const renderStub = (name: string): ViewRenderer => (element: HTMLElement) => {
  if (element instanceof FakeElement) {
    element.dataset.view = name;
    element.__lastRendered = name;
  }
};

(globalThis as Record<string, unknown>).__MINIAPP_UI_HOOKS__ = {
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

globalThis.document = dom.document as unknown as Document;
globalThis.window = { document: dom.document } as unknown as Window;
globalThis.HTMLElement = FakeElement as unknown as typeof HTMLElement;
globalThis.HTMLButtonElement = FakeElement as unknown as typeof HTMLButtonElement;
globalThis.Element = FakeElement as unknown as typeof Element;
globalThis.CustomEvent = FakeCustomEvent as unknown as typeof CustomEvent;

const { bootstrapApp } = await import('../../app/main.js');
const { router } = await import('../../router/index.js');
const { renderView } = await import('../../ui/app-shell.js');

function resetDomState(): void {
  const { viewRoot, main, headerActions } = dom.elements;
  viewRoot.classSet.clear();
  viewRoot.dataset = {};
  viewRoot.textContent = '';
  viewRoot.replaceChildren();
  viewRoot.__lastRendered = undefined;
  main.classSet.clear();
  headerActions.children = [];
}

function primeRouter(expected: 'dashboard' | 'login' | 'register'): void {
  const fallback = expected === 'dashboard' ? 'login' : 'dashboard';
  router.goTo(fallback);
  resetDomState();
}

async function runBootstrapScenario(options: {
  validation: 'ok' | 'reset';
  accounts: Array<{ id: string }>;
  session: { activeAccountId?: string };
  onClearSession?: () => void;
}): Promise<'dashboard' | 'login' | 'register'> {
  resetDomState();

  const overrides: BootstrapOverrideFunctions = {
    validateSchemaOrReset: async () => options.validation,
    getAllAccounts: async () => options.accounts,
    getSession: async () => options.session,
    clearSession: async () => {
      options.onClearSession?.();
    },
  };

  (globalThis as Record<string, unknown>).__MINIAPP_BOOTSTRAP_OVERRIDES__ = overrides;

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
  delete (globalThis as Record<string, unknown>).__MINIAPP_BOOTSTRAP_OVERRIDES__;

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
  delete (globalThis as Record<string, unknown>).__MINIAPP_BOOTSTRAP_OVERRIDES__;
  delete (globalThis as Record<string, unknown>).__MINIAPP_UI_HOOKS__;
  delete (globalThis as Record<string, unknown>).document;
  delete (globalThis as Record<string, unknown>).window;
  delete (globalThis as Record<string, unknown>).HTMLElement;
  delete (globalThis as Record<string, unknown>).HTMLButtonElement;
  delete (globalThis as Record<string, unknown>).Element;
  delete (globalThis as Record<string, unknown>).CustomEvent;
});
