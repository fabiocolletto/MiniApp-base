/**
 * Biblioteca de Funções Essenciais (Utility Library) - relatorio_utils.js
 * Criada para performance PWA (IndexedDB), Multi-Dispositivo (Serverless Sync)
 * e segurança (WebAuthn/OAuth).
 */

// --- I. CONFIGURAÇÕES GLOBAIS (AJUSTE NECESSÁRIO) ---
const APP_CONFIG = {
    // Substitua pelo seu ID de Cliente do Google para o fluxo OAuth
    GOOGLE_CLIENT_ID: "SEU_CLIENT_ID_DO_GOOGLE_AQUI", 
    
    // Substitua pela URL base do seu Google Apps Script Web App (Endpoint único)
    GAS_ENDPOINT_BASE: 'SUA_URL_DO_GAS_AQUI',
    
    DB_NAME: 'PainelPrefeitoDB',
    DB_VERSION: 1,
    STORE_REPORT: 'report_data',
    STORE_PREFS: 'user_prefs',
    PREFS_FILE_ID_KEY: 'drive_file_id',
    BIOMETRIC_PREF_KEY: 'biometric_enabled'
};

// Variáveis de estado global (não salvas)
let CURRENT_USER_ACCESS_TOKEN = null;

// Estado em memória para agregados de pesquisas
let reportAggregatesCache = null;
let reportAggregatesPromise = null;
const reportAggregateListeners = new Set();
let reportBroadcastChannel = null;
let broadcastInitialized = false;

const REPORT_BROADCAST_CHANNEL = 'relatorio-report-data';
const REPORT_STORAGE_KEY = 'relatorio:lastReportUpdate';

const SECTOR_ALIASES = {
    saude: 'saude',
    saúde: 'saude',
    health: 'saude',
    health_care: 'saude',
    educacao: 'educacao',
    educação: 'educacao',
    education: 'educacao',
    transporte: 'transporte',
    mobility: 'transporte',
    transport: 'transporte',
    seguranca: 'seguranca',
    segurança: 'seguranca',
    security: 'seguranca',
    meioambiente: 'meioambiente',
    meio_ambiente: 'meioambiente',
    environment: 'meioambiente',
    environment_protection: 'meioambiente'
};

const AGE_ALIASES = {
    '16-24': '16_24',
    '16–24': '16_24',
    '16_24': '16_24',
    '16 a 24': '16_24',
    '25-34': '25_34',
    '25–34': '25_34',
    '25_34': '25_34',
    '25 a 34': '25_34',
    '35-44': '35_44',
    '35–44': '35_44',
    '35_44': '35_44',
    '35 a 44': '35_44',
    '45-59': '45_59',
    '45–59': '45_59',
    '45_59': '45_59',
    '45 a 59': '45_59',
    '60+': '60_plus',
    '60_plus': '60_plus',
    '60+ anos': '60_plus',
    '60 a mais': '60_plus'
};

const GENDER_ALIASES = {
    feminino: 'female',
    female: 'female',
    mulher: 'female',
    mulheres: 'female',
    masculino: 'male',
    male: 'male',
    homem: 'male',
    homens: 'male',
    nbinario: 'nonbinary',
    'não-binário': 'nonbinary',
    'nao-binario': 'nonbinary',
    nonbinary: 'nonbinary',
    outro: 'other',
    outros: 'other',
    other: 'other',
    prefiro_nao_responder: 'other',
    undefined: 'other'
};

function normalizeString(value) {
    if (value === null || value === undefined) return '';
    return String(value).trim();
}

function normalizeKey(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
}

function toNumber(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const normalized = value.replace(/\./g, '').replace(',', '.');
        const parsed = Number.parseFloat(normalized);
        return Number.isFinite(parsed) ? parsed : null;
    }
    if (typeof value === 'boolean') {
        return value ? 1 : 0;
    }
    return null;
}

function toPositiveInteger(value, fallback = 0) {
    const num = toNumber(value);
    if (num === null) return fallback;
    const rounded = Math.max(0, Math.floor(num));
    return Number.isFinite(rounded) ? rounded : fallback;
}

