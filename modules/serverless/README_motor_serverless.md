# 🤖 README: Motor Serverless — `relatorio_utils.js`  
**Versão:** v1.1-hardening • **Produto:** Painel Executivo 5 Horas P&A

Este documento é o guia oficial para instalar, configurar e usar o **Motor Serverless** do Painel Executivo.  
O arquivo `relatorio_utils.js` implementa **PWA Offline (IndexedDB)**, **Sincronização Multi-Dispositivo (Google Drive, OAuth GIS)**, **i18n** e rotinas de **Governança (LGPD)** — **sem backend próprio**.

---

## 📦 O que há nesta versão (v1.1-hardening)

Melhorias essenciais de robustez:

- **IndexedDB transacional:** `operateOnDB` agora resolve em `transaction.oncomplete` (evita condição de corrida).  
- **Renderização Offline real:** `fetchAndRender` usa cache (se houver) **antes** do fetch e renderiza com `cachedObject.data`.  
- **Revogação de token correta:** `logoutAllDevices` envia `token=` no **corpo** (`application/x-www-form-urlencoded`).  
- **Sincronização Drive (bootstrap):** documento orienta a persistência de `PREFS_FILE_ID_KEY` e “Last-Write-Wins” com `timestamp`.  
- **Tratamento de erros:** diretrizes de *retry/backoff* e telemetria mínima (logs).  
- **PWA/Service Worker:** recomendações para `stale-while-revalidate` e versionamento de cache.  

> **Compatibilidade:** substitui a v1.0.0. Não quebra API pública.  

---

## ⚙️ Pré-requisitos

### Dependências (HTML `<head>`)
- **Google Charts** (loader)  
- **i18next** (tradução)  
- **Google Identity Services (GIS)** — OAuth/Drive

```html
<script src="https://www.gstatic.com/charts/loader.js"></script>
<script>google.charts.load('current', {'packages':['corechart','table','gauge']});</script>
<script src="https://unpkg.com/i18next/i18next.min.js"></script>
<script src="/modules/serverless/relatorio_utils.js"></script>
```

### Configuração obrigatória
Edite no topo do `relatorio_utils.js`:

| Constante | Descrição | Exemplo |
|---|---|---|
| `GOOGLE_CLIENT_ID` | ID do cliente OAuth (GIS). | `xxxxxxxx.apps.googleusercontent.com` |
| `GAS_ENDPOINT_BASE` | URL de *deployment* do Google Apps Script (Web App). | `https://script.google.com/macros/s/.../exec` |

Outros parâmetros (default): `DB_NAME`, `DB_VERSION`, `STORE_REPORT`, `STORE_PREFS`, `PREFS_FILE_ID_KEY`, `BIOMETRIC_PREF_KEY`.

---

## 🧱 Arquitetura e Módulos

**1) Cache & Offline (IndexedDB)**  
- `openIndexedDB()` — cria/abre o banco e *object stores*  
- `operateOnDB()` — *helper transacional* (interno)  
- `saveDataToCache(key, data)` / `loadDataFromCache(key)` — persistência de relatórios

**2) Conexão & Renderização**  
- `getDataSourceUrl(type)` — compõe URL do GAS  
- `fetchAndRender(type, drawFn, elId)` — motor principal: **cache → fetch → render**

**3) Sincronização Multi-Dispositivo (Drive + OAuth GIS)**  
- `initGoogleAuth()` / `getAuthToken()` — autenticação GIS  
- `syncToDriveWithTimestamp(prefs)` — escreve prefs com `timestamp` *(privado)*  
- `loadAndResolveConflict()` — “Last-Write-Wins” entre local e nuvem *(privado)*  
- `loadUserPreferences()` — ponto de entrada; aplica resolução

**4) Governança & Segurança**  
- `clearLocalData()` — LGPD (apaga IndexedDB, Cache API e `localStorage`)  
- `logoutAllDevices()` — revoga token no Google + `clearLocalData`

**5) i18n & Preferências de Biometria**  
- `t(key)` — atalho para i18next  
- `setupBiometricToggle(elId)` / `getBiometricKey()` — UI/estado de biometria

**6) Inicialização**  
- `initializeLibrary()` — inicializa o motor e prepara o *hook* da app

---

## 🧪 API Pública (exportada em `window.relatorioUtils`)

| Função | Descrição |
|---|---|
| `initializeLibrary()` | Inicializa o motor do relatório no carregamento do Google Charts. |
| `t(key)` | Tradução via i18next. |
| `getDataSourceUrl(type)` | Monta a URL de dados (GAS). |
| `fetchAndRender(type, drawFn, elId)` | Carrega (cache/fetch) e renderiza via `drawFn`. |
| `openIndexedDB()` | Abre/cria o banco local. |
| `saveDataToCache(key, data)` | Persiste datasets. |
| `loadDataFromCache(key)` | Recupera datasets. |
| `getDataTable(jsonArray)` | Adapta Array 2D à Google DataTable. |
| `initGoogleAuth()` | Autentica usuário (GIS). |
| `loadUserPreferences()` | Prefs multi-dispositivo (Drive+Local). |
| `getAuthToken()` | Lê token em memória. |
| `setupBiometricToggle(elId)` | Inicializa UI de biometria. |
| `getBiometricKey()` | Lê preferência de biometria. |
| `clearLocalData()` | Limpa dados e caches do dispositivo. |
| `logoutAllDevices()` | Revoga token e limpa dados locais. |

