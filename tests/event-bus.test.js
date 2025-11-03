import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createPrefsBus, createStoreBus } from '../miniapp-base/event-bus.js';

const channels = [];

afterEach(() => {
  while (channels.length) {
    const channel = channels.pop();
    try {
      channel.close();
    } catch (error) {
      // ignore
    }
  }
});

test('BroadcastChannel entrega mensagens de preferências', async () => {
  const sender = createPrefsBus();
  const receiver = createPrefsBus();
  channels.push(sender, receiver);

  const payload = { type: 'preferences', prefs: { theme: 'dark' } };
  const received = await new Promise((resolve) => {
    receiver.subscribe((message) => {
      if (message?.type === 'preferences') {
        resolve(message);
      }
    });
    sender.post(payload);
  });

  assert.deepEqual(received, payload);
});

test('Canal de armazenamento replica estados na ordem enviada', async () => {
  const sender = createStoreBus();
  const receiver = createStoreBus();
  channels.push(sender, receiver);

  const sequence = ['dirty', 'saving', 'saved'];
  const receivedStates = [];

  const ready = new Promise((resolve) => {
    receiver.subscribe((message) => {
      if (message?.type === 'status') {
        receivedStates.push(message.state);
        if (receivedStates.length === sequence.length) {
          resolve();
        }
      }
    });
  });

  sequence.forEach((state) => {
    sender.post({ type: 'status', state, source: 'test' });
  });

  await ready;
  assert.deepEqual(receivedStates, sequence);
});
