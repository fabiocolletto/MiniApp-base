// miniapp-data.js
// Este arquivo contém a array de dados de todos os MiniApps do Sistema 5Horas.
// Use 'export' para disponibilizar a array para outros módulos.

export const miniAppsData = [
    {
        id: 'miniapp-gestao-catalogo',
        title: 'Gestão de Catálogo',
        description: 'Crie, edite e publique MiniApps diretamente do catálogo principal com fluxo guiado.',
        price: 'Grátis',
        category: 'Administração',
        contract: 'Incluso',
        active: true,
        url: './miniapps/gestao-de-catalogo/index.html',
        image: 'https://placehold.co/400x300/2563eb/ffffff?text=Gestao+Catalogo',
        updatedAt: '2024-05-01T00:00:00.000Z'
    },
    {
        id: 'miniapp-gestao-conta-usuario',
        title: 'Gestão de Conta do Usuário',
        description: 'Centralize revisões de perfil, segurança e preferências com painéis prontos para ação.',
        price: 'Grátis',
        category: 'Administração',
        contract: 'Incluso',
        active: true,
        url: './miniapps/gestao-de-conta-do-usuario/index.html',
        image: 'https://placehold.co/400x300/0ea5e9/ffffff?text=Conta+Usuario',
        updatedAt: '2024-05-15T00:00:00.000Z'
    }
];
