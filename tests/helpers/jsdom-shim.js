const VOID_ELEMENTS = new Set([
  'AREA',
  'BASE',
  'BR',
  'COL',
  'EMBED',
  'HR',
  'IMG',
  'INPUT',
  'LINK',
  'META',
  'PARAM',
  'SOURCE',
  'TRACK',
  'WBR',
]);

function toKebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

function decodeEntities(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

class MiniEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = Boolean(options.bubbles);
    this.cancelable = Boolean(options.cancelable);
    this.defaultPrevented = false;
    this.target = null;
    this.currentTarget = null;
    this._propagationStopped = false;
    this._immediatePropagationStopped = false;
  }

  preventDefault() {
    if (this.cancelable) {
      this.defaultPrevented = true;
    }
  }

  stopPropagation() {
    this._propagationStopped = true;
  }

  stopImmediatePropagation() {
    this._immediatePropagationStopped = true;
    this._propagationStopped = true;
  }
}

class MiniKeyboardEvent extends MiniEvent {
  constructor(type, options = {}) {
    super(type, options);
    this.key = options.key || '';
  }
}

class MiniNode {
  constructor(nodeType, ownerDocument) {
    this.nodeType = nodeType;
    this.ownerDocument = ownerDocument;
    this.parentNode = null;
    this.childNodes = [];
    this._listeners = new Map();
  }

  get parentElement() {
    const parent = this.parentNode;
    return parent && parent.nodeType === 1 ? parent : null;
  }

  get firstChild() {
    return this.childNodes[0] ?? null;
  }

  get lastChild() {
    return this.childNodes[this.childNodes.length - 1] ?? null;
  }

  get previousSibling() {
    if (!this.parentNode) {
      return null;
    }
    const siblings = this.parentNode.childNodes;
    const index = siblings.indexOf(this);
    return index > 0 ? siblings[index - 1] : null;
  }

  get nextSibling() {
    if (!this.parentNode) {
      return null;
    }
    const siblings = this.parentNode.childNodes;
    const index = siblings.indexOf(this);
    return index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;
  }

  appendChild(node) {
    if (!node) {
      return node;
    }

    if (node.nodeType === 11) {
      while (node.firstChild) {
        this.appendChild(node.firstChild);
      }
      return node;
    }

    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }

    node.parentNode = this;
    this.childNodes.push(node);
    return node;
  }

  insertBefore(node, reference) {
    if (!node) {
      return node;
    }

    if (!reference) {
      return this.appendChild(node);
    }

    if (node.nodeType === 11) {
      const nodes = [...node.childNodes];
      nodes.forEach((child) => this.insertBefore(child, reference));
      return node;
    }

    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }

    const index = this.childNodes.indexOf(reference);
    if (index === -1) {
      return this.appendChild(node);
    }

    node.parentNode = this;
    this.childNodes.splice(index, 0, node);
    return node;
  }

  removeChild(node) {
    const index = this.childNodes.indexOf(node);
    if (index === -1) {
      return node;
    }

    this.childNodes.splice(index, 1);
    node.parentNode = null;
    return node;
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  replaceChildren(...nodes) {
    [...this.childNodes].forEach((child) => child.remove());
    this.append(...nodes);
  }

  append(...nodes) {
    nodes.forEach((node) => {
      if (node == null) {
        return;
      }
      if (typeof node === 'string') {
        this.appendChild(this.ownerDocument.createTextNode(node));
      } else {
        this.appendChild(node);
      }
    });
  }

  get textContent() {
    return this.childNodes.map((child) => child.textContent).join('');
  }

  set textContent(value) {
    [...this.childNodes].forEach((child) => child.remove());
    if (value == null || value === '') {
      return;
    }
    this.appendChild(this.ownerDocument.createTextNode(String(value)));
  }

  addEventListener(type, handler, options = {}) {
    if (!type || typeof handler !== 'function') {
      return;
    }
    if (!this._listeners.has(type)) {
      this._listeners.set(type, new Set());
    }
    const entry = { handler, options: { ...options } };
    this._listeners.get(type).add(entry);
  }

  removeEventListener(type, handler) {
    const listeners = this._listeners.get(type);
    if (!listeners) {
      return;
    }
    [...listeners].forEach((entry) => {
      if (entry.handler === handler) {
        listeners.delete(entry);
      }
    });
  }

  dispatchEvent(event) {
    if (!event || typeof event.type !== 'string') {
      throw new TypeError('dispatchEvent requer um objeto Event válido.');
    }

    if (!event.target) {
      event.target = this;
    }

    let node = this;
    while (node) {
      const listeners = node._listeners.get(event.type);
      if (listeners && listeners.size > 0) {
        [...listeners].forEach((entry) => {
          if (event._immediatePropagationStopped) {
            return;
          }
          event.currentTarget = node;
          try {
            entry.handler.call(node, event);
          } catch (error) {
            console.error('Erro no listener de evento.', error);
          }
          if (entry.options?.once) {
            listeners.delete(entry);
          }
        });
      }

      if (!event.bubbles || event._propagationStopped) {
        break;
      }

      if (node.parentNode) {
        node = node.parentNode;
        continue;
      }

      if (node instanceof MiniDocument) {
        node = node.defaultView ?? null;
        continue;
      }

      if (node instanceof MiniWindow) {
        node = null;
        continue;
      }

      const owner = node.ownerDocument;
      if (owner && node !== owner) {
        node = owner;
      } else {
        node = null;
      }
    }

    return !event.defaultPrevented;
  }
}

