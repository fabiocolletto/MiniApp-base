# MiniApp 5Horas – Catálogo Zero Custo

Este repositório contém o catálogo principal do ecossistema MiniApp 5Horas. O objetivo é listar, testar e validar MiniApps dentro de uma arquitetura PWA totalmente gratuita, apoiada por sincronização local via IndexedDB e integração opcional com Google.

## Visão Geral
- **Frontend**: HTML estático com Tailwind CDN e componentes próprios. A revisão 3.0 (RodaPack) elimina o header do shell principal e concentra o controle do stage no rodapé compacto.
- **Dados**: `docs/miniapp-data.js` é a fonte única de verdade para todos os MiniApps. O carregamento é orquestrado por `js/miniapp-data-loader.js`, que tenta importar o módulo localmente, faz fallback automático para a cópia oficial hospedada no GitHub Raw (`https://raw.githubusercontent.com/5horas/miniapp/main/docs/miniapp-data.js`) e, em último caso, reutiliza o cache salvo no `localStorage`. É possível apontar o fallback para outro endpoint definindo `window.MINIAPP_DATA_REMOTE_URL` antes de carregar o módulo.
- **Persistência local**: `js/indexeddb-store.js` centraliza acesso ao IndexedDB.
- **Sincronização**: `js/googleSync.js` coordena fila offline, Google Sign-In e atualização dos indicadores de status.
- **PWA**: manifestos vivem em `pwa/` e o `service-worker.js` na raiz continua responsável pelo precache e pelas rotas offline.

### Autenticação, redirecionamento e controles condicionais
- `js/googleSync.js` passa a expor helpers como `miniappSync.getCurrentUserId()` e `miniappSync.isUserAuthenticated()`, além de
  publicar `window.currentUserId` sempre que o status é atualizado.
- Quando o shell identifica uma sessão Google válida (usuário autenticado com `userId` disponível), ele alterna automaticamente
  o stage para **Home** para dar prioridade aos blocos globais.
- A aba **Configurações** permanece sempre visível na primeira linha do rodapé; ao ser acionada, solicita o ID da planilha se
  ele ainda não estiver salvo no IndexedDB e abre o MiniApp de configurações.
- Teste manual sugerido: autenticar com Google e confirmar redirecionamento para o stage Home; acionar Configurações e validar o
  prompt de ID da planilha somente quando o valor ainda não estiver salvo localmente.

## Estrutura Relevante
```
.
├── docs/
│   ├── components/             # Web Components compartilhados
│   │   ├── app-shared-footer.js # Footer oficial que controla o stage
│   │   └── app-shared-header.js # Header legado para MiniApps que ainda precisam de barra superior
│   ├── miniapp-data.js      # Lista oficial de MiniApps disponíveis
│   ├── miniapp-card.js      # Template e listeners dos cards
│   └── miniapp-card.css     # Estilos dos cards exibidos no grid
├── docs/design-system/      # Estrutura inicial para o futuro Design System
├── pwa/                     # Manifestos do PWA centralizados
├── js/
│   ├── googleSync.js        # Fila offline + integração com Google
│   └── indexeddb-store.js   # Acesso ao IndexedDB e helpers
├── tests/
│   ├── helpers/             # Servidor estático e utilidades de teste
│   └── miniapps/            # Suítes Playwright segmentadas por MiniApp
├── templates/               # Modelos temporários para novos MiniApps
├── miniapps/                # MiniApps homologados ou em desenvolvimento
└── index.html               # Shell principal do catálogo
```

A pasta `templates/` concentra HTMLs temporários usados como referência na criação de novos MiniApps. Os arquivos são processados pelo Codex e não fazem parte da PWA final.

### Componentes compartilhados
- `<app-shared-footer>` é definido em `docs/components/app-shared-footer.js` e passa a ser o **controle principal do stage**. Ele inicia em modo compacto, mantém a aba **Configurações** sempre visível (o atributo `show-settings="false"` pode escondê-la quando necessário) e centraliza os alertas na segunda linha do rodapé.
- `<app-shared-header>` (em `docs/components/app-shared-header.js`) permanece disponível como componente **legado** para MiniApps que exigirem barra superior interna, mas não é mais renderizado pelo shell principal.

