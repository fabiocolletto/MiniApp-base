# Tema 5 Horas, Tokens e Preferências do Usuário

Este documento reúne as convenções do tema "5 Horas", a camada de design tokens baseada em DTCG e a API oficial de preferências
do shell MiniApp Base.

## Design tokens (`design/tokens.json`)

- Os tokens seguem o formato [Design Tokens Community Group](https://design-tokens.org/) e são versionados em `design/tokens.json`.
- Para gerar `public/tokens.css`, execute `node scripts/build/tokens.mjs`. O script lê o JSON, normaliza os tokens e grava as variáveis CSS.
- Os tokens estão agrupados em três conjuntos (`global`, `light`, `dark`). O `@layer tokens` importa `public/tokens.css` e expõe os aliases `--ac-*` usados pelos demais layers.

## Camadas CSS (`public/app-theme.css`)

O arquivo `public/app-theme.css` define a ordem de camadas `@layer tokens, base, layout, components, utilities`.

- **tokens**: importa `public/tokens.css`, mapeia variáveis Elementor (`--e-global-*`) e define os aliases `--ac-*` para cores, fontes,
  espaçamentos, sombras e estados. Também ajusta `color-scheme` conforme `data-theme`.
- **base**: controla tipografia e plano de fundo globais, além da classe `reduce-motion` que neutraliza animações quando ativada.
- **layout**: disponibiliza helpers de layout (`.app`, `body.density-compact`) e trata `safe-area`.
- **components**: fornece estilos base para `.card`, `.btn`, `.chip` e utilitários compartilháveis.
- **utilities**: concentra classes auxiliares, como `.surface-muted`, `.text-muted` e `.sr-only`.

### Escala tipográfica

| `fontScale` | `--ac-font-scale` | Rótulo UI         |
|-------------|-------------------|-------------------|
| `-2`        | `0.90`             | Muito pequeno     |
| `-1`        | `0.95`             | Pequeno           |
| `0`         | `1.00`             | Padrão            |
| `1`         | `1.10`             | Grande            |
| `2`         | `1.25`             | Muito grande      |

A escala é aplicada no `<html>` por `scripts/preferences/user-preferences.js`, que atualiza a variável `--ac-font-scale` conforme a preferência salva.

### Preferências do sistema (`prefers-*`)

- `@media (prefers-color-scheme: dark)` ajusta as variáveis quando `data-theme` não força `light` ou `dark`.
- A classe `.reduce-motion` é anexada ao `<html>`/`<body>` quando o usuário habilita “Reduzir animações” ou quando o sistema sinaliza `prefers-reduced-motion: reduce`.

## Armazenamento de preferências (`shared/storage/idb/prefs.js`)

- Store `prefs` no banco `marco_core` com chave `ui_prefs`.
- `getPrefs()` retorna um objeto com defaults `{ theme: 'auto', lang: 'pt-BR', fontScale: 0, density: 'comfort', reduceMotion: false }`.
- `setPrefs(partial)` mescla o objeto parcial aos valores atuais e persiste o resultado.

```js
import { getPrefs, setPrefs } from '../shared/storage/idb/prefs.js';

const prefs = await getPrefs();
await setPrefs({ theme: 'dark', fontScale: 1 });
```

## Controlador de preferências (`scripts/preferences/user-preferences.js`)

Este módulo encapsula leitura, aplicação e assinatura das preferências:

- `loadUserPreferences({ window, document })`: aplica defaults imediatamente, sincroniza com IndexedDB e observa `prefers-color-scheme` e `prefers-reduced-motion`.
- `updateUserPreferences(partial, { window, document })`: sanitiza o objeto parcial, persiste e aplica mudanças ao DOM.
- `getCurrentPreferences()`: devolve o snapshot atual.
- `subscribeUserPreferences(listener)`: registra callback disparado a cada atualização.
- `getFontScaleLabel(value)`: retorna o rótulo amigável exibido no painel (`Muito pequeno`, `Padrão`, etc.).

Exemplo de atualização programática:

```js
import { updateUserPreferences } from '../scripts/preferences/user-preferences.js';

await updateUserPreferences({ density: 'compact', theme: 'light' });
```

## Painel de Preferências (`components/preferences/panel.*`)

- HTML (`panel.html`) e CSS (`panel.css`) são carregados sob demanda quando o usuário escolhe **Preferências do usuário** no menu do rodapé.
- O módulo `panel.js` exporta `openPreferencesPanel({ document, window })` e `closePreferencesPanel()`. É possível abrir o painel programaticamente:

```js
const { openPreferencesPanel } = await import('../components/preferences/panel.js');
await openPreferencesPanel();
```

- Cada alteração de controle chama `updateUserPreferences`, aplicando imediatamente tema, idioma, escala de fonte, densidade e redução de animações.
- O painel usa targets de toque ≥ 24×24 px e classes utilitárias do tema (`.preferences-panel-open` desativa rolagem do `body`).

## Registry de MiniApps (`miniapps/registry.json` + `shell/load-miniapp.js`)

- O arquivo JSON lista objetos `{ "id": "slug", "entry": "./miniapps/<slug>/index.js" }`.
- `shell/load-miniapp.js` expõe `loadMiniApp(id, options)` que aplica `fetch` com `cache: 'no-store'`, importa o módulo e executa `mount(target, context)`.
- O Service Worker trata `miniapps/registry.json` e `components/preferences/panel.html` com estratégia network-first para evitar dados obsoletos em produção.
