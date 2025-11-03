import {
  ensureDeviceId,
  getSyncState,
  setSyncState,
  updateSyncFile,
  clearSyncFile,
  getSyncFile,
} from '../shared/storage/idb/sync.js';
import { listMiniApps } from './miniapps.js';
import {
  readDocument as readPesquisasDocument,
  writeDocument as writePesquisasDocument,
  normalizeDocument as normalizePesquisasDocument,
} from '../miniapps/pesquisas-cidades/storage.js';

const SYNC_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const DEFAULT_POLL_INTERVAL = 120000;
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

export const SYNC_STATUSES = Object.freeze({
  DISCONNECTED: 'disconnected',
  AUTHORIZING: 'authorizing',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  ERROR: 'error',
});

function resolveEnvClientId() {
  try {
    return globalThis?.__ENV__?.GOOGLE_CLIENT_ID ?? null;
  } catch (error) {
    return null;
  }
}

function escapeQueryValue(value) {
  return String(value).replace(/['\\]/g, '\\$&');
}

function createMiniappHandlers(storeBus) {
  const handlers = new Map();
  const catalog = listMiniApps();
  const ids = new Set(catalog.map((item) => item.id));
  if (ids.has('pesquisas-cidades')) {
    handlers.set('pesquisas-cidades', {
      id: 'pesquisas-cidades',
      fileName: 'pesquisas-cidades.json',
      normalizeDocument: normalizePesquisasDocument,
      async getLocalDocument() {
        const { document } = await readPesquisasDocument();
        return document;
      },
      async saveMergedDocument(document) {
        await writePesquisasDocument(document);
        storeBus?.post({ type: 'sync:update', miniappId: 'pesquisas-cidades' });
      },
    });
  }
  return handlers;
}

class TokenManager {
  constructor({ clientId, scopes = [SYNC_SCOPE], windowRef = globalThis.window, documentRef = globalThis.document }) {
    this.clientId = clientId;
    this.scopes = scopes;
    this.windowRef = windowRef;
    this.documentRef = documentRef;
    this.token = null;
    this.expiresAt = 0;
    this.googleReadyPromise = null;
  }

  async loadClient() {
    if (!this.clientId) {
      throw new Error('O Client ID do Google não foi configurado.');
    }
    if (this.windowRef?.google?.accounts?.oauth2) {
      return;
    }
    if (!this.documentRef) {
      throw new Error('Documento indisponível para carregar o SDK do Google.');
    }
    if (this.googleReadyPromise) {
      return this.googleReadyPromise;
    }
    this.googleReadyPromise = new Promise((resolve, reject) => {
      const existing = this.documentRef.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Falha ao carregar Google Identity Services.')), {
          once: true,
        });
        return;
      }
      const script = this.documentRef.createElement('script');
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Falha ao carregar Google Identity Services.'));
      this.documentRef.head?.appendChild(script);
    });
    return this.googleReadyPromise;
  }

  async requestToken({ prompt = '' } = {}) {
    await this.loadClient();
    return new Promise((resolve, reject) => {
      try {
        const tokenClient = this.windowRef.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: this.scopes.join(' '),
          callback: (response) => {
            if (response && response.access_token) {
              this.token = response.access_token;
              const expiresIn = Number.parseInt(response.expires_in ?? '0', 10);
              const offset = Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn * 1000 : 3600 * 1000;
              this.expiresAt = Date.now() + offset;
              resolve(this.token);
            } else if (response?.error) {
              reject(new Error(response.error_description ?? 'Autorização cancelada.'));
            } else {
              reject(new Error('Autorização do Google Drive não retornou um token válido.'));
            }
          },
          error_callback: (error) => {
            const message = error?.error_description ?? error?.error ?? 'Falha ao autorizar com o Google.';
            reject(new Error(message));
          },
        });
        tokenClient.requestAccessToken({ prompt });
      } catch (error) {
        reject(error);
      }
    });
  }

  async ensureToken({ promptIfNeeded = false } = {}) {
    if (this.token && Date.now() < this.expiresAt - 10000) {
      return this.token;
    }
    const prompt = promptIfNeeded ? 'consent' : '';
    return this.requestToken({ prompt });
  }

  async revoke() {
    if (!this.token) {
      return;
    }
    const token = this.token;
    this.token = null;
    this.expiresAt = 0;
    if (this.windowRef?.google?.accounts?.oauth2?.revoke) {
      await new Promise((resolve) => {
        try {
          this.windowRef.google.accounts.oauth2.revoke(token, () => resolve());
        } catch (error) {
          resolve();
        }
      });
      return;
    }
    if (typeof fetch === 'function') {
      try {
        await fetch('https://oauth2.googleapis.com/revoke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ token }),
        });
      } catch (error) {
        // ignorar falha silenciosamente
      }
    }
  }
}

