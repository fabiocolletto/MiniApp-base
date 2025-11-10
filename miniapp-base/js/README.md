# Scripts compartilhados de MiniApps

Este diretório concentra todos os arquivos JavaScript utilizados pelo shell (`index.html`) e pelos miniapps publicados no repositório. A partir desta versão os scripts seguem a mesma metodologia atomic design adotada nos estilos: dividimos o código em **atoms**, **molecules** e **organisms**.

## Estrutura

- `atoms/`: funções utilitárias puras e estáveis (tradução, localização, armazenamento, mensageria).
- `molecules/`: composições reutilizáveis que encapsulam comportamentos (carrossel, sincronização com o shell, favoritos do catálogo, etc.).
- `organisms/`: pontos de entrada de cada miniapp e do shell. Cada organismo orquestra moléculas/átomos e contém apenas a lógica específica da experiência. Subdiretórios organizam miniapps maiores, como `organisms/prefeito/`.

Cada pasta contém um `README.md` que detalha sua responsabilidade.

## Diretrizes

1. Antes de criar um novo script, escolha o nível correto (atom, molecule ou organism). Evite que organismos implementem regras duplicadas que poderiam viver em moléculas.
2. Ao comunicar um miniapp com o shell, utilize as funções de `atoms/messaging.js` (por exemplo, `postToParent`) para manter o comportamento consistente e seguro.
3. Mantenha as traduções sincronizadas para `pt-BR`, `en-US` e `es-ES` — os átomos de i18n e locale devem ser a única fonte de normalização.
4. Sempre registre alterações relevantes no `CHANGELOG.md` e atualize os READMEs caso surjam novas convenções.
5. Novos miniapps devem criar seus organismos dentro de `organisms/` (opcionalmente em um subdiretório) e documentar os arquivos envolvidos.

## Scripts existentes

- `organisms/shell.js`: inicializa o shell principal, aplica i18n e controla o catálogo padrão.
- `organisms/catalog.js`: monta o catálogo, controla favoritos, notifica o shell e utiliza o carrossel compartilhado.
- `organisms/miniapp-cadastro.js`: fluxo guiado de cadastro de usuários e sincronização de cabeçalho.
- `organisms/miniapp-importador.js` e `organisms/miniapp-importador-shell.js`: lógica do importador de pesquisas e suas integrações com o shell.
- `organisms/miniapp-tts.js`: gerador de roteiros TTS com prévias de áudio.
- `organisms/prefeito/*.js`: módulos do painel do prefeito (dados mockados, tema, i18n, carregadores e inicialização).

Siga esta organização para facilitar o reuso entre miniapps e reduzir o acoplamento com o shell.
