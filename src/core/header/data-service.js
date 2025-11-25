/**
 * Serviço centralizado para persistir e recuperar os dados básicos do usuário.
 *
 * - Usa `localforage` quando disponível, com fallback para `localStorage`.
 * - Expõe funções utilitárias para outros módulos (ex.: autofill em formulários).
 * - Mantém a chave única `USER_DATA_KEY` para evitar duplicações.
 */
const USER_DATA_KEY = "user-data";

function hasLocalforage() {
  return typeof window !== "undefined" && typeof window.localforage !== "undefined";
}

async function readFromStorage(key) {
  if (hasLocalforage()) {
    const stored = await window.localforage.getItem(key);
    if (stored) return stored;
  }

  const raw = window.localStorage?.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

async function writeToStorage(key, value) {
  if (hasLocalforage()) {
    await window.localforage.setItem(key, value);
  }
  window.localStorage?.setItem(key, JSON.stringify(value));
}

async function removeFromStorage(key) {
  if (hasLocalforage()) {
    await window.localforage.removeItem(key);
  }
  window.localStorage?.removeItem(key);
}

function normalizeUserData(data = {}) {
  const { name = "", phone = "", email = "", updated } = data;
  return { name, phone, email, ...(updated ? { updated } : {}) };
}

export async function getUserData() {
  const stored = await readFromStorage(USER_DATA_KEY);
  return normalizeUserData(stored || {});
}

export async function saveUserData(partialData = {}) {
  const current = await getUserData();
  const merged = {
    ...current,
    ...partialData,
    updated: partialData.updated || current.updated || new Date().toLocaleString(),
  };

  await writeToStorage(USER_DATA_KEY, merged);
  return merged;
}

export async function clearUserData() {
  await removeFromStorage(USER_DATA_KEY);
  return {};
}

if (typeof window !== "undefined") {
  window.UserDataService = {
    USER_DATA_KEY,
    getUserData,
    saveUserData,
    clearUserData,
  };
}

export { USER_DATA_KEY };
