import { syncPolicyManager } from './policyManager.js';

let running = false;
let timer = null;

export async function startSyncWorker() {
  if (running) {
    return;
  }
  running = true;
  loop();
}

export function stopSyncWorker() {
  running = false;
  if (timer != null) {
    clearTimeout(timer);
    timer = null;
  }
}

async function loop() {
  if (!running) {
    return;
  }

  try {
    // TODO: aqui entra o PULL/PUSH real (manifest, deltas etc.)
    // Por enquanto é um no-op seguro.
  } finally {
    timer = setTimeout(loop, 15000);
  }
}

(async () => {
  await syncPolicyManager.init();
  const apply = () => {
    const settings = syncPolicyManager.get();
    if (settings.policy === 'cloud_primary') {
      startSyncWorker();
    } else {
      stopSyncWorker();
    }
  };
  syncPolicyManager.subscribe(apply);
  apply();
})();