function inferSectorKey(raw) {
    const normalized = normalizeKey(raw);
    if (!normalized) return null;
    if (SECTOR_ALIASES[normalized]) return SECTOR_ALIASES[normalized];
    return normalized;
}

function inferAgeKey(raw) {
    const cleaned = normalizeString(raw);
    if (!cleaned) return null;
    const normalized = normalizeKey(cleaned);
    if (AGE_ALIASES[cleaned]) return AGE_ALIASES[cleaned];
    if (AGE_ALIASES[normalized]) return AGE_ALIASES[normalized];
    return normalized || null;
}

function inferGenderKey(raw) {
    const cleaned = normalizeString(raw);
    if (!cleaned) return null;
    const normalized = normalizeKey(cleaned);
    if (GENDER_ALIASES[cleaned.toLowerCase()]) return GENDER_ALIASES[cleaned.toLowerCase()];
    if (GENDER_ALIASES[normalized]) return GENDER_ALIASES[normalized];
    return normalized || null;
}

function inferNeighborhood(raw) {
    const cleaned = normalizeString(raw);
    if (!cleaned) return null;
    return cleaned;
}

function parsePeriod(raw) {
    if (!raw && raw !== 0) return null;
    if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
        return `${raw.getFullYear()}-${String(raw.getMonth() + 1).padStart(2, '0')}`;
    }
    const text = normalizeString(raw);
    if (!text) return null;
    const isoMatch = text.match(/(20\d{2})[-/](\d{1,2})/);
    if (isoMatch) {
        const year = Number.parseInt(isoMatch[1], 10);
        const month = Number.parseInt(isoMatch[2], 10);
        if (Number.isFinite(year) && Number.isFinite(month)) {
            return `${year}-${String(month).padStart(2, '0')}`;
        }
    }
    const localeMatch = text.match(/(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez|jan\.|feb|mar\.|apr|may|jun|jul|aug|sep|oct|nov|dec)[^0-9]*(20\d{2})/i);
    if (localeMatch) {
        const monthIndex = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        let candidate = localeMatch[1].toLowerCase().slice(0, 3);
        if (candidate === 'mai') candidate = 'may';
        if (candidate === 'ago') candidate = 'aug';
        if (candidate === 'set') candidate = 'sep';
        if (candidate === 'out') candidate = 'oct';
        if (candidate === 'dez') candidate = 'dec';
        const idx = monthIndex.indexOf(candidate);
        const year = Number.parseInt(localeMatch[2], 10);
        if (idx >= 0 && Number.isFinite(year)) {
            return `${year}-${String(idx + 1).padStart(2, '0')}`;
        }
    }
    return null;
}

function ensureBroadcastListeners() {
    if (broadcastInitialized || typeof window === 'undefined') return;
    broadcastInitialized = true;
    if (typeof BroadcastChannel !== 'undefined') {
        reportBroadcastChannel = new BroadcastChannel(REPORT_BROADCAST_CHANNEL);
        reportBroadcastChannel.onmessage = (event) => {
            if (!event || !event.data) return;
            const { type } = event.data;
            if (type === 'report-data-update') {
                refreshReportAggregates({ reason: 'broadcast' });
            }
        };
    }
    window.addEventListener('storage', (event) => {
        if (event?.key === REPORT_STORAGE_KEY) {
            refreshReportAggregates({ reason: 'storage' });
        }
    });
}

function emitToListeners(payload, meta = {}) {
    reportAggregateListeners.forEach((listener) => {
        try {
            listener(payload, meta);
        } catch (error) {
            console.error('RelatorioUtils listener error:', error);
        }
    });
}

async function listReportRecords() {
    try {
        const records = await operateOnDB(APP_CONFIG.STORE_REPORT, 'readonly', (store) => store.getAll());
        return Array.isArray(records) ? records : [];
    } catch (error) {
        console.warn('RelatorioUtils: falha ao listar report_data', error);
        return [];
    }
}

function normalizeRowObject(row) {
    if (!row || typeof row !== 'object') return null;
    const normalized = {};
    Object.keys(row).forEach((key) => {
        const normKey = normalizeKey(key);
        normalized[normKey] = row[key];
    });
    return normalized;
}

