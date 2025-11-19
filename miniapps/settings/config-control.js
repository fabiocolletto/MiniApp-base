const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';
const REFRESH_INTERVAL = 30_000; // 30s

const summaryElements = {
    usage: document.getElementById('memory-usage'),
    status: document.getElementById('memory-status'),
    free: document.getElementById('memory-free'),
};

const detailElements = {
    quota: document.getElementById('memory-quota'),
    usage: document.getElementById('memory-usage-detail'),
    free: document.getElementById('memory-free-detail'),
    progress: document.getElementById('memory-progress'),
    updated: document.getElementById('memory-updated'),
};

function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    const precision = value >= 100 || unitIndex === 0 ? 0 : 1;
    return `${value.toFixed(precision)} ${units[unitIndex]}`;
}

function defineStatus(percentage) {
    if (percentage >= 80) return 'Crítico';
    if (percentage >= 60) return 'Atenção';
    return 'Estável';
}

function updateSummary({ usage, free, status }) {
    if (summaryElements.usage) summaryElements.usage.textContent = usage;
    if (summaryElements.free) summaryElements.free.textContent = free;
    if (summaryElements.status) summaryElements.status.textContent = status;
}

function updateDetail({ quota, usage, free, percentage }) {
    if (detailElements.quota) detailElements.quota.textContent = quota;
    if (detailElements.usage) detailElements.usage.textContent = usage;
    if (detailElements.free) detailElements.free.textContent = free;
    if (detailElements.progress) detailElements.progress.style.width = `${percentage}%`;
    if (detailElements.updated) {
        const now = new Date();
        detailElements.updated.textContent = now.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    }
}

async function readStorageEstimate() {
    if (!navigator?.storage?.estimate) {
        throw new Error('StorageManager API não disponível.');
    }

    const estimate = await navigator.storage.estimate();
    const usage = estimate?.usageDetails?.indexedDB ?? estimate?.usage ?? 0;
    const quota = estimate?.quota ?? 0;

    return { usage, quota };
}

function applyEstimate({ usage, quota }) {
    const safeUsage = Math.max(usage || 0, 0);
    const safeQuota = Math.max(quota || 0, safeUsage);
    const free = Math.max(safeQuota - safeUsage, 0);
    const percentage = safeQuota ? Number(((safeUsage / safeQuota) * 100).toFixed(1)) : 0;
    const status = defineStatus(percentage);

    updateSummary({
        usage: formatBytes(safeUsage),
        free: formatBytes(free),
        status,
    });

    updateDetail({
        quota: formatBytes(safeQuota),
        usage: formatBytes(safeUsage),
        free: formatBytes(free),
        percentage,
    });
}

function handleEstimateError(error) {
    console.error('Não foi possível calcular o uso do IndexedDB', error);
    updateSummary({ usage: '--', free: '--', status: 'Indisponível' });
    updateDetail({
        quota: '--',
        usage: '--',
        free: '--',
        percentage: 0,
    });
}

async function refreshEstimate() {
    try {
        const estimate = await readStorageEstimate();
        applyEstimate(estimate);
    } catch (error) {
        handleEstimateError(error);
    }
}

function setupAutoRefresh() {
    refreshEstimate();
    setInterval(refreshEstimate, REFRESH_INTERVAL);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            refreshEstimate();
        }
    });
}

function setupToggleBehavior() {
    const card = document.getElementById('indexeddb-card');
    const detailPanel = document.getElementById('memory-detail-panel');
    if (!card || !detailPanel) return;

    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    let expanded = mediaQuery.matches;

    function updateExpandedState(forceValue) {
        const nextState = typeof forceValue === 'boolean' ? forceValue : !expanded;
        expanded = nextState;
        detailPanel.hidden = !expanded;
        card.dataset.expanded = expanded ? 'true' : 'false';
        card.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }

    updateExpandedState(mediaQuery.matches);

    card.addEventListener('click', () => {
        if (mediaQuery.matches) {
            updateExpandedState(true);
            return;
        }
        updateExpandedState();
    });

    mediaQuery.addEventListener('change', (event) => {
        updateExpandedState(event.matches);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    setupToggleBehavior();
    setupAutoRefresh();
});