class DriveClient {
  constructor({ tokenManager, fetchImpl = globalThis.fetch }) {
    this.tokenManager = tokenManager;
    this.fetchImpl = fetchImpl;
    this.apiBase = 'https://www.googleapis.com/drive/v3';
    this.uploadBase = 'https://www.googleapis.com/upload/drive/v3';
  }

  async request(path, { method = 'GET', params, body, headers = {}, upload = false, parseJson = true } = {}) {
    const token = await this.tokenManager.ensureToken({ promptIfNeeded: false });
    const base = upload ? this.uploadBase : this.apiBase;
    const url = new URL(path, base);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, value);
        }
      });
    }
    const response = await this.fetchImpl(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...headers,
      },
      body,
    });
    if (!response.ok) {
      const contentType = response.headers.get('content-type') ?? '';
      let errorDetail = '';
      if (contentType.includes('application/json')) {
        try {
          const payload = await response.json();
          errorDetail = payload?.error?.message ?? JSON.stringify(payload);
        } catch (error) {
          errorDetail = response.statusText;
        }
      } else {
        errorDetail = response.statusText;
      }
      throw new Error(`Google Drive (${response.status}): ${errorDetail}`);
    }
    if (response.status === 204 || !parseJson) {
      return null;
    }
    const text = await response.text();
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch (error) {
      return text;
    }
  }

  async listFilesByName(name, miniappId) {
    const queryParts = [
      "'appDataFolder' in parents",
      `name='${escapeQueryValue(name)}'`,
      'trashed=false',
    ];
    if (miniappId) {
      queryParts.push(`appProperties has { key='miniappId' and value='${escapeQueryValue(miniappId)}' }`);
    }
    const payload = await this.request('files', {
      params: {
        spaces: 'appDataFolder',
        fields: 'files(id,name,headRevisionId,modifiedTime,appProperties)',
        q: queryParts.join(' and '),
      },
    });
    return payload?.files ?? [];
  }

  buildMultipartBody(metadata, data) {
    const boundary = `boundary${Math.random().toString(36).slice(2)}`;
    const meta = JSON.stringify(metadata ?? {});
    const content = JSON.stringify(data ?? {});
    const body = [`--${boundary}`, 'Content-Type: application/json; charset=UTF-8', '', meta, `--${boundary}`, 'Content-Type: application/json; charset=UTF-8', '', content, `--${boundary}--`, ''].join('\r\n');
    return { body, boundary };
  }

  async createFile(name, data, miniappId) {
    const metadata = {
      name,
      parents: ['appDataFolder'],
      appProperties: { miniappId },
    };
    const { body, boundary } = this.buildMultipartBody(metadata, data);
    return this.request('files', {
      method: 'POST',
      upload: true,
      params: { uploadType: 'multipart', fields: 'id,name,headRevisionId,modifiedTime' },
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    });
  }

  async updateFile(fileId, data, { revisionId, miniappId }) {
    const metadata = {
      appProperties: miniappId ? { miniappId } : undefined,
    };
    const { body, boundary } = this.buildMultipartBody(metadata, data);
    return this.request(`files/${fileId}`, {
      method: 'PATCH',
      upload: true,
      params: {
        uploadType: 'multipart',
        fields: 'id,name,headRevisionId,modifiedTime',
        ...(revisionId ? { ifRevisionId: revisionId } : {}),
      },
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    });
  }

  async downloadFile(fileId) {
    return this.request(`files/${fileId}`, {
      params: { alt: 'media' },
    });
  }

  async getFileMetadata(fileId) {
    return this.request(`files/${fileId}`, {
      params: { fields: 'id,name,headRevisionId,modifiedTime,appProperties' },
    });
  }

  async deleteFile(fileId) {
    await this.request(`files/${fileId}`, { method: 'DELETE', parseJson: false });
  }
}

