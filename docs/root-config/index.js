// =============================================
// Caminho sugerido no repositório GitHub:
// docs/root-config/index.js
// Este será o renderizador de telas (root-config) do sistema 5 Horas.
// O arquivo index.html da raiz deve carregar este script como módulo.
// =============================================
// MODELO DIDÁTICO: single-spa aplicado ao Projeto 5 Horas
// Arquitetura ilustrativa para aprender microfrontends
// =============================================
// Este arquivo simula como seria a raiz "root-config" do MiniApp
// usando conceitos inspirados no single-spa para gerenciar
// microaplicações como: Home, Educação, Perfil, Catálogo.
// =============================================

import { registerApplication, start } from 'single-spa';

// -------------------------------------------------------------
// Import maps lógicos — no Projeto 5 Horas usamos loaders remotos
// do GitHub Pages com fallback local. Aqui representamos isso
// de forma simplificada.
// -------------------------------------------------------------

const loader = async (url) => {
  try {
    return await import(url);
  } catch (e) {
    console.warn('Falhou remoto, tentando fallback local');
    return await import('/local/' + url.split('/').pop());
  }
};

// -------------------------------------------------------------
// Microapp HOME
// -------------------------------------------------------------
registerApplication({
  name: '5horas-home',
  app: () => loader('https://5horas.com.br/miniapp/home.js'),
  activeWhen: (location) => location.pathname === '/' || location.pathname === '/home'
});

// -------------------------------------------------------------
// Microapp EDUCAÇÃO — renderiza produtos do módulo Educação
// -------------------------------------------------------------
registerApplication({
  name: '5horas-educacao',
  app: () => loader('https://5horas.com.br/miniapp/educacao.js'),
  activeWhen: (location) => location.pathname.startsWith('/educacao')
});

// -------------------------------------------------------------
// Microapp PERFIL — usa Dexie para salvar dados localmente
// -------------------------------------------------------------
registerApplication({
  name: '5horas-perfil',
  app: () => loader('https://5horas.com.br/miniapp/perfil.js'),
  activeWhen: (location) => location.pathname.startsWith('/perfil')
});

// -------------------------------------------------------------
// Microapp CATÁLOGO
// -------------------------------------------------------------
registerApplication({
  name: '5horas-catalogo',
  app: () => loader('https://5horas.com.br/miniapp/catalogo.js'),
  activeWhen: (location) => location.pathname.startsWith('/catalogo')
});

// -------------------------------------------------------------
// Inicializa o "maestro"
// -------------------------------------------------------------
start();
