// =============================================
// Caminho sugerido no repositório GitHub:
// docs/microapps/home/Home.js
// =============================================
// MICROAPP: Home.js — Padrão single-spa (Projeto 5 Horas)
// =============================================
// Este arquivo representa um microaplicativo independente.
// Ele será carregado dinamicamente pelo root-config.
// Implementa: bootstrap, mount, unmount.
// =============================================

// Exemplo simples usando Vanilla JS (pode ser adaptado para React depois)

let container = null;

export function bootstrap() {
  console.log('Home.js — bootstrap executado');
  return Promise.resolve();
}

export function mount() {
  console.log('Home.js — mount executado');

  container = document.getElementById('app-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'app-root';
    document.body.appendChild(container);
  }

  container.innerHTML = `
    <div style="padding:20px; font-family:Inter, sans-serif;">
      <h1 style="font-size: 28px; color:#222;">Bem vindo ao MiniApp 5 Horas</h1>
      <p style="margin-top:10px; font-size:16px; color:#444;">
        Esta é a tela inicial do microapp <strong>Home</strong>.
      </p>
      <p style="margin-top:15px; font-size:15px; color:#666;">
        Renderizado usando o padrão <em>single-spa</em>.
      </p>

      <button id="home-navegar-educacao" style="margin-top:20px; padding:10px 15px; background:#0057ff; color:white; border-radius:8px; border:none; cursor:pointer;">
        Ir para Educação
      </button>
    </div>
  `;

  document.getElementById('home-navegar-educacao').onclick = () => {
    window.history.pushState({}, '', '/educacao');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return Promise.resolve();
}

export function unmount() {
  console.log('Home.js — unmount executado');

  if (container) {
    container.innerHTML = '';
  }

  return Promise.resolve();
}