function normalizeDocumentStructure(handler, document, deviceId) {
  const normalized = handler.normalizeDocument(document ?? null, deviceId);
  normalized.deviceId = normalized.deviceId ?? deviceId;
  return normalized;
}

function getFieldKeys(document) {
  if (!document || typeof document !== 'object') {
    return [];
  }
  return Object.keys(document.fields ?? {});
}

function fieldEquals(a, b) {
  return (
    (a?.value ?? null) === (b?.value ?? null) &&
    (a?.deviceId ?? null) === (b?.deviceId ?? null) &&
    (a?.updatedAt ?? null) === (b?.updatedAt ?? null)
  );
}

function parseTimestamp(value) {
  if (!value) return 0;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 0;
  return date.getTime();
}

function chooseField(localField, remoteField, deviceId) {
  const localTs = parseTimestamp(localField?.updatedAt);
  const remoteTs = parseTimestamp(remoteField?.updatedAt);
  if (localTs > remoteTs) {
    return localField;
  }
  if (remoteTs > localTs) {
    return remoteField;
  }
  const localDevice = localField?.deviceId ?? '';
  const remoteDevice = remoteField?.deviceId ?? '';
  if (localDevice === remoteDevice) {
    return localField;
  }
  if (localDevice === deviceId) {
    return localField;
  }
  if (remoteDevice === deviceId) {
    return remoteField;
  }
  return localDevice > remoteDevice ? localField : remoteField;
}

function mergeDocuments(handler, localDoc, remoteDoc, deviceId) {
  const normalizedLocal = normalizeDocumentStructure(handler, localDoc, deviceId);
  const normalizedRemote = normalizeDocumentStructure(handler, remoteDoc, deviceId);
  const fields = new Set([...getFieldKeys(normalizedLocal), ...getFieldKeys(normalizedRemote)]);
  const merged = { version: 1, deviceId, updatedAt: null, fields: {} };
  let localChanged = false;
  let remoteChanged = false;

  fields.forEach((field) => {
    const localField = normalizedLocal.fields[field] ?? { value: '', updatedAt: null, deviceId };
    const remoteField = normalizedRemote.fields[field] ?? { value: '', updatedAt: null, deviceId };
    const winner = chooseField(localField, remoteField, deviceId);
    merged.fields[field] = { ...winner };
    if (!fieldEquals(winner, localField)) {
      localChanged = true;
    }
    if (!fieldEquals(winner, remoteField)) {
      remoteChanged = true;
    }
  });

  const timestamps = Object.values(merged.fields)
    .map((field) => parseTimestamp(field.updatedAt))
    .filter((value) => value > 0);
  merged.updatedAt = timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : new Date().toISOString();

  return { document: merged, localChanged, remoteChanged };
}

class SyncController {
  constructor(options = {}) {
    this.window = options.window ?? globalThis.window;
    this.document = options.document ?? globalThis.document;
    this.fetch = options.fetch ?? globalThis.fetch;
    this.pollInterval = options.pollInterval ?? DEFAULT_POLL_INTERVAL;
    this.storeBus = options.storeBus ?? null;
    this.tokenManager = new TokenManager({
      clientId: options.clientId ?? resolveEnvClientId(),
      scopes: options.scopes ?? [SYNC_SCOPE],
      windowRef: this.window,
      documentRef: this.document,
    });
    this.drive = new DriveClient({ tokenManager: this.tokenManager, fetchImpl: this.fetch });
    this.miniapps = options.miniapps ?? createMiniappHandlers(this.storeBus);
    this.listeners = new Set();
    this.state = {
      enabled: false,
      status: SYNC_STATUSES.DISCONNECTED,
      lastSyncAt: null,
      lastError: null,
      lastErrorAt: null,
      files: {},
    };
    this.pollTimer = null;
    this.visibilityListener = null;
    this.focusListener = null;
    this.ready = this.initialize();
  }