function convertTableToObjects(table) {
    if (!Array.isArray(table) || !table.length) return [];
    const [header, ...rows] = table;
    if (!Array.isArray(header)) return [];
    const headerKeys = header.map((h) => normalizeKey(h));
    return rows
        .filter((row) => Array.isArray(row))
        .map((row) => {
            const obj = {};
            row.forEach((value, index) => {
                const key = headerKeys[index] || `col_${index}`;
                obj[key] = value;
            });
            return obj;
        });
}

function flattenReportEntries(records) {
    const entries = [];
    records.forEach((record) => {
        const data = record?.data;
        if (!data) return;
        if (Array.isArray(data)) {
            if (data.length && Array.isArray(data[0])) {
                entries.push(...convertTableToObjects(data));
            } else {
                data.forEach((item) => {
                    if (!item) return;
                    if (Array.isArray(item)) {
                        entries.push(...convertTableToObjects([item]));
                    } else if (typeof item === 'object') {
                        entries.push(normalizeRowObject(item) || {});
                    }
                });
            }
        } else if (typeof data === 'object') {
            if (Array.isArray(data.rows)) {
                entries.push(...convertTableToObjects(data.rows));
            } else if (Array.isArray(data.values)) {
                entries.push(...convertTableToObjects(data.values));
            } else {
                entries.push(normalizeRowObject(data) || {});
            }
        }
    });
    return entries.filter((entry) => entry && typeof entry === 'object');
}

function computePersonaAggregates(entries) {
    const genderCounts = new Map();
    const ageCounts = new Map();
    const neighborhoodCounts = new Map();
    let total = 0;

    entries.forEach((entry) => {
        const weight = toPositiveInteger(entry.responses ?? entry.respondentes ?? entry.samples ?? entry.total ?? 1, 1) || 1;
        const genderKey = inferGenderKey(entry.gender ?? entry.genero ?? entry.sexo);
        const ageKey = inferAgeKey(entry.age ?? entry.age_range ?? entry.faixa_etaria ?? entry.faixa ?? entry.idade);
        const neighborhood = inferNeighborhood(entry.neighborhood ?? entry.bairro ?? entry.regiao ?? entry.distrito);

        total += weight;
        if (genderKey) {
            genderCounts.set(genderKey, (genderCounts.get(genderKey) || 0) + weight);
        }
        if (ageKey) {
            ageCounts.set(ageKey, (ageCounts.get(ageKey) || 0) + weight);
        }
        if (neighborhood) {
            const key = neighborhood.toLowerCase();
            neighborhoodCounts.set(key, {
                key,
                label: neighborhood,
                count: (neighborhoodCounts.get(key)?.count || 0) + weight,
            });
        }
    });

    const genders = Array.from(genderCounts.entries()).map(([key, count]) => ({
        key,
        count,
        percentage: total ? count / total : 0,
    }));

    const ages = Array.from(ageCounts.entries()).map(([key, count]) => ({
        key,
        count,
        percentage: total ? count / total : 0,
    }));

    const neighborhoods = Array.from(neighborhoodCounts.values())
        .map((item) => ({
            key: item.key,
            label: item.label,
            count: item.count,
            percentage: total ? item.count / total : 0,
        }));

    const sortedNeighborhoods = neighborhoods.sort((a, b) => b.count - a.count);

    return {
        total,
        genders: genders.sort((a, b) => b.count - a.count),
        ages: ages.sort((a, b) => b.count - a.count),
        neighborhoods: sortedNeighborhoods,
    };
}

