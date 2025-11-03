import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createAutosaveController } from '../miniapp-base/autosave.js';

function createMockBus() {
  const listeners = new Set();
  const messages = [];
  return {
    messages,
    post(data) {
      messages.push(data);
      listeners.forEach((listener) => listener(data));
    },
    subscribe(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    close() {
      listeners.clear();
    },
  };
}

test('controlador de autosave sincroniza estados e reinicia após salvar', async () => {
  const bus = createMockBus();
  const controller = createAutosaveController({ bus, source: 'test', autoResetDelay: 200 });

  let observedState = controller.getState();
  controller.subscribe((nextState) => {
    observedState = nextState;
  });

  assert.equal(observedState, 'synced');
  controller.markDirty();
  assert.equal(controller.getState(), 'dirty');
  assert.equal(bus.messages.at(-1).state, 'dirty');

  controller.markSaving();
  assert.equal(controller.getState(), 'saving');

  controller.markSaved();
  assert.equal(controller.getState(), 'saved');
  await new Promise((resolve) => setTimeout(resolve, 250));
  assert.equal(controller.getState(), 'synced');

  controller.markError();
  assert.equal(observedState, 'error');

  controller.dispose();
  bus.close();
});
