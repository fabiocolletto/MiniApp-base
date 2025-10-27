import test from 'node:test';
import assert from 'node:assert/strict';

class FakeElement {
  constructor(tagName = '') {
    this.tagName = String(tagName || '').toUpperCase();
    this.attributes = new Map();
    this.dataset = {};
    this.children = [];
    this.eventListeners = new Map();
    this.parentNode = null;
    this.ownerDocument = null;
    this.isConnected = false;
    this.dispatchedEvents = [];
    this.textContent = '';
    this.id = null;
  }

  appendChild(child) {
    if (!(child instanceof FakeElement)) {
      return child;
    }
    child.parentNode = this;
    child.ownerDocument = this.ownerDocument;
    child.isConnected = true;
    this.children.push(child);
    return child;
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
    if (name === 'id') {
      this.id = value;
    }
    if (name === 'role') {
      this.role = value;
    }
    if (name.startsWith('data-')) {
      const dataKey = name
        .slice(5)
        .split('-')
        .map((token, index) => (index === 0 ? token : token.charAt(0).toUpperCase() + token.slice(1)))
        .join('');
      this.dataset[dataKey] = value;
    }
  }

  addEventListener(type, handler) {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type).add(handler);
  }

  removeEventListener(type, handler) {
    const handlers = this.eventListeners.get(type);
    if (!handlers) {
      return;
    }
    handlers.delete(handler);
    if (handlers.size === 0) {
      this.eventListeners.delete(type);
    }
  }

  dispatchEvent(event) {
    const type = event?.type;
    if (type) {
      this.dispatchedEvents.push(type);
    }
    const handlers = type ? this.eventListeners.get(type) : undefined;
    handlers?.forEach((handler) => handler(event));
    return true;
  }

  matches(selector) {
    if (selector === 'div[role=button]') {
      return this.tagName === 'DIV' && this.attributes.get('role') === 'button';
    }
    if (selector === 'script[data-gis]') {
      return this.tagName === 'SCRIPT' && this.dataset.gis !== undefined;
    }
    if (selector === 'script[data-msal]') {
      return this.tagName === 'SCRIPT' && this.dataset.msal !== undefined;
    }
    return this.tagName.toLowerCase() === selector.toLowerCase();
  }

  querySelector(selector) {
    for (const child of this.children) {
      if (!(child instanceof FakeElement)) {
        continue;
      }
      if (child.matches(selector)) {
        return child;
      }
      const nested = child.querySelector(selector);
      if (nested) {
        return nested;
      }
    }
    return null;
  }

  getElementById(searchId) {
    if (this.id === searchId) {
      return this;
    }
    for (const child of this.children) {
      if (!(child instanceof FakeElement)) {
        continue;
      }
      const match = child.getElementById(searchId);
      if (match) {
        return match;
      }
    }
    return null;
  }
}

class FakeTemplate {
  constructor(ownerDocument) {
    this.ownerDocument = ownerDocument;
    this._innerHTML = '';
    this.content = {
      cloneNode: () => new FakeElement('fragment'),
    };
  }

  set innerHTML(value) {
    this._innerHTML = value;
  }

  get innerHTML() {
    return this._innerHTML;
  }
}

class FakeDocument {
  constructor() {
    this.head = new FakeElement('head');
    this.body = new FakeElement('body');
    this.head.ownerDocument = this;
    this.body.ownerDocument = this;
  }

  createElement(tagName) {
    if (String(tagName).toLowerCase() === 'template') {
      return new FakeTemplate(this);
    }
    const element = new FakeElement(tagName);
    element.ownerDocument = this;
    return element;
  }

  querySelector(selector) {
    return this.head.querySelector(selector) ?? this.body.querySelector(selector);
  }
}

function createDocumentStub() {
  return new FakeDocument();
}

