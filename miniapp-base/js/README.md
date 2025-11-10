# Scripts compartilhados de MiniApps

Este diretório concentra todos os arquivos JavaScript utilizados pelo shell (`index.html`) e pelos miniapps publicados no repositório. O objetivo é manter uma única origem para utilitários, integrações com o shell e rotinas específicas de cada experiência.

## Estrutura

- `shell.js`: inicializa o shell principal, aplica i18n, controla o catálogo padrão e sincroniza mensagens via `postMessage`.
- `catalog.js`: alimenta o catálogo padrão com os cards configurados e sincroniza favoritos/localização.
- `carousel.js`: utilitário de carrossel utilizado pelo catálogo e demais experiências que exigem listas horizontais.
- `miniapp-cadastro.js`: lógica do fluxo de cadastro de usuários; mantém traduções em `pt-BR`, `en-US` e `es-ES`, valida campos e publica o cabeçalho via `postMessage`.
- `miniapp-importador.js`: script principal do importador com simulação de backend, IndexedDB e tratamento de arquivos.
- `miniapp-importador-shell.js`: integrações específicas do importador com o shell (metadados, fallback para o catálogo e comandos remotos).
- `miniapp-tts.js`: orquestra o gerador de roteiros TTS, incluindo pré-visualizações e sincronização de traduções.
- `prefeito-sample-data.js`: dados mockados utilizados pelos gráficos do painel do prefeito.
- `prefeito-i18n.js`: gerenciador de tradução do painel; mantém cache local e comunicação com o shell.
- `prefeito-template-loader.js`: carrega templates HTML e injeta blocos dinâmicos nas seções do painel.
- `prefeito-theme.js`: aplica ajustes de tema e tokens da UI do painel do prefeito.
- `prefeito-loader.js`: monitora o carregamento de estilos remotos e alterna entre as versões temporária e principal.
- `prefeito-main.js`: amarra os módulos do painel do prefeito, registra ouvintes de `postMessage` e dispara a montagem dos gráficos.

## Diretrizes

1. Qualquer novo módulo JavaScript deve ser adicionado aqui e referenciado via caminho relativo (por exemplo, `../miniapp-base/js/<arquivo>.js`).
2. Sempre que um script se comunicar com o shell, utilize `window.parent.postMessage` e valide a origem (`window.location.origin`).
3. Mantenha todas as traduções alinhadas para `pt-BR`, `en-US` e `es-ES` antes de publicar alterações.
4. Ao atualizar ou criar arquivos, documente-os nesta lista e registre a mudança no `CHANGELOG.md`.

## Regras específicas dos miniapps

- **Cadastro de Usuários**: preserve o objeto `translations` e mantenha a validação dos campos conforme o comportamento atual.
- **Importador de Pesquisas**: atualize tanto `miniapp-importador.js` quanto `miniapp-importador-shell.js` ao modificar integração com o shell ou fluxo de importação.
- **Gerador de Roteiros TTS**: mantenha as chamadas de pré-visualização e exportação sincronizadas com as traduções e com o cabeçalho enviado ao shell.
- **Painel do Prefeito**: garanta que `prefeito-sample-data.js`, `prefeito-i18n.js`, `prefeito-template-loader.js`, `prefeito-theme.js`, `prefeito-loader.js` e `prefeito-main.js` permaneçam consistentes entre si para evitar estados inválidos no carregamento.

Sempre que adicionar novos miniapps, crie os scripts correspondentes neste diretório e descreva suas responsabilidades neste README.
