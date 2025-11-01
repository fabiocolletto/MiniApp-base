import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', '..');

function resolveFilePath(request) {
  const url = typeof request === 'string' ? request : request.url;
  try {
    const parsed = new URL(url, 'http://localhost');
    if (parsed.protocol === 'file:') {
      return fileURLToPath(parsed);
    }
    return path.join(ROOT, parsed.pathname.replace(/^\//, ''));
  } catch {
    return path.join(ROOT, url.replace(/^\//, ''));
  }
}

global.fetch = async (input) => {
  const filePath = resolveFilePath(input);
  const data = await readFile(filePath, 'utf-8');
  return new Response(data, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

const dom = new JSDOM('<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});

const defineGlobal = (key, value) => {
  Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
};

defineGlobal('window', dom.window);
defineGlobal('document', dom.window.document);
defineGlobal('navigator', dom.window.navigator);
defineGlobal('HTMLElement', dom.window.HTMLElement);
defineGlobal('CustomEvent', dom.window.CustomEvent);
defineGlobal('Event', dom.window.Event);

globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

defineGlobal('crypto', dom.window.crypto);

if (!globalThis.Response) {
  defineGlobal('Response', dom.window.Response);
}

const moduleUrl = pathToFileURL(path.join(ROOT, 'miniapps/education/ripple/index.js'));
const { mount } = await import(moduleUrl.href);

const host = document.getElementById('app');
await mount(host);

await new Promise((resolve) => setTimeout(resolve, 600));

const cards = document.querySelectorAll('[data-ripple-item]');
if (cards.length !== 12) {
  throw new Error(`Esperado 12 itens na pré-visualização, mas encontramos ${cards.length}.`);
}

const summaryToken = document.querySelector('.ripple-summary-tags');
if (!summaryToken) {
  throw new Error('Resumo da prova não foi renderizado corretamente.');
}

console.log('Ripple smoke test concluído com sucesso.');
