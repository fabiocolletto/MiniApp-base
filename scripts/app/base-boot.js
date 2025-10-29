import { initAuthShell } from './auth-shell.js';
import eventBus from '../events/event-bus.js';
import { resetMiniApps, getMiniAppsSnapshot } from '../data/miniapp-store.js';
import { ensurePersistentStorage, getStorageEstimate } from '../../shared/storage/idb/persistence.js';
import { openMarcoCore, openPesquisaStudio } from '../../shared/storage/idb/databases.js';
import { migrateLegacyStorage } from '../../shared/storage/idb/migrate.js';
import { syncMiniappsCatalog as syncMiniappsCatalogToIndexedDB } from '../../shared/storage/idb/marcocore.js';

function emitStorageReady(payload) {
  eventBus.emit('storage:ready', payload);
}

function emitStorageEstimate(payload) {
  eventBus.emit('storage:estimate', payload);
}

function emitStorageMigrated(payload) {
  eventBus.emit('storage:migrated', payload);
}

async function prepareDatabases() {
  const results = await Promise.allSettled([openMarcoCore(), openPesquisaStudio()]);
  const [marcoResult, pesquisaResult] = results;

  if (marcoResult.status === 'fulfilled') {
    try {
      marcoResult.value.close();
    } catch (error) {
      console.warn('Não foi possível encerrar a conexão inicial do banco marco_core.', error);
    }
  }

  if (pesquisaResult.status === 'fulfilled') {
    try {
      pesquisaResult.value.close();
    } catch (error) {
      console.warn('Não foi possível encerrar a conexão inicial do banco pesquisa_studio.', error);
    }
  }

  return {
    marcoCore: {
      status: marcoResult.status,
      error:
        marcoResult.status === 'rejected'
          ? (marcoResult.reason && typeof marcoResult.reason === 'object' && 'message' in marcoResult.reason
              ? marcoResult.reason.message
              : String(marcoResult.reason))
          : null,
    },
    pesquisaStudio: {
      status: pesquisaResult.status,
      error:
        pesquisaResult.status === 'rejected'
          ? (pesquisaResult.reason && typeof pesquisaResult.reason === 'object' && 'message' in pesquisaResult.reason
              ? pesquisaResult.reason.message
              : String(pesquisaResult.reason))
          : null,
    },
  };
}

async function synchronizeMiniAppsCatalog(sourceEntries = null) {
  let entries = Array.isArray(sourceEntries) ? sourceEntries : null;

  if (!entries) {
    try {
      const response = await fetch('./miniapps/catalog.json', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          entries = data;
        }
      } else {
        console.warn('Catálogo de MiniApps não pôde ser carregado (HTTP %s).', response.status);
      }
    } catch (error) {
      console.warn('Falha ao buscar miniapps/catalog.json.', error);
    }
  }

  if (!entries) {
    entries = getMiniAppsSnapshot();
  }

  if (!entries || entries.length === 0) {
    resetMiniApps();
    const snapshot = getMiniAppsSnapshot();
    await syncMiniappsCatalogToIndexedDB(snapshot);
    return snapshot;
  }

  await syncMiniappsCatalogToIndexedDB(entries);
  resetMiniApps(entries);
  return entries;
}

async function collectStorageEstimate() {
  const estimate = await getStorageEstimate();
  if (!estimate) {
    emitStorageEstimate({ success: false, usage: 0, quota: 0, persisted: false, timestamp: Date.now() });
    return;
  }

  emitStorageEstimate({
    success: true,
    usage: estimate.usage ?? 0,
    quota: estimate.quota ?? 0,
    persisted: estimate.persisted ?? null,
    details: estimate.usageDetails ?? null,
    timestamp: Date.now(),
  });
}

async function bootstrapStorageLayer() {
  const persistencePromise = ensurePersistentStorage().catch((error) => {
    console.warn('Falha ao solicitar armazenamento persistente.', error);
    return false;
  });

  const databaseStatuses = await prepareDatabases();
  const persistenceGranted = await persistencePromise;

  emitStorageReady({
    databases: {
      marcoCore: { ...databaseStatuses.marcoCore },
      pesquisaStudio: { ...databaseStatuses.pesquisaStudio },
    },
    persistent: Boolean(persistenceGranted),
    timestamp: Date.now(),
  });

  const migrationResult = await migrateLegacyStorage();
  emitStorageMigrated(migrationResult);

  await synchronizeMiniAppsCatalog(migrationResult.catalog);
  await collectStorageEstimate();
}

function setupEstimateRefresh() {
  eventBus.on('storage:estimate:request', () => {
    collectStorageEstimate();
  });
}

export function bootstrapMiniAppBase(runtimeWindow = typeof window !== 'undefined' ? window : undefined) {
  initAuthShell(runtimeWindow);
  setupEstimateRefresh();
  bootstrapStorageLayer().catch((error) => {
    console.error('Falha ao inicializar a camada de armazenamento IndexedDB.', error);
  });
}

bootstrapMiniAppBase();