function computeKpiAggregates(entries) {
    const sectors = new Map();

    entries.forEach((entry) => {
        const sectorKey = inferSectorKey(entry.sector ?? entry.setor ?? entry.segmento ?? entry.categoria ?? entry.area);
        if (!sectorKey) return;
        const rating = toNumber(entry.rating ?? entry.nota ?? entry.score ?? entry.media ?? entry.average);
        if (!Number.isFinite(rating)) return;
        const weight = toPositiveInteger(entry.responses ?? entry.respondentes ?? entry.samples ?? entry.total ?? 1, 1) || 1;
        const delta = toNumber(entry.delta ?? entry.variacao ?? entry.diferenca);
        let previous = toNumber(entry.previousrating ?? entry.previous ?? entry.nota_anterior ?? entry.base ?? entry.anterior);
        if (!Number.isFinite(previous) && Number.isFinite(delta)) {
            previous = rating - delta;
        }

        if (!sectors.has(sectorKey)) {
            sectors.set(sectorKey, {
                key: sectorKey,
                sum: 0,
                count: 0,
                prevSum: 0,
                prevCount: 0,
                deltas: [],
            });
        }

        const bucket = sectors.get(sectorKey);
        bucket.sum += rating * weight;
        bucket.count += weight;
        if (Number.isFinite(previous)) {
            bucket.prevSum += previous * weight;
            bucket.prevCount += weight;
        }
        if (Number.isFinite(delta)) {
            bucket.deltas.push({ value: delta, weight });
        }
    });

    const result = [];
    sectors.forEach((bucket, key) => {
        const average = bucket.count ? bucket.sum / bucket.count : null;
        const previousAverage = bucket.prevCount ? bucket.prevSum / bucket.prevCount : null;
        let delta = null;
        if (bucket.deltas.length) {
            const totalWeight = bucket.deltas.reduce((acc, item) => acc + item.weight, 0);
            const weighted = bucket.deltas.reduce((acc, item) => acc + item.value * item.weight, 0);
            delta = totalWeight ? weighted / totalWeight : null;
        } else if (Number.isFinite(average) && Number.isFinite(previousAverage)) {
            delta = average - previousAverage;
        }
        result.push({
            key,
            average,
            previousAverage,
            delta,
            responses: bucket.count,
        });
    });

    return result;
}

function computeDistribution(entries) {
    const distribution = {
        total: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
    };

    entries.forEach((entry) => {
        const rating = toNumber(entry.rating ?? entry.nota ?? entry.score ?? entry.media ?? entry.average);
        if (!Number.isFinite(rating)) return;
        const weight = toPositiveInteger(entry.responses ?? entry.respondentes ?? entry.samples ?? entry.total ?? 1, 1) || 1;
        distribution.total += weight;
        if (rating >= 4) {
            distribution.positive += weight;
        } else if (rating >= 3) {
            distribution.neutral += weight;
        } else {
            distribution.negative += weight;
        }
    });

    return distribution;
}

function computeMonthly(entries) {
    const byPeriod = new Map();
    entries.forEach((entry) => {
        const period = parsePeriod(entry.period ?? entry.mes ?? entry.mes_ano ?? entry.month ?? entry.data ?? entry.timestamp);
        if (!period) return;
        const weight = toPositiveInteger(entry.responses ?? entry.respondentes ?? entry.samples ?? entry.total ?? 1, 1) || 1;
        const current = byPeriod.get(period) || 0;
        byPeriod.set(period, current + weight);
    });
    const items = Array.from(byPeriod.entries())
        .map(([period, count]) => ({ period, count }))
        .sort((a, b) => (a.period < b.period ? -1 : 1));
    return items;
}

function computeSectorShare(kpis) {
    const total = kpis.reduce((acc, item) => acc + (item.responses || 0), 0);
    return kpis.map((item) => ({
        key: item.key,
        percentage: total ? (item.responses || 0) / total : 0,
    }));
}

async function computeReportAggregates() {
    const records = await listReportRecords();
    const entries = flattenReportEntries(records);

    const persona = computePersonaAggregates(entries);
    const kpis = computeKpiAggregates(entries);
    const distribution = computeDistribution(entries);
    const monthly = computeMonthly(entries);
    const sectorShare = computeSectorShare(kpis);

    const updatedAt = records.reduce((acc, record) => {
        const ts = Number(record?.timestamp);
        if (Number.isFinite(ts)) {
            return Math.max(acc, ts);
        }
        return acc;
    }, 0);

    return {
        persona,
        kpis,
        indicators: {
            distribution,
            monthly,
            sectorShare,
            kpis,
            persona,
        },
        meta: {
            updatedAt: updatedAt || null,
            totalEntries: entries.length,
            sources: records.map((record) => record?.key).filter(Boolean),
        },
    };
}

