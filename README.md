# MiniApp Base — Reset 100%

Este repositório contém o pacote base atualizado do ecossistema de MiniApps da 5 Horas. A estrutura foi simplificada para servir como shell PWA independente, com catálogo inicial, MiniApp Minha Conta e suporte offline.

> **Integração recomendada com WordPress/Elementor**: publique esta pasta em um host estático (GitHub Pages, Vercel, etc.) e incorpore o shell (`index.html`) via `<iframe>` no site principal. Não injete CSS ou JS deste repositório diretamente no WordPress.

## Componentes principais
- **Shell PWA (`index.html`)** – organiza a área central em três visões: `#setup-sheet-view` (configuração da planilha), `#catalog-view` (catálogo embutido) e `#app-view` (iframe exclusivo dos MiniApps). Expõe `window.changeView('catalog'|'app')` e `window.loadMiniApp(url, metadata)` para alternar telas sem recarregar a página, além de registrar `sw.js` para operação offline.【F:index.html†L32-L66】【F:js/app.js†L20-L78】
- **Catálogo (`miniapp-catalogo/index.html`)** – lista de MiniApps mantida no próprio arquivo via o array `STATIC_CATALOG_ITEMS`, facilitando a edição direta dos cartões exibidos no shell.
- **Design System (`miniapp-base/style/styles.css`)** – CSS escopado com a classe `.ma`, responsável por reset, tokens, componentes e utilitários compartilhados.
- **Minha Conta (`miniapp-minha-conta/`)** – MiniApp administrativo para backups, preferências pessoais e handshake de tema com o shell.【F:miniapp-minha-conta/index.html†L1-L118】【F:miniapp-minha-conta/minha-conta.js†L1-L132】

## Tema claro/escuro integrado
- O shell possui um botão dedicado no cabeçalho que alterna entre claro e escuro, persiste a escolha em `localStorage` (`miniapp-shell.theme`), aplica `data-theme="dark"` ao `#miniapp-root` e sincroniza a cor do `<meta name="theme-color">` para manter a barra do navegador coerente.【F:index.html†L27-L51】【F:js/app.js†L20-L133】
- Sempre que o tema muda o shell envia `{ action: 'shell-theme', theme }` para o catálogo e o MiniApp ativo via `postMessage`, esperando por `{ action: 'miniapp-theme-ready' }` após o carregamento e registrando `{ action: 'miniapp-theme-applied', theme }` quando o iframe confirma a aplicação.【F:js/app.js†L134-L333】
- Miniapps baseados no design system precisam apenas espelhar o atributo `data-theme` na raiz `.ma`. Interfaces em Tailwind (catálogo público e gestor) contam com CSS adicional observando `body[data-theme="dark"]` e os respectivos scripts de handshake com o shell; preserve esses handlers ao criar experiências semelhantes.【F:miniapp-catalogo/index.html†L8-L206】【F:miniapp-gestor-de-catalogo/index.html†L1-L120】【F:miniapp-minha-conta/minha-conta.js†L1-L132】

## Integração com o Gestor e o Catálogo

### 1. Adicionar o `miniapp-gestor-de-catalogo`
1. Garanta que o shell carregue o gestor com `window.loadMiniApp('miniapp-gestor-de-catalogo/index.html', meta)` quando o administrador acionar a função. O shell já expõe o helper `loadMiniApp`, alterna para `#app-view` e atualiza cabeçalho e histórico (`localStorage`) automaticamente.【F:js/app.js†L51-L85】
2. Dentro do gestor, mantenha a coleta da planilha (`buildCsvUrl`) e a transformação em itens do catálogo com `parseCsv`, pois os cards ativos dependem dos campos `id`, `name`, `status`, `category` e `lastImport`. O gestor marca itens selecionados e sinaliza duplicidades comparando com `window.ACTIVE_MINIAPPS`.【F:miniapp-gestor-de-catalogo/index.html†L61-L202】
3. Preserve as chamadas de seleção (`toggleRowSelection`, `toggleAllSelection`) e a atualização de resumos, porque o shell espera que o gestor publique o catálogo final para o Firestore ou API responsável após a importação. Caso precise persistir, substitua os stubs `saveSheetId`, `trySignIn` e `loadSavedSheetId` pelas integrações reais de autenticação e banco.【F:miniapp-gestor-de-catalogo/index.html†L203-L356】
4. Ao concluir a importação, envie para o shell um `postMessage` com `{ action: 'load-miniapp', url: 'miniapp-catalogo/index.html', metadata }` para devolver o usuário ao catálogo público, mantendo a experiência integrada.【F:js/app.js†L323-L333】

### 2. Usar o `miniapp-catalogo` como catálogo oficial
1. Atualize o array `STATIC_CATALOG_ITEMS` dentro de `miniapp-catalogo/index.html` sempre que quiser incluir, remover ou editar MiniApps. Cada objeto deve conter `id`, `name`, `description`, `url`, `icon_url`, além dos metadados `category`, `category_key`, `status`, `status_key` e, quando necessário, `required_role` e `translations` localizadas por idioma.【F:miniapp-catalogo/index.html†L60-L154】
2. Mantenha os MiniApps essenciais (base, catálogo e gestor) listados nesse array para que o shell continue navegável mesmo durante testes offline.【F:miniapp-catalogo/index.html†L60-L117】
3. Cada card publica `postMessage({ action: 'load-miniapp', url, metadata })` para o shell, que responde com `window.loadMiniApp` e alterna para `#app-view`. Garanta que as URLs sejam relativas à raiz do shell para evitar navegar fora do contêiner.【F:miniapp-catalogo/index.html†L368-L436】【F:js/app.js†L51-L134】
4. Mantenha o filtro de categorias e busca alimentado pelo array `fullCatalogData`. Caso acrescente novos campos, ajuste `populateFilters` e `applyFiltersAndRender` para refletir as propriedades que deseja expor no catálogo público.【F:miniapp-catalogo/index.html†L312-L418】

