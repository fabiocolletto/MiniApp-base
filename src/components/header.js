import { getState } from '../core/state.js';

export function renderHeader() {
  const { user, theme } = getState();
  return `
    <header class="card" aria-label="Topo do app">
      <div class="section-title">
        <div>
          <div class="badge">MiniApp 5 Horas v3.0</div>
          <h1>Central do Usuário</h1>
          <p class="small">UniqueID principal: ${user.uniqueId || 'pendente'}</p>
        </div>
        <div class="grid" style="grid-template-columns: repeat(2, auto); gap: 0.5rem; align-items: center;">
          <button class="secondary" id="theme-toggle" aria-label="Alternar tema">${theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</button>
          <button class="primary" id="sync-now">Sincronizar</button>
        </div>
      </div>
    </header>
  `;
}