async function getReportAggregates({ forceRefresh = false } = {}) {
    ensureBroadcastListeners();
    if (!forceRefresh && reportAggregatesCache) {
        return reportAggregatesCache;
    }
    if (forceRefresh) {
        reportAggregatesPromise = null;
    }
    if (!reportAggregatesPromise) {
        reportAggregatesPromise = computeReportAggregates()
            .then((result) => {
                reportAggregatesCache = result;
                return result;
            })
            .catch((error) => {
                console.error('RelatorioUtils: falha ao calcular agregados', error);
                reportAggregatesPromise = null;
                throw error;
            });
    }
    const output = await reportAggregatesPromise;
    return output;
}

async function refreshReportAggregates({ reason = 'refresh', broadcast = false } = {}) {
    try {
        const result = await getReportAggregates({ forceRefresh: true });
        emitToListeners(result, { reason });
    } catch (error) {
        emitToListeners(null, { reason, error });
    }
    if (broadcast) {
        try {
            if (reportBroadcastChannel) {
                reportBroadcastChannel.postMessage({ type: 'report-data-update', ts: Date.now() });
            }
            if (typeof window !== 'undefined') {
                localStorage.setItem(REPORT_STORAGE_KEY, String(Date.now()));
            }
        } catch (error) {
            console.warn('RelatorioUtils: falha ao notificar broadcast', error);
        }
    }
}

function subscribeToReportAggregates(listener) {
    ensureBroadcastListeners();
    if (typeof listener !== 'function') return () => {};
    reportAggregateListeners.add(listener);
    if (reportAggregatesCache) {
        try {
            listener(reportAggregatesCache, { reason: 'hydrate' });
        } catch (error) {
            console.error('RelatorioUtils listener error:', error);
        }
    }
    return () => {
        reportAggregateListeners.delete(listener);
    };
}

// --- II. MÓDULO DE CACHE E OFFLINE (IndexedDB) ---

// 5. openIndexedDB()
async function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(APP_CONFIG.DB_NAME, APP_CONFIG.DB_VERSION);

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            // Cria stores para dados (relatórios) e preferências (configurações)
            if (!db.objectStoreNames.contains(APP_CONFIG.STORE_REPORT)) {
                db.createObjectStore(APP_CONFIG.STORE_REPORT, { keyPath: 'key' });
            }
            if (!db.objectStoreNames.contains(APP_CONFIG.STORE_PREFS)) {
                db.createObjectStore(APP_CONFIG.STORE_PREFS, { keyPath: 'key' });
            }
        };

        request.onsuccess = function(event) {
            resolve(event.target.result);
        };

        request.onerror = function(event) {
            console.error("IndexedDB Error:", event.target.error);
            reject(new Error("Erro ao abrir o IndexedDB."));
        };
    });
}

// Funções utilitárias para operar no IndexedDB
async function operateOnDB(storeName, mode, callback) {
    const db = await openIndexedDB();
    const transaction = db.transaction([storeName], mode);
    const store = transaction.objectStore(storeName);
    return new Promise((resolve, reject) => {
        transaction.onerror = () => reject(transaction.error);
        
        const request = callback(store);
        request.onsuccess = () => resolve(request.result);
    });
}

// 6. saveDataToCache(key, data) - Persiste JSON de relatório (Assíncrono)
async function saveDataToCache(key, data) {
    await operateOnDB(APP_CONFIG.STORE_REPORT, 'readwrite', (store) =>
        store.put({ key: key, data: data, timestamp: Date.now() })
    );
    reportAggregatesPromise = null;
    await refreshReportAggregates({ reason: 'local-update', broadcast: true });
}

// 7. loadDataFromCache(key) - Carrega JSON de relatório
async function loadDataFromCache(key) {
    return operateOnDB(APP_CONFIG.STORE_REPORT, 'readonly', (store) => store.get(key));
}