#### Internacionalização do catálogo

- Os idiomas disponíveis são definidos em `js/i18n.js`. Ao adicionar um novo locale, inclua a sigla em `AVAILABLE_LOCALES`, descreva metadados (`meta.direction`, `languageNames`) e traduções de interface (`catalog`, `shell`, `manager`). Garanta também um mapa `catalog.card.statusByKey` cobrindo os `status_key` usados no catálogo.【F:js/i18n.js†L1-L122】
- Cada item do `STATIC_CATALOG_ITEMS` pode expor traduções específicas em `translations[locale]` para `name`, `description`, `category` e `status`. Quando um idioma não estiver definido no item, o catálogo recorre ao texto padrão ou ao fallback por `status_key`, garantindo consistência visual ao alternar o idioma no shell.【F:miniapp-catalogo/index.html†L129-L298】
- Para incluir um novo MiniApp ou idioma:
  1. Preencha os campos padrão (`name`, `description`, `category`, `status`) em português.
  2. Defina `category_key` e `status_key` com identificadores estáveis em inglês (ex.: `system`, `essential`). Evite acentos ou espaços para manter compatibilidade com filtros e estilos.【F:miniapp-catalogo/index.html†L75-L150】
  3. Adicione as traduções em `translations['novo-locale']` e, se necessário, complemente o mapa `statusByKey` no arquivo de i18n.
  4. Valide no shell alternando o idioma pelo botão de tradução e confirmando a renderização dos cards, filtros e metadados enviados via `postMessage`.

### 3. Sincronizar o ID da planilha do catálogo
1. O shell consulta o documento `artifacts/{appId}/admin/sheet_config` no Firestore (ou o cache local) em busca do campo `GOOGLE_SHEET_ID`. Se encontrar o valor, ele aplica o ID em `window.CATALOG_GOOGLE_SHEET_ID` e restaura o último MiniApp aberto; caso contrário, exibe `#setup-sheet-view` para solicitar o ID manualmente.【F:js/app.js†L80-L172】
2. Ao salvar o formulário, o shell tenta persistir o ID no Firestore e, em seguida, troca automaticamente para `#catalog-view`, recarregando o catálogo incorporado quando necessário. Em ambientes sem Firebase, o ID fica salvo apenas no `localStorage`, com aviso visual no formulário.【F:index.html†L32-L51】【F:js/app.js†L174-L223】
3. Hosts que já conhecem o ID da planilha podem defini-lo antes de carregar `js/app.js` usando `window.__initial_sheet_id` (ou os aliases `window.__catalog_sheet_id` / `window.__catalog_google_sheet_id`). O shell aplicará o valor imediatamente, armazenará o ID localmente e tentará persistir no Firestore assim que disponível.【F:js/app.js†L271-L306】【F:js/app.js†L600-L657】

## Estrutura
```
index.html               # Shell PWA
manifest.webmanifest     # Manifesto do app
sw.js                    # Service Worker cache-first
js/
  app.js                 # Lógica do shell (postMessage, instalação, SW)
  i18n.js                # Mensagens e configurações de idiomas
miniapp-base/
  style/styles.css       # Único arquivo de estilo compartilhado
  icons/README.md        # Instruções para adicionar manualmente os ícones PWA
miniapp-catalogo/index.html      # Catálogo inicial com dataset embutido
docs/
  protocolos/            # Protocolos operacionais (ex.: remoção de MiniApps)
```

Todas as pastas possuem um `README.md` próprio descrevendo responsabilidades e limites de manutenção.

## Fluxo de desenvolvimento
1. Leia `AGENTE.md` e o `CHANGELOG.md` antes de iniciar uma modificação.
2. Abertura de novos miniapps exige adicionar o cartão correspondente diretamente ao array `STATIC_CATALOG_ITEMS` do `miniapp-catalogo/index.html`.
3. Miniapps devem enviar `window.parent.postMessage({ action: 'miniapp-header', title, subtitle })` assim que carregarem para atualizar o cabeçalho do shell.
4. Ao alterar o CSS, mantenha o escopo `.ma` e preserve a organização por camadas (`@layer`).
5. Atualize o `CHANGELOG.md` a cada alteração relevante.

## Publicação
1. Gere um build estático copiando a raiz do projeto para o host.
2. Limpe o cache do navegador e abra `index.html` hospedado.
3. Ao ser solicitado, utilize o botão **Instalar** para testar o modo PWA.
4. Com a internet desconectada, verifique o catálogo, abra o MiniApp Minha Conta e confirme o fallback de dados local.

## Licença
Uso interno. Consulte os responsáveis antes de compartilhar ou reutilizar.
