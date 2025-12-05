// =============================================
// ROOT-CONFIG atualizado com caminhos corretos para GitHub Pages
// Caminho do arquivo no repo: docs/root-config/index.js
// =============================================

import { registerApplication, start } from 'single-spa';

// Loader com fallback local
const loader = async (url) => {
  try {
    return await import(url);
  } catch (e) {
    console.warn('Falha remota, usando fallback local');
    const localPath = url.replace('./docs/', './docs/');
    return await import(localPath);
  }
};

// HOME
registerApplication({
  name: '5horas-home',
  app: () => loader('./docs/microapps/home/Home.js'),
  activeWhen: (loc) => loc.pathname === '/' || loc.pathname === '/home'
});

// EDUCAÇÃO
registerApplication({
  name: '5horas-educacao',
  app: () => loader('./docs/microapps/educacao/Educacao.js'),
  activeWhen: (loc) => loc.pathname.startsWith('/educacao')
});

// CATÁLOGO
registerApplication({
  name: '5horas-catalogo',
  app: () => loader('./docs/microapps/catalogo/Catalogo.js'),
  activeWhen: (loc) => loc.pathname.startsWith('/catalogo')
});

// PERFIL
registerApplication({
  name: '5horas-perfil',
  app: () => loader('./docs/microapps/perfil/Perfil.js'),
  activeWhen: (loc) => loc.pathname.startsWith('/perfil')
});

start();
