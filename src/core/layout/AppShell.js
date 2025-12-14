// AppShell.js – Novo estilo unificado baseado no App Família
// Estrutura limpa, moderna e preparada para receber MiniApps renderizados pelo Orchestrator.

export function mount(root, Orchestrator = { load: async () => {} }, GENOMA = { MEMBERS: {} }) {
  if (!root) return;

  root.innerHTML = `
    <div id="pwao-shell" class="app-shell">
      <header id="pwao-header" class="app-header">
        <div class="header-left">
          <button id="menu-button" class="icon-btn" aria-label="Abrir menu">
            <span class="material-symbols-outlined">menu</span>
          </button>
          <button id="btn-back" class="icon-btn" aria-label="Voltar" style="visibility:hidden">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
        </div>

        <div id="pwao-title" class="title">MiniApps</div>

        <div class="header-right">
          <button id="btn-user" class="icon-btn" aria-label="Painel do Usuário">
            <span class="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      <main id="pwao-stage" class="stage">
        <div class="loading">Selecione um MiniApp no menu.</div>
      </main>

      <footer id="pwao-footer"></footer>
    </div>
  `;

  const stage = root.querySelector('#pwao-stage');
  const title = root.querySelector('#pwao-title');
  const menuBtn = root.querySelector('#menu-button');

  const menuPanel = document.createElement('div');
  menuPanel.id = 'pwao-menu-panel';
  menuPanel.innerHTML = `
    <div class="menu-header">
      <div class="menu-title">MiniApps</div>
      <button id="pwao-close-menu" class="icon-btn" aria-label="Fechar menu">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="menu-list"></div>
  `;

  const list = menuPanel.querySelector('.menu-list');

  Object.values(GENOMA.MEMBERS || {}).forEach((member) => {
    const btn = document.createElement('button');
    btn.textContent = member.nome;
    btn.className = 'menu-item';

    btn.onclick = async () => {
      menuPanel.classList.remove('open');
      if (title) title.textContent = member.nome;
      if (stage) stage.innerHTML = `<div class="loading">Carregando ${member.nome}…</div>`;
      try {
        await Orchestrator.load(member, stage);
      } catch (e) {
        if (stage) stage.innerHTML = `<div class="error">Erro ao carregar.</div>`;
        console.error(e);
      }
    };

    list.appendChild(btn);
  });

  document.body.appendChild(menuPanel);

  const closeBtn = menuPanel.querySelector('#pwao-close-menu');

  const toggleMenu = (forceOpen) => {
    const isOpen = menuPanel.classList.contains('open');
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !isOpen;
    if (shouldOpen) menuPanel.classList.add('open');
    else menuPanel.classList.remove('open');
  };

  menuBtn.onclick = () => toggleMenu();
  if (closeBtn) closeBtn.onclick = () => toggleMenu(false);
}
