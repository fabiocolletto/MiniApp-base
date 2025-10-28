# Relatório de Validação PWA — MiniApp-Base

## Contexto e metodologia
- **Data da auditoria:** 28/10/2025 (BRT)
- **Ambiente de testes:** container Linux sem acesso a navegadores gráficos ou Chrome DevTools. A aplicação foi servida localmente via `python -m http.server` para inspeções estáticas.
- **Limitações do ambiente:** políticas de rede bloqueiam downloads via npm/pip, impedindo a instalação do Lighthouse ou Playwright e a captura de capturas de tela do DevTools. Foram indicadas etapas para repetição manual das verificações em um ambiente com Chrome/Edge.
- **Artefatos consultados:** manifesto (`manifest.webmanifest`), shell HTML (`index.html`), service worker (`service-worker.js`), registrador (`scripts/pwa/register-service-worker.js`) e fluxos de navegação (`scripts/views/*.js`). Todos os testes automatizados (`npm test`) foram executados.

## 1. Instalabilidade e Manifesto
| Item | Resultado | Evidências |
| --- | --- | --- |
| HTTPS ativo | **Não verificado** | Necessita checagem em produção; não há configuração de servidor no repositório. |
| Manifesto presente e linkado | ✅ | `<link rel="manifest" href="./manifest.webmanifest">` no `index.html`.【F:index.html†L8-L25】 |
| Campos obrigatórios (name/short_name/start_url/display) | ✅ | Manifesto define `name`, `short_name`, `start_url: "./"`, `display: "standalone"`, idioma, orientação e cores.【F:manifest.webmanifest†L1-L29】 |
| MIME type correto | ⚠️ | Precisa ser confirmado no servidor real (não exposto no repo). Sugerido configurar `Content-Type: application/manifest+json`. |
| Ícones 192/512 + maskable | ✅ | Manifesto inclui 500×500 (`purpose: any` e `maskable`).【F:manifest.webmanifest†L14-L27】 |
| Shortcuts para MiniApps | ✅ | Manifesto inclui atalhos para `task-manager` e `exam-planner`.【F:manifest.webmanifest†L29-L44】 |

## 2. Service Worker e Offline
| Item | Resultado | Evidências |
| --- | --- | --- |
| SW registrado e com fetch handler | ✅ | Registrado via `registerServiceWorker` e `service-worker.js` possui `self.addEventListener('fetch', ...)`.【F:scripts/pwa/register-service-worker.js†L1-L24】【F:service-worker.js†L1-L66】 |
| App Shell offline | Parcial | `CORE_ASSETS` pre-cache inclui HTML/CSS/ícones, mas falta JavaScript central e fallback dedicado (usa `index.html`).【F:service-worker.js†L8-L21】 |
| Estratégia HTML network-first com fallback | ✅ | `handleNavigationRequest` faz `fetch` com fallback para `index.html` offline.【F:service-worker.js†L44-L70】 |
| Estáticos stale-while-revalidate | ❌ | `handleAssetRequest` responde cache-first e só atualiza se cache miss; não revalida recursos já em cache.【F:service-worker.js†L72-L99】 |
| AppCache ausente | ✅ | Nenhum uso de `manifest=` no HTML. |
| Teste offline | ⚠️ | Necessário repetir via Chrome DevTools > Application > Service Workers (modo offline). Offline fallback descrito no fluxo acima.

## 3. Desempenho e Boas Práticas
| Item | Resultado | Observações |
| --- | --- | --- |
| Lighthouse PWA (mobile/desktop) | ⚠️ | Execução bloqueada (sem Lighthouse). Instruções de repetição incluídas abaixo. |
| Performance > 90 | ⚠️ | Dependente do relatório Lighthouse. |
| Starts fast, stays fast | Parcial | Shell leve, porém falta estratégia `stale-while-revalidate` para JS/CSS, podendo atrasar atualizações. |

## 4. Acessibilidade e UX instalável
| Item | Resultado | Evidências |
| --- | --- | --- |
| Lighthouse Accessibility | ⚠️ | Audit não executado (limitação de ambiente). |
| Foco/labels | ✅ | Painéis utilizam labels explícitos e estado de foco visível via CSS (`:focus-visible`).【F:index.html†L60-L121】 |
| Promoção de instalação | ⚠️ | Não verificado sem navegador; requer observação manual em Chrome/Edge e Android.

## 5. Compatibilidade iOS
| Item | Resultado | Evidências |
| --- | --- | --- |
| Add to Home Screen | ⚠️ | Requer teste manual no Safari iOS. |
| `apple-touch-icon` e comportamento standalone | ✅ | `index.html` define meta tags iOS e ícone 192×192.【F:index.html†L12-L24】 |
| APIs limitadas documentadas | ❌ | Repositório não documenta fallback para push/background sync (não implementados). Recomenda-se adicionar nota ao README/relatório operacional.

## 6. Escopo, Rotas e Versão
| Item | Resultado | Evidências |
| --- | --- | --- |
| Scope/start_url coerentes | ✅ | Manifesto define `scope`/`start_url` para raiz, alinhado ao shell sem roteador dedicado.【F:manifest.webmanifest†L1-L21】 |
| Versionamento de cache | Parcial | `CACHE_PREFIX` inclui versão (`?v=`), mas não há rotina automatizada de bump; depende de publicar SW com query distinta.【F:service-worker.js†L1-L32】 |

## 7. Dados, Segurança e Privacidade
| Item | Resultado | Evidências |
| --- | --- | --- |
| Dados sensíveis no cache | ✅ | `CORE_ASSETS` inclui apenas arquivos estáticos; sessão tratada via IndexedDB/session store (não cacheada).【F:service-worker.js†L8-L21】 |
| Cabeçalhos de respostas privadas | ⚠️ | Depende de backend; não configurável aqui. |
| Política de retry offline | ❌ | SW não enfileira requisições POST nem possui retry; fluxo de formulários depende de rede ativa.

## 8. Evidências e pendências para coleta manual
Devido à limitação de ambiente, os prints solicitados (DevTools > Manifest/Service Workers, Lighthouse, offline fallback, prompts de instalação Android e iOS) **não puderam ser anexados**. Recomenda-se executar os passos abaixo em um ambiente com Google Chrome ou Microsoft Edge:
1. Servir o app via HTTPS (p. ex., `npx serve` atrás de um certificado válido) e abrir DevTools > Application para capturar as abas Manifest e Service Workers.
2. Rodar Lighthouse (mobile e desktop) com os relatórios exportados em HTML/PDF.
3. Simular offline nas DevTools para capturar o fallback exibido pelo Shell.
4. Testar instalação em Android (Chrome) e iOS (Safari) registrando telas do fluxo.

## Lista de arquivos verificados
- `index.html`
- `manifest.webmanifest`
- `public/icons/miniapp-icon-192.svg`
- `public/icons/miniapp-icon-512.svg`
- `service-worker.js`
- `scripts/pwa/register-service-worker.js`
- `scripts/views/login.js`
- `scripts/views/register.js`
- `scripts/views/shared/form-fields.js`
- `scripts/events/event-bus.js`

## Próximos passos recomendados
1. Validar os `shortcuts` do manifesto em produção e expandir a lista conforme novos MiniApps gratuitos forem lançados.
2. Atualizar o Service Worker para estratégia `stale-while-revalidate` nos assets e incluir fallback offline dedicado (HTML enxuto).
3. Preparar documentação de instalação iOS/Android e políticas de dados offline.
4. Reexecutar os audits Lighthouse em ambiente com Chrome e anexar os prints exigidos.

