// AppShell.js — PWAO Genoma V4
// Monta a estrutura visual global do PWAO e carrega MiniApps no stage.

export function mount(root, Orchestrator) {
  if (!root) return console.error("[AppShell] Root inválido");

  // Criar estrutura base
  root.innerHTML = `
    <div id="pwao-shell" style="width:100%;height:100vh;display:flex;flex-direction:column;background:var(--pwao-bg);color:var(--pwao-text);">

      <!-- HEADER -->
      <header id="pwao-header" style="
        height:56px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:0 16px;
        background:var(--pwao-surface);
        border-bottom:1px solid rgba(255,255,255,0.08);
      ">
        <div style="display:flex;align-items:center;gap:12px;">
          <div id="pwao-menu-button" style="cursor:pointer;font-size:22px;">☰</div>

          <!-- DROPDOWN -->
          <div id="pwao-dropdown-wrapper" style="position:relative;">
            <div id="pwao-dropdown-trigger" style="cursor:pointer;font-size:16px;">
              MiniApps ▼
            </div>

            <div id="pwao-dropdown" style="
              display:none;
              position:absolute;
              top:26px;
              left:0;
              background:var(--pwao-surface);
              border:1px solid rgba(255,255,255,0.1);
              border-radius:var(--pwao-radius);
              min-width:160px;
              padding:6px 0;
              z-index:50;
            "></div>
          </div>
        </div>

        <div style="font-size:28px;cursor:pointer;">👤</div>
      </header>

      <!-- ÁREA CENTRAL (STAGE) -->
      <main id="pwao-stage" style="flex:1;overflow:auto;padding:16px;">
        <div style="text-align:center;opacity:0.6;margin-top:32px;">
          <h2>Bem-vindo ao ecossistema PWAO</h2>
          <p>Selecione um MiniApp no menu acima.</p>
        </div>
      </main>

      <!-- FOOTER ADMIN -->
      <footer id="pwao-footer" style="
        height:50px;
        background:var(--pwao-surface);
        border-top:1px solid rgba(255,255,255,0.08);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:12px;
        opacity:0.5;
      ">
        PWAO Genoma V4 • Modo Admin
      </footer>
    </div>
  `;

  // ===============================
  // POPULAR DROPDOWN COM MINIAPPS
  // ===============================

  const dropdown = root.querySelector("#pwao-dropdown");
  const trigger = root.querySelector("#pwao-dropdown-trigger");

  trigger.onclick = () => {
    dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
  };

  // Se clicar fora, fecha
  document.addEventListener("click", (e) => {
    if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });

  // Alimenta com os MiniApps carregados do GENOMA
  Object.values(window.GENOMA?.MEMBERS || {}).forEach(member => {
    const btn = document.createElement("div");
    btn.textContent = member.nome;
    btn.style.cssText = `
      padding:10px 14px;
      cursor:pointer;
      transition:0.2s;
    `;
    btn.onmouseover = () => (btn.style.background = "rgba(255,255,255,0.06)");
    btn.onmouseout  = () => (btn.style.background = "transparent");

    btn.onclick = () => {
      dropdown.style.display = "none";
      loadMiniApp(member);
    };

    dropdown.appendChild(btn);
  });

  // ===============================
  // FUNÇÃO PARA CARREGAR MINIAPP
  // ===============================

  async function loadMiniApp(member) {
    const stage = root.querySelector("#pwao-stage");
    stage.innerHTML = `<p style="opacity:0.7">Carregando ${member.nome}…</p>`;

    try {
      await Orchestrator.load(member.entry, stage);
    } catch (err) {
      stage.innerHTML = `<p style="color:red;">Erro ao carregar ${member.nome}.</p>`;
      console.error("[PWAO][AppShell] Falha ao carregar MiniApp:", err);
    }
  }

  console.log("[AppShell] Shell montado.");
}