// --- III. SINCRONIZAÇÃO MULTI-DISPOSITIVO (Serverless Drive Sync) ---

// 15. getAuthToken() - Retorna o token de acesso (para chamadas ao Drive)
function getAuthToken() {
    return CURRENT_USER_ACCESS_TOKEN;
}

// 9. initGoogleAuth() - Inicia o fluxo de autorização OAuth
async function initGoogleAuth() {
    return new Promise((resolve, reject) => {
        const client = google.accounts.oauth2.initTokenClient({
            client_id: APP_CONFIG.GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/drive.file',
            callback: (tokenResponse) => {
                if (tokenResponse.error) {
                    console.error("OAuth Error:", tokenResponse.error);
                    reject(new Error("Falha na autorização Google."));
                    return;
                }
                CURRENT_USER_ACCESS_TOKEN = tokenResponse.access_token;
                resolve(tokenResponse.access_token);
            },
        });
        // Solicita o token
        client.requestAccessToken();
    });
}

// 10. syncToDriveWithTimestamp(prefs) - Escreve o JSON de prefs no Drive
async function syncToDriveWithTimestamp(prefs) {
    const token = getAuthToken();
    if (!token) return;

    // 1. Adiciona o timestamp de controle (Last Write Wins)
    prefs.timestamp = Date.now();
    
    // 2. Busca o ID do arquivo de prefs no IndexedDB local
    const fileIdObj = await operateOnDB(APP_CONFIG.STORE_PREFS, 'readonly', (store) => store.get(APP_CONFIG.PREFS_FILE_ID_KEY));
    const fileId = fileIdObj ? fileIdObj.value : null;
    const isUpdate = !!fileId;

    // ... (Lógica de chamada à API do Google Drive)

    // Simulação da chamada ao Google Drive API
    console.log("Sincronizando preferências com o Google Drive. Versão: " + prefs.timestamp);

    // 3. Salva a versão FINAL no IndexedDB local para uso imediato
    await operateOnDB(APP_CONFIG.STORE_PREFS, 'readwrite', (store) => store.put({ key: 'user_settings', ...prefs }));
}

// 11. loadAndResolveConflict() - Carrega e resolve conflitos de Timestamp
async function loadAndResolveConflict() {
    const token = getAuthToken();
    const fileIdObj = await operateOnDB(APP_CONFIG.STORE_PREFS, 'readonly', (store) => store.get(APP_CONFIG.PREFS_FILE_ID_KEY));
    
    let cloudPrefs = null;
    // ... (Lógica para buscar o arquivo JSON do Drive, se houver token/fileId)

    const localPrefs = await operateOnDB(APP_CONFIG.STORE_PREFS, 'readonly', (store) => store.get('user_settings'));
    
    let finalPrefs = { [APP_CONFIG.BIOMETRIC_PREF_KEY]: false, timestamp: 0 }; // Default
    
    // Resolução: Last Write Wins (Compara timestamps da Nuvem e Local)
    if (cloudPrefs && localPrefs) {
        if (cloudPrefs.timestamp > localPrefs.timestamp) {
            finalPrefs = cloudPrefs;
        } else {
            finalPrefs = localPrefs;
        }
    } else if (cloudPrefs) {
        finalPrefs = cloudPrefs;
    } else if (localPrefs) {
        finalPrefs = localPrefs;
    }
    
    // Salva a versão resolvida no IndexedDB e, se for a versão local que venceu, no Drive
    await operateOnDB(APP_CONFIG.STORE_PREFS, 'readwrite', (store) => store.put({ key: 'user_settings', ...finalPrefs }));
    
    return finalPrefs;
}

// 12. loadUserPreferences() - Ponto de entrada do Multi-Dispositivo
async function loadUserPreferences() {
    try {
        const preferences = await loadAndResolveConflict();
        // Aqui o Painel aplicaria as configurações (ex: idioma, ativação de biometria)
        return preferences;
    } catch (error) {
        console.error("Falha na sincronização de preferências. Usando padrões.", error);
        return { [APP_CONFIG.BIOMETRIC_PREF_KEY]: false };
    }
}

