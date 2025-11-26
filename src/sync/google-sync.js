/**
 * google-sync.js
 * Sincronização completa do MiniApp com Google Drive via Apps Script.
 */

import { getGoogleToken } from "../auth/google-auth.js";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwcm49CbeSuT-f8r-RvzhntPz6RRVWz3l0sNv-e_mM4ADB_CQXRvsmyWSsdWGT8qCQ6jw/exec";

// ======== UTIL ========
function deviceId() {
  return localStorage.getItem("device-id") ||
    (() => {
      const id = "dev-" + Math.random().toString(36).substring(2);
      localStorage.setItem("device-id", id);
      return id;
    })();
}

// ======== CRIPTOGRAFIA ========
async function encrypt(text, key) {
  const enc = new TextEncoder().encode(text);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    "AES-GCM",
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    enc
  );

  return {
    iv: Array.from(iv),
    data: btoa(String.fromCharCode.apply(null, new Uint8Array(encrypted))),
  };
}

async function decrypt(obj, key) {
  const iv = new Uint8Array(obj.iv);
  const encryptedBytes = Uint8Array.from(atob(obj.data), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    "AES-GCM",
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encryptedBytes
  );

  return new TextDecoder().decode(decrypted);
}

// ======== GERAÇÃO DA CHAVE LOCAL ========
function getLocalKey() {
  let hex = localStorage.getItem("crypto-key");
  if (!hex) {
    const key = crypto.getRandomValues(new Uint8Array(32));
    hex = Array.from(key).map(b => b.toString(16).padStart(2, "0")).join("");
    localStorage.setItem("crypto-key", hex);
  }
  return new Uint8Array(
    hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
  );
}

// ======== EXPORTAR ESTADO LOCAL ========
async function readDexieState() {
  return {
    user: await window.db?.kv?.toArray?.() ?? [],
    updatedAt: new Date().toISOString()
  };
}

// ======== IMPORTAR ESTADO PARA DEXIE ========
async function applyDexieState(state) {
  if (!window.db) return;

  await window.db.kv.clear();
  for (const entry of state.user) {
    await window.db.kv.put(entry);
  }
}

// ======== UPLOAD ========
export async function syncUpload(miniApp = "Base", fileName = "backup.json") {
  const token = getGoogleToken();
  if (!token) throw new Error("Usuário não está logado no Google.");

  const key = getLocalKey();
  const state = await readDexieState();

  const encrypted = await encrypt(JSON.stringify(state), key);

  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      miniApp,
      fileName,
      data: JSON.stringify(encrypted),
      deviceId: deviceId()
    })
  });

  return res.json();
}

// ======== DOWNLOAD ========
export async function syncDownload(miniApp = "Base", fileName = "backup.json") {
  const token = getGoogleToken();
  if (!token) throw new Error("Usuário não está logado no Google.");

  const url = `${SCRIPT_URL}?miniApp=${miniApp}&fileName=${fileName}`;

  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const encryptedString = await res.text();
  if (!encryptedString || encryptedString === "null") return null;

  const encryptedObj = JSON.parse(encryptedString);
  const key = getLocalKey();

  const jsonString = await decrypt(encryptedObj, key);
  const state = JSON.parse(jsonString);

  await applyDexieState(state);

  return state;
}