  async initialize() {
    const stored = await getSyncState();
    this.state = {
      ...this.state,
      ...stored,
      status: stored?.status ?? (stored?.enabled ? SYNC_STATUSES.DISCONNECTED : SYNC_STATUSES.DISCONNECTED),
    };
    this.notify();
    this.attachVisibilityListeners();
    if (this.state.enabled) {
      try {
        await this.syncNow({ reason: 'startup' });
      } catch (error) {
        // estado já atualizado em syncNow
      }
      this.startPolling();
    }
  }

  attachVisibilityListeners() {
    if (!this.document || !this.window) {
      return;
    }
    this.visibilityListener = () => {
      if (!this.state.enabled) return;
      if (this.document.visibilityState === 'visible') {
        this.syncNow({ reason: 'visibility' }).catch(() => {});
      }
    };
    this.focusListener = () => {
      if (!this.state.enabled) return;
      this.syncNow({ reason: 'focus' }).catch(() => {});
    };
    this.document.addEventListener('visibilitychange', this.visibilityListener);
    this.window.addEventListener('focus', this.focusListener);
  }

  detachVisibilityListeners() {
    if (this.document && this.visibilityListener) {
      this.document.removeEventListener('visibilitychange', this.visibilityListener);
    }
    if (this.window && this.focusListener) {
      this.window.removeEventListener('focus', this.focusListener);
    }
    this.visibilityListener = null;
    this.focusListener = null;
  }