function setupModuleImportEnv() {
  const original = {
    document: globalThis.document,
    window: globalThis.window,
    HTMLElement: globalThis.HTMLElement,
    customElements: globalThis.customElements,
  };

  const documentStub = createDocumentStub();
  const windowStub = {};
  const registry = new Map();

  globalThis.document = documentStub;
  globalThis.window = windowStub;
  globalThis.HTMLElement = class {};
  globalThis.customElements = {
    define(name, ctor) {
      if (!registry.has(name)) {
        registry.set(name, ctor);
      }
    },
    get(name) {
      return registry.get(name);
    },
  };

  return {
    restore() {
      if (original.document === undefined) {
        delete globalThis.document;
      } else {
        globalThis.document = original.document;
      }
      if (original.window === undefined) {
        delete globalThis.window;
      } else {
        globalThis.window = original.window;
      }
      if (original.HTMLElement === undefined) {
        delete globalThis.HTMLElement;
      } else {
        globalThis.HTMLElement = original.HTMLElement;
      }
      if (original.customElements === undefined) {
        delete globalThis.customElements;
      } else {
        globalThis.customElements = original.customElements;
      }
    },
    document: documentStub,
    window: windowStub,
    registry,
  };
}

function setupRuntimeEnv() {
  const original = {
    document: globalThis.document,
    window: globalThis.window,
    location: globalThis.location,
    atob: globalThis.atob,
  };

  const documentStub = createDocumentStub();
  const windowStub = { document: documentStub };

  globalThis.document = documentStub;
  globalThis.window = windowStub;
  globalThis.location = { origin: 'https://miniapp.test' };

  return {
    document: documentStub,
    window: windowStub,
    restore() {
      if (original.document === undefined) {
        delete globalThis.document;
      } else {
        globalThis.document = original.document;
      }
      if (original.window === undefined) {
        delete globalThis.window;
      } else {
        globalThis.window = original.window;
      }
      if (original.location === undefined) {
        delete globalThis.location;
      } else {
        globalThis.location = original.location;
      }
      if (original.atob === undefined) {
        delete globalThis.atob;
      } else {
        globalThis.atob = original.atob;
      }
    },
  };
}

function ensureAtob() {
  if (typeof globalThis.atob === 'function') {
    return;
  }
  globalThis.atob = (input) => {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
    return Buffer.from(normalized + padding, 'base64').toString('utf8');
  };
}

