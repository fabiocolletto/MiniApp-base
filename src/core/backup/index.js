import { set, get } from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";
import { connectGoogleDrive } from "./connector-google.js";
import { connectOneDrive } from "./connector-onedrive.js";

const STORAGE_KEY = "miniapp-backup-config";

function buildPendingConfig(providerName, ownerId = "") {
  return {
    provider: "pending",
    requestedProvider: providerName,
    accessToken: "",
    refreshToken: "",
    tokenExpiry: "",
    activatedAt: new Date().toISOString(),
    ownerId,
    pendingSync: true,
  };
}

export async function saveBackupConfig(config) {
  await set(STORAGE_KEY, config);
  return config;
}

export async function getBackupConfig() {
  return get(STORAGE_KEY);
}

export async function activateBackup(providerName, ownerId = "") {
  if (!navigator.onLine) {
    const pendingConfig = buildPendingConfig(providerName, ownerId);
    await saveBackupConfig(pendingConfig);
    return pendingConfig;
  }

  let config = null;

  if (providerName === "google") {
    config = await connectGoogleDrive(ownerId);
  } else if (providerName === "onedrive") {
    config = await connectOneDrive(ownerId);
  } else {
    throw new Error(`Provedor desconhecido: ${providerName}`);
  }

  if (config) {
    await saveBackupConfig(config);
  }

  return config;
}

// Em breve: exportBackup("turmas");
// Em breve: exportBackup("alunos");