  startPolling() {
    this.stopPolling();
    if (this.pollInterval <= 0) {
      return;
    }
    this.pollTimer = setInterval(() => {
      if (!this.state.enabled) return;
      this.syncNow({ reason: 'interval' }).catch(() => {});
    }, this.pollInterval);
  }

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  subscribe(listener) {
    if (typeof listener !== 'function') {
      return () => {};
    }
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    const snapshot = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (error) {
        console.error('Sync listener error', error);
      }
    });
  }

  getState() {
    return {
      enabled: this.state.enabled,
      status: this.state.status,
      lastSyncAt: this.state.lastSyncAt,
      lastError: this.state.lastError,
      lastErrorAt: this.state.lastErrorAt,
      files: { ...(this.state.files ?? {}) },
    };
  }

  async updateState(partial) {
    this.state = await setSyncState(partial);
    this.notify();
    return this.state;
  }

  async enable() {
    if (this.state.enabled) {
      return this.state;
    }
    await this.updateState({ status: SYNC_STATUSES.AUTHORIZING });
    try {
      await this.tokenManager.requestToken({ prompt: 'consent' });
      await this.updateState({ enabled: true, status: SYNC_STATUSES.SYNCING, lastError: null, lastErrorAt: null });
      await this.syncNow({ reason: 'enable' });
      this.startPolling();
      return this.state;
    } catch (error) {
      await this.updateState({
        enabled: false,
        status: SYNC_STATUSES.ERROR,
        lastError: error.message,
        lastErrorAt: new Date().toISOString(),
      });
      throw error;
    }
  }

  async disable() {
    this.stopPolling();
    await this.tokenManager.revoke();
    await this.updateState({
      enabled: false,
      status: SYNC_STATUSES.DISCONNECTED,
    });
  }

  async syncNow({ reason } = {}) {
    if (!this.state.enabled) {
      return this.state;
    }
    await this.updateState({ status: SYNC_STATUSES.SYNCING });
    try {
      await this.tokenManager.ensureToken({ promptIfNeeded: false });
      const deviceId = await ensureDeviceId();
      for (const handler of this.miniapps.values()) {
        await this.syncMiniapp(handler, deviceId);
      }
      await this.updateState({
        status: SYNC_STATUSES.SYNCED,
        lastSyncAt: new Date().toISOString(),
        lastError: null,
        lastErrorAt: null,
      });
    } catch (error) {
      await this.updateState({
        status: SYNC_STATUSES.ERROR,
        lastError: error.message,
        lastErrorAt: new Date().toISOString(),
      });
      throw error;
    }
    return this.state;
  }

  async syncMiniapp(handler, deviceId) {
    const miniappId = handler.id;
    const fileState = await getSyncFile(miniappId);
    let fileId = fileState?.fileId ?? null;
    let revisionId = fileState?.revisionId ?? null;
    let remoteDoc = null;

    let metadataUpdated = false;
    let metadataTimestamp = null;

    if (fileId) {
      try {
        const metadata = await this.drive.getFileMetadata(fileId);
        if (!metadata) {
          fileId = null;
          revisionId = null;
        } else {
          metadataTimestamp = metadata.modifiedTime ?? null;
          if (metadata.headRevisionId && metadata.headRevisionId !== revisionId) {
            remoteDoc = await this.drive.downloadFile(fileId);
            revisionId = metadata.headRevisionId;
            metadataUpdated = true;
          }
        }
      } catch (error) {
        fileId = null;
        revisionId = null;
      }
    }

    if (!fileId) {
      const existing = await this.drive.listFilesByName(handler.fileName, miniappId);
      if (existing.length > 0) {
        const file = existing[0];
        fileId = file.id;
        revisionId = file.headRevisionId;
        remoteDoc = await this.drive.downloadFile(fileId);
        const snapshot = await updateSyncFile(miniappId, {
          fileId,
          revisionId,
          updatedAt: file.modifiedTime ?? new Date().toISOString(),
        });
        this.state.files = snapshot.files;
      }
    }

    const localDoc = await handler.getLocalDocument();
    const { document: mergedDoc, localChanged, remoteChanged } = mergeDocuments(
      handler,
      localDoc,
      remoteDoc,
      deviceId,
    );

    if (localChanged) {
      await handler.saveMergedDocument(mergedDoc);
    }

    if (!fileId) {
      const created = await this.drive.createFile(handler.fileName, mergedDoc, miniappId);
      fileId = created.id;
      revisionId = created.headRevisionId;
      const snapshot = await updateSyncFile(miniappId, {
        fileId,
        revisionId,
        updatedAt: created.modifiedTime ?? mergedDoc.updatedAt,
      });
      this.state.files = snapshot.files;
    } else if (remoteChanged) {
      const updated = await this.drive.updateFile(fileId, mergedDoc, {
        revisionId,
        miniappId,
      });
      revisionId = updated.headRevisionId ?? revisionId;
      const snapshot = await updateSyncFile(miniappId, {
        fileId,
        revisionId,
        updatedAt: updated.modifiedTime ?? mergedDoc.updatedAt,
      });
      this.state.files = snapshot.files;
    } else if (metadataUpdated) {
      const snapshot = await updateSyncFile(miniappId, {
        fileId,
        revisionId,
        updatedAt: metadataTimestamp ?? mergedDoc.updatedAt,
      });
      this.state.files = snapshot.files;
    }
  }

  async deleteBackups() {
    await this.tokenManager.ensureToken({ promptIfNeeded: true });
    for (const handler of this.miniapps.values()) {
      const existing = await this.drive.listFilesByName(handler.fileName, handler.id);
      for (const file of existing) {
        await this.drive.deleteFile(file.id);
      }
      const snapshot = await clearSyncFile(handler.id);
      this.state.files = snapshot.files;
    }
    await this.updateState({ lastSyncAt: null });
  }

  async dispose() {
    this.stopPolling();
    this.detachVisibilityListeners();
    this.listeners.clear();
    if (this.tokenManager && typeof this.tokenManager.revoke === 'function') {
      try {
        await this.tokenManager.revoke();
      } catch (error) {
        // ignore revoke errors during dispose
      }
    }
  }
}

let controllerInstance;

export function initSync(options = {}) {
  if (!controllerInstance) {
    controllerInstance = new SyncController(options);
  } else if (options.storeBus && !controllerInstance.storeBus) {
    controllerInstance.storeBus = options.storeBus;
    controllerInstance.miniapps = options.miniapps ?? createMiniappHandlers(options.storeBus);
  }
  return controllerInstance;
}

export function getSyncController() {
  if (!controllerInstance) {
    controllerInstance = new SyncController({});
  }
  return controllerInstance;
}

export async function __resetSyncControllerForTests() {
  if (controllerInstance && typeof controllerInstance.dispose === 'function') {
    try {
      await controllerInstance.dispose();
    } catch (error) {
      // ignore dispose errors in tests
    }
  }
  controllerInstance = null;
}
