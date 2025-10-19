const CLEANUP_KEY = Symbol('viewCleanup');

export function runViewCleanup(target) {
  if (target && typeof target[CLEANUP_KEY] === 'function') {
    try {
      target[CLEANUP_KEY]();
    } finally {
      delete target[CLEANUP_KEY];
    }
  }
}

export function registerViewCleanup(target, cleanup) {
  if (!(target instanceof HTMLElement)) {
    return;
  }

  runViewCleanup(target);

  if (typeof cleanup === 'function') {
    target[CLEANUP_KEY] = cleanup;
  }
}
