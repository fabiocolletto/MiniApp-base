const DB_NAME = 'miniapp-db';
const DB_VERSION = 1;
const STORES = {
  userSettings: { keyPath: 'key' },
  pendingSync: { keyPath: 'id', autoIncrement: true }
};

let dbPromise;

function openDatabase() {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      Object.entries(STORES).forEach(([name, options]) => {
        if (!database.objectStoreNames.contains(name)) {
          database.createObjectStore(name, options);
        }
      });
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

async function withStore(storeName, mode, callback) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = callback(store);

      transaction.oncomplete = () => resolve(request?.result ?? true);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    } catch (error) {
      reject(error);
    }
  });
}

export async function saveRecord(storeName, data, key) {
  return withStore(storeName, 'readwrite', (store) => {
    if (typeof key !== 'undefined') {
      return store.put(data, key);
    }
    return store.put(data);
  });
}

export async function addRecord(storeName, data) {
  return withStore(storeName, 'readwrite', (store) => store.add(data));
}

export async function getAll(storeName) {
  return withStore(storeName, 'readonly', (store) => store.getAll());
}

export async function getByKey(storeName, key) {
  return withStore(storeName, 'readonly', (store) => store.get(key));
}

export async function deleteRecord(storeName, key) {
  return withStore(storeName, 'readwrite', (store) => store.delete(key));
}

export async function clearStore(storeName) {
  return withStore(storeName, 'readwrite', (store) => store.clear());
}

export async function addToPendingSync(payload) {
  const record = {
    payload,
    createdAt: new Date().toISOString(),
    syncStatus: 'pending'
  };
  return addRecord('pendingSync', record);
}

export async function markPendingAsSynced(id, extra = {}) {
  const record = await getByKey('pendingSync', id);
  if (!record) {
    return false;
  }
  const updated = {
    ...record,
    id,
    syncStatus: 'synced',
    syncedAt: new Date().toISOString(),
    ...extra
  };
  await saveRecord('pendingSync', updated, id);
  return true;
}

export async function markAsSynced(id, extra) {
  return markPendingAsSynced(id, extra);
}

export async function removePending(id) {
  return deleteRecord('pendingSync', id);
}

export async function getPendingItems() {
  return getAll('pendingSync');
}

export { openDatabase };
