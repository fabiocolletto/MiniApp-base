const AUTOSAVE_STATES = new Set(['synced', 'dirty', 'saving', 'saved', 'error']);

function normalizeState(next) {
  if (typeof next !== 'string') {
    return 'synced';
  }
  const normalized = next.toLowerCase();
  return AUTOSAVE_STATES.has(normalized) ? normalized : 'synced';
}

export function createAutosaveController({
  bus,
  source = 'shell',
  initialState = 'synced',
  autoResetDelay = 1800,
} = {}) {
  let state = normalizeState(initialState);
  let timer = null;
  let disposed = false;
  const listeners = new Set();
  const unsubscribe =
    bus && typeof bus.subscribe === 'function'
      ? bus.subscribe((message) => {
          if (!message || typeof message !== 'object') return;
          if (message.type !== 'status') return;
          if (message.source && message.source === source) return;
          internalSetState(normalizeState(message.state), { broadcast: false });
        })
      : null;

  function notify(nextState) {
    if (disposed) return;
    listeners.forEach((listener) => {
      try {
        listener(nextState);
      } catch (error) {
        console.error('Autosave listener error', error);
      }
    });
  }

  function clearTimer() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function scheduleReset() {
    clearTimer();
    if (autoResetDelay > 0) {
      timer = setTimeout(() => {
        timer = null;
        internalSetState('synced', { broadcast: true });
      }, autoResetDelay);
    }
  }

  function internalSetState(nextState, { broadcast } = { broadcast: true }) {
    if (disposed) return state;
    const normalized = normalizeState(nextState);
    if (normalized === state) {
      return state;
    }
    clearTimer();
    state = normalized;
    if (normalized === 'saved') {
      scheduleReset();
    }
    notify(state);
    if (broadcast && bus && typeof bus.post === 'function') {
      bus.post({ type: 'status', state, source });
    }
    return state;
  }

  function setState(nextState, options = {}) {
    return internalSetState(nextState, { broadcast: options.broadcast !== false });
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      return () => {};
    }
    listeners.add(listener);
    listener(state);
    return () => {
      listeners.delete(listener);
    };
  }

  function dispose() {
    disposed = true;
    clearTimer();
    listeners.clear();
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  }

  return {
    getState() {
      return state;
    },
    setState,
    markDirty() {
      return setState('dirty');
    },
    markSaving() {
      return setState('saving');
    },
    markSaved() {
      return setState('saved');
    },
    markError() {
      return setState('error');
    },
    subscribe,
    dispose,
  };
}

export { AUTOSAVE_STATES };
