# IndexedDB Shared Layer

Este diretório consolida a camada oficial de acesso ao armazenamento local com IndexedDB para o MiniApp Base e para as MiniApps.

## Estrutura

- `databases.js` — pontos de entrada `openMarcoCore()` e `openPesquisaStudio()` que garantem o schema e retornam instâncias `IDBPDatabase` encapsuladas.
- `marcocore.js` — API de dados do banco `marco_core`, incluindo configurações, usuário mestre, catálogo de MiniApps, auditoria e cache de chave/valor.
- `surveystudio.js` — API do banco `pesquisa_studio` com coleções de surveys, fluxos, templates, variantes, terminais, presets, drafts, exports, runs e tags.
- `migrate.js` — migrador idempotente do legado `localStorage` para IndexedDB e utilitários de seed.
- `persistence.js` — funções para solicitar armazenamento persistente e consultar cota/uso.
- `README.md` — este guia rápido.

## Uso rápido

```js
import { openMarcoCore } from '../../shared/storage/idb/databases.js';
import { getSetting, setSetting, listAuditLog, kvCache } from '../../shared/storage/idb/marcocore.js';
import { upsertSurvey, listSurveys } from '../../shared/storage/idb/surveystudio.js';

const db = await openMarcoCore();
await setSetting('theme', 'dark');
const theme = await getSetting('theme');
const cacheEntry = await kvCache.set('catalog', { version: '1.0.0' }, 5 * 60 * 1000);
const recentAudits = await listAuditLog({ limit: 10 });

await upsertSurvey({ surveyId: 'launch-2025', name: 'Pesquisa de Lançamento' });
const surveys = await listSurveys({ status: 'draft' });
```

## Transações multi-store

As funções utilitárias encapsulam operações de leitura e escrita comuns. Para transações customizadas envolvendo múltiplas stores:

```js
import { openMarcoCore } from '../../shared/storage/idb/databases.js';

const db = await openMarcoCore();
const tx = db.transaction(['settings', 'miniapps_catalog'], 'readwrite');
const settingsStore = tx.objectStore('settings');
const catalogStore = tx.objectStore('miniapps_catalog');

await settingsStore.put({ key: 'locale', value: 'pt-BR', updatedAt: new Date().toISOString() });
await catalogStore.put({ id: 'task-manager', name: 'Gestão de Trabalho', route: '/miniapps/task-manager' });
await tx.done;
```

## Consultas por índice

Os bancos expõem índices declarados na migração inicial. Exemplos:

```js
import { openMarcoCore } from '../../shared/storage/idb/databases.js';
import { openPesquisaStudio } from '../../shared/storage/idb/databases.js';

const marcoDb = await openMarcoCore();
const auditsByApp = await marcoDb.getAllFromIndex('audit_log', 'by_app', 'survey-studio');
const catalogByRoute = await marcoDb.getFromIndex('miniapps_catalog', 'by_route', '/miniapps/task-manager');

const pesquisaDb = await openPesquisaStudio();
const publishedSurveys = await pesquisaDb.getAllFromIndex('surveys', 'by_status', 'published');
const variantsByTerminal = await pesquisaDb.getAllFromIndex('variants', 'by_terminal', 'curitiba-lapa');
const tagged = await pesquisaDb.getAllFromIndex('tags', 'surveys_multi', 'launch-2025');
```

Para índices compostos (`variants` usa `[surveyId, variantId]`) forneça o par como array: `db.get('variants', ['launch-2025', 'variant-a'])`.
