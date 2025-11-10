# MiniApp Importador de Pesquisas

Este miniapp oferece o fluxo completo de importação de pesquisas, simulando operações com IndexedDB e armazenamento online.

- `index.html` — página principal do miniapp. Carrega o design system central (`../miniapp-base/style/styles.css`) e os estilos específicos do importador.
- `js/importador.js` — lógica do fluxo de importação, incluindo i18n para `pt-BR`, `en-US` e `es-ES`. O script lê `document.documentElement.lang`, solicita o idioma atual ao shell quando necessário e responde a mensagens `{ action: 'set-locale' }` para reaplicar textos e reenviar o cabeçalho localizado.
- `style/importador-pesquisas.css` — estilos complementares necessários apenas para este miniapp.

Mantenha este miniapp alinhado com os tokens do design system em `miniapp-base` e atualize o `CHANGELOG.md` sempre que mudanças relevantes forem feitas.
