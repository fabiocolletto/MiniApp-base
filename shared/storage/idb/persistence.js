export async function ensurePersistentStorage() {
  if (typeof navigator === 'undefined' || !navigator.storage) {
    return false;
  }

  try {
    if (typeof navigator.storage.persisted === 'function') {
      const alreadyPersisted = await navigator.storage.persisted();
      if (alreadyPersisted) {
        return true;
      }
    }

    if (typeof navigator.storage.persist === 'function') {
      return navigator.storage.persist();
    }
  } catch (error) {
    console.warn('IndexedDB persist: falha ao solicitar armazenamento persistente.', error);
  }

  return false;
}

export async function getStorageEstimate() {
  if (typeof navigator === 'undefined' || !navigator.storage || typeof navigator.storage.estimate !== 'function') {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    if (!estimate) {
      return null;
    }

    const { quota = 0, usage = 0 } = estimate;
    return {
      quota,
      usage,
      usageDetails: estimate.usageDetails ?? null,
      persisted: typeof navigator.storage.persisted === 'function'
        ? await navigator.storage.persisted()
        : null,
    };
  } catch (error) {
    console.warn('IndexedDB persist: falha ao estimar uso de armazenamento.', error);
    return null;
  }
}
