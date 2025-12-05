// =============================================================
// Tela de Perfil — versão completa, seguindo práticas single-spa
// =============================================================

import Dexie from 'https://cdn.jsdelivr.net/npm/dexie@latest/dist/dexie.mjs';

let container = null;
let db;

// -------------------------------------------------------------
// BOOTSTRAP — inicializa banco Dexie
// -------------------------------------------------------------
export function bootstrap() {
  db = new Dexie('perfilDB');
  db.version(1).stores({
    usuario: '++id, nome, email'
  });
  return Promise.resolve();
}

// -------------------------------------------------------------
// MOUNT — monta UI da tela e ativa comportamentos
// -------------------------------------------------------------
export async function mount() {
  container = document.getElementById('app-root');

  const dados = await db.usuario.toArray();
  const usuario = dados[0] || { nome: '', email: '' };

  container.innerHTML = `
    <div style="padding:24px; font-family:Inter; max-width:500px; margin:auto;">
      <h1 style="margin-bottom:20px;">Perfil</h1>

      <label style="display:block; margin-bottom:12px;">
        <span style="font-size:14px; color:#555;">Nome</span>
        <input id="perfil-nome" 
               value="${usuario.nome}" 
               placeholder="Seu nome" 
               style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px; margin-top:4px;">
      </label>

      <label style="display:block; margin-bottom:20px;">
        <span style="font-size:14px; color:#555;">Email</span>
        <input id="perfil-email" 
               value="${usuario.email}" 
               placeholder="email@exemplo.com" 
               style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px; margin-top:4px;">
      </label>

      <button id="perfil-salvar" 
              style="padding:12px 20px; background:#0057ff; color:#fff; border:none; border-radius:6px; cursor:pointer; width:100%;">
        Salvar
      </button>

      <p id="perfil-status" style="margin-top:16px; font-size:14px; color:green;"></p>
    </div>
  `;

  // -----------------------------------------------------------
  // EVENTO DE SALVAR
  // -----------------------------------------------------------
  document.getElementById("perfil-salvar").onclick = async () => {
    const nome = document.getElementById("perfil-nome").value.trim();
    const email = document.getElementById("perfil-email").value.trim();

    // Limpa tabela e salva um único registro
    await db.usuario.clear();
    await db.usuario.add({ nome, email });

    document.getElementById("perfil-status").innerText = "Dados salvos!";
  };

  return Promise.resolve();
}

// -------------------------------------------------------------
// UNMOUNT — desmonta a tela, limpa eventos e UI
// -------------------------------------------------------------
export function unmount() {
  if (container) container.innerHTML = '';
  return Promise.resolve();
}
