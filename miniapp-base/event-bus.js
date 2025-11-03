const PREFS_CHANNEL = 'marco:prefs';
const STORE_CHANNEL = 'marco:store';

const fallbackTargets = new Map();

function createFallbackChannel(name) {
  if (!fallbackTargets.has(name)) {
    fallbackTargets.set(name, { listeners: new Set() });
  }
  const target = fallbackTargets.get(name);
  return {
    postMessage(data) {
      const snapshot = Array.from(target.listeners);
      Promise.resolve().then(() => {
        snapshot.forEach((listener) => {
          try {
            listener({ data });
          } catch (error) {
            console.error('Fallback BroadcastChannel listener error', error);
          }
        });
      });
    },
    addEventListener(type, listener) {
      if (type === 'message') {
        target.listeners.add(listener);
      }
    },
    removeEventListener(type, listener) {
      if (type === 'message') {
        target.listeners.delete(listener);
      }
    },
    close() {
      target.listeners.clear();
    },
  };
}

function createNativeChannel(name) {
  if (typeof BroadcastChannel === 'undefined') {
    return createFallbackChannel(name);
  }

  return new BroadcastChannel(name);
}

export function createBus(name) {
  const channel = createNativeChannel(name);
  const subscribers = new Set();

  function handleMessage(event) {
    const message = event?.data ?? null;
    subscribers.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        console.error('BroadcastChannel subscriber error', error);
      }
    });
  }

  channel.addEventListener('message', handleMessage);

  return {
    name,
    post(data) {
      try {
        channel.postMessage(data);
      } catch (error) {
        console.error(`Falha ao enviar mensagem para ${name}`, error);
      }
    },
    subscribe(callback) {
      if (typeof callback !== 'function') {
        return () => {};
      }
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },
    close() {
      subscribers.clear();
      channel.removeEventListener('message', handleMessage);
      if (typeof channel.close === 'function') {
        channel.close();
      }
    },
  };
}

export function createPrefsBus() {
  return createBus(PREFS_CHANNEL);
}

export function createStoreBus() {
  return createBus(STORE_CHANNEL);
}

export { PREFS_CHANNEL, STORE_CHANNEL };
