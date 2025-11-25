// HEADER dinâmico do App 5 Horas – compatível com CDN e ES Modules

import ThemeService from "https://cdn.jsdelivr.net/gh/fabiocolletto/miniapp@fabiocolletto-patch-1/shared/modules/theme/themeService.js";
import UserDataService from "https://cdn.jsdelivr.net/gh/fabiocolletto/miniapp@fabiocolletto-patch-1/shared/modules/user/userDataService.js";
import GoogleBackupService from "https://cdn.jsdelivr.net/gh/fabiocolletto/miniapp@fabiocolletto-patch-1/shared/modules/google/googleBackupService.js";

// Injeta o HTML do header no topo do <body>
document.body.insertAdjacentHTML("afterbegin", `
<div class="fixed top-0 inset-x-0 z-50 flex justify-end px-4 py-4 rounded-b-3xl border-b border-white/10 backdrop-blur-md bg-black/20">

  <button id="theme-toggle"
    class="btn btn-primary">
    <span id="theme-icon" class="icon">dark_mode</span>
  </button>

  <button id="user-btn"
    class="btn btn-info ml-2">
    <span class="icon">account_circle</span>
  </button>

</div>

<div id="user-panel" class="fixed inset-0 z-[70] hidden items-center justify-center bg-black/50 backdrop-blur-sm">
  <div id="user-container" class="relative bg-black/70 border border-white/10 rounded-3xl p-6 pt-14 w-96 shadow-xl text-white">
    <button id="user-close" class="absolute top-3 left-3 p-2">
      <span class="icon">close</span>
    </button>
    <button id="user-edit-icon" class="absolute top-3 right-3 p-2">
      <span class="icon">edit</span>
    </button>

    <h2 class="text-xl font-semibold mb-4">Painel do Usuário</h2>

    <div id="user-form" class="space-y-3 mb-5 hidden">
      <input id="user-name" placeholder="Nome completo" class="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 focus:outline-none" />
      <input id="user-phone" placeholder="Telefone" class="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 focus:outline-none" />
      <input id="user-email" placeholder="E-mail" class="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 focus:outline-none" />
    </div>

    <div id="user-data" class="mb-4 text-sm space-y-2">
      <div id="d-name"></div>
      <div id="d-phone"></div>
      <div id="d-email"></div>
    </div>

    <button id="sync-drive" class="btn btn-info w-full mt-5">Backup para Google Drive</button>
    <button id="delete-data" class="btn btn-danger w-full mt-3">Excluir meus dados</button>

    <div id="status-bar" class="mt-6 pt-3 border-t border-white/10 text-xs opacity-80 text-center">
      Nenhum backup realizado
    </div>
  </div>
</div>
`);

// Seletores globais
const dom = {
  themeToggle: document.getElementById("theme-toggle"),
  themeIcon: document.getElementById("theme-icon"),
  userBtn: document.getElementById("user-btn"),
  userPanel: document.getElementById("user-panel"),
  userClose: document.getElementById("user-close"),
  userEditIcon: document.getElementById("user-edit-icon"),
  nameInput: document.getElementById("user-name"),
  phoneInput: document.getElementById("user-phone"),
  emailInput: document.getElementById("user-email"),
  userForm: document.getElementById("user-form"),
  dName: document.getElementById("d-name"),
  dPhone: document.getElementById("d-phone"),
  dEmail: document.getElementById("d-email"),
  statusBar: document.getElementById("status-bar"),
  deleteData: document.getElementById("delete-data"),
  syncDrive: document.getElementById("sync-drive")
};

// Tema inicial
ThemeService.load((t) => {
  dom.themeIcon.textContent = t === "dark" ? "light_mode" : "dark_mode";
});

// Botão: troca tema
dom.themeToggle.onclick = () => {
  ThemeService.toggle((t) => {
    dom.themeIcon.textContent = t === "dark" ? "light_mode" : "dark_mode";
  });
};

// Mostra painel do usuário
dom.userBtn.onclick = () => {
  dom.userPanel.classList.remove("hidden");
  dom.userPanel.classList.add("flex");
};

// Fecha painel
dom.userClose.onclick = () => closePanel();
dom.userPanel.onclick = (e) => { if (e.target === dom.userPanel) closePanel(); };

function closePanel() {
  dom.userPanel.classList.add("hidden");
  dom.userPanel.classList.remove("flex");
  dom.userForm.classList.add("hidden");
  dom.userData.classList.remove("hidden");
}

// Renderiza dados na interface
function render(data) {
  dom.dName.innerHTML = `<strong>Nome:</strong> ${data.name || ""}`;
  dom.dPhone.innerHTML = `<strong>Telefone:</strong> ${data.phone || ""}`;
  dom.dEmail.innerHTML = `<strong>E-mail:</strong> ${data.email || ""}`;
}

// Carrega dados do usuário
(async () => {
  const u = await UserDataService.load();
  dom.nameInput.value = u.name || "";
  dom.phoneInput.value = u.phone || "";
  dom.emailInput.value = u.email || "";
  render(u);
})();

// Salvar com debounce
let timer;
function debouncedSave() {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    const saved = await UserDataService.update({
      name: dom.nameInput.value.trim(),
      phone: dom.phoneInput.value.trim(),
      email: dom.emailInput.value.trim()
    });
    render(saved);
    dom.statusBar.textContent = `Última atualização: ${saved.updated}`;
  }, 400);
}

dom.nameInput.oninput = debouncedSave;
dom.phoneInput.oninput = debouncedSave;
dom.emailInput.oninput = debouncedSave;

// Editar dados
dom.userEditIcon.onclick = () => {
  dom.userForm.classList.toggle("hidden");
  dom.userData.classList.toggle("hidden");
};

// Apagar dados
dom.deleteData.onclick = async () => {
  await UserDataService.clear();
  dom.nameInput.value = "";
  dom.phoneInput.value = "";
  dom.emailInput.value = "";
  render({});
  dom.statusBar.textContent = "Dados excluídos.";
};

// Backup Google Drive
dom.syncDrive.onclick = async () => {
  if (!window.GOOGLE_CLIENT_ID) {
    dom.statusBar.textContent = "CLIENT_ID não configurado.";
    return;
  }

  GoogleBackupService.init(window.GOOGLE_CLIENT_ID);
  const ok = await GoogleBackupService.uploadBackup();

  dom.statusBar.textContent = ok
    ? "Backup enviado com sucesso!"
    : "Falha ao enviar backup.";
};
