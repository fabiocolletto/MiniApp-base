# MiniApp Base

Aplicativo PWA que centraliza o acesso aos MiniApps da 5 Horas com suporte a instalação, uso offline controlado e catálogo de miniaplicações acessíveis a convidados.

O shell inicia diretamente na vitrine de convidados, permitindo explorar MiniApps liberados sem credenciais. Quando desejar salvar preferências ou sincronizar dispositivos, o usuário pode abrir o formulário de cadastro para criar uma conta.

## Estrutura do repositório

- `index.html` – shell principal com painel de acesso (modo convidado por padrão) e vitrine de MiniApps liberados.
- `design/` – tokens DTCG (`tokens.json`) e utilitários de geração (`scripts/build/tokens.mjs`).
- `public/` – assets estáticos servidos diretamente (service worker, ícones, `app-theme.css`, `tokens.css` e páginas offline).
- `styles/` – estilos do fluxo de autenticação (`main.css` e `auth.css`) construídos sobre o tema global.
- `scripts/` – módulos JavaScript do shell (autenticação, armazenamento local, preferências e integração com o service worker).
- `core/` – utilitários persistentes para contas e sessão global (IndexedDB + logging compartilhado).
- `sys/` – ferramentas de infraestrutura (ex.: utilitário de log) utilizadas pelos módulos centrais.
- `docs/` – documentação viva. Destaque para [`docs/pwa.md`](docs/pwa.md) e [`docs/migration-pre-to-post-pwa.md`](docs/migration-pre-to-post-pwa.md).
- `docs/miniapps/` – fichas descritivas dos MiniApps publicados no catálogo.
- `reports/` – relatórios e evidências da limpeza PWA atual, incluindo inventário, coverage e validações.
- `archive/2025-10-28/` – árvore completa do legado movido durante a limpeza, preservando histórico sem poluir o shell ativo.

## Tema 5 Horas & Tokens

- Os tokens do tema são definidos em [`design/tokens.json`](design/tokens.json) seguindo o padrão DTCG. Execute `node scripts/build/tokens.mjs`
  sempre que alterar o JSON para regenerar `public/tokens.css`.
- [`public/app-theme.css`](public/app-theme.css) organiza as camadas `@layer tokens, base, layout, components, utilities`, mapeia variáveis do Elementor
  (`--e-global-*`) para aliases `--ac-*` e controla `color-scheme` com `data-theme`.
- Os estilos específicos do shell (`styles/main.css`, `styles/auth.css`) consomem os aliases `--ac-*` e variáveis auxiliares expostas pelo tema global.
- Detalhes adicionais, mapa de escala tipográfica e exemplos de uso estão em [`docs/ui-theme-and-prefs.md`](docs/ui-theme-and-prefs.md).

## Preferências do Usuário

- As preferências são persistidas no IndexedDB `marco_core`, store `prefs`, através de [`shared/storage/idb/prefs.js`](shared/storage/idb/prefs.js).
- O controlador [`scripts/preferences/user-preferences.js`](scripts/preferences/user-preferences.js) aplica as preferências ao carregar o shell (`loadUserPreferences`),
  expõe `updateUserPreferences`, `getCurrentPreferences` e permite inscrição em mudanças.
- Opções suportadas: tema (`auto`/`light`/`dark`), idioma (`pt-BR`/`en`/`es`), escala tipográfica (cinco níveis), densidade (`comfort`/`compact`) e redução de animações.
- O painel visual é carregado sob demanda a partir de [`components/preferences/panel.js`](components/preferences/panel.js) via menu do rodapé (item **Preferências do usuário**).
  O painel aplica as alterações imediatamente e respeita `prefers-color-scheme` / `prefers-reduced-motion` quando o usuário mantém a opção automática.

## Registry de MiniApps

- [`miniapps/registry.json`](miniapps/registry.json) lista os MiniApps publicados e aponta para o módulo ESM responsável por inicializar cada experiência.
- [`shell/load-miniapp.js`](shell/load-miniapp.js) expõe `loadMiniApp(id, options)`, que busca o registro sem cache, importa o módulo e executa `mount(target, context)`.
- O service worker mantém `miniapps/registry.json` e `components/preferences/panel.html` com estratégia network-first para garantir atualizações rápidas sem exigir limpeza manual de cache.

## MiniApp Store em layout conversacional