**Internas (não exportadas):** `operateOnDB`, `syncToDriveWithTimestamp`, `loadAndResolveConflict`.

---

## 🔌 Exemplo de uso (HTML)

```html
<div id="chart-title"></div>
<div id="gauge_chart_div" style="height:220px;"></div>

<script>
  // 1) Inicialização do motor quando o Google Charts estiver pronto
  google.charts.setOnLoadCallback(relatorioUtils.initializeLibrary);

  // 2) Lógica do app — chamada por initializeLibrary() (ou manualmente)
  async function startAppLogic() {
    // i18n
    document.getElementById('chart-title').textContent = relatorioUtils.t('titles.gauge_title');

    // OAuth (opcional antes de preferências/sync)
    try { await relatorioUtils.initGoogleAuth(); } catch(e) { console.warn('OAuth opcional:', e); }

    // Preferências (Drive + Local)
    const prefs = await relatorioUtils.loadUserPreferences();

    // 3) Renderização com cache-first
    relatorioUtils.fetchAndRender('gauge', drawGaugeChart, 'gauge_chart_div');
  }

  // 4) Função de desenho (Google Charts)
  function drawGaugeChart(dataTable, elId, fromCache) {
    const chart = new google.visualization.Gauge(document.getElementById(elId));
    const options = { max: 100, minorTicks: 5 }; // ajuste seus options
    chart.draw(dataTable, options);
  }
</script>
```

> **Nota:** `fetchAndRender` tenta usar cache **imediatamente** (modo offline), e depois busca dados no GAS para atualizar e recachear.

---

## 🔐 Segurança & Governança

- **Token em memória:** `CURRENT_USER_ACCESS_TOKEN` **não é** persistido.  
- **Revogação adequada (GIS):**  
  ```js
  await fetch('https://oauth2.googleapis.com/revoke', {
    method: 'POST',
    headers: {'Content-Type':'application/x-www-form-urlencoded'},
    body: `token=${encodeURIComponent(token)}`
  });
  ```
- **LGPD:** `clearLocalData()` apaga IndexedDB, Cache API e `localStorage`.  
- **WebAuthn:** previsto no roadmap (enrollment/assertion).  
- **PII:** dados sensíveis (ex.: CEP) devem ser **transformados** (ex.: geohash, truncagem) antes de persistir.

---

## 🗄️ Sincronização Multi-Dispositivo (detalhes)

- **Resolução de conflito:** *Last-Write-Wins* via `timestamp` (`Date.now()`); documente fuso/hora e considere `serverTime`.  
- **Bootstrap de arquivo no Drive:** se `PREFS_FILE_ID_KEY` não existir no IndexedDB, crie/descubra o arquivo no Drive e salve `{key:PREFS_FILE_ID_KEY, value:<FILE_ID>}` em `STORE_PREFS`.  
- **Caminho sugerido no Drive:** pasta “5H-Painel/Prefs/`<env>`/`<user>`/`user_prefs.json`”.

---

## 🕸️ PWA & Service Worker (recomendado)

- **Estratégia:** `stale-while-revalidate` para assets e datasets pequenos.  
- **Versionamento de cache:** inclua sufixo `-vX` no nome do cache; limpe versões antigas no `activate`.  
- **IndexedDB schema:** suba `DB_VERSION` e faça migração em `onupgradeneeded`.

---

## 🧰 Contrato de Dados (relatórios do GAS)

- **Formato esperado pelo `getDataTable`:** array bidimensional (`Array<Array<any>>`), com linha 0 de cabeçalhos.  
- **Validação:** normalize tipos no GAS; quando possível, utilize *headers* estáveis.  
- **ETag/Last-Modified:** se disponível no GAS, habilite requisições condicionais e preserve o cache.

---

## 🧾 Changelog

- **v1.1-hardening**
  - `operateOnDB` passa a resolver em `tx.oncomplete` (consistência transacional).
  - `fetchAndRender` renderiza do cache (`cachedObject.data`) e depois atualiza.
  - Revogação GIS com `POST` no corpo (`token=`).
  - Diretrizes de bootstrap do `PREFS_FILE_ID_KEY` (Drive).
  - Notas de PWA, backoff e telemetria.
- **v1.0.0**
  - Versão inicial com PWA, GIS OAuth e IndexedDB básicos.

---

## 📁 Estrutura sugerida no repositório

```
/modules/serverless/relatorio_utils.js
/modules/serverless/README_motor_serverless.md  ← este arquivo
/app/index.html
/app/assets/...
/sw.js
```

---

## 📜 Licença

Este código integra o **Painel Executivo — 5 Horas P&A** e é licenciado para uso interno e **white-label** conforme contrato comercial vigente.

---
```
