// miniapp-data.js
// Este arquivo contém a array de dados de todos os MiniApps do Sistema 5Horas.
// Use 'export' para disponibilizar a array para outros módulos.

export const miniAppsData = [
  {
    id: 'catalog',
    title: 'Catálogo 5Horas',
    description:
      'Centraliza todos os MiniApps homologados, oferece favoritos persistidos e abre cada painel diretamente no shell.',
    category: 'Sistema',
    contract: 'SYS-CTLG',
    owner: 'Plataforma 5Horas',
    status: 'published',
    url: '../miniapps/catalog/index.html',
    image: 'https://placehold.co/600x400/111827/f8fafc?text=Cat%C3%A1logo',
  },
  {
    id: 'favorites',
    title: 'Favoritos',
    description:
      'Exibe os MiniApps marcados como favoritos e mantém a lista sincronizada com o IndexedDB para uso offline.',
    category: 'Sistema',
    contract: 'SYS-FAV',
    owner: 'Time de Experiência',
    status: 'em revisão',
    url: '../miniapps/favorites/index.html',
    image: 'https://placehold.co/600x400/312e81/fef2f2?text=Favoritos',
  },
  {
    id: 'recents',
    title: 'Recentes',
    description:
      'Mostra os MiniApps utilizados nas últimas sessões para agilizar o reingresso sem depender do catálogo completo.',
    category: 'Sistema',
    contract: 'SYS-RCNT',
    owner: 'Time de Experiência',
    status: 'draft',
    url: '../miniapps/recents/index.html',
    image: 'https://placehold.co/600x400/0f172a/f1f5f9?text=Recentes',
  },
  {
    id: 'settings',
    title: 'Configurações',
    description:
      'Concentra preferências do usuário, tema, idioma e controles de memória compartilhados entre todos os MiniApps.',
    category: 'Sistema',
    contract: 'SYS-STGS',
    owner: 'Plataforma 5Horas',
    status: 'published',
    url: '../miniapps/settings/index.html',
    image: 'https://placehold.co/600x400/334155/f8fafc?text=Configura%C3%A7%C3%B5es',
  },
];