- A view `renderMiniAppStore` (`scripts/views/miniapp-store.js`) monta a vitrine utilizando uma grade responsiva (`.chat-shell`) inspirada no ChatGPT: sidebar com jornadas e thread central com mensagens e cartões.
- As conversas disponíveis aparecem em `.chat-shell__conversation-list`. Clicar em um item atualiza imediatamente o destaque da lista e da vitrine (`.miniapp-store__item--highlight`) e fecha o menu lateral em telas estreitas.
- O botão "Nova conversa" leva o foco ao compositor (`.chat-shell__composer`) e reposiciona a thread no topo, simulando o início de um novo atendimento.
- A identidade visual utiliza tokens verdes/grafite. Ajustes adicionais podem ser feitos nos arquivos `design/tokens.json` e `public/app-theme.css`; gere novamente `public/tokens.css` com `node scripts/build/tokens.mjs` após alterar os tokens.
- Para customizar preferências salvas/favoritas sem uma sessão ativa, utilize as opções `savedMiniAppIds` e `favoriteMiniAppIds` ao chamar `renderMiniAppStore` em testes ou storybooks.

## Memória local (IndexedDB)

### Visão geral
- A camada oficial utiliza [`shared/vendor/idb.min.js`](shared/vendor/idb.min.js) (versão 7.x em ESM com licença MIT embutida).
- O banco `marco_core` centraliza configurações, usuário mestre, catálogo de MiniApps, auditoria local e cache chave/valor.
- MiniApps que precisam de persistência dedicada ganham bancos próprios, como `pesquisa_studio` para o futuro Pesquisa Studio.
- As APIs residem em `shared/storage/idb/` e expõem funções assíncronas prontas para uso em módulos ESM.

### Convenções de nomes
- Bancos: `marco_core` para o Base; `miniapp_slug` ou nomes compostos (`pesquisa_studio`) para MiniApps.
- Stores (`marco_core`): `settings`, `user_master`, `miniapps_catalog`, `audit_log`, `kv_cache`.
- Stores (`pesquisa_studio`): `surveys`, `flows`, `templates`, `variants`, `terminals`, `presets`, `drafts`, `exports`, `runs`, `tags`.
- Índices seguem o prefixo `by_` (`by_email`, `by_route`, `by_status`, `surveys_multi` etc.). Use chaves compostas quando necessário (`variants` usa `[surveyId, variantId]`).

### Exemplos de uso
```js
import { setSetting, getMiniappsCatalog, listAuditLog } from './shared/storage/idb/marcocore.js';
import { upsertSurvey, listSurveys } from './shared/storage/idb/surveystudio.js';

await setSetting('theme', 'dark');
const catalog = await getMiniappsCatalog();
const recentEvents = await listAuditLog({ limit: 10 });

await upsertSurvey({ surveyId: 'launch-2025', name: 'Pesquisa de lançamento', status: 'draft' });
const drafts = await listSurveys({ status: 'draft' });
```

### Boas práticas
- Solicite persistência e monitore quota usando `ensurePersistentStorage()` e `getStorageEstimate()` (expostos em `persistence.js`).
- Evite armazenar segredos ou PII. A camada destina-se a preferências, catálogos e caches descartáveis.
- Para backup local ou auditoria, exporte os dados com `listAuditLog()`/`getMiniappsCatalog()` e gere um JSON para download (por exemplo com `URL.createObjectURL(new Blob([...]))`).
- Nunca dependa de `localStorage`; a migração automática (`shared/storage/idb/migrate.js`) limpa resquícios legados.

## Executando localmente

1. Instale as dependências do projeto com `npm install` (nenhum pacote externo é obrigatório para os testes).
2. Inicie um servidor apontando para a raiz do projeto, por exemplo: `npx serve .` ou `python -m http.server 4173`.
3. Acesse `http://localhost:<porta>/index.html` para validar a interface.
4. Execute `npm test` para rodar a suíte automatizada que cobre as interações do shell (uma simulação de DOM já está inclusa no repositório).

### Validação visual obrigatória

- Após aplicar qualquer alteração aprovada para commit, execute a interface localmente e capture **dois screenshots** do shell: um em modo paisagem e outro em modo retrato.
- Utilize a simulação de dispositivo **Samsung Galaxy Tab S9** nas DevTools do navegador para ambos os registros.
- Anexe as imagens geradas ao relatório ou pull request correspondente e referencie os caminhos no resumo final da entrega.

### Testes manuais recomendados

