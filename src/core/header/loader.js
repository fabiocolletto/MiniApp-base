// src/core/header/loader.js

// Utilitário de armazenamento assíncrono com fallback:
// tenta usar localforage (se existir) e cai pra localStorage se não tiver.
const Storage = (() => {
  if (typeof window !== "undefined" && window.localforage) {
    return {
      async getItem(key) {
        return window.localforage.getItem(key);
      },
      async setItem(key, value) {
        return window.localforage.setItem(key, value);
      },
      async removeItem(key) {
        return window.localforage.removeItem(key);
      }
    };
  }

  // Fallback simples usando localStorage
  return {
    async getItem(key) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },
    async setItem(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // ignore
      }
    },
    async removeItem(key) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
  };
})();

// Serviço de tema: cuida do data-theme e persiste a escolha
const ThemeService = {
  key: "app5-theme",

  async load() {
    const saved = await Storage.getItem(this.key);
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const theme = saved === "light" || saved === "dark"
      ? saved
      : (prefersDark ? "dark" : "light");

    this.apply(theme);
  },

  apply(theme) {
    const html = document.documentElement;
    html.setAttribute("data-theme", theme);

    // Atualiza ícone se existir
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

// Serviço de dados do usuário
const UserService = {
  key: "app5-user-data",

  async get() {
    const data = await Storage.getItem(this.key);
    // Se não tiver nada salvo ou só lixo vazio, retorna null
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

// Controle da visibilidade dos botões do header
function setupHeaderButtons(root) {
  const raw = document.body.dataset.headerButtons || ""; // ex: "theme,user,home"
  const allowed = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Se nada foi declarado, assume núcleo padrão
  const fallback = ["theme", "user"];
  const setAllowed = new Set(allowed.length ? allowed : fallback);

  root.querySelectorAll("[data-header-button]").forEach((btn) => {
    const key = btn.getAttribute("data-header-button");
    if (!key) return;

    const visible = setAllowed.has(key);
    btn.classList.toggle("hidden", !visible);
    btn.setAttribute("aria-hidden", visible ? "false" : "true");
  });
}

// Máscara de telefone simples (+55, DDD, número)
function createPhoneMask() {
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

// Configura painel do usuário: abrir/fechar, editar, salvar, excluir
function setupUserPanel(root) {
  const userBtn = root.querySelector("#user-btn");
  const userPanel = root.querySelector("#user-panel");
  const userClose = root.querySelector("#user-close");
  const userEditIcon = root.querySelector("#user-edit-icon");

  const nameInput = root.querySelector("#user-name");
  const phoneInput = root.querySelector("#user-phone");
  const emailInput = root.querySelector("#user-email");
  const userForm = root.querySelector("#user-form");
  const userData = root.querySelector("#user-data");
  const statusBar = root.querySelector("#status-bar");
  const syncBtn = root.querySelector("#sync-drive");
  const deleteBtn = root.querySelector("#delete-data");

  if (!userPanel || !userBtn) {
    // Header usado sem painel – tudo bem
    return;
  }

  let isEditing = false;
  const maskPhone = createPhoneMask();

  function renderUser(data) {
    if (!data || (!data.name && !data.phone && !data.email)) {
      userData.innerHTML = `
        <div class="opacity-70 text-sm">
          Nenhum dado cadastrado ainda. Clique no ícone de edição para preencher.
        </div>
      `;
      return;
    }

    userData.innerHTML = `
      <div><strong>Nome:</strong> ${data.name || ""}</div>
      <div><strong>Telefone:</strong> ${data.phone || ""}</div>
      <div><strong>E-mail:</strong> ${data.email || ""}</div>
    `;
  }

  function validateName(name) {
    return name.trim().split(" ").length >= 2;
  }

  function validateEmail(email) {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    return phone.replace(/\D/g, "").length >= 10;
  }

  function setStatus(message, type = "info") {
    if (!statusBar) return;
    statusBar.textContent = message;
    statusBar.classList.remove("text-warn", "text-emerald-300", "text-red-300");
    if (type === "warn") statusBar.classList.add("text-warn");
    if (type === "ok") statusBar.classList.add("text-emerald-300");
    if (type === "error") statusBar.classList.add("text-red-300");
  }

  async function loadUser() {
    const user = await UserService.get();
    if (!user) {
      renderUser(null);
      setStatus("Nenhum backup realizado");
      return;
    }

    if (nameInput) nameInput.value = user.name || "";
    if (phoneInput) phoneInput.value = maskPhone(user.phone || "");
    if (emailInput) emailInput.value = user.email || "";

    renderUser(user);
    setStatus(`Restaurado (última atualização: ${user.updated || "--"})`);
  }

  async function saveLocal() {
    const name = (nameInput?.value || "").trim();
    const phoneRaw = (phoneInput?.value || "").trim();
    const email = (emailInput?.value || "").trim();

    const phoneMasked = maskPhone(phoneRaw);

    if (!validateName(name)) {
      setStatus("Informe nome completo (nome e sobrenome).", "warn");
      return false;
    }

    if (!validatePhone(phoneMasked)) {
      setStatus("Informe
