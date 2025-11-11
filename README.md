# MiniApp Base — Reset 100%

Este repositório contém o pacote base atualizado do ecossistema de MiniApps da 5 Horas. A estrutura foi simplificada para servir como shell PWA independente, com catálogo inicial, MiniApp Prefeito e suporte offline.

> **Integração recomendada com WordPress/Elementor**: publique esta pasta em um host estático (GitHub Pages, Vercel, etc.) e incorpore o shell (`index.html`) via `<iframe>` no site principal. Não injete CSS ou JS deste repositório diretamente no WordPress.

## Componentes principais
- **Shell PWA (`index.html`)** – organiza a área central em três visões: `#setup-sheet-view` (configuração da planilha), `#catalog-view` (catálogo embutido) e `#app-view` (iframe exclusivo dos MiniApps). Expõe `window.changeView('catalog'|'app')` e `window.loadMiniApp(url, metadata)` para alternar telas sem recarregar a página, além de registrar `sw.js` para operação offline.【F:index.html†L32-L66】【F:js/app.js†L20-L78】
- **Catálogo (`miniapp-catalogo/index.html`)** – lista de miniapps que consome exclusivamente `catalog.json`, arquivo estático com os metadados dos MiniApps.
- **MiniApp Prefeito (`miniapp-prefeito/`)** – experiência padrão carregada pelo catálogo, capaz de consumir dados em JSON/CSV ou incorporar um painel externo via iframe seguro.
- **Design System (`miniapp-base/style/styles.css`)** – CSS escopado com a classe `.ma`, responsável por reset, tokens, componentes e utilitários compartilhados.

## Tema claro/escuro integrado
- O shell possui um botão dedicado no cabeçalho que alterna entre claro e escuro, persiste a escolha em `localStorage` (`miniapp-shell.theme`), aplica `data-theme="dark"` ao `#miniapp-root` e sincroniza a cor do `<meta name="theme-color">` para manter a barra do navegador coerente.【F:index.html†L27-L51】【F:js/app.js†L20-L133】
- Sempre que o tema muda o shell envia `{ action: 'shell-theme', theme }` para o catálogo e o MiniApp ativo via `postMessage`, esperando por `{ action: 'miniapp-theme-ready' }` após o carregamento e registrando `{ action: 'miniapp-theme-applied', theme }` quando o iframe confirma a aplicação.【F:js/app.js†L134-L333】
- Miniapps baseados no design system precisam apenas espelhar o atributo `data-theme` na raiz `.ma`. Interfaces em Tailwind (catálogo público e gestor) contam com CSS adicional observando `body[data-theme="dark"]` e os respectivos scripts de handshake com o shell; preserve esses handlers ao criar experiências semelhantes.【F:miniapp-catalogo/index.html†L8-L206】【F:miniapp-gestor-de-catalogo/index.html†L1-L120】【F:miniapp-prefeito/index.html†L1-L52】

## Integração com o Gestor e o Catálogo

### 1. Adicionar o `miniapp-gestor-de-catalogo`
1. Garanta que o shell carregue o gestor com `window.loadMiniApp('miniapp-gestor-de-catalogo/index.html', meta)` quando o administrador acionar a função. O shell já expõe o helper `loadMiniApp`, alterna para `#app-view` e atualiza cabeçalho e histórico (`localStorage`) automaticamente.【F:js/app.js†L51-L85】
2. Dentro do gestor, mantenha a coleta da planilha (`buildCsvUrl`) e a transformação em itens do catálogo com `parseCsv`, pois os cards ativos dependem dos campos `id`, `name`, `status`, `category` e `lastImport`. O gestor marca itens selecionados e sinaliza duplicidades comparando com `window.ACTIVE_MINIAPPS`.【F:miniapp-gestor-de-catalogo/index.html†L61-L202】
3. Preserve as chamadas de seleção (`toggleRowSelection`, `toggleAllSelection`) e a atualização de resumos, porque o shell espera que o gestor publique o catálogo final para o Firestore ou API responsável após a importação. Caso precise persistir, substitua os stubs `saveSheetId`, `trySignIn` e `loadSavedSheetId` pelas integrações reais de autenticação e banco.【F:miniapp-gestor-de-catalogo/index.html†L203-L356】
4. Ao concluir a importação, envie para o shell um `postMessage` com `{ action: 'load-miniapp', url: 'miniapp-catalogo/index.html', metadata }` para devolver o usuário ao catálogo público, mantendo a experiência integrada.【F:js/app.js†L323-L333】