- **Fallback offline**: com o app aberto no navegador, abra as DevTools (`Ctrl+Shift+I` / `Cmd+Option+I`), ative o modo "Offline" na aba **Network** e recarregue a página. O shell deve exibir `public/offline.html` com o aviso de falta de conexão. Ao restaurar a conexão e atualizar novamente, o painel de autenticação volta a aparecer.
- **Atalhos de MiniApp**: acesse `/?app=task-manager` ou `/?app=exam-planner` para confirmar o redirecionamento imediato para a ficha correspondente em `docs/miniapps/`.
- **Instalabilidade**: verifique a opção "Instalar" do navegador (Chrome/Edge) e confirme que o nome, ícones maskable e atalho do PWA aparecem conforme o manifesto (`manifest.webmanifest`).
- **Navegação conversacional**: valide a alternância do botão de sidebar (`.chat-shell__sidebar-toggle`) em telas estreitas, a seleção de conversas na lista lateral e o foco aplicado ao cartão correspondente.
- **Ações de MiniApp**: estando autenticado, teste os botões "Salvar" e "Favoritar" em cada cartão verificando feedbacks acessíveis (`aria-pressed`, rótulos atualizados e mensagens de erro quando atingir o limite de favoritos).

### Cenários validados automaticamente

- Inicialização do shell no modo convidado com dois MiniApps ativos e versão carregada a partir de `package.json`.
- Alternância para o painel de cadastro pelo seletor principal e foco automático nas ações relevantes.
- Funcionamento do menu do rodapé, incluindo abertura com foco no primeiro item e destaque de MiniApp selecionado.
- Tratamento do parâmetro `?app=` para redirecionar diretamente à documentação ou destacar o MiniApp correspondente na MiniApp Store.
- Renderização do layout conversacional do MiniApp Store com destaque automático, alternância de conversas e bloqueio das ações de salvar/favoritar sem sessão ativa.

## Instalação como PWA

1. Abra o aplicativo em um navegador compatível (Chrome, Edge, Safari iOS 16.4+).
2. Aguarde a exibição do prompt nativo ou utilize a opção "Instalar aplicativo" do navegador.
3. O PWA expõe atalhos para `Gestão de Trabalho` e `Criador de Provas` via `/?app=<slug>` que redirecionam para a documentação correspondente.
4. Ícones maskable (192 px e 512 px) e ícones específicos de atalho estão em `public/icons/` e são pré-cacheados pelo service worker.

## Política de cache e offline

- O `service-worker.js` utiliza estratégia cache-first para os assets essenciais listados em `CORE_ASSETS`.
- `miniapps/registry.json` e `components/preferences/panel.html` são tratados com estratégia network-first (`NETWORK_FIRST_PATHS`)
  para refletir publicações e ajustes de UI sem exigir limpeza manual de cache.
- A página `public/offline.html` garante fallback controlado para navegação sem conexão.
- As fichas dos MiniApps (`docs/miniapps/*.md`) são pré-cacheadas para suportar leitura offline após o primeiro acesso.
- Requisições de navegação para `/?app=<slug>` redirecionam automaticamente para a documentação correspondente; caso o slug seja inválido o catálogo destaca o item buscado.

## Limitações conhecidas em iOS

- Safari iOS só dispara sincronização em segundo plano enquanto o app estiver em uso.
- O armazenamento offline respeita os limites de quota padrão de 50 MB do WebKit.
- Instalação exige iOS 16.4 ou superior; versões anteriores não suportam ícones maskable.

## Documentação complementar

- Guia de manutenção PWA: [`docs/pwa.md`](docs/pwa.md)
- Roteiro de migração pré ➜ pós PWA: [`docs/migration-pre-to-post-pwa.md`](docs/migration-pre-to-post-pwa.md)
- Auditoria da pasta MiniApps: [`docs/miniapps-folder-audit.md`](docs/miniapps-folder-audit.md)
- Tokens de design: [`docs/design-kit-tokens.md`](docs/design-kit-tokens.md)
- Tema e preferências: [`docs/ui-theme-and-prefs.md`](docs/ui-theme-and-prefs.md)
- Validação da versão 3.0.0: [`docs/testing/release-3.0-validation.md`](docs/testing/release-3.0-validation.md)
- Validação PWA anterior: [`docs/pwa-validation-report.md`](docs/pwa-validation-report.md)
- Integração MiniApps + WordPress: [`docs/wordpress-miniapps-integration.md`](docs/wordpress-miniapps-integration.md)
- Relatório completo da limpeza: [`reports/pwa-cleanup-2025-10-28/README.md`](reports/pwa-cleanup-2025-10-28/README.md)
- Registro de mudanças: [`CHANGELOG.md`](CHANGELOG.md)

Para orientações detalhadas sobre histórico e arquivos arquivados, consulte [`archive/2025-10-28/README.md`](archive/2025-10-28/README.md).
