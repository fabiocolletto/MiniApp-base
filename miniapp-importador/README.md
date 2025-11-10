# MiniApp Importador de Pesquisas

Este miniapp oferece o fluxo completo de importação de pesquisas, simulando operações com IndexedDB e armazenamento online.

- `index.html` — página principal do miniapp. Carrega apenas o design system central (`../miniapp-base/style/styles.css`) para compartilhar componentes com os demais painéis.
- `../miniapp-base/js/organisms/miniapp-importador.js` — lógica do fluxo de importação, incluindo i18n para `pt-BR`, `en-US` e `es-ES`. O script lê `document.documentElement.lang`, solicita o idioma atual ao shell quando necessário e responde a mensagens `{ action: 'set-locale' }` para reaplicar textos e reenviar o cabeçalho localizado.
- `../miniapp-base/js/organisms/miniapp-importador-shell.js` — integrações específicas com o shell para sincronizar favoritos, catálogo e abertura de modais.

Mantenha este miniapp alinhado com os tokens do design system em `miniapp-base` e atualize o `CHANGELOG.md` sempre que mudanças relevantes forem feitas.