class MiniTextNode extends MiniNode {
  constructor(data, ownerDocument) {
    super(3, ownerDocument);
    this.data = data;
  }

  get textContent() {
    return this.data;
  }

  set textContent(value) {
    this.data = value ?? '';
  }
}

class MiniDocumentFragment extends MiniNode {
  constructor(ownerDocument) {
    super(11, ownerDocument);
  }
}

class MiniClassList {
  constructor(element) {
    this.element = element;
    this._set = new Set();
  }

  _syncAttribute() {
    const value = [...this._set].join(' ');
    if (value) {
      this.element._attributes.set('class', value);
    } else {
      this.element._attributes.delete('class');
    }
  }

  add(...tokens) {
    tokens
      .flatMap((token) => String(token ?? '').split(/\s+/))
      .filter(Boolean)
      .forEach((token) => this._set.add(token));
    this._syncAttribute();
  }

  remove(...tokens) {
    tokens
      .flatMap((token) => String(token ?? '').split(/\s+/))
      .filter(Boolean)
      .forEach((token) => this._set.delete(token));
    this._syncAttribute();
  }

  toggle(token, force) {
    const normalized = String(token ?? '');
    if (!normalized) {
      return false;
    }
    const exists = this._set.has(normalized);
    if (force === true || (!exists && force !== false)) {
      this._set.add(normalized);
      this._syncAttribute();
      return true;
    }
    if (exists && force !== true) {
      this._set.delete(normalized);
      this._syncAttribute();
      return false;
    }
    return exists;
  }

  contains(token) {
    return this._set.has(String(token ?? ''));
  }

  get value() {
    return [...this._set].join(' ');
  }

  toString() {
    return this.value;
  }

  replace(token, newToken) {
    const has = this.contains(token);
    if (has) {
      this._set.delete(String(token ?? ''));
      if (newToken != null) {
        this._set.add(String(newToken));
      }
      this._syncAttribute();
    }
    return has;
  }

  get length() {
    return this._set.size;
  }

  [Symbol.iterator]() {
    return this._set[Symbol.iterator]();
  }
}

