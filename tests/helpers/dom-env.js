import { JSDOM } from './jsdom-shim.js';

const DOM_GLOBAL_KEYS = [
  'window',
  'document',
  'HTMLElement',
  'Node',
  'KeyboardEvent',
  'HTMLBodyElement',
  'navigator',
];

function snapshotGlobals() {
  return DOM_GLOBAL_KEYS.reduce((acc, key) => {
    acc[key] = global[key];
    return acc;
  }, {});
}

function applyGlobals(window) {
  global.window = window;
  global.document = window.document;
  global.HTMLElement = window.HTMLElement;
  global.Node = window.Node;
  global.KeyboardEvent = window.KeyboardEvent;
  global.HTMLBodyElement = window.HTMLBodyElement;
  Object.defineProperty(global, 'navigator', {
    configurable: true,
    writable: true,
    value: window.navigator,
  });
}

function restoreGlobals(snapshot) {
  DOM_GLOBAL_KEYS.forEach((key) => {
    const value = snapshot[key];
    if (typeof value === 'undefined') {
      delete global[key];
      return;
    }

    if (key === 'navigator') {
      Object.defineProperty(global, 'navigator', {
        configurable: true,
        writable: true,
        value,
      });
      return;
    }

    global[key] = value;
  });
}

export function createDomEnvironment({ html, url = 'http://localhost/', pretendToBeVisual = true } = {}) {
  const markup =
    typeof html === 'string' && html.trim() !== ''
      ? html
      : '<!doctype html><html><head></head><body></body></html>';

  const dom = new JSDOM(markup, { url, pretendToBeVisual });
  const snapshot = snapshotGlobals();
  applyGlobals(dom.window);

  return {
    dom,
    window: dom.window,
    document: dom.window.document,
    restore() {
      dom.window?.close?.();
      restoreGlobals(snapshot);
    },
  };
}

export { applyGlobals as attachDomGlobals, restoreGlobals };
