import { test } from 'node:test';
import assert from 'node:assert/strict';

async function importRegisterServiceWorkerModule() {
  const moduleUrl = new URL('../../scripts/pwa/register-service-worker.js', import.meta.url);
  moduleUrl.searchParams.set('t', `${Date.now()}-${Math.random()}`);
  return import(moduleUrl.href);
}

function stubGlobalProperty(key, value) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
  Object.defineProperty(globalThis, key, {
    configurable: true,
    enumerable: true,
    writable: true,
    value,
  });

  return () => {
    if (descriptor) {
      Object.defineProperty(globalThis, key, descriptor);
    } else {
      delete globalThis[key];
    }
  };
}

test('não força atualização quando o cache já corresponde à versão ativa', async (t) => {
  const restoreNavigator = stubGlobalProperty('navigator', { serviceWorker: null });
  const restoreCaches = stubGlobalProperty('caches', null);
  const restoreLocation = stubGlobalProperty('location', { reload: () => {} });
  const originalWarn = console.warn;

  const registrationMock = {
    update: async () => {
      throw new Error('update não deveria ser chamado');
    },
  };

  const serviceWorker = {
    register: async () => registrationMock,
    ready: Promise.resolve(registrationMock),
  };

  globalThis.navigator.serviceWorker = serviceWorker;
  globalThis.caches = {
    async keys() {
      return ['miniapp-base::pwa::1.2.3'];
    },
  };
  console.warn = () => {};

  t.after(() => {
    restoreNavigator();
    restoreCaches();
    restoreLocation();
    console.warn = originalWarn;
  });

  const { registerServiceWorker } = await importRegisterServiceWorkerModule();
  const registration = await registerServiceWorker('1.2.3');

  assert.equal(registration, registrationMock);
});

test('atualiza o registro e aguarda o cache correto quando não houver versão local', async (t) => {
  const restoreNavigator = stubGlobalProperty('navigator', { serviceWorker: null });
  const restoreCaches = stubGlobalProperty('caches', null);
  const restoreLocation = stubGlobalProperty('location', { reload: () => {} });
  const originalWarn = console.warn;

  let updateCalls = 0;
  const registrationMock = {
    async update() {
      updateCalls += 1;
    },
  };

  let controllerChangeHandler = null;
  const serviceWorker = {
    register: async () => registrationMock,
    ready: Promise.resolve(registrationMock),
    addEventListener(eventName, handler) {
      if (eventName === 'controllerchange') {
        controllerChangeHandler = handler;
      }
    },
  };

  let pollCount = 0;
  globalThis.navigator.serviceWorker = serviceWorker;
  globalThis.caches = {
    async keys() {
      pollCount += 1;
      if (pollCount >= 2) {
        return ['miniapp-base::pwa::2.0.0'];
      }
      return [];
    },
  };

  let reloadCalls = 0;
  globalThis.location = {
    reload() {
      reloadCalls += 1;
    },
  };
  console.warn = () => {};

  t.after(() => {
    restoreNavigator();
    restoreCaches();
    restoreLocation();
    console.warn = originalWarn;
  });

  const { registerServiceWorker } = await importRegisterServiceWorkerModule();
  const registration = await registerServiceWorker('2.0.0');

  assert.equal(registration, registrationMock);
  assert.equal(updateCalls, 1);
  assert.equal(typeof controllerChangeHandler, 'function');

  controllerChangeHandler?.();
  assert.equal(reloadCalls, 1);
});