### Navegação via rodapé (RodaPack)
- O shell principal alterna entre o catálogo e placeholders compactos ao clicar nos ícones do rodapé.
- Cada placeholder exibe o título do MiniApp correspondente (ex.: Conta do Usuário) até que a versão homologada seja publicada, hidratando título e descrição diretamente do `miniapp-data.js`.
- O rodapé mantém estado persistido (`collapsed`/`expanded`) no IndexedDB e continua controlando mensagens, status de sync e tema.

## Como adicionar ou atualizar um MiniApp
1. **Cadastrar dados no `miniapp-data.js`**
   - Inclua um objeto com propriedades `id`, `title`, `description`, `price`, `category`, `contract`, `url` e `image`.
   - Garanta que `id` seja único e estável. Utilize o padrão `miniapp-nome-versao` ou um slug claro.
   - Revise o `title` para que seja exclusivo; ele ainda é usado como fallback para favoritos e buscas.
   - Campo opcional `updatedAt` (ISO 8601) permite rastrear quando o registro foi revisado pela última vez e já é utilizado pelo MiniApp **Gestão de Catálogo**.

2. **Validar a renderização**
   - Abra `index.html` localmente (via servidor estático ou live server) e confirme que o card aparece com imagem, tags e botões corretos.
   - Verifique se o modal de detalhes exibe o conteúdo recém-adicionado sem erros no console.

3. **Testar interações críticas**
   - **Favoritos**: adicione e remova o MiniApp, conferindo se o estado persiste após recarregar a página.
   - **Carrinho/Fila de Sync**: use o botão "Adicionar ao Carrinho" para checar se o item gera entrada com `miniAppId` válido.
   - **Busca**: utilize termos parciais do título e categoria para garantir que o filtro funciona.

4. **Checklist antes do PR**
   - Executar os testes manuais acima e registrar no PR o que foi validado.
   - Atualizar este `README.md` e o `CHANGELOG.md` caso novas regras ou estruturas tenham sido introduzidas.
   - Garantir que imagens tenham fallback ou dimensões proporcionais para evitar layout shift.

## Fluxo guiado com o MiniApp Gestão de Catálogo

Para evitar edições manuais diretas no arquivo, é possível abrir `miniapps/gestao-de-catalogo/index.html` em um servidor estático local e usar o CRUD guiado para gerar e sincronizar o `miniapp-data.js` atualizado. O fluxo é o seguinte:

1. A tela importa automaticamente `docs/miniapp-data.js`, mostra todos os itens oficiais e salva rascunhos em `localStorage`.
2. Cada linha pode ser editada, duplicada ou removida. O formulário garante que os campos obrigatórios estejam preenchidos e atualiza o campo `updatedAt` em cada alteração.
3. Ao finalizar, clique em **Salvar no sistema**. A interface envia o catálogo revisado para a fila do IndexedDB e dispara a sincronização automática via Apps Script/Google APIs configuradas.
4. Caso deseje descartar o rascunho local e voltar aos dados oficiais, use o atalho **Descartar rascunho local** dentro do próprio MiniApp.

Mesmo utilizando o fluxo guiado, o commit final sempre envolve atualizar o arquivo `docs/miniapp-data.js`, pois ele continua sendo a única fonte de verdade carregada pelo shell (`index.html`).

## Boas Práticas
- Mantenha as alterações auditáveis: descreva no PR motivação, impacto e passos de teste.
- Evite quebrar compatibilidade com dados existentes; quando adicionar campos novos, forneça valores padrão para os MiniApps antigos.
- Observe o guia do agente (`AGENTE.md`) para decisões sobre fluxo, segurança e documentação.
- Sempre prefira soluções gratuitas e escaláveis, alinhadas ao objetivo zero custo do ecossistema.

## Rotina de limpeza do repositório
- **Mapeie referências antes de remover**: use `rg` para confirmar se um arquivo, função ou constante ainda é importado. Itens sem uso devem ser apagados junto com os imports associados.
- **Higienize artefatos antigos do PWA**: manifeste, ícones e listas de precache ficam em `pwa/` e `service-worker.js`. Ao remover ou renomear ativos, atualize o precache e valide caminhos absolutos.
- **Excluir páginas ou MiniApps descontinuados**: remova o diretório do MiniApp, a entrada correspondente no `docs/miniapp-data.js` e quaisquer imagens exclusivas da pasta `assets/`.
- **Limpeza de templates**: arquivos processados em `templates/miniapps-inbox/` devem ser movidos para `templates/miniapps-archive/` ou excluídos após a publicação.
- **Revisar testes órfãos**: suítes em `tests/miniapps/` que apontarem para rotas removidas devem ser apagadas ou atualizadas para o fluxo vigente.

