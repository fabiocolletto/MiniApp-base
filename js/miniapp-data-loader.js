const CACHE_KEY = "miniappDataCache";
const LOCAL_MODULE_URL = new URL("../docs/miniapp-data.js", import.meta.url)
  .href;
const DEFAULT_REMOTE_SOURCE =
  globalThis.MINIAPP_DATA_REMOTE_URL ||
  "https://raw.githubusercontent.com/5horas/miniapp/main/docs/miniapp-data.js";
let lastDataSource = "uninitialized";

function isValidDataset(data) {
  return Array.isArray(data);
}

function cacheDataset(data) {
  if (typeof localStorage === "undefined") {
    return;
  }
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        updatedAt: new Date().toISOString(),
        data,
      }),
    );
  } catch (error) {
    console.warn("Não foi possível salvar o cache do catálogo.", error);
  }
}

function loadCachedDataset() {
  if (typeof localStorage === "undefined") {
    return null;
  }
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) {
      return null;
    }
    const parsed = JSON.parse(stored);
    if (!isValidDataset(parsed?.data)) {
      return null;
    }
    lastDataSource = "local-cache";
    return parsed.data;
  } catch (error) {
    console.warn("Cache do catálogo corrompido. Ignorando.", error);
    return null;
  }
}

async function loadFromLocalModule() {
  const module = await import(LOCAL_MODULE_URL);
  if (!isValidDataset(module?.miniAppsData)) {
    throw new Error("Estrutura inesperada em miniapp-data.js");
  }
  lastDataSource = "local-module";
  return module.miniAppsData;
}

function extractArrayLiteral(text) {
  const match = text.match(/export const miniAppsData\s*=\s*(\[[\s\S]*?\]);?/);
  if (!match || match.length < 2) {
    throw new Error(
      "Não foi possível localizar miniAppsData no arquivo remoto.",
    );
  }
  return match[1];
}

function evaluateArrayLiteral(literal) {
  const factory = Function(`"use strict"; return (${literal});`);
  return factory();
}

async function loadFromRemoteSource(remoteUrl) {
  const response = await fetch(remoteUrl, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Falha ao baixar dados remotos (${response.status}).`);
  }
  const text = await response.text();
  const literal = extractArrayLiteral(text);
  const data = evaluateArrayLiteral(literal);
  if (!isValidDataset(data)) {
    throw new Error("Conteúdo remoto inválido.");
  }
  lastDataSource = "remote-fallback";
  return data;
}

export function getMiniAppDataSource() {
  return lastDataSource;
}

export async function loadMiniAppData(options = {}) {
  const remoteUrl = options.remoteUrl || DEFAULT_REMOTE_SOURCE;
  try {
    const data = await loadFromLocalModule();
    cacheDataset(data);
    return data;
  } catch (localError) {
    console.warn(
      "miniapp-data.js local indisponível. Tentando fallback remoto.",
      localError,
    );
    try {
      const remoteData = await loadFromRemoteSource(remoteUrl);
      cacheDataset(remoteData);
      return remoteData;
    } catch (remoteError) {
      console.error("Fallback remoto falhou.", remoteError);
      const cached = loadCachedDataset();
      if (cached) {
        return cached;
      }
      lastDataSource = "unavailable";
      throw remoteError;
    }
  }
}