// --- IV. MÓDULO DE CONEXÃO E RENDERIZAÇÃO ---

// 3. getDataSourceUrl(type)
function getDataSourceUrl(type) {
    if (!APP_CONFIG.GAS_ENDPOINT_BASE) throw new Error("GAS_ENDPOINT_BASE não configurada.");
    return `${APP_CONFIG.GAS_ENDPOINT_BASE}?type=${type}`;
}

// 4. fetchAndRender(type, drawFn, elId) - Motor Principal
async function fetchAndRender(type, drawFn, elId) {
    const key = `report_data_${type}`;
    
    const cachedObject = await loadDataFromCache(key);

    // 1. Tenta carregar o cache (Offline)
    if (cachedObject) {
        // ... Renderiza
    } 

    // 2. Tenta buscar dados novos (Online)
    try {
        const response = await fetch(getDataSourceUrl(type));
        const dataArray = await response.json();

        // 3. Sucesso: Salva no IndexedDB e Renderiza
        await saveDataToCache(key, dataArray); 
        drawFn(getDataTable(dataArray), elId, false);
    } catch (error) {
        if (!cachedObject) {
            // ... Trata erro
        }
    }
}

// --- V. SEGURANÇA E GOVERNANÇA ---

// 16. clearLocalData() - Direito à Exclusão (LGPD)
async function clearLocalData() {
    // 1. Limpa IndexedDB
    await new Promise((resolve, reject) => {
        const req = indexedDB.deleteDatabase(APP_CONFIG.DB_NAME);
        req.onsuccess = () => resolve();
        req.onerror = (e) => reject(e);
    });
    // 2. Limpa Cache API (o Service Worker fará o resto)
    if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
    }
    // 3. Limpa localStorage (token e IDs)
    localStorage.clear();
    console.log("Todos os dados e caches locais foram excluídos.");
    return true;
}

// 17. logoutAllDevices() - Logout Universal
async function logoutAllDevices() {
    const token = getAuthToken();
    if (!token) return true;

    // Revoga o token do Google, desconectando o usuário de todos os dispositivos
    const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
        method: 'POST',
        headers: { 'Content-type': 'application/x-www-form-urlencoded' }
    });

    if (response.ok) {
        console.log("Logout Universal SUCEDIDO: Token revogado.");
        await clearLocalData(); // Limpa também os dados locais após o logout
        CURRENT_USER_ACCESS_TOKEN = null;
        return true;
    } else {
        console.error("Logout Universal FALHOU. Código:", response.status);
        return false;
    }
}

// 13. setupBiometricToggle(elId)
function setupBiometricToggle(elId) {
    // Código para inicializar o switch de biometria (omissão para o foco da lista)
    console.log("Setup Biometria (Função 13) pronto para ser implementado.");
}

// 14. getBiometricKey()
function getBiometricKey() {
    return localStorage.getItem(APP_CONFIG.BIOMETRIC_PREF_KEY) === 'true';
}

// 8. getDataTable(jsonArray)
function getDataTable(jsonArray) {
    return google.visualization.arrayToDataTable(jsonArray);
}

// 2. t(key)
const t = (key) => {
    if (typeof i18next !== 'undefined' && i18next.t) {
        return i18next.t(key);
    }
    return key;
};

// 1. initializeLibrary()
function initializeLibrary() {
    console.log("Biblioteca de Relatórios (Motor) Inicializada.");
    // NOTA: O fluxo de initGoogleAuth deve ser chamado no HTML para iniciar a autenticação
}


// --- EXPORTAÇÕES GLOBAIS ---
window.relatorioUtils = {
    initializeLibrary,
    t,
    getDataSourceUrl,
    fetchAndRender,
    openIndexedDB,
    saveDataToCache,
    loadDataFromCache,
    getDataTable,
    initGoogleAuth,
    loadUserPreferences,
    getAuthToken,
    setupBiometricToggle,
    getBiometricKey,
    getReportAggregates,
    refreshReportAggregates,
    subscribeToReportAggregates,
    // Funções de Segurança e Governança
    clearLocalData,
    logoutAllDevices
};