### 2. Usar o `miniapp-catalogo` como catálogo oficial
1. O catálogo lê o arquivo estático `catalog.json` na raiz do projeto. Cada item deve conter `id`, `name`, `description`, `url`, `category`, `status` e `icon_url` para que o cartão seja renderizado corretamente.【F:miniapp-catalogo/index.html†L98-L214】
2. Inclua sempre os MiniApps essenciais (base, catálogo e gestor) no `catalog.json` para manter a navegação completa mesmo durante testes offline.【F:catalog.json†L1-L28】【F:miniapp-catalogo/index.html†L185-L214】
3. Cada card publica `postMessage({ action: 'load-miniapp', url, metadata })` para o shell, que responde com `window.loadMiniApp` e alterna para `#app-view`. Garanta que as URLs sejam relativas à raiz do shell para evitar navegar fora do contêiner.【F:miniapp-catalogo/index.html†L157-L214】【F:js/app.js†L51-L134】
4. Mantenha o filtro de categorias e busca alimentado pelo array `fullCatalogData`. Caso acrescente novos campos, ajuste `populateFilters` e `applyFiltersAndRender` para refletir as propriedades que deseja expor no catálogo público.【F:miniapp-catalogo/index.html†L126-L183】

### 3. Sincronizar o ID da planilha do catálogo
1. O shell consulta o documento `artifacts/{appId}/admin/sheet_config` no Firestore (ou o cache local) em busca do campo `GOOGLE_SHEET_ID`. Se encontrar o valor, ele aplica o ID em `window.CATALOG_GOOGLE_SHEET_ID` e restaura o último MiniApp aberto; caso contrário, exibe `#setup-sheet-view` para solicitar o ID manualmente.【F:js/app.js†L80-L172】
2. Ao salvar o formulário, o shell tenta persistir o ID no Firestore e, em seguida, troca automaticamente para `#catalog-view`, recarregando o catálogo incorporado quando necessário. Em ambientes sem Firebase, o ID fica salvo apenas no `localStorage`, com aviso visual no formulário.【F:index.html†L32-L51】【F:js/app.js†L174-L223】

## Estrutura
```
index.html               # Shell PWA
manifest.webmanifest     # Manifesto do app
sw.js                    # Service Worker cache-first
catalog.json             # Fonte local de miniapps (fallback)
js/
  app.js                 # Lógica do shell (postMessage, instalação, SW)
  catalog.js             # Loader/renderizador do catálogo
miniapp-base/
  style/styles.css       # Único arquivo de estilo compartilhado
  icons/README.md        # Instruções para adicionar manualmente os ícones PWA
miniapp-catalogo/index.html      # Catálogo inicial com fallback embutido
miniapp-prefeito/
  index.html             # MiniApp Prefeito com painel de dados/iframe
  js/config-source.js    # Utilitários para escolher e validar a fonte de dados
  data/sample.json       # Fallback local para modo offline
```

Todas as pastas possuem um `README.md` próprio descrevendo responsabilidades e limites de manutenção.

## Fluxo de desenvolvimento
1. Leia `AGENTE.md` e o `CHANGELOG.md` antes de iniciar uma modificação.
2. Abertura de novos miniapps exige adicionar o cartão correspondente ao `catalog.json` e opcionalmente ao fallback do catálogo embutido.
3. Miniapps devem enviar `window.parent.postMessage({ action: 'miniapp-header', title, subtitle })` assim que carregarem para atualizar o cabeçalho do shell.
4. Ao alterar o CSS, mantenha o escopo `.ma` e preserve a organização por camadas (`@layer`).
5. Atualize o `CHANGELOG.md` a cada alteração relevante.

## Publicação
1. Gere um build estático copiando a raiz do projeto para o host.
2. Limpe o cache do navegador e abra `index.html` hospedado.
3. Ao ser solicitado, utilize o botão **Instalar** para testar o modo PWA.
4. Com a internet desconectada, verifique o catálogo, abra o MiniApp Prefeito e confirme o fallback de dados local.

## Licença
Uso interno. Consulte os responsáveis antes de compartilhar ou reutilizar.
