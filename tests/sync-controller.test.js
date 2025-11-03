import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';

import './helpers/fake-indexeddb.js';
import { ensureDeviceId } from '../shared/storage/idb/sync.js';
import { initSync, __resetSyncControllerForTests } from '../miniapp-base/sync.js';
import { readDocument, writeDocument, touchField } from '../miniapps/pesquisas-cidades/storage.js';

beforeEach(async () => {
  await new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase('marco_core');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
  await __resetSyncControllerForTests();
});

after(async () => {
  await __resetSyncControllerForTests();
  await new Promise((resolve) => {
    const request = indexedDB.deleteDatabase('marco_core');
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
});

test('controlador de sync cria e atualiza backups no Drive simulado', async () => {
  const fakeBus = { subscribe: () => () => {}, post: () => {} };
  const fakeDocument = {
    querySelector: () => null,
    head: { appendChild: () => {} },
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  const fakeWindow = {
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  const deviceId = await ensureDeviceId();
  let { document } = await readDocument();
  document = touchField(document, 'city', 'Curitiba', deviceId);
  await writeDocument(document);

  const controller = initSync({
    window: fakeWindow,
    document: fakeDocument,
    fetch: async () => {
      throw new Error('fetch não deveria ser chamado nos testes.');
    },
    pollInterval: 0,
    storeBus: fakeBus,
  });

  controller.tokenManager = {
    async requestToken() {
      return 'token';
    },
    async ensureToken() {
      return 'token';
    },
    async revoke() {},
  };

  const driveState = {
    files: [],
    metadata: null,
    remoteDoc: null,
    created: null,
    updated: null,
    deleted: 0,
  };

  controller.drive = {
    listFilesByName: async () => driveState.files,
    createFile: async (name, data, miniappId) => {
      driveState.created = { name, data, miniappId };
      const meta = {
        id: 'file-1',
        headRevisionId: 'rev-1',
        modifiedTime: new Date().toISOString(),
      };
      driveState.files = [{ ...meta }];
      driveState.metadata = { ...meta };
      return meta;
    },
    updateFile: async (fileId, data, { revisionId }) => {
      driveState.updated = { fileId, data, revisionId };
      const meta = {
        headRevisionId: `rev-${Math.random().toString(36).slice(2, 6)}`,
        modifiedTime: new Date().toISOString(),
      };
      driveState.metadata = { id: fileId, ...meta };
      return { ...meta };
    },
    downloadFile: async () => driveState.remoteDoc,
    getFileMetadata: async () => driveState.metadata,
    deleteFile: async () => {
      driveState.deleted += 1;
      driveState.files = [];
      driveState.metadata = null;
    },
  };

  await controller.ready;

  await controller.enable();
  assert.ok(driveState.created);
  assert.equal(driveState.created.data.fields.city.value, 'Curitiba');

  // prepara alteração local
  let localDoc = touchField(driveState.created.data, 'notes', 'Campo local', deviceId);
  await writeDocument(localDoc);
  await controller.syncNow({ reason: 'local-change' });
  assert.ok(driveState.updated);
  assert.equal(driveState.updated.data.fields.notes.value, 'Campo local');

  // prepara alteração remota
  driveState.metadata = { id: 'file-1', headRevisionId: 'rev-remote', modifiedTime: new Date().toISOString() };
  driveState.remoteDoc = {
    version: 1,
    deviceId: 'remote-device',
    updatedAt: new Date().toISOString(),
    fields: {
      city: { value: 'Curitiba', updatedAt: new Date().toISOString(), deviceId: 'remote-device' },
      notes: { value: 'Campo remoto', updatedAt: new Date().toISOString(), deviceId: 'remote-device' },
    },
  };

  await controller.syncNow({ reason: 'remote-change' });
  const refreshed = await readDocument();
  assert.equal(refreshed.document.fields.notes.value, 'Campo remoto');

  await controller.deleteBackups();
  assert.equal(driveState.deleted > 0, true);

  await controller.disable();
  await controller.dispose();
  await __resetSyncControllerForTests();
});
