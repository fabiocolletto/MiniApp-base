export const MINIAPPS = [
  {
    id: 'pesquisas-cidades',
    title: {
      'pt-BR': 'Pesquisas ▸ Cidades',
      'en-US': 'Surveys ▸ Cities',
      'es-ES': 'Encuestas ▸ Ciudades',
    },
    description: {
      'pt-BR': 'Gerencie coletas urbanas, acompanhe indicadores e sincronize com a equipe em campo.',
      'en-US': 'Manage urban survey runs, monitor indicators and synchronise with the field team.',
      'es-ES': 'Gestione levantamientos urbanos, supervise indicadores y sincronice con el equipo en campo.',
    },
    icon: 'https://5horas.com.br/wp-content/uploads/2025/09/Icone-clareza-em-cada-entrega.png',
    entry: './miniapps/pesquisas-cidades/index.html',
  },
];

export function listMiniApps() {
  return MINIAPPS.slice();
}

export function getMiniAppById(id) {
  if (!id) return null;
  return MINIAPPS.find((item) => item.id === id) ?? null;
}

export function getMiniAppLabel(item, lang = 'pt-BR') {
  if (!item) return '';
  return item.title?.[lang] ?? item.title?.['pt-BR'] ?? item.id;
}

export function getMiniAppDescription(item, lang = 'pt-BR') {
  if (!item) return '';
  return item.description?.[lang] ?? item.description?.['pt-BR'] ?? '';
}
