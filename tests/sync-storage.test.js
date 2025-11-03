import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';

import './helpers/fake-indexeddb.js';
import {
  getSyncState,
  setSyncState,
  updateSyncFile,
  clearSyncFile,
  ensureDeviceId,
} from '../shared/storage/idb/sync.js';

beforeEach(async () => {
  await new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase('marco_core');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
});

after(async () => {
  await new Promise((resolve) => {
    const request = indexedDB.deleteDatabase('marco_core');
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
});

test('estado padrão possui campos esperados e gera deviceId', async () => {
  const initial = await getSyncState();
  assert.equal(initial.enabled, false);
  assert.equal(initial.status, 'disconnected');
  assert.equal(initial.deviceId, null);

  const deviceId = await ensureDeviceId();
  assert.ok(typeof deviceId === 'string' && deviceId.length > 8);

  const again = await ensureDeviceId();
  assert.equal(again, deviceId);

  const state = await getSyncState();
  assert.equal(state.deviceId, deviceId);
});

test('atualização de arquivo sincronizado persiste metadados', async () => {
  const deviceId = await ensureDeviceId();
  assert.ok(deviceId);

  const snapshot = await updateSyncFile('pesquisas-cidades', {
    fileId: 'file-123',
    revisionId: 'rev-1',
  });
  assert.equal(snapshot.files['pesquisas-cidades'].fileId, 'file-123');

  const cleared = await clearSyncFile('pesquisas-cidades');
  assert.equal(cleared.files['pesquisas-cidades'], undefined);
});

test('setSyncState mescla e preserva arquivos', async () => {
  await updateSyncFile('pesquisas-cidades', { fileId: 'file-x', revisionId: 'rev-x' });
  const next = await setSyncState({ enabled: true, status: 'syncing' });
  assert.equal(next.enabled, true);
  assert.equal(next.status, 'syncing');
  assert.ok(next.files['pesquisas-cidades']);
});