function createDatasetProxy(element) {
  const cache = {};
  const updateFromAttributes = () => {
    Object.keys(cache).forEach((key) => delete cache[key]);
    for (const [name, value] of element._attributes.entries()) {
      if (!name.startsWith('data-')) {
        continue;
      }
      const propName = name
        .slice(5)
        .split('-')
        .map((chunk, index) => (index === 0 ? chunk : chunk.charAt(0).toUpperCase() + chunk.slice(1)))
        .join('');
      cache[propName] = value;
    }
  };

  updateFromAttributes();

  return new Proxy(cache, {
    get(target, prop) {
      if (prop === '__sync__') {
        updateFromAttributes();
        return undefined;
      }
      return target[prop];
    },
    set(target, prop, value) {
      if (typeof prop !== 'string') {
        return false;
      }
      const attr = `data-${toKebabCase(prop)}`;
      const stringValue = value == null ? '' : String(value);
      element.setAttribute(attr, stringValue);
      target[prop] = stringValue;
      return true;
    },
    deleteProperty(target, prop) {
      if (typeof prop !== 'string') {
        return false;
      }
      const attr = `data-${toKebabCase(prop)}`;
      element.removeAttribute(attr);
      delete target[prop];
      return true;
    },
  });
}

function matchesSimpleSelector(element, selector) {
  if (!selector || !(element instanceof MiniElement)) {
    return false;
  }

  let index = 0;
  const length = selector.length;
  let tagName = null;
  let elementId = null;
  const classes = [];
  const attributes = [];

  while (index < length) {
    const char = selector[index];

    if (char === '#') {
      index += 1;
      const match = selector.slice(index).match(/^[A-Za-z0-9_-]+/);
      if (!match) {
        return false;
      }
      elementId = match[0];
      index += match[0].length;
      continue;
    }

    if (char === '.') {
      index += 1;
      const match = selector.slice(index).match(/^[A-Za-z0-9_-]+/);
      if (!match) {
        return false;
      }
      classes.push(match[0]);
      index += match[0].length;
      continue;
    }

    if (char === '[') {
      const endIndex = selector.indexOf(']', index + 1);
      if (endIndex === -1) {
        return false;
      }
      const content = selector.slice(index + 1, endIndex).trim();
      const [namePart, valuePart] = content.split('=');
      const name = namePart?.trim();
      if (!name) {
        return false;
      }
      const hasValue = typeof valuePart === 'string';
      let value = null;
      if (hasValue) {
        value = valuePart.trim().replace(/^['"]|['"]$/g, '');
      }
      attributes.push({ name, value, hasValue });
      index = endIndex + 1;
      continue;
    }

    if (char === ':') {
      break;
    }

    const remaining = selector.slice(index);
    const match = remaining.match(/^[A-Za-z][A-Za-z0-9_-]*/);
    if (match) {
      tagName = match[0].toLowerCase();
      index += match[0].length;
      continue;
    }

    index += 1;
  }

  if (tagName && element.tagName.toLowerCase() !== tagName) {
    return false;
  }

  if (elementId && element.id !== elementId) {
    return false;
  }

  if (classes.some((cls) => !element.classList.contains(cls))) {
    return false;
  }

  for (const attr of attributes) {
    if (!element.hasAttribute(attr.name)) {
      return false;
    }
    if (attr.hasValue && element.getAttribute(attr.name) !== attr.value) {
      return false;
    }
  }

  return true;
}

function splitSelectors(selector) {
  return selector
    .split(',')
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function elementMatchesSelector(element, selector) {
  const trimmed = selector.trim();
  if (trimmed.includes(':not(')) {
    const [base, notPart] = trimmed.split(':not(');
    const notSelector = notPart.slice(0, -1);
    return elementMatchesSelector(element, base) && !elementMatchesSelector(element, notSelector);
  }
  if (trimmed.includes(' ')) {
    const parts = trimmed.split(/\s+/);
    let current = element;
    for (let index = parts.length - 1; index >= 0; index -= 1) {
      const targetSelector = parts[index];
      while (current && !matchesSimpleSelector(current, targetSelector)) {
        current = current.parentElement;
      }
      if (!current) {
        return false;
      }
      current = current.parentElement;
    }
    return true;
  }
  return matchesSimpleSelector(element, trimmed);
}

class MiniElement extends MiniNode {
  constructor(tagName, ownerDocument) {
    super(1, ownerDocument);
    this.tagName = tagName.toUpperCase();
    this._attributes = new Map();
    this.classList = new MiniClassList(this);
    this._dataset = createDatasetProxy(this);
    this.style = {};
  }

  get id() {
    return this.getAttribute('id') || '';
  }

  set id(value) {
    this.setAttribute('id', value ?? '');
  }

  get className() {
    return this.getAttribute('class') || '';
  }

  set className(value) {
    const normalized = value == null ? '' : String(value);
    this._attributes.set('class', normalized);
    this.classList = new MiniClassList(this);
    normalized
      .split(/\s+/)
      .filter(Boolean)
      .forEach((token) => this.classList.add(token));
  }

  get dataset() {
    this._dataset.__sync__;
    return this._dataset;
  }

  get children() {
    return this.childNodes.filter((node) => node.nodeType === 1);
  }

  get firstElementChild() {
    return this.children[0] ?? null;
  }

  get innerHTML() {
    return this.childNodes.map((child) => child.textContent).join('');
  }

  set innerHTML(value) {
    this.replaceChildren();
    if (value) {
      this.appendChild(this.ownerDocument.createTextNode(decodeEntities(String(value))));
    }
  }

  get outerHTML() {
    return `<${this.tagName.toLowerCase()}>${this.innerHTML}</${this.tagName.toLowerCase()}>`;
  }

  get textContent() {
    return super.textContent;
  }

  set textContent(value) {
    super.textContent = value;
  }

  get tabIndex() {
    const value = this.getAttribute('tabindex');
    return value != null ? Number(value) : -1;
  }

  set tabIndex(value) {
    this.setAttribute('tabindex', String(value));
  }

  get hidden() {
    return this.hasAttribute('hidden');
  }

  set hidden(value) {
    if (value) {
      this.setAttribute('hidden', '');
    } else {
      this.removeAttribute('hidden');
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  setAttribute(name, value) {
    const normalizedName = String(name).toLowerCase();
    const stringValue = value == null ? '' : String(value);
    this._attributes.set(normalizedName, stringValue);
    if (normalizedName === 'id') {
      this.ownerDocument?._indexId(this, stringValue);
    }
    if (normalizedName === 'class') {
      this.classList = new MiniClassList(this);
      stringValue
        .split(/\s+/)
        .filter(Boolean)
        .forEach((token) => this.classList.add(token));
    }
    if (normalizedName.startsWith('data-')) {
      this._dataset.__sync__;
    }
  }

  getAttribute(name) {
    return this._attributes.get(String(name).toLowerCase()) ?? null;
  }

  hasAttribute(name) {
    return this._attributes.has(String(name).toLowerCase());
  }

  removeAttribute(name) {
    const normalizedName = String(name).toLowerCase();
    if (normalizedName === 'id') {
      this.ownerDocument?._removeId(this);
    }
    this._attributes.delete(normalizedName);
    if (normalizedName.startsWith('data-')) {
      this._dataset.__sync__;
    }
    if (normalizedName === 'class') {
      this.classList = new MiniClassList(this);
    }
  }

  matches(selector) {
    return elementMatchesSelector(this, selector);
  }

  closest(selector) {
    let current = this;
    while (current) {
      if (current.matches(selector)) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  contains(node) {
    if (!node) {
      return false;
    }
    let current = node;
    while (current) {
      if (current === this) {
        return true;
      }
      current = current.parentNode;
    }
    return false;
  }

  querySelector(selector) {
    return this.ownerDocument._querySelectorFrom(selector, this);
  }

  querySelectorAll(selector) {
    return this.ownerDocument._querySelectorAllFrom(selector, this);
  }

  focus(options = {}) {
    if (this.ownerDocument) {
      this.ownerDocument.activeElement = this;
      if (!options || options.preventScroll !== true) {
        this.ownerDocument.scrollingElement.scrollTop = this.ownerDocument.scrollingElement.scrollTop;
      }
    }
  }

  blur() {
    if (this.ownerDocument?.activeElement === this) {
      this.ownerDocument.activeElement = null;
    }
  }

  click() {
    const event = new MiniEvent('click', { bubbles: true, cancelable: true });
    this.dispatchEvent(event);
  }
}

class MiniHTMLBodyElement extends MiniElement {}

class MiniDocument extends MiniNode {
  constructor(html = '', options = {}) {
    super(9, null);
    this.ownerDocument = this;
    this.childNodes = [];
    this.defaultView = null;
    this.documentElement = null;
    this.head = null;
    this.body = null;
    this.activeElement = null;
    this.readyState = 'complete';
    this.contentType = 'text/html';
    this._idIndex = new Map();
    this._listeners = new Map();
    this._url = options.url || 'http://localhost/';

    if (html) {
      parseHtmlDocument(this, String(html));
    }
  }

  createElement(tagName) {
    const normalized = String(tagName).toLowerCase();
    const element =
      normalized === 'body'
        ? new MiniHTMLBodyElement(normalized, this)
        : new MiniElement(normalized, this);
    element.ownerDocument = this;
    return element;
  }

  createElementNS(_namespace, tagName) {
    return this.createElement(tagName);
  }

  createTextNode(data) {
    return new MiniTextNode(String(data ?? ''), this);
  }

  createDocumentFragment() {
    return new MiniDocumentFragment(this);
  }

  getElementById(id) {
    return this._idIndex.get(String(id)) ?? null;
  }

  _indexId(element, id) {
    if (!id) {
      return;
    }
    this._idIndex.set(String(id), element);
  }

  _removeId(element) {
    for (const [key, value] of this._idIndex.entries()) {
      if (value === element) {
        this._idIndex.delete(key);
      }
    }
  }

  querySelector(selector) {
    return this._querySelectorFrom(selector, this);
  }

  querySelectorAll(selector) {
    return this._querySelectorAllFrom(selector, this);
  }

  _querySelectorFrom(selector, root) {
    const all = this._querySelectorAllFrom(selector, root);
    return all[0] ?? null;
  }

  _querySelectorAllFrom(selector, root) {
    const selectors = splitSelectors(selector);
    if (!selectors.length) {
      return [];
    }
    const results = [];
    const visit = (node) => {
      if (node.nodeType === 1 && selectors.some((sel) => elementMatchesSelector(node, sel))) {
        results.push(node);
      }
      node.childNodes.forEach((child) => visit(child));
    };
    const startNodes = root === this ? this.childNodes : root.childNodes;
    startNodes.forEach((child) => visit(child));
    return results;
  }

  appendChild(node) {
    const appended = super.appendChild(node);
    if (appended && appended.nodeType === 1 && appended.tagName.toLowerCase() === 'html') {
      this.documentElement = appended;
    }
    if (!this.scrollingElement) {
      this.scrollingElement = this.documentElement ?? appended;
    }
    return appended;
  }
}

class MiniLocation {
  constructor(url) {
    this._url = new URL(url ?? 'http://localhost/');
  }

  get href() {
    return this._url.href;
  }

  set href(value) {
    this._url = new URL(value, this._url.href);
  }

  get search() {
    return this._url.search;
  }

  get searchParams() {
    return this._url.searchParams;
  }

  replace(value) {
    this.href = value;
  }

  assign(value) {
    this.href = value;
  }

  toString() {
    return this.href;
  }
}

class MiniWindow extends MiniNode {
  constructor(document, options = {}) {
    super(0, document);
    this.document = document;
    this.defaultView = this;
    this.document.defaultView = this;
    this.Node = MiniNode;
    this.HTMLElement = MiniElement;
    this.HTMLBodyElement = MiniHTMLBodyElement;
    this.Event = MiniEvent;
    this.KeyboardEvent = MiniKeyboardEvent;
    this.CustomEvent = MiniEvent;
    this.location = new MiniLocation(options.url || 'http://localhost/');
    this.navigator = { userAgent: 'MiniDom' };
    this.queueMicrotask = global.queueMicrotask?.bind(global) ?? ((cb) => Promise.resolve().then(cb));
    this.setTimeout = global.setTimeout?.bind(global);
    this.clearTimeout = global.clearTimeout?.bind(global);
    this.setInterval = global.setInterval?.bind(global);
    this.clearInterval = global.clearInterval?.bind(global);
    this.alert = (message) => {
      console.info('[alert]', message);
    };
    this.scrollTo = () => {};
    this._listeners = new Map();
  }

  close() {
    this.document = null;
  }
}

function parseAttributes(element, raw) {
  const attrRegex = /(\w[\w:-]*)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'>/=`]+))?/g;
  let match;
  while ((match = attrRegex.exec(raw))) {
    const name = match[1];
    const value = match[2] ? match[2].replace(/^['"]|['"]$/g, '') : '';
    element.setAttribute(name, decodeEntities(value));
  }
}

function parseHtmlDocument(document, html) {
  const cleaned = html.replace(/<!DOCTYPE[^>]*>/gi, '');
  const tokenRegex = /<[^>]+>|[^<]+/g;
  const stack = [document];

  let match;
  while ((match = tokenRegex.exec(cleaned))) {
    const token = match[0];
    const parent = stack[stack.length - 1];

    if (token.startsWith('<!--')) {
      continue;
    }

    if (token.startsWith('</')) {
      const tagName = token.slice(2, -1).trim().toLowerCase();
      for (let i = stack.length - 1; i >= 0; i -= 1) {
        const node = stack[i];
        if (node.nodeType === 1 && node.tagName.toLowerCase() === tagName) {
          stack.length = i;
          break;
        }
      }
      continue;
    }

    if (token.startsWith('<')) {
      const isSelfClosing = token.endsWith('/>');
      const raw = token.slice(1, token.length - (isSelfClosing ? 2 : 1)).trim();
      const [tagNameRaw, ...rest] = raw.split(/\s+/);
      const tagName = tagNameRaw.toLowerCase();
      const attrRaw = raw.slice(tagNameRaw.length);
      const element = document.createElement(tagName);
      parseAttributes(element, attrRaw);
      parent.appendChild(element);

      if (tagName === 'html') {
        document.documentElement = element;
      } else if (tagName === 'head') {
        document.head = element;
      } else if (tagName === 'body') {
        document.body = element;
      }

      if (!isSelfClosing && !VOID_ELEMENTS.has(element.tagName)) {
        stack.push(element);
      }
      continue;
    }

    const text = decodeEntities(token);
    if (!text.trim() && (!stack.length || stack[stack.length - 1] === document)) {
      continue;
    }
    const textNode = document.createTextNode(text);
    parent.appendChild(textNode);
  }

  if (!document.documentElement) {
    const htmlElement = document.createElement('html');
    document.appendChild(htmlElement);
    document.documentElement = htmlElement;
  }
  if (!document.body) {
    const body = document.createElement('body');
    document.documentElement.appendChild(body);
    document.body = body;
  }
  if (!document.head) {
    const head = document.createElement('head');
    document.documentElement.insertBefore(head, document.body);
    document.head = head;
  }
  document.scrollingElement = document.documentElement;
}

class JSDOMShim {
  constructor(html = '', options = {}) {
    this.window = new MiniWindow(new MiniDocument(html, options), options);
    this.window.document.defaultView = this.window;
    this.virtualConsole = { sendTo() {} };
  }
}

export { JSDOMShim as JSDOM, MiniDocument, MiniElement, MiniEvent, MiniKeyboardEvent };
