# MiniApp Base

Este repositório reúne protótipos HTML/CSS simples utilizados para validar fluxos de interface de miniaplicativos. Os artefatos principais ficam na pasta `miniapp-base`, mas há variações experimentais em `miniapp-prefeito`.

## Estrutura
- `index.html`: shell PWA responsável por carregar o catálogo padrão e hospedar os miniapps ativos em um iframe central.
- `miniapp-base/`: assets e folhas de estilo do miniaplicativo base.
- `miniapp-importador/`: miniapp dedicado ao fluxo de importação de pesquisas.
- `miniapp-cadastro/`: miniapp focado no cadastro e onboarding de usuários.
- `miniapp-prefeito/`: variantes visuais e fluxos específicos para cenários municipais.
- `miniapp-catalogo/index.html`: variante do catálogo publicada em ambientes de homologação.

## Como trabalhar
1. Leia `AGENTE.md` e `CHANGELOG.md` antes de começar qualquer alteração para entender as convenções vigentes.
2. Utilize `npm`, `pnpm` ou `yarn` apenas se necessário; os protótipos funcionam abrindo o HTML diretamente no navegador.
3. Ao alterar estilos, mantenha a responsividade e valide o layout em breakpoints menores (altura e largura).
4. Utilize o componente `miniapp-base/components/carousel.js` sempre que precisar criar containers roláveis de miniapps, mantendo consistência com os demais fluxos.
5. Sempre atualize o `CHANGELOG.md` descrevendo as mudanças relevantes antes de abrir um PR.

## Shell PWA e fluxo de navegação
O arquivo `index.html` atua como shell da experiência. Ele incorpora o catálogo em `miniapp-catalogo/index.html` dentro do iframe `#miniapp-panel` e expõe os utilitários de navegação via `window.loadMiniApp`. Os links com o atributo `data-miniapp-target` — presentes no catálogo e opcionais em outros componentes do shell — alternam o conteúdo do iframe e os próprios miniapps podem solicitar trocas usando `window.parent.postMessage('open-catalog')` ou enviando um objeto `{ action: 'load-miniapp', url: '<caminho>' }` para o shell. O utilitário `window.loadMiniApp(url, { metadata })` aceita opcionalmente um objeto com `title` e `subtitle` para popular o cabeçalho antes da confirmação enviada pelo miniapp.

O painel passa a concentrar apenas o conteúdo ativo; qualquer ação de navegação é acessada pelo botão único fixado no canto esquerdo do rodapé. O atalho abre uma janela consistente em todas as larguras com as opções de reabrir o catálogo padrão e alternar o modo tela cheia, respeitando a localização e desabilitando o catálogo quando ele já está em exibição.

O cabeçalho do shell acompanha o miniapp ativo. Assim que o iframe é carregado, o miniapp deve disparar `window.parent.postMessage({ action: 'miniapp-header', title: '<título>', subtitle: '<subtítulo>', icon: '<material-symbol>', iconTheme: '<tema>' }, window.location.origin)` para informar os textos e o ícone exibidos na marcação principal. Enquanto a mensagem não chega, o shell utiliza os metadados do catálogo (`data-miniapp-name`, `data-miniapp-description`, `data-miniapp-icon-symbol` e `data-miniapp-icon-theme`) e um fallback localizado para manter o cabeçalho consistente.

O rodapé fixo destaca a identidade visual da 5 Horas por meio do ícone oficial e do texto “5 horas de pesquisa e análise limitada”, enquanto o menu do shell reutiliza o mesmo botão em todas as telas para abrir a janela com os atalhos de catálogo, tela cheia e a seção “Sobre o app” com nome e versão do shell. Quando a API nativa não está disponível, o shell habilita automaticamente um modo de tela cheia baseado em CSS para manter a experiência visual e o posicionamento do botão idênticos em qualquer dispositivo.

O menu também oferece um seletor de idioma acessível com rádios para `pt-BR`, `en-US` e `es-ES`. A escolha é persistida em `localStorage` (`miniapp-shell.locale`) e reaplica automaticamente os rótulos do shell, estado do catálogo, cabeçalho ativo e o controle de tela cheia. Sempre que o iframe é carregado ou troca de miniapp, o shell envia `postMessage({ action: 'set-locale', locale })` para o conteúdo ativo (mesma origem) e responde a `postMessage({ action: 'request-locale' })` com o idioma atual para sincronizar as traduções dos miniapps.

### Registrando novos miniapps
1. Publique os assets HTML/CSS do miniapp em um diretório dedicado na raiz do projeto (ex.: `miniapp-novo/index.html`).
2. Adicione um novo cartão ao catálogo (`miniapp-catalogo/index.html`) apontando o link (`href`) para o arquivo de entrada do miniapp, mantendo `target="miniapp-panel"` para reutilizar o iframe do shell.
3. Defina `data-miniapp-name`, `data-miniapp-description`, `data-miniapp-icon-symbol` (nome do ícone na biblioteca Material Symbols) e `data-miniapp-icon-theme` (sufixo utilizado em `.app-icon--theme-*`) no link para alimentar o cabeçalho do shell enquanto o miniapp é carregado.
4. Ao inicializar, envie `window.parent.postMessage({ action: 'miniapp-header', title: '<título>', subtitle: '<subtítulo>', icon: '<material-symbol>', iconTheme: '<tema>' }, window.location.origin)` para confirmar o conteúdo definitivo do cabeçalho do shell.
5. Caso o miniapp precise voltar ao catálogo ou abrir outra experiência dinamicamente, utilize `window.parent.postMessage('open-catalog')` ou envie `{ action: 'load-miniapp', url: '<caminho>' }` conforme necessário.

Para uma lista completa de requisitos visuais e de integração, consulte `docs/README.md`.

## Miniapps disponíveis
- **Painel do Prefeito** – painel com KPIs, filtros e relatórios setoriais acessível em `miniapp-prefeito/index.html`.
- **Importador de Pesquisas** – fluxo para importar arquivos CSV e revisar resultados em `miniapp-importador/index.html`.
- **Cadastro de Usuários** – formulário guiado de onboarding com validações e resumo localizado em `miniapp-cadastro/index.html`.
- **Gerador de Roteiros TTS** – formulário com campos guiados e tradução automática em `miniapp-tts/index.html`.

## Licença
Uso interno apenas; consulte os responsáveis pelo projeto antes de compartilhar externamente.
