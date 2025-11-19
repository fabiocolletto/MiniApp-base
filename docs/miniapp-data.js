// miniapp-data.js
// Este arquivo contém a array de dados de todos os MiniApps do Sistema 5Horas.
// Use 'export' para disponibilizar a array para outros módulos.

export const miniAppsData = [
  {
    id: 'catalog',
    title: 'Catálogo 5Horas',
    titles: {
      'pt-BR': 'Catálogo 5Horas',
      'en-US': '5Horas Catalog',
      'es-ES': 'Catálogo 5Horas',
    },
    description: 'Centraliza todos os MiniApps homologados, oferece favoritos persistidos e abre cada painel diretamente no shell.',
    descriptions: {
      'pt-BR': 'Centraliza todos os MiniApps homologados, oferece favoritos persistidos e abre cada painel diretamente no shell.',
      'en-US': 'Centralizes all approved MiniApps, offers persisted favorites, and opens each panel directly in the shell.',
      'es-ES': 'Centraliza todos los MiniApps homologados, ofrece favoritos persistidos y abre cada panel directamente en el shell.',
    },
    category: 'Sistema',
    categories: {
      'pt-BR': 'Sistema',
      'en-US': 'System',
      'es-ES': 'Sistema',
    },
    contract: 'SYS-CTLG',
    owner: 'Plataforma 5Horas',
    status: 'published',
    statuses: {
      'pt-BR': 'Publicado',
      'en-US': 'Published',
      'es-ES': 'Publicado',
    },
    url: '../miniapps/catalog/index.html',
    image: 'https://placehold.co/600x400/111827/f8fafc?text=Cat%C3%A1logo',
  },
  {
    id: 'favorites',
    title: 'Favoritos',
    titles: {
      'pt-BR': 'Favoritos',
      'en-US': 'Favorites',
      'es-ES': 'Favoritos',
    },
    description: 'Exibe os MiniApps marcados como favoritos e mantém a lista sincronizada com o IndexedDB para uso offline.',
    descriptions: {
      'pt-BR': 'Exibe os MiniApps marcados como favoritos e mantém a lista sincronizada com o IndexedDB para uso offline.',
      'en-US': 'Displays the MiniApps marked as favorites and keeps the list synced with IndexedDB for offline use.',
      'es-ES': 'Muestra los MiniApps marcados como favoritos y mantiene la lista sincronizada con IndexedDB para uso sin conexión.',
    },
    category: 'Sistema',
    categories: {
      'pt-BR': 'Sistema',
      'en-US': 'System',
      'es-ES': 'Sistema',
    },
    contract: 'SYS-FAV',
    owner: 'Time de Experiência',
    status: 'em revisão',
    statuses: {
      'pt-BR': 'Em revisão',
      'en-US': 'In review',
      'es-ES': 'En revisión',
    },
    url: '../miniapps/favorites/index.html',
    image: 'https://placehold.co/600x400/312e81/fef2f2?text=Favoritos',
  },
  {
    id: 'recents',
    title: 'Recentes',
    titles: {
      'pt-BR': 'Recentes',
      'en-US': 'Recents',
      'es-ES': 'Recientes',
    },
    description: 'Mostra os MiniApps utilizados nas últimas sessões para agilizar o reingresso sem depender do catálogo completo.',
    descriptions: {
      'pt-BR': 'Mostra os MiniApps utilizados nas últimas sessões para agilizar o reingresso sem depender do catálogo completo.',
      'en-US': 'Shows the MiniApps used in recent sessions to speed re-entry without the full catalog.',
      'es-ES': 'Muestra los MiniApps usados en sesiones recientes para agilizar el reingreso sin depender del catálogo completo.',
    },
    category: 'Sistema',
    categories: {
      'pt-BR': 'Sistema',
      'en-US': 'System',
      'es-ES': 'Sistema',
    },
    contract: 'SYS-RCNT',
    owner: 'Time de Experiência',
    status: 'draft',
    statuses: {
      'pt-BR': 'Em rascunho',
      'en-US': 'Draft',
      'es-ES': 'En borrador',
    },
    url: '../miniapps/recents/index.html',
    image: 'https://placehold.co/600x400/0f172a/f1f5f9?text=Recentes',
  },
  {
    id: 'settings',
    title: 'Configurações',
    titles: {
      'pt-BR': 'Configurações',
      'en-US': 'Settings',
      'es-ES': 'Configuraciones',
    },
    description: 'Concentra preferências do usuário, tema, idioma e controles de memória compartilhados entre todos os MiniApps.',
    descriptions: {
      'pt-BR': 'Concentra preferências do usuário, tema, idioma e controles de memória compartilhados entre todos os MiniApps.',
      'en-US': 'Concentrates user preferences, theme, language, and shared controls across all MiniApps.',
      'es-ES': 'Concentra las preferencias del usuario, tema, idioma y controles compartidos entre todos los MiniApps.',
    },
    category: 'Sistema',
    categories: {
      'pt-BR': 'Sistema',
      'en-US': 'System',
      'es-ES': 'Sistema',
    },
    contract: 'SYS-STGS',
    owner: 'Plataforma 5Horas',
    status: 'published',
    statuses: {
      'pt-BR': 'Publicado',
      'en-US': 'Published',
      'es-ES': 'Publicado',
    },
    url: '../miniapps/settings/index.html',
    image: 'https://placehold.co/600x400/334155/f8fafc?text=Configura%C3%A7%C3%B5es',
  },
];
