# MiniApp Base

Aplicativo PWA que centraliza o acesso aos MiniApps da 5 Horas com suporte a instalação, uso offline controlado e catálogo de miniaplicações acessíveis a convidados.

O shell inicia diretamente na vitrine de convidados, permitindo explorar MiniApps liberados sem credenciais. Quando desejar salvar preferências ou sincronizar dispositivos, o usuário pode abrir o formulário de cadastro para criar uma conta.

## Estrutura do repositório

- `index.html` – shell principal com painel de acesso (modo convidado por padrão) e vitrine de MiniApps liberados.
- `public/` – assets estáticos servidos diretamente (service worker, ícones, páginas offline e atalhos dos MiniApps).
- `styles/` – design tokens globais (`tokens.css`) e estilos do fluxo de autenticação (`main.css` e `auth.css`).
- `scripts/` – módulos JavaScript do shell (autenticação, armazenamento local, preferências e integração com o service worker).
- `core/` – utilitários persistentes para contas e sessão global (IndexedDB + logging compartilhado).
- `sys/` – ferramentas de infraestrutura (ex.: utilitário de log) utilizadas pelos módulos centrais.
- `docs/` – documentação viva. Destaque para [`docs/pwa.md`](docs/pwa.md) e [`docs/migration-pre-to-post-pwa.md`](docs/migration-pre-to-post-pwa.md).
- `docs/miniapps/` – fichas descritivas dos MiniApps publicados no catálogo.
- `reports/` – relatórios e evidências da limpeza PWA atual, incluindo inventário, coverage e validações.
- `archive/2025-10-28/` – árvore completa do legado movido durante a limpeza, preservando histórico sem poluir o shell ativo.

## Executando localmente

1. Instale as dependências necessárias para servir arquivos estáticos (qualquer servidor HTTP simples atende).
2. Inicie um servidor apontando para a raiz do projeto, por exemplo: `npx serve .` ou `python -m http.server 4173`.
3. Acesse `http://localhost:<porta>/index.html` para validar a interface.
4. Opcionalmente execute `npm test` para garantir que não há regressões (nenhum teste automatizado permanece ativo após o arquivamento).

### Testes manuais recomendados

- **Fallback offline**: com o app aberto no navegador, abra as DevTools (`Ctrl+Shift+I` / `Cmd+Option+I`), ative o modo "Offline" na aba **Network** e recarregue a página. O shell deve exibir `public/offline.html` com o aviso de falta de conexão. Ao restaurar a conexão e atualizar novamente, o painel de autenticação volta a aparecer.
- **Atalhos de MiniApp**: acesse `/?app=task-manager` ou `/?app=exam-planner` para confirmar o redirecionamento imediato para a ficha correspondente em `docs/miniapps/`.
- **Instalabilidade**: verifique a opção "Instalar" do navegador (Chrome/Edge) e confirme que o nome, ícones maskable e atalho do PWA aparecem conforme o manifesto (`manifest.webmanifest`).

## Instalação como PWA

1. Abra o aplicativo em um navegador compatível (Chrome, Edge, Safari iOS 16.4+).
2. Aguarde a exibição do prompt nativo ou utilize a opção "Instalar aplicativo" do navegador.
3. O PWA expõe atalhos para `Gestão de Trabalho` e `Criador de Provas` via `/?app=<slug>` que redirecionam para a documentação correspondente.
4. Ícones maskable (192 px e 512 px) e ícones específicos de atalho estão em `public/icons/` e são pré-cacheados pelo service worker.

## Política de cache e offline

- O `service-worker.js` utiliza estratégia cache-first para os assets essenciais listados em `CORE_ASSETS`.
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
- Validação PWA anterior: [`docs/pwa-validation-report.md`](docs/pwa-validation-report.md)
- Integração MiniApps + WordPress: [`docs/wordpress-miniapps-integration.md`](docs/wordpress-miniapps-integration.md)
- Relatório completo da limpeza: [`reports/pwa-cleanup-2025-10-28/README.md`](reports/pwa-cleanup-2025-10-28/README.md)
- Registro de mudanças: [`CHANGELOG.md`](CHANGELOG.md)

Para orientações detalhadas sobre histórico e arquivos arquivados, consulte [`archive/2025-10-28/README.md`](archive/2025-10-28/README.md).
