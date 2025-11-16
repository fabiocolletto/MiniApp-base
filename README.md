# MiniApp 5Horas – Catálogo Zero Custo

Este repositório contém o catálogo principal do ecossistema MiniApp 5Horas. O objetivo é listar, testar e validar MiniApps dentro de uma arquitetura PWA totalmente gratuita, apoiada por sincronização local via IndexedDB e integração opcional com Google.

## Visão Geral
- **Frontend**: HTML estático com Tailwind CDN e componentes próprios.
- **Dados**: `docs/miniapp-data.js` é a fonte única de verdade para todos os MiniApps.
- **Persistência local**: `js/indexeddb-store.js` centraliza acesso ao IndexedDB.
- **Sincronização**: `js/googleSync.js` coordena fila offline, Google Sign-In e atualização dos indicadores de status.

## Estrutura Relevante
```
.
├── docs/
│   ├── miniapp-data.js      # Lista oficial de MiniApps disponíveis
│   ├── miniapp-card.js      # Template e listeners dos cards
│   └── miniapp-card.css     # Estilos dos cards exibidos no grid
├── docs/design-system/      # Estrutura inicial para o futuro Design System
├── js/
│   ├── googleSync.js        # Fila offline + integração com Google
│   └── indexeddb-store.js   # Acesso ao IndexedDB e helpers
├── templates/               # Modelos temporários para novos MiniApps
└── index.html               # Shell principal do catálogo
```

A pasta `templates/` concentra HTMLs temporários usados como referência na criação de novos MiniApps. Os arquivos são processados pelo Codex e não fazem parte da PWA final.

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

## MiniApp Catálogo 5Horas
O primeiro MiniApp implantado é o **Catálogo 5Horas**, registrado em `docs/miniapp-data.js` com `id: catalogo-5horas`. Ele funciona como hub inicial para descoberta, favoritos e fila offline, servindo como referência para contribuições futuras.

## Desenvolvimento Local
Nenhuma dependência Node é obrigatória. Utilize um servidor HTTP simples (ex.: `npx serve`, `python -m http.server`) para testar PWA, modais e integração com IndexedDB.

## Licença
Este projeto segue a política de código aberto acordada para o ecossistema MiniApp 5Horas. Ajustes específicos devem ser discutidos via PR.
