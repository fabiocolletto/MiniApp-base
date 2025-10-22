import test from 'node:test';
import assert from 'node:assert/strict';

class FakeClassList {
  constructor(element) {
    this.element = element;
    this.tokens = new Set();
  }

  _sync() {
    const value = Array.from(this.tokens).join(' ');
    this.element._setClassName(value);
  }

  add(...classNames) {
    classNames
      .flatMap((token) => (typeof token === 'string' ? token.split(/\s+/) : []))
      .filter(Boolean)
      .forEach((token) => this.tokens.add(token));
    this._sync();
  }

  remove(...classNames) {
    classNames
      .flatMap((token) => (typeof token === 'string' ? token.split(/\s+/) : []))
      .filter(Boolean)
      .forEach((token) => this.tokens.delete(token));
    this._sync();
  }

  contains(token) {
    return this.tokens.has(token);
  }

  toggle(token, force) {
    if (!token) {
      return false;
    }

    if (force === true) {
      this.add(token);
      return true;
    }

    if (force === false) {
      this.remove(token);
      return false;
    }

    if (this.tokens.has(token)) {
      this.tokens.delete(token);
      this._sync();
      return false;
    }

    this.tokens.add(token);
    this._sync();
    return true;
  }

  toString() {
    return Array.from(this.tokens).join(' ');
  }
}

class FakeElement {
  constructor(tagName = '', namespaceURI = null) {
    this.tagName = String(tagName || '').toUpperCase();
    this.namespaceURI = namespaceURI;
    this.children = [];
    this.parentNode = null;
    this.attributes = new Map();
    this.dataset = {};
    this.eventListeners = new Map();
    this.hidden = false;
    this.disabled = false;
    this.textContent = '';
    this.value = '';
    this.style = {};
    this._className = '';
    this.classList = new FakeClassList(this);
  }

  _setClassName(value) {
    this._className = value;
    if (value) {
      this.attributes.set('class', value);
    } else {
      this.attributes.delete('class');
    }
  }

  get className() {
    return this._className;
  }

  set className(value) {
    const normalized = typeof value === 'string' ? value.trim() : '';
    this.classList.tokens = new Set(normalized ? normalized.split(/\s+/).filter(Boolean) : []);
    this._setClassName(Array.from(this.classList.tokens).join(' '));
  }

  append(...nodes) {
    nodes.forEach((node) => {
      if (!node) {
        return;
      }
      if (typeof node === 'string') {
        const textNode = new FakeElement('#text', this.namespaceURI);
        textNode.textContent = node;
        textNode.parentNode = this;
        this.children.push(textNode);
        return;
      }
      if (node instanceof FakeElement) {
        node.parentNode = this;
        this.children.push(node);
      }
    });
  }

  replaceChildren(...nodes) {
    this.children.forEach((child) => {
      if (child instanceof FakeElement && child.parentNode === this) {
        child.parentNode = null;
      }
    });
    this.children = [];
    this.append(...nodes);
  }

  setAttribute(name, value) {
    if (name === 'class') {
      this.className = value;
      return;
    }
    if (name.startsWith('data-')) {
      const dataKey = name
        .slice(5)
        .split('-')
        .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
        .join('');
      this.dataset[dataKey] = String(value);
    }
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  addEventListener(eventName, handler) {
    if (!eventName || typeof handler !== 'function') {
      return;
    }
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set());
    }
    this.eventListeners.get(eventName).add(handler);
  }

  querySelector(selector) {
    return this._query(selector, true) ?? null;
  }

  querySelectorAll(selector) {
    const results = [];
    this._query(selector, false, results);
    return results;
  }

  _matches(selector) {
    if (!selector) {
      return false;
    }

    if (selector.startsWith('.')) {
      const classes = selector
        .split('.')
        .slice(1)
        .filter(Boolean);
      return classes.every((token) => this.classList.contains(token));
    }

    const [tagToken, ...classTokens] = selector.split('.');
    if (tagToken && this.tagName.toLowerCase() !== tagToken.toLowerCase()) {
      return false;
    }
    return classTokens.every((token) => this.classList.contains(token));
  }

  _query(selector, findFirst, results = []) {
    for (const child of this.children) {
      if (!(child instanceof FakeElement)) {
        continue;
      }
      if (child._matches(selector)) {
        if (findFirst) {
          return child;
        }
        results.push(child);
      }
      const descendant = child._query(selector, findFirst, results);
      if (findFirst && descendant) {
        return descendant;
      }
    }
    return findFirst ? null : results;
  }
}

class FakeDocument {
  createElement(tagName) {
    const element = new FakeElement(tagName);
    element.ownerDocument = this;
    return element;
  }

  createElementNS(namespaceURI, tagName) {
    const element = new FakeElement(tagName, namespaceURI);
    element.ownerDocument = this;
    return element;
  }
}

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }

  clear() {
    this.map.clear();
  }

  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }

  setItem(key, value) {
    this.map.set(String(key), String(value));
  }

  removeItem(key) {
    this.map.delete(key);
  }
}