## Protocolo de manutenção e organização
- **Documentar cada mudança estrutural**: ajustes em pastas (ex.: mover manifestos para `pwa/` ou realocar testes) exigem atualização deste `README.md` e do `CHANGELOG.md`.
- **Seguir mobile-first e design system**: novos estilos devem reutilizar tokens já definidos em `docs/miniapp-global.css` e evoluir o design system dentro de `docs/design-system/` quando necessário.
- **Centralizar alertas**: mensagens devem ser disparadas via evento `app:notify` para ocupar a linha de alertas do rodapé, garantindo consistência visual.
- **Organização de testes**: manter as suítes Playwright em `tests/miniapps/<slug>/`, com utilidades compartilhadas em `tests/helpers/`. Scripts `npm run qa:*` devem continuar refletindo essa estrutura.
- **Checklist de PR**: confirmar formatação consistente, ausência de dependências externas novas não aprovadas e execução dos testes automatizados relevantes.

## Processo de QA para quem executa os testes
- **Guias rápidos**: os planos com termos de aceitação estão em `docs/qa/gestao-conta-auto-save.md` (gestão de conta) e `docs/qa/gestao-catalogo-auto-save.md` (gestão de catálogo). Cada arquivo detalha ambiente, comando e passos validados.
- **Organização das suítes**: todas as suítes Playwright residem em `tests/miniapps/<slug>/`, reutilizando os utilitários de `tests/helpers/` para subir o servidor estático.
- **Comandos únicos**: use `npm run qa:gestao-conta`, `npm run qa:gestao-catalogo` ou `npm test` para rodar todas as suítes Playwright. Os scripts já sobem o servidor estático local automaticamente e apontam para os testes localizados dentro de cada MiniApp.
- **Registro obrigatório**: anexe a saída dos comandos ao PR/commit como evidência dos termos de aceitação. Caso um cenário falhe, corrija o fluxo e repita até todos os termos serem atendidos.
- **Ajustes de dependência**: na primeira execução (ou após reinstalar o ambiente), rode `npm install`, `npx playwright install-deps chromium` e `npx playwright install chromium` para habilitar o navegador de teste.
- **Histórico de execuções**: cada rodada de QA deve ser registrada em `docs/qa/runs/<AAAA-MM-DD>.md` com ambiente preparado, comandos disparados, resultado e observações de rede. Consulte `docs/qa/runs/2025-11-17.md` como referência inicial.

## Layout do grid e largura dos cards
- O contêiner principal (`.app-shell`/`.app-main`) usa largura total com limite de **1280px** centralizado e `padding` de `1rem` para manter respiro lateral.
- O grid de cards (`.responsive-panel-grid` em `docs/miniapp-global.css`) usa colunas fixas de `300px` (`repeat(auto-fit, minmax(300px, 300px))`), `gap` de `1.2rem` e largura máxima de **1280px**, garantindo que cada card mantenha sempre **300px** de largura e que o conjunto fique centralizado.
- A altura do shell é travada em `100vh`: header e footer permanecem sempre visíveis, enquanto o painel central (`.app-main`) ganha rolagem própria com barra oculta para não poluir o layout.
- Relatório de capturas e observações de responsividade está documentado em `docs/responsiveness-report.md`.

## MiniApp Catálogo 5Horas
O primeiro MiniApp implantado é o **Catálogo 5Horas**, registrado em `docs/miniapp-data.js` com `id: catalogo-5horas`. Ele funciona como hub inicial para descoberta, favoritos e fila offline, servindo como referência para contribuições futuras.

## Desenvolvimento Local
Nenhuma dependência Node é obrigatória. Utilize um servidor HTTP simples (ex.: `npx serve`, `python -m http.server`) para testar PWA, modais e integração com IndexedDB.

## Licença
Este projeto segue a política de código aberto acordada para o ecossistema MiniApp 5Horas. Ajustes específicos devem ser discutidos via PR.
