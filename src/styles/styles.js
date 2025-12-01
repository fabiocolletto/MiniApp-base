// --- CONSTANTES DE ESTILO MODULARIZADAS (Para código React mais limpo) ---

// Estilo para campos de configuração inativos (usado em ConfigItem)
export const INACTIVE_FIELD_STYLE = 'inactive-field border-slate-200';

// Classes base para todos os itens de configuração (ConfigItem)
export const BASE_ITEM_STYLE_CLASSES = "flex items-center justify-between w-full px-4 py-2.5 rounded-xl transition-all shadow-sm";

// Classes para botões de configuração ATIVOS e interativos (com hover)
export const INTERACTIVE_CONFIG_ITEM_CLASSES = "bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 cursor-pointer";

// Classes para itens de configuração que usam um Toggle Switch (ativos, mas sem hover de clique)
export const TOGGLE_CONFIG_ITEM_CLASSES = "bg-white border border-slate-200 text-slate-800 hover:bg-slate-50";

// Classes base para o grid flexível do portfólio e catálogo de idiomas
export const APP_GRID_BASE_FLEXIBLE = "app-grid-base-flexible mx-auto";

// Estilo para o botão de perfil/login
export const PROFILE_BUTTON_CLASSES = "chip-button w-full px-4 py-3 rounded-xl flex items-center justify-start bg-white border border-slate-200 hover:bg-slate-50 transition-all text-left group shadow-md";

// Estilos de transição para ícones (usado no AppCard)
export const LARGE_ICON_STYLE = "font-size: 6.5rem; transform: translateY(-0.75rem);";

// Estilos base para os cartões (AppCard e LanguageCard)
export const CARD_BASE_CLASSES = "card-base w-32 h-32 md:w-36 md:h-36";
