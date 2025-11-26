// src/core/header/loader.js

import { activateBackup, getBackupConfig } from "../backup/index.js";

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

  function getOwnerId() {
    return (emailInput?.value || "").trim();
  }

  function normalizeProvider(provider) {
    if (provider === "onedrive") return "onedrive";
    return "google";
  }

  function setBackupStatusFromConfig(config) {
    if (!config) return;

    const label = config.provider === "onedrive" || config.requestedProvider === "onedrive"
      ? "OneDrive"
      : "Google Drive";

    if (config.pendingSync) {
      setStatus(`Backup pendente (offline) para ${label}. Será retomado quando a conexão voltar.`, "warn");
      return;
    }

    if (config.provider === "google" || config.provider === "onedrive") {
      setStatus(`Backup sincronizado via ${label}.`, "ok");
    }
  }

  function tryOpenBackupTarget(button) {
    const targetModal = button.dataset.modal || button.dataset.target;
    if (targetModal) {
      const modalEl = document.querySelector(targetModal);
      if (modalEl) {
        modalEl.classList.remove("hidden");
        modalEl.classList.add("flex");
        return true;
      }
    }

    const targetUrl = button.dataset.href || button.dataset.url;
    if (targetUrl) {
      window.location.href = targetUrl;
      return true;
    }

    return false;
  }

  async function handleBackupSync(provider) {
    const normalized = normalizeProvider(provider);
    setStatus("Conectando com o serviço de backup...", "info");

    try {
      const config = await activateBackup(normalized, getOwnerId());

      if (!config) {
        setStatus("Nenhuma resposta recebida do serviço de backup.", "warn");
        return;
      }

      setBackupStatusFromConfig(config);
    } catch (error) {
      console.error("Erro ao ativar backup pelo painel do usuário", error);
      setStatus("Erro ao ativar backup. Tente novamente.", "error");
    }
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
      setStatus("Informe um telefone válido (com DDD).", "warn");
      return false;
    }

    if (!validateEmail(email)) {
      setStatus("Informe um e-mail válido.", "warn");
      return false;
    }

    const updated = {
      name,
      phone: phoneMasked,
      email,
      updated: new Date().toLocaleString("pt-BR")
    };

    await UserService.save(updated);
    renderUser(updated);
    setStatus(`Último salvamento: ${updated.updated}`, "ok");
    return true;
  }

  // Eventos básicos
  userBtn.addEventListener("click", () => {
    userPanel.classList.remove("hidden");
    userPanel.classList.add("flex");
  });

  if (userClose) {
    userClose.addEventListener("click", () => {
      userPanel.classList.add("hidden");
      userPanel.classList.remove("flex");
    });
  }

  // Enter/exit modo edição pelo ícone de lápis
  if (userEditIcon && userForm && userData) {
    const iconSpan = userEditIcon.querySelector(".material-symbols-rounded");

    userEditIcon.addEventListener("click", async () => {
      if (!isEditing) {
        // Entrar em modo edição
        isEditing = true;
        userForm.classList.remove("hidden");
        userData.classList.add("opacity-40");

        if (iconSpan) iconSpan.textContent = "done";
        userEditIcon.setAttribute("aria-label", "Salvar dados");
        setStatus("Edite os dados e clique em salvar.", "info");
      } else {
        // Tentar salvar e sair do modo edição
        const ok = await saveLocal();
        if (!ok) return;

        isEditing = false;
        userForm.classList.add("hidden");
        userData.classList.remove("opacity-40");

        if (iconSpan) iconSpan.textContent = "edit";
        userEditIcon.setAttribute("aria-label", "Editar dados");
      }
    });
  }

  // Máscara de telefone em tempo real
  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.value = maskPhone(phoneInput.value);
    });
  }

  // Botão de backup (Google/OneDrive)
  if (syncBtn) {
    const providerFromButton = normalizeProvider(syncBtn.dataset.provider);

    syncBtn.addEventListener("click", () => {
      if (tryOpenBackupTarget(syncBtn)) return;

      handleBackupSync(providerFromButton);
    });
  }

  // Botão de excluir dados
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const sure = window.confirm(
        "Tem certeza que deseja excluir seus dados locais? Essa ação não pode ser desfeita."
      );
      if (!sure) return;

      await UserService.clear();
      if (nameInput) nameInput.value = "";
      if (phoneInput) phoneInput.value = "";
      if (emailInput) emailInput.value = "";
      renderUser(null);
      setStatus("Dados apagados deste dispositivo.", "error");
    });
  }
  
  // Carrega dados na abertura
  loadUser();
  getBackupConfig()
    .then(setBackupStatusFromConfig)
    .catch((error) => {
      console.error("loadUserPanel: não foi possível recuperar status de backup", error);
      setStatus("Falha ao recuperar status de backup.", "error");
    });
}

// Função principal exportada
export async function loadGlobalHeader(options = {}) {
  const selector = options.selector || "[data-global-header]";
  const container = document.querySelector(selector);

  if (!container) {
    console.warn("loadGlobalHeader: nenhum container encontrado para", selector);
    return;
  }

  try {
    const response = await fetch("/src/core/element/header.html", {
      cache: "no-cache"
    });

    if (!response.ok) {
      console.error("loadGlobalHeader: erro ao carregar header.html", response.status);
      return;
    }

    const html = await response.text();
    container.innerHTML = html;

    // Depois que o HTML for injetado, configuramos tudo
    const root = container; // raiz local do header + painel
    setupHeaderButtons(root);
    await ThemeService.load();

    const themeToggle = root.querySelector("#theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        ThemeService.toggle();
      });
    }

    setupUserPanel(root);
  } catch (err) {
    console.error("loadGlobalHeader: falha ao carregar header:", err);
  }
}
