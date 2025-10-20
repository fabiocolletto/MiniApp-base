const listenerMap = new Map();

function normalizeEventName(eventName) {
  if (typeof eventName !== 'string') {
    return '';
  }

  return eventName.trim();
}

function getListeners(eventName) {
  const normalizedName = normalizeEventName(eventName);
  if (!normalizedName) {
    return { name: '', listeners: null };
  }

  if (!listenerMap.has(normalizedName)) {
    listenerMap.set(normalizedName, new Set());
  }

  return { name: normalizedName, listeners: listenerMap.get(normalizedName) };
}

function on(eventName, listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  const { name, listeners } = getListeners(eventName);
  if (!name || !listeners) {
    return () => {};
  }

  listeners.add(listener);

  return () => {
    off(name, listener);
  };
}

function once(eventName, listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  const unsubscribe = on(eventName, (payload) => {
    unsubscribe();
    listener(payload);
  });

  return unsubscribe;
}

function off(eventName, listener) {
  const normalizedName = normalizeEventName(eventName);
  if (!normalizedName || typeof listener !== 'function') {
    return;
  }

  const listeners = listenerMap.get(normalizedName);
  if (!listeners) {
    return;
  }

  listeners.delete(listener);

  if (listeners.size === 0) {
    listenerMap.delete(normalizedName);
  }
}

function emit(eventName, payload) {
  const normalizedName = normalizeEventName(eventName);
  if (!normalizedName) {
    return;
  }

  const listeners = listenerMap.get(normalizedName);
  if (!listeners || listeners.size === 0) {
    return;
  }

  const snapshot = Array.from(listeners);
  snapshot.forEach((listener) => {
    try {
      listener(payload);
    } catch (error) {
      console.error(`Erro ao lidar com o evento "${normalizedName}".`, error);
    }
  });
}

function clear(eventName) {
  if (typeof eventName === 'string') {
    const normalizedName = normalizeEventName(eventName);
    if (!normalizedName) {
      return;
    }

    listenerMap.delete(normalizedName);
    return;
  }

  listenerMap.clear();
}

export default {
  on,
  once,
  off,
  emit,
  clear,
};
