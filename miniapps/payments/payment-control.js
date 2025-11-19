const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';
const MERCADO_PAGO_BASE_URL = 'https://www.mercadopago.com.br/';

const PAYMENT_SUBSCRIPTIONS = [
    {
        region: 'br',
        provider: 'mercado_pago',
        planName: 'Assistente Marco',
        amount: 350,
        currency: 'BRL',
        billingPeriod: 'mês',
        status: 'active',
        nextCharge: '2024-11-05',
        history: [
            { date: '2024-10-05', amount: 350, status: 'paid' },
            { date: '2024-09-05', amount: 350, status: 'paid' },
            { date: '2024-08-05', amount: 350, status: 'pending' },
        ],
    },
];

const subscriptionElements = {
    planSummary: document.getElementById('subscription-plan-summary'),
    statusSummary: document.getElementById('subscription-status-summary'),
    statusBadge: document.getElementById('subscription-status-badge'),
    nextChargeSummary: document.getElementById('subscription-next-charge-summary'),
    providerSummary: document.getElementById('subscription-provider'),
    planDetail: document.getElementById('subscription-plan-detail'),
    statusDetail: document.getElementById('subscription-status-detail'),
    nextChargeDetail: document.getElementById('subscription-next-charge-detail'),
    manageButton: document.getElementById('subscription-manage-button'),
    updatePaymentButton: document.getElementById('subscription-update-button'),
    viewDetailsButton: document.getElementById('subscription-details-button'),
    historyBody: document.getElementById('subscription-history-body'),
};

function formatCurrencyBRL(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    }).format(value ?? 0);
}

function formatChargeDate(dateInput) {
    if (!dateInput) return 'Sem previsão';
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return 'Sem previsão';
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function getStatusMetadata(status) {
    const normalized = (status || '').toLowerCase();
    const dictionary = {
        active: { label: 'Ativo', variant: 'success' },
        pending: { label: 'Pendente', variant: 'warning' },
        expired: { label: 'Expirado', variant: 'danger' },
        paid: { label: 'Pago', variant: 'success' },
        failed: { label: 'Falhou', variant: 'danger' },
        refunded: { label: 'Reembolsado', variant: 'neutral' },
    };
    return dictionary[normalized] ?? { label: status ?? '--', variant: 'neutral' };
}

function renderSubscriptionHistory(history = []) {
    if (!subscriptionElements.historyBody) return;

    if (!history.length) {
        subscriptionElements.historyBody.innerHTML = `
            <tr>
                <td colspan="3">Sem cobranças registradas</td>
            </tr>
        `;
        return;
    }

    const rows = history.map((entry) => {
        const { label, variant } = getStatusMetadata(entry.status);
        return `
            <tr>
                <td>${formatChargeDate(entry.date)}</td>
                <td>${formatCurrencyBRL(entry.amount)}</td>
                <td><span class="history-status" data-variant="${variant}">${label}</span></td>
            </tr>
        `;
    });
    subscriptionElements.historyBody.innerHTML = rows.join('');
}

function hydrateSubscriptionCard(data) {
    if (!data || data.provider !== 'mercado_pago') return;
    const planLabel = `${data.planName} – ${formatCurrencyBRL(data.amount)}/${data.billingPeriod}`;
    const { label, variant } = getStatusMetadata(data.status);
    const nextCharge = formatChargeDate(data.nextCharge);

    if (subscriptionElements.planSummary) subscriptionElements.planSummary.textContent = data.planName;
    if (subscriptionElements.statusSummary) subscriptionElements.statusSummary.textContent = label;
    if (subscriptionElements.nextChargeSummary) subscriptionElements.nextChargeSummary.textContent = nextCharge;
    if (subscriptionElements.planDetail) subscriptionElements.planDetail.textContent = planLabel;
    if (subscriptionElements.statusDetail) subscriptionElements.statusDetail.textContent = label;
    if (subscriptionElements.nextChargeDetail) subscriptionElements.nextChargeDetail.textContent = nextCharge;

    const badge = subscriptionElements.statusBadge;
    if (badge) {
        badge.textContent = label;
        badge.dataset.variant = variant;
    }

    if (subscriptionElements.providerSummary) subscriptionElements.providerSummary.textContent = 'Mercado Pago';

    const actionButtons = [
        subscriptionElements.manageButton,
        subscriptionElements.updatePaymentButton,
        subscriptionElements.viewDetailsButton,
    ];

    actionButtons.forEach((button) => {
        if (!button) return;
        button.dataset.provider = data.provider;
        button.href = MERCADO_PAGO_BASE_URL;
    });

    renderSubscriptionHistory(data.history);
}

function setupExpandableCard({ triggerId, panelId }) {
    const trigger = document.getElementById(triggerId);
    const detailPanel = document.getElementById(panelId);
    if (!trigger || !detailPanel) return;

    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    let expanded = mediaQuery.matches;

    function updateExpandedState(forceValue) {
        const nextState = typeof forceValue === 'boolean' ? forceValue : !expanded;
        expanded = nextState;
        detailPanel.hidden = !expanded;
        trigger.dataset.expanded = expanded ? 'true' : 'false';
        trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }

    updateExpandedState(mediaQuery.matches);

    trigger.addEventListener('click', () => {
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

function initPaymentCard() {
    const brazilSubscription = PAYMENT_SUBSCRIPTIONS.find(
        (item) => item.region === 'br' && item.provider === 'mercado_pago'
    );
    hydrateSubscriptionCard(brazilSubscription);
    setupExpandableCard({ triggerId: 'subscription-card', panelId: 'subscription-detail-panel' });
}

window.addEventListener('DOMContentLoaded', () => {
    initPaymentCard();
});
