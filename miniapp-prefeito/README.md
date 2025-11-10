# Miniapp Prefeito

## Objetivo
O miniapp Prefeito apresenta o painel executivo com KPIs, gráficos do Google Charts e atalhos para retornar ao catálogo global. Ele reutiliza o design system hospedado em `miniapp-base` e mantém o cabeçalho sincronizado com o shell via `postMessage`.

## Dependências externas
- **Shell (`index.html`)**: responsável por carregar o miniapp em um iframe, enviar `{ action: 'set-locale', locale }` sempre que o idioma global mudar e receber `{ action: 'miniapp-header', ... }` para atualizar o cabeçalho.
- **Google Charts**: biblioteca carregada diretamente do CDN (`www.gstatic.com/charts/loader.js`) para renderizar os gráficos do painel.

## Localização
- O miniapp depende do seletor global do shell. Controles locais com `[data-lang]` estão somente como indicadores visuais e não acionam mais trocas de idioma.
- `miniapp-base/js/prefeito-i18n.js` expõe `window.I18nManager.setLocale(locale, { persist })`, permitindo que o shell imponha o idioma sem gravar a preferência quando `persist: false`.
- Ao receber `{ action: 'set-locale', locale }` via `window.postMessage`, o miniapp executa `I18nManager.setLocale(locale, { persist: false })`, reaplica traduções e reenviar o cabeçalho através de `notifyShell()`.
- Traduções completas devem ser fornecidas para `pt-BR`, `en-US` e `es-ES`, seguindo a estrutura de namespaces em `miniapp-prefeito/i18n/locales/`.

## Manutenção
- Atualize este README sempre que novas integrações ou dependências forem adicionadas ao miniapp.
- Ao modificar os gráficos ou dados simulados, preserve os atributos `data-i18n`/`data-i18n-attr` quando disponíveis para facilitar a localização.
- Antes de publicar alterações, execute uma revisão manual abrindo `miniapp-prefeito/index.html` no navegador e testando a troca de idioma disparada pelo shell.