test('renderHome posiciona widgets de favoritos e salvos antes do catálogo geral', async (t) => {
  const storage = new MemoryStorage();
  globalThis.window = { localStorage: storage };
  const fakeDocument = new FakeDocument();
  globalThis.document = fakeDocument;
  globalThis.HTMLElement = FakeElement;

  const { resetMiniApps } = await import('../scripts/data/miniapp-store.js');
  const { resetMiniAppPreferences } = await import('../scripts/data/miniapp-preferences-store.js');
  const { resetUserStoreForTests, addUser } = await import('../scripts/data/user-store.js');
  const { setActiveUser, clearActiveUser } = await import('../scripts/data/session-store.js');

  await resetUserStoreForTests();

  const newUser = await addUser({
    name: 'Colaborador',
    phone: '+5511999999999',
    password: 'Senha@123',
    device: 'web',
    userType: 'colaborador',
    profile: {},
    preferences: {},
  });

  setActiveUser(newUser.id);

  const miniApps = [
    { id: 'alpha', name: 'Alpha', description: 'A', category: 'Ops', status: 'active', updatedAt: '2025-10-10', access: ['colaborador'] },
    { id: 'beta', name: 'Beta', description: 'B', category: 'Ops', status: 'testing', updatedAt: '2025-10-11', access: ['colaborador'] },
    { id: 'gamma', name: 'Gamma', description: 'C', category: 'Ops', status: 'deployment', updatedAt: '2025-10-12', access: ['colaborador'] },
    { id: 'delta', name: 'Delta', description: 'D', category: 'Ops', status: 'active', updatedAt: '2025-10-13', access: ['colaborador'] },
    { id: 'epsilon', name: 'Epsilon', description: 'E', category: 'Ops', status: 'active', updatedAt: '2025-10-14', access: ['usuario'] },
    { id: 'zeta', name: 'Zeta', description: 'Z', category: 'Ops', status: 'testing', updatedAt: '2025-10-15', access: ['colaborador'] },
    { id: 'theta', name: 'Theta', description: 'T', category: 'Ops', status: 'deployment', updatedAt: '2025-10-16', access: ['colaborador'] },
    { id: 'iota', name: 'Iota', description: 'I', category: 'Ops', status: 'active', updatedAt: '2025-10-17', access: ['colaborador'] },
    { id: 'kappa', name: 'Kappa', description: 'K', category: 'Ops', status: 'testing', updatedAt: '2025-10-18', access: ['colaborador'] },
    { id: 'lambda', name: 'Lambda', description: 'L', category: 'Ops', status: 'active', updatedAt: '2025-10-19', access: ['usuario'] },
  ];

  resetMiniApps(miniApps);

  resetMiniAppPreferences({
    [String(newUser.id)]: {
      favorites: ['alpha', 'beta', 'gamma', 'delta', 'epsilon'],
      saved: ['alpha', 'zeta', 'theta', 'lambda', 'kappa', 'iota'],
    },
  });

  const { renderHome } = await import('../scripts/views/home.js');

  const viewRoot = fakeDocument.createElement('div');
  renderHome(viewRoot);

  const layout = viewRoot.querySelector('.home-dashboard__layout');
  assert.ok(layout, 'layout principal deve existir');
  assert.equal(layout.children.length, 3, 'devem existir três widgets principais');

  const [favoritesWidget, savedWidget, availableWidget] = layout.children;
  assert.ok(
    favoritesWidget.classList.contains('home-dashboard__widget--favorites'),
    'primeiro widget deve listar favoritos',
  );
  assert.ok(
    savedWidget.classList.contains('home-dashboard__widget--saved'),
    'segundo widget deve listar mini-apps salvos',
  );
  assert.ok(
    availableWidget.classList.contains('home-dashboard__widget--miniapps'),
    'terceiro widget deve listar mini-apps liberados',
  );

  const favoritesList = favoritesWidget.querySelector('.home-dashboard__miniapps');
  assert.ok(favoritesList, 'lista de favoritos deve estar presente');
  assert.equal(favoritesList.children.length, 4, 'apenas quatro favoritos devem ser exibidos');
  const favoriteIds = favoritesList.children.map((child) => child.dataset.appId);
  assert.deepEqual(favoriteIds, ['alpha', 'beta', 'gamma', 'delta']);
  assert.equal(
    favoritesList.dataset.emptyMessage,
    'Você ainda não favoritou mini-apps.',
    'mensagem de vazio personalizada deve ser registrada',
  );

  const savedList = savedWidget.querySelector('.home-dashboard__miniapps');
  assert.ok(savedList, 'lista de salvos deve estar presente');
  const savedIds = savedList.children.map((child) => child.dataset.appId);
  assert.deepEqual(savedIds, ['alpha', 'zeta', 'theta', 'kappa', 'iota']);

  const availableList = availableWidget.querySelector('.home-dashboard__miniapps');
  assert.ok(availableList, 'lista de liberados deve estar presente');
  assert.equal(
    availableList.dataset.emptyMessage,
    'Os mini-apps liberados para você aparecerão aqui.',
  );
  const availableIds = availableList.children.map((child) => child.dataset.appId);
  assert.deepEqual(
    availableIds,
    ['alpha', 'beta', 'delta', 'gamma', 'iota', 'kappa', 'theta', 'zeta'],
    'lista geral deve ordenar mini-apps acessíveis alfabeticamente',
  );

  t.after(async () => {
    clearActiveUser();
    resetMiniAppPreferences();
    resetMiniApps();
    await resetUserStoreForTests();
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.HTMLElement;
  });
});
