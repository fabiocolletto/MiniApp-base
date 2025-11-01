# Tema white label, tokens e preferências do usuário

Este documento reúne as convenções do tema white label, a camada de design tokens baseada em DTCG e a API oficial de preferências
do shell MiniApp Base.

## Identidade white label (`scripts/app/white-label-config.js`)

- `WHITE_LABEL_IDENTITY` centraliza nome curto, título da janela, mensagens de boas-vindas e o hint exibido no painel convidado.
- `resolveMiniAppContext(overrides)` devolve o contexto padrão repassado ao MiniApp registrado, permitindo sobrescrever
  propriedades como `brandName`, `highlights` ou `ctaHref` sem tocar no módulo base.
- O bootstrap atualiza `document.title`, metadados (`application-name`, `apple-mobile-web-app-title`) e o texto do status a partir
  dos valores definidos no arquivo, garantindo consistência entre shell, manifesto e miniapp.

## Design tokens (`design/tokens.json`)

- Os tokens seguem o formato [Design Tokens Community Group](https://design-tokens.org/) e são versionados em `design/tokens.json`.
- Para gerar `public/tokens.css`, execute `node scripts/build/tokens.mjs`. O script lê o JSON, normaliza os tokens e grava as variáveis CSS.
- Os tokens estão agrupados em três conjuntos (`global`, `light`, `dark`). O `@layer tokens` importa `public/tokens.css` e expõe os aliases `--ac-*` usados pelos demais layers.
- A paleta white label utiliza azul profundo (`#4358E6`) como primária, acento violeta claro (`#7C8CFF`), neutros frios (`#111827`, `#F9FAFB`) e estados acessíveis (`#16A34A`, `#F59E0B`, `#DC2626`, `#3B82F6`). Essa base garante contraste AA nos componentes principais em ambos os modos de cor.

## Camadas CSS (`public/app-theme.css`)

O arquivo `public/app-theme.css` define a ordem de camadas `@layer tokens, base, layout, components, utilities`.

- **tokens**: importa `public/tokens.css`, mapeia variáveis Elementor (`--e-global-*`) e define os aliases `--ac-*` para cores, fontes,
  espaçamentos, sombras e estados. Também ajusta `color-scheme` conforme `data-theme`.
- **base**: controla tipografia e plano de fundo globais, além da classe `reduce-motion` que neutraliza animações quando ativada.
- **layout**: disponibiliza helpers de layout (`.app`, `body.density-compact`) e trata `safe-area`.
- **components**: fornece estilos base para `.card`, `.btn`, `.chip` e utilitários compartilháveis, garantindo contraste AA com o novo esquema azul/violeta.
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

## Atalhos de preferências no menu

- A seção **Usuário** do menu principal concentra as trocas de jornada (`data-view="register"` ou `data-view="guest"`), permitindo alternar entre Cadastro e Visitante sem depender de botões externos ao painel.
- A seção **Configurações** mantém os três botões com `data-action="preferences-theme"`, `data-action="preferences-font"` e `data-action="preferences-language"`.
- Cliques em tema e escala tipográfica calculam o próximo valor disponível e chamam `updateUserPreferences` imediatamente. O botão de idioma abre uma lista com as opções (`pt-BR`, `en`, `es`) para que o usuário escolha explicitamente qual idioma aplicar.
- Os rótulos e dicas exibidos no menu são atualizados por `subscribeUserPreferences`, garantindo que leitores de tela anunciem o estado vigente.
- Não há mais janela dedicada de preferências; toda a personalização acontece diretamente por esses atalhos.

## Registry de MiniApps (`miniapps/registry.json` + `shell/load-miniapp.js`)

- O arquivo JSON lista objetos `{ "id": "slug", "entry": "./miniapps/<slug>/index.js" }`.
- `shell/load-miniapp.js` expõe `loadMiniApp(id, options)` que aplica `fetch` com `cache: 'no-store'`, importa o módulo e executa `mount(target, context)`.
- O Service Worker não possui mais rotas adicionais em estratégia network-first além da navegação padrão.
