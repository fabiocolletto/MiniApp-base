// admin-shared.js
(function () {
  const ReactLib = window.React;
  const ReactDOMLib = window.ReactDOM;
  const Material = window.MaterialUI;
  const AppUI = window.AppUI;
  const AppModalContext = window.AppModalContext;
  const idb = window.idb;

  // ---------- 1) Guard de dependências ----------
  function assertDeps(rootId) {
    if (!ReactLib || !ReactDOMLib || !Material || !AppUI || !AppModalContext || !idb) {
      const root = document.getElementById(rootId);
      if (root) {
        root.innerHTML =
          '<div style="padding:20px;color:#ff5555;background:#220000;margin:20px;">' +
          '<h2>❌ ERRO CRÍTICO</h2><p>Dependências UI falharam ao carregar.</p></div>';
      }
      throw new Error("Dependências faltando");
    }
  }

  // ---------- 2) AdminStore (IndexedDB) ----------
  function bootstrapAdminStore() {
    if (window.AdminStore) return window.AdminStore;

    const DB_NAME = "miniapp-db";
    const DB_VERSION = 3;

    const ST_PROFILE = "system_profile";
    const ST_PREFS = "system_prefs";
    const ST_USERS = "admin_users";
    const ST_MINIAPPS = "admin_miniapps";
    const ST_CATEGORIES = "admin_categories";

    let dbPromise = null;

    function openDB() {
      if (dbPromise) return dbPromise;
      dbPromise = idb.openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(ST_PROFILE)) {
            db.createObjectStore(ST_PROFILE, { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains(ST_PREFS)) {
            db.createObjectStore(ST_PREFS, { keyPath: "key" });
          }
          if (!db.objectStoreNames.contains(ST_USERS)) {
            const s = db.createObjectStore(ST_USERS, { keyPath: "id" });
            s.createIndex("by_email", "email", { unique: true });
          }
          if (!db.objectStoreNames.contains(ST_MINIAPPS)) {
            const s = db.createObjectStore(ST_MINIAPPS, { keyPath: "id" });
            s.createIndex("by_slug", "slug", { unique: true });
            s.createIndex("by_categoryId", "categoryId", { unique: false });
          }
          if (!db.objectStoreNames.contains(ST_CATEGORIES)) {
            const s = db.createObjectStore(ST_CATEGORIES, { keyPath: "id" });
            s.createIndex("by_slug", "slug", { unique: true });
          }
        }
      });
      return dbPromise;
    }

    const Driver = {
      async get(store, key) { const db = await openDB(); return db.get(store, key); },
      async put(store, val) { const db = await openDB(); return db.put(store, val); },
      async del(store, key) { const db = await openDB(); return db.delete(store, key); },
      async all(store) { const db = await openDB(); return db.getAll(store); }
    };

    function uid(prefix) {
      return (prefix || "id") + "_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }

    const listeners = new Set();
    let status = { online: navigator.onLine, message: "Armazenamento admin pronto.", lastSaveTime: null };

    function notify(partial = {}) {
      status = { ...status, ...partial };
      listeners.forEach(fn => { try { fn(status); } catch (e) {} });
    }

    window.addEventListener("online", () => notify({ online: true, message: "Conectado. Admin local ativo." }));
    window.addEventListener("offline", () => notify({ online: false, message: "Offline total. Admin local ativo." }));

    const AdminStore = {
      async initOnce() { await openDB(); return true; },
      registerStatusListener(fn) {
        if (typeof fn !== "function") return () => {};
        listeners.add(fn); fn(status);
        return () => listeners.delete(fn);
      },
      getStatus() { return { ...status }; },

      async setPref(key, value) {
        await Driver.put(ST_PREFS, { key, value, updatedAt: new Date().toISOString() });
        return true;
      },
      async getPref(key, def = null) {
        const r = await Driver.get(ST_PREFS, key);
        return r ? r.value : def;
      },

      // CRUD genérico por entidade
      async list(entity) {
        await this.initOnce();
        const store =
          entity === "users" ? ST_USERS :
          entity === "miniapps" ? ST_MINIAPPS :
          ST_CATEGORIES;
        return Driver.all(store);
      },
      async upsert(entity, data) {
        await this.initOnce();
        const store =
          entity === "users" ? ST_USERS :
          entity === "miniapps" ? ST_MINIAPPS :
          ST_CATEGORIES;

        const now = new Date().toISOString();
        const id = data.id || uid(entity);
        const val = { ...data, id, updatedAt: now, createdAt: data.createdAt || now };
        await Driver.put(store, val);
        notify({ lastSaveTime: new Date().toLocaleTimeString("pt-BR"), message: "Registro salvo localmente." });
        return val;
      },
      async remove(entity, id) {
        await this.initOnce();
        const store =
          entity === "users" ? ST_USERS :
          entity === "miniapps" ? ST_MINIAPPS :
          ST_CATEGORIES;
        await Driver.del(store, id);
        notify({ lastSaveTime: new Date().toLocaleTimeString("pt-BR"), message: "Registro removido." });
        return true;
      }
    };

    window.AdminStore = AdminStore;
    AdminStore.initOnce();
    return AdminStore;
  }

  // ---------- 3) Helpers de UI ----------
  function toSlug(v) {
    return (v || "")
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 64);
  }

  function getOutlinedSx(themeMode) {
    const ORANGE = "#f97316";
    return {
      backgroundColor: "transparent",
      "& .MuiOutlinedInput-root": { backgroundColor: "transparent" },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: themeMode === "light" ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.18)",
        borderWidth: 1
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: themeMode === "light" ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.35)"
      },
      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: ORANGE,
        boxShadow: "none"
      }
    };
  }

  // ---------- 4) Layout padrão ----------
  function makeLayout(AppCardComponent, rootId) {
    const { useCallback, useEffect, useMemo, useState } = ReactLib;
    const { ThemeProvider, createTheme, CssBaseline, Box } = Material;

    const e = ReactLib.createElement;
    const AdminStore = window.AdminStore;

    function Layout() {
      const [preferences, setPreferences] = useState(() => ({ theme: "dark", language: "pt-BR" }));
      const apply = useCallback(next => setPreferences(prev => ({ ...prev, ...next })), []);

      useEffect(() => {
        Promise.all([
          AdminStore.getPref("theme", "dark"),
          AdminStore.getPref("language", "pt-BR")
        ]).then(([t, l]) => apply({ theme: t, language: l }));
      }, [apply]);

      useEffect(() => {
        function onMsg(event) {
          const payload = event?.data;
          if (!payload || payload.type !== "miniapp:global-preferences") return;
          const p = payload.preferences || {};
          if (p.theme || p.language) {
            apply({
              theme: p.theme || preferences.theme,
              language: p.language || preferences.language
            });
          }
        }
        window.addEventListener("message", onMsg);
        return () => window.removeEventListener("message", onMsg);
      }, [apply, preferences.theme, preferences.language]);

      const [status, setStatus] = useState(() => AdminStore.getStatus());

      const appTheme = useMemo(() => createTheme({
        palette: {
          mode: preferences.theme === "light" ? "light" : "dark",
          primary: { main: "#4CAF50" },
          secondary: { main: "#0ea5e9" },
          error: { main: "#f44336" },
          background: {
            default: preferences.theme === "light" ? "#f3f4f6" : "#020617",
            paper: preferences.theme === "light" ? "#ffffff" : "#0f172a"
          }
        },
        typography: { fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
        shape: { borderRadius: 0 }
      }), [preferences.theme]);

      useEffect(() => AdminStore.registerStatusListener(setStatus), []);

      return e(
        ThemeProvider, { theme: appTheme },
        e(CssBaseline),
        e(
          AppModalContext.AppModalProvider, null,
          e("div", { className: "miniapp-shell", style: { minHeight: "100vh", display: "flex", flexDirection: "column" } },
            e(Box, { component: "main", className: "miniapp-stage", sx: { flex: 1, display: "flex", flexDirection: "column" } },
              e(Box, { sx: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: { xs: 2, md: 4 } } },
                e(Box, { sx: { width: "100%", maxWidth: "720px" } },
                  e(AppCardComponent, { status, preferences, outlinedSx: getOutlinedSx(preferences.theme) })
                )
              )
            )
          )
        )
      );
    }

    ReactDOMLib.createRoot(document.getElementById(rootId)).render(e(Layout));
  }

  // API pública do shared
  window.AdminShared = {
    assertDeps,
    bootstrapAdminStore,
    toSlug,
    getOutlinedSx,
    makeLayout
  };
})();
