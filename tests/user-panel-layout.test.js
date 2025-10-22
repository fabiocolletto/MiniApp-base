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

  contains(token) {
    return this.tokens.has(token);
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
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  removeAttribute(name) {
    if (name === 'class') {
      this.className = '';
      return;
    }
    this.attributes.delete(name);
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

function findElement(root, predicate) {
  if (!root || typeof predicate !== 'function') {
    return null;
  }
  if (predicate(root)) {
    return root;
  }
  for (const child of root.children) {
    if (!(child instanceof FakeElement)) {
      continue;
    }
    const result = findElement(child, predicate);
    if (result) {
      return result;
    }
  }
  return null;
}

test('renderUserPanel monta resumo e formulário principais com atalhos ativos', async (t) => {
  const fakeDocument = new FakeDocument();
  globalThis.document = fakeDocument;
  globalThis.HTMLElement = FakeElement;

  t.after(() => {
    delete globalThis.document;
    delete globalThis.HTMLElement;
  });

  const { renderUserPanel } = await import('../scripts/views/user.js');

  const viewRoot = fakeDocument.createElement('div');
  renderUserPanel(viewRoot);

  const layout = viewRoot.children.find(
    (child) => child instanceof FakeElement && child.classList.contains('user-panel__layout'),
  );
  assert.ok(layout, 'layout principal não foi renderizado');

  const overviewWidget = layout.children.find(
    (child) => child instanceof FakeElement && child.classList.contains('user-dashboard__widget--overview'),
  );
  assert.ok(overviewWidget, 'widget de resumo não foi renderizado');

  const statsList = overviewWidget.querySelector('.admin-dashboard__user-stats');
  assert.ok(statsList, 'indicadores principais devem estar presentes');
  assert.equal(statsList.children.length, 4, 'o resumo deve apresentar quatro indicadores');

  const actionGrid = overviewWidget.querySelector('.user-dashboard__action-grid');
  assert.ok(actionGrid, 'atalhos rápidos precisam estar visíveis no widget de resumo');

  const logoutButton = findElement(actionGrid, (node) =>
    node instanceof FakeElement && node.classList.contains('user-dashboard__quick-action--logout'),
  );
  assert.ok(logoutButton, 'botão de encerrar sessão deve estar disponível no painel');

  const accountWidget = layout.children.find(
    (child) => child instanceof FakeElement && child.classList.contains('user-dashboard__widget--account'),
  );
  assert.ok(accountWidget, 'widget de dados principais não foi renderizado');

  const emptyState = findElement(accountWidget, (node) =>
    node instanceof FakeElement && node.classList.contains('user-dashboard__empty-state'),
  );
  assert.ok(emptyState, 'mensagem de ausência de sessão deve estar disponível');

  const form = accountWidget.querySelector('form.user-form');
  assert.ok(form, 'formulário principal não foi encontrado');

  const themeSelect = findElement(form, (node) => node instanceof FakeElement && node.tagName === 'SELECT');
  assert.ok(themeSelect, 'seletor de tema precisa fazer parte do formulário');
});
