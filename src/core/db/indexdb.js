// src/core/db/indexdb.js
import { openDB } from "idb";

export async function initDB() {
  // Evita reabrir DB a cada chamada
  if (window.familyDB) return window.familyDB;

  const db = await openDB("family-app-db", 1, {
    upgrade(db) {
      // Tabela de informações da família
      if (!db.objectStoreNames.contains("family")) {
        db.createObjectStore("family", { keyPath: "id" });
      }

      // Membros da família (UserID + roles)
      if (!db.objectStoreNames.contains("members")) {
        const store = db.createObjectStore("members", { keyPath: "userId" });
        store.createIndex("familyId", "familyId", { unique: false });
      }

      // Permissões
      if (!db.objectStoreNames.contains("permissions")) {
        db.createObjectStore("permissions", { keyPath: "id" });
      }

      // Configurações do dispositivo local
      if (!db.objectStoreNames.contains("session")) {
        db.createObjectStore("session", { keyPath: "key" });
      }

      // Dados compartilhados entre miniapps
      if (!db.objectStoreNames.contains("sharedData")) {
        const store = db.createObjectStore("sharedData", { keyPath: "id" });
        store.createIndex("type", "type", { unique: false });
      }

      // Logs para sincronização eventual
      if (!db.objectStoreNames.contains("logs")) {
        db.createObjectStore("logs", { keyPath: "id" });
      }
    },
  });

  window.familyDB = db;
  return db;
}
