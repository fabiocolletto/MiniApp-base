# MiniApp Base — Reset 100%

Este repositório contém o pacote base atualizado do ecossistema de MiniApps da 5 Horas. A estrutura foi simplificada para servir como shell PWA independente com catálogo inicial — atualmente o único MiniApp embarcado — e suporte offline para o fluxo de navegação.

> **Integração recomendada com WordPress/Elementor**: publique esta pasta em um host estático (GitHub Pages, Vercel, etc.) e incorpore o shell (`index.html`) via `<iframe>` no site principal. Não injete CSS ou JS deste repositório diretamente no WordPress.

## Componentes principais
- **Shell PWA (`index.html`)** – organiza a área central em três visões: `#setup-sheet-view` (configuração da planilha), `#catalog-view` (catálogo embutido) e `#app-view` (iframe exclusivo dos MiniApps). Expõe `window.changeView('catalog'|'app')` e `window.loadMiniApp(url, metadata)` para alternar telas sem recarregar a página, além de registrar `sw.js` para operação offline.【F:index.html†L32-L66】【F:js/app.js†L20-L78】
- **Catálogo embutido (`js/catalog-app.js`)** – centraliza o dataset `STATIC_CATALOG_ITEMS` e a renderização do catálogo diretamente dentro do shell, expondo eventos para abrir MiniApps sem depender de um iframe dedicado.
- **Design System (`miniapp-base/style/styles.css`)** – CSS escopado com a classe `.ma`, responsável por reset, tokens, componentes e utilitários compartilhados.

## Tema claro/escuro integrado
- O shell possui um botão dedicado no cabeçalho que alterna entre claro e escuro, persiste a escolha em `localStorage` (`miniapp-shell.theme`), aplica `data-theme="dark"` ao `#miniapp-root` e sincroniza a cor do `<meta name="theme-color">` para manter a barra do navegador coerente.【F:index.html†L27-L51】【F:js/app.js†L20-L133】
- Sempre que o tema muda o shell aplica `data-theme` na raiz `.ma`, ajusta o `<meta name="theme-color">` e sincroniza o valor com o catálogo embutido e com o MiniApp ativo (iframe) — o catálogo emite `miniapp-theme-ready`/`miniapp-theme-applied` via `EventTarget`, enquanto o iframe continua respondendo aos eventos `postMessage`.【F:js/app.js†L320-L420】【F:js/catalog-app.js†L266-L338】
- Miniapps baseados no design system precisam apenas espelhar o atributo `data-theme` na raiz `.ma`. O catálogo reutiliza as classes declaradas em `miniapp-base/style/styles.css` (blocos `.catalog-*`), dispensando dependências externas como Tailwind.【F:miniapp-base/style/styles.css†L250-L360】

## Integração com o catálogo

### 1. Manter o catálogo embutido
1. Atualize o array `STATIC_CATALOG_ITEMS` dentro de `js/catalog-app.js` sempre que quiser incluir, remover ou editar MiniApps. Cada objeto deve conter `id`, `name`, `description`, `url`, `icon_url`, além dos metadados `category`, `category_key`, `status`, `status_key` e, quando necessário, `required_role` e `translations` por idioma.【F:js/catalog-app.js†L1-L116】
2. O catálogo continua listado como MiniApp essencial do shell. Caso novos MiniApps sejam adicionados, inclua-os nesse array e valide o funcionamento offline antes de publicar.
3. Cada card emite o evento `load-miniapp` via `EventTarget`; o shell captura o detalhe e chama `window.loadMiniApp`, alternando para `#app-view`. As URLs devem ser relativas à raiz do shell para evitar navegar fora do contêiner.【F:js/catalog-app.js†L178-L228】【F:js/app.js†L60-L150】
4. Mantenha o filtro de categorias e a busca alimentados por `fullCatalogData`. Ao incluir novos campos, ajuste `populateFilters` e `applyFiltersAndRender` para refletir as propriedades que deseja expor no catálogo.【F:js/catalog-app.js†L120-L210】

#### Internacionalização do catálogo

- Os idiomas disponíveis são definidos em `js/i18n.js`. Ao adicionar um novo locale, inclua a sigla em `AVAILABLE_LOCALES`, descreva metadados (`meta.direction`, `languageNames`) e traduções de interface (`catalog`, `shell`). Garanta também um mapa `catalog.card.statusByKey` cobrindo os `status_key` usados no catálogo.【F:js/i18n.js†L1-L122】
- Cada item do `STATIC_CATALOG_ITEMS` pode expor traduções específicas em `translations[locale]` para `name`, `description`, `category` e `status`. Quando um idioma não estiver definido no item, o catálogo recorre ao texto padrão ou ao fallback por `status_key`, garantindo consistência visual ao alternar o idioma no shell.【F:js/catalog-app.js†L118-L176】
- Para incluir um novo MiniApp ou idioma:
  1. Preencha os campos padrão (`name`, `description`, `category`, `status`) em português.
  2. Defina `category_key` e `status_key` com identificadores estáveis em inglês (ex.: `system`, `essential`). Evite acentos ou espaços para manter compatibilidade com filtros e estilos.【F:js/catalog-app.js†L118-L176】
  3. Adicione as traduções em `translations['novo-locale']` e, se necessário, complemente o mapa `statusByKey` no arquivo de i18n.
  4. Valide no shell alternando o idioma pelo botão de tradução e confirmando a renderização dos cards, filtros e metadados enviados via `postMessage`.

### 2. Sincronizar o ID da planilha do catálogo
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
  catalog-app.js         # Catálogo embutido (dataset, filtros e eventos)
miniapp-base/
  style/styles.css       # Único arquivo de estilo compartilhado
  icons/README.md        # Instruções para adicionar manualmente os ícones PWA
docs/
  protocolos/            # Protocolos operacionais (ex.: remoção de MiniApps)
```

Todas as pastas possuem um `README.md` próprio descrevendo responsabilidades e limites de manutenção.

## Fluxo de desenvolvimento
1. Leia `AGENTE.md` e o `CHANGELOG.md` antes de iniciar uma modificação.
2. Abertura de novos miniapps exige adicionar o cartão correspondente diretamente ao array `STATIC_CATALOG_ITEMS` em `js/catalog-app.js`.
3. Miniapps devem enviar `window.parent.postMessage({ action: 'miniapp-header', title, subtitle })` assim que carregarem para atualizar o cabeçalho do shell.
4. Ao alterar o CSS, mantenha o escopo `.ma` e preserve a organização por camadas (`@layer`).
5. Atualize o `CHANGELOG.md` a cada alteração relevante.

## Publicação
1. Gere um build estático copiando a raiz do projeto para o host.
2. Limpe o cache do navegador e abra `index.html` hospedado.
3. Ao ser solicitado, utilize o botão **Instalar** para testar o modo PWA.
4. Com a internet desconectada, verifique o catálogo e confirme o fallback de dados local para os itens carregados.

## Licença
Uso interno. Consulte os responsáveis antes de compartilhar ou reutilizar.
