// src/core/header/loader.js
// Módulo de utilidades globais e serviços de estado (Tema, Usuário e Armazenamento).
// Função principal: Fornecer acesso ao UserService (dados locais do MiniApp).

// Utilitário de armazenamento assíncrono com fallback
export const Storage = (() => {
  if (typeof window !== "undefined" && window.localforage) {
    return {
      async getItem(key) { return window.localforage.getItem(key); },
      async setItem(key, value) { return window.localforage.setItem(key, value); },
      async removeItem(key) { return window.localforage.removeItem(key); }
    };
  }

  // Fallback simples e síncrono usando localStorage
  const FALLBACK_STORAGE = {
    async getItem(key) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    },
    async setItem(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch { console.error("Storage Fallback: Erro ao salvar chave:", key); }
    },
    async removeItem(key) {
      try { window.localStorage.removeItem(key); }
      catch { console.error("Storage Fallback: Erro ao remover chave:", key); }
    }
  };
  return FALLBACK_STORAGE;
})();


/**
 * Serviço de dados do usuário (dados salvos localmente).
 * ESSENCIAL: Exportado para ser usado pelo módulo de backup (index.js).
 */
export const UserService = { // CORREÇÃO CRÍTICA: EXPORTADO
  key: "app5-user-data",

  async get() {
    const data = await Storage.getItem(this.key);
    if (!data || (!data.name && !data.phone && !data.email)) {
      return null;
    }
    return data;
  },

  async save(data) {
    await Storage.setItem(this.key, data);
  },

  async clear() {
    await Storage.removeItem(this.key);
  }
};


// Serviço de tema (Mantido)
export const ThemeService = {
  key: "app5-theme",
  async load() {
    const saved = await Storage.getItem(this.key);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved === "light" || saved === "dark" ? saved : (prefersDark ? "dark" : "light");
    this.apply(theme);
    return theme;
  },
  apply(theme) {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);
    const btn = document.getElementById("theme-toggle");
    const icon = btn ? btn.querySelector(".material-symbols-rounded") : null;
    if (icon) {
      icon.textContent = theme === "dark" ? "dark_mode" : "light_mode";
    }
  },
  async toggle() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    this.apply(next);
    await Storage.setItem(this.key, next);
  }
};

// Máscara de telefone (Mantida)
export function createPhoneMask() {
  let autoCC = false;
  return function maskPhone(value) {
    let n = (value || "").replace(/\D/g, "");

    if (!autoCC && n.length >= 2 && !n.startsWith("55")) {
      n = "55" + n;
      autoCC = true;
    }

    if (n.length <= 2) return "+" + n;
    if (n.length <= 4) return `+${n.slice(0, 2)} ${n.slice(2)}`;
    if (n.length <= 9) {
      const cc = n.slice(0, 2);
      const ddd = n.slice(2, 4);
      const f = n.slice(4);
      return `+${cc} ${ddd} ${f}`;
    }

    const cc = n.slice(0, 2);
    const ddd = n.slice(2, 4);
    const first = n.length === 10 ? n.slice(4, 8) : n.slice(4, 9);
    const last = n.slice(-4);
    return `+${cc} ${ddd} ${first}-${last}`;
  };
}
