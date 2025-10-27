import { syncPolicyManager } from './policyManager.js';

let running = false;
let timer: number | null = null;

export async function startSyncWorker(): Promise<void> {
  if (running) return;
  running = true;
  loop();
}

export function stopSyncWorker(): void {
  running = false;
  if (timer != null) { clearTimeout(timer); timer = null; }
}

async function loop() {
  if (!running) return;
  try {
    // TODO: aqui entra o PULL/PUSH real (manifest, deltas etc.)
    // Por enquanto é um no-op seguro.
  } finally {
    // agenda nova iteração leve
    timer = setTimeout(loop, 15000) as unknown as number;
  }
}

// Inicialização/gate de política
(async () => {
  await syncPolicyManager.init();
  const apply = () => {
    const s = syncPolicyManager.get();
    if (s.policy === 'cloud_primary') startSyncWorker(); else stopSyncWorker();
  };
  syncPolicyManager.subscribe(apply);
  apply();
})();
