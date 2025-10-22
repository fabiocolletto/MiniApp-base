export class FakeClassList {
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

export class FakeElement {
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
    if (name.startsWith('data-')) {
      const key = name
        .slice(5)
        .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      this.dataset[key] = String(value);
    }
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
    if (name.startsWith('data-')) {
      const key = name
        .slice(5)
        .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      delete this.dataset[key];
    }
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

  removeEventListener(eventName, handler) {
    if (!eventName || !this.eventListeners.has(eventName)) {
      return;
    }
    const listeners = this.eventListeners.get(eventName);
    listeners.delete(handler);
    if (listeners.size === 0) {
      this.eventListeners.delete(eventName);
    }
  }

  dispatchEvent(event) {
    if (!event || typeof event.type !== 'string') {
      return false;
    }
    const listeners = this.eventListeners.get(event.type);
    if (!listeners) {
      return true;
    }
    listeners.forEach((listener) => {
      try {
        listener.call(this, event);
      } catch (error) {
        console.error('Erro ao despachar evento fake.', error);
      }
    });
    return true;
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

export class FakeDocument {
  constructor() {
    this.body = this.createElement('body');
  }

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

  querySelector(selector) {
    return this.body.querySelector(selector);
  }
}

export function setupFakeDom() {
  const fakeDocument = new FakeDocument();
  globalThis.document = fakeDocument;
  globalThis.HTMLElement = FakeElement;
  return () => {
    delete globalThis.document;
    delete globalThis.HTMLElement;
  };
}
