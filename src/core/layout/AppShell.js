// AppShell.js – Novo estilo unificado baseado no App Família
// Estrutura limpa, moderna e preparada para receber MiniApps renderizados pelo Orchestrator.

export function mount(root, Orchestrator, GENOMA) {
  if (!root) return;

  root.innerHTML = `
    <div id="pwao-shell" style="width:100%;min-height:100vh;display:flex;flex-direction:column;background:#f3f6fb;color:#000;overflow:hidden;font-family:system-ui, sans-serif;">

      <header id="pwao-header" style="height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;background:#ffffff;border-bottom:1px solid #e5e5e5;">
        <div id="menu-button" style="font-size:22px;cursor:pointer;">☰</div>

        <div id="pwao-title" style="font-size:18px;font-weight:600;">MiniApps</div>

        <div style="font-size:26px;cursor:pointer;">👤</div>
      </header>

      <main id="pwao-stage" style="flex:1 0 auto;display:flex;flex-direction:column;align-items:stretch;overflow:visible;background:#f3f6fb;">
        <div style="text-align:center;opacity:0.6;margin:32px auto;font-size:16px;padding:0 16px;">
          Selecione um MiniApp no menu.
        </div>
      </main>

      <footer id="pwao-footer" style="height:52px;background:#ffffff;border-top:1px solid #e5e5e5;display:flex;align-items:center;justify-content:center;font-size:13px;color:#777;">
        Opp 5Horas – PWAO
      </footer>
    </div>
  `;

  const stage = root.querySelector('#pwao-stage');
  const title = root.querySelector('#pwao-title');
  const menuBtn = root.querySelector('#menu-button');

  const menuPanel = document.createElement('div');
  menuPanel.id = 'pwao-menu-panel';
  menuPanel.style.cssText = `
    position:fixed;
    top:0;left:0;
    width:240px;height:100vh;
    background:#ffffff;
    box-shadow:2px 0 8px rgba(0,0,0,0.1);
    transform:translateX(-260px);
    transition:0.25s ease;
    padding:16px;
    display:flex;
    flex-direction:column;
    gap:12px;
    z-index:100;
  `;

  Object.values(GENOMA.MEMBERS).forEach(member => {
    const btn = document.createElement('button');
    btn.textContent = member.nome;
    btn.style.cssText = `
      padding:12px;
      background:#f5f5f5;
      border:none;
      border-radius:12px;
      font-size:15px;
      text-align:left;
      cursor:pointer;
      transition:0.2s;
    `;
    btn.onmouseover = () => btn.style.background='#ececec';
    btn.onmouseout = () => btn.style.background='#f5f5f5';

    btn.onclick = async () => {
      menuPanel.style.transform = 'translateX(-260px)';
      title.textContent = member.nome;
      stage.innerHTML = `<div style='padding:20px;font-size:16px;opacity:0.7;'>Carregando ${member.nome}…</div>`;
      try {
        await Orchestrator.load(member, stage);
      } catch (e) {
        stage.innerHTML = `<div style='padding:20px;color:red;'>Erro ao carregar.</div>`;
        console.error(e);
      }
    };

    menuPanel.appendChild(btn);
  });

  document.body.appendChild(menuPanel);

  menuBtn.onclick = () => {
    const isOpen = menuPanel.style.transform === 'translateX(0px)';
    menuPanel.style.transform = isOpen ? 'translateX(-260px)' : 'translateX(0px)';
  };
}
