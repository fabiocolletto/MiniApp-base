import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { checkStorageStatus } from '../miniapp-base/storage.js';

let originalDescriptor;

beforeEach(() => {
  originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
});

afterEach(() => {
  if (originalDescriptor) {
    Object.defineProperty(globalThis, 'navigator', originalDescriptor);
  } else {
    delete globalThis.navigator;
  }
});

test('checkStorageStatus formata quota e uso em MB', async () => {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: (() => {
      let persistedFlag = false;
      return {
        storage: {
          persisted: async () => persistedFlag,
          persist: async () => {
            persistedFlag = true;
            return true;
          },
          estimate: async () => ({
            quota: 10 * 1024 * 1024,
            usage: 1024,
            persisted: persistedFlag,
          }),
        },
      };
    })(),
  });

  const status = await checkStorageStatus('en-US');
  assert.equal(status.persisted, true);
  assert.equal(status.formatted.persisted.includes('persistent'), true);
  assert.equal(status.formatted.quota, '10 MB');
  assert.equal(status.formatted.usage, '0 MB');
  assert.ok(status.formatted.timestamp);
});

test('checkStorageStatus lida com ausência da Storage API', async () => {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {},
  });
  const status = await checkStorageStatus('pt-BR');
  assert.equal(status.persisted, false);
  assert.equal(status.formatted.quota, null);
  assert.equal(status.formatted.usage, null);
});