function createCredential(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature`;
}

const moduleEnv = setupModuleImportEnv();
await import('../../src/ui/components/social-auth.js');
const SocialAuth = globalThis.customElements?.get('social-auth');
moduleEnv.restore();

if (!SocialAuth) {
  throw new Error('social-auth component não pôde ser carregado para os testes.');
}

test('google login flow usa Google Identity e conclui cadastro social', async (t) => {
  const runtime = setupRuntimeEnv();
  const { window } = runtime;
  ensureAtob();

  window.__ENV__ = { GOOGLE_CLIENT_ID: 'gid-123' };

  const originalMouseEvent = globalThis.MouseEvent;
  class TestMouseEvent {
    constructor(type, options = {}) {
      this.type = type;
      this.bubbles = Boolean(options?.bubbles);
    }
  }
  globalThis.MouseEvent = TestMouseEvent;

  const hint = { textContent: '' };
  const shadowRoot = new FakeElement('shadow-root');
  shadowRoot.ownerDocument = runtime.document;
  shadowRoot.getElementById = (id) => (id === 'hint' ? hint : null);

  const instance = new SocialAuth();
  instance.shadowRoot = shadowRoot;
  instance.$hint = hint;

  let capturedProfile = null;
  instance.finish = (profile) => {
    capturedProfile = profile;
  };

  let initializeConfig = null;
  let renderOptions = null;

  window.google = {
    accounts: {
      id: {
        initialize(config) {
          initializeConfig = config;
        },
        renderButton(container, options) {
          renderOptions = options;
          const button = container.ownerDocument.createElement('div');
          button.setAttribute('role', 'button');
          container.appendChild(button);
        },
      },
    },
  };
  globalThis.google = window.google;

  await instance.google();

  assert.ok(initializeConfig, 'initialize deve ser chamado');
  assert.equal(initializeConfig.client_id, 'gid-123');
  assert.equal(typeof initializeConfig.callback, 'function', 'callback do GIS deve ser uma função');
  assert.ok(renderOptions, 'renderButton deve ser invocado');

  const credential = createCredential({
    sub: 'sub-001',
    email: 'user@example.com',
    name: 'User Example',
    picture: 'https://cdn.example/avatar.png',
  });

  initializeConfig.callback({ credential });

  assert.deepEqual(capturedProfile, {
    provider: 'google',
    sub: 'sub-001',
    email: 'user@example.com',
    name: 'User Example',
    picture: 'https://cdn.example/avatar.png',
    idToken: credential,
  });

  const renderedButton = shadowRoot.querySelector('div[role=button]');
  assert.ok(renderedButton, 'botão renderizado deve estar acessível');
  assert.ok(
    renderedButton.dispatchedEvents.includes('click'),
    'renderButton deve receber o disparo automático de clique',
  );

  t.after(() => {
    runtime.restore();
    delete window.google;
    delete globalThis.google;
    if (originalMouseEvent === undefined) {
      delete globalThis.MouseEvent;
    } else {
      globalThis.MouseEvent = originalMouseEvent;
    }
  });
});

test('google exibe aviso quando o SDK não está pronto', async (t) => {
  const runtime = setupRuntimeEnv();
  const { window } = runtime;

  window.__ENV__ = { GOOGLE_CLIENT_ID: null };

  const hint = { textContent: '' };
  const shadowRoot = new FakeElement('shadow-root');
  shadowRoot.getElementById = (id) => (id === 'hint' ? hint : null);

  const instance = new SocialAuth();
  instance.shadowRoot = shadowRoot;
  instance.$hint = hint;

  await instance.google();

  assert.equal(
    hint.textContent,
    'Google indisponível. Verifique env.js e permissões.',
    'mensagem de indisponibilidade deve ser exibida',
  );

  t.after(() => {
    runtime.restore();
  });
});

test('microsoft login utiliza MSAL e finaliza o perfil retornado', async (t) => {
  const runtime = setupRuntimeEnv();
  const { window } = runtime;

  window.__ENV__ = {
    MSAL_CLIENT_ID: 'msal-client',
    MSAL_TENANT_ID: 'tenant-abc',
  };

  const configs = [];
  const loginOptions = [];

  window.msal = {
    PublicClientApplication: class {
      constructor(config) {
        configs.push(config);
      }

      async loginPopup(options) {
        loginOptions.push(options);
        return {
          account: {
            localAccountId: 'local-123',
            username: 'msal@example.com',
            name: 'MS User',
          },
          idToken: 'msal-token',
        };
      }
    },
  };

  const hint = { textContent: '' };
  const shadowRoot = new FakeElement('shadow-root');
  shadowRoot.getElementById = (id) => (id === 'hint' ? hint : null);

  const instance = new SocialAuth();
  instance.shadowRoot = shadowRoot;
  instance.$hint = hint;

  let receivedProfile = null;
  instance.finish = (profile) => {
    receivedProfile = profile;
  };

  await instance.microsoft();

  assert.equal(hint.textContent, '', 'hint deve ser limpo após login bem-sucedido');
  assert.ok(configs.length > 0, 'MSAL deve ser configurado');
  assert.deepEqual(configs[0].auth, {
    clientId: 'msal-client',
    authority: 'https://login.microsoftonline.com/tenant-abc',
    redirectUri: 'https://miniapp.test',
  });
  assert.deepEqual(configs[0].cache, {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  });

  assert.deepEqual(loginOptions[0], {
    scopes: ['openid', 'profile', 'email'],
    prompt: 'select_account',
  });

  assert.deepEqual(receivedProfile, {
    provider: 'microsoft',
    sub: 'local-123',
    email: 'msal@example.com',
    name: 'MS User',
    picture: '',
    idToken: 'msal-token',
  });

  t.after(() => {
    runtime.restore();
    delete window.msal;
  });
});

