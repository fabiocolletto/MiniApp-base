// =============================================================
// 4) docs/microapps/catalogo/Catalogo.js
// =============================================================
export const catalogoJs = `
let container = null;
let modalOverlay = null;
let examData = [];

const productCards = [
    {
        id: 'simulados',
        title: 'Simulados',
        description: 'Pratique provas anteriores com o app de quiz.',
        color: '#ec4899',
        icon: 'edit_note',
        url: 'products/educacao/app-quiz/index.html',
        basePath: 'products/educacao/app-quiz/'
    },
    {
        id: 'cadastro',
        title: 'Cadastro do estudante',
        description: 'Atualize seus dados e acompanhe o progresso.',
        color: '#6366f1',
        icon: 'app_registration',
        href: '/educacao'
    }
];

function createCard(item) {
    const card = document.createElement('div');
    card.className = 'card-base catalog-card';
    card.style.borderColor = item.color;
    card.style.backgroundColor = `${item.color}1a`;

    const icon = document.createElement('span');
    icon.className = 'material-symbols-rounded catalog-card__icon';
    icon.textContent = item.icon;
    icon.style.color = item.color;
    card.appendChild(icon);

    const title = document.createElement('h3');
    title.className = 'catalog-card__title';
    title.textContent = item.title;
    title.style.color = item.color;
    card.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'catalog-card__description';
    desc.textContent = item.description;
    card.appendChild(desc);

    card.addEventListener('click', () => handleCardClick(item));

    return card;
}

function handleCardClick(item) {
    if (item.id === 'simulados') {
        openSimulados();
        return;
    }

    if (item.href) {
        window.history.pushState({}, '', item.href);
        window.dispatchEvent(new PopStateEvent('popstate'));
    }
}

async function openSimulados() {
    const selection = getExamSelection();
    const query = buildExamQuery(selection);
    const urlWithParams = query ? `${productCards[0].url}?${query}` : productCards[0].url;
    await openMiniAppModal({
        url: urlWithParams,
        basePath: productCards[0].basePath,
        title: 'Simulados'
    });
}

function getExamSelection() {
    const yearSelect = container.querySelector('#exam-year');
    const disciplineSelect = container.querySelector('#exam-discipline');
    const languageSelect = container.querySelector('#exam-language');

    return {
        year: yearSelect?.value || '',
        discipline: disciplineSelect?.value || '',
        language: languageSelect?.value || ''
    };
}

function buildExamQuery({ year, discipline, language }) {
    const params = new URLSearchParams();

    if (year) params.set('year', year);
    if (discipline) params.set('discipline', discipline);
    if (language) params.set('language', language);

    return params.toString();
}

async function openMiniAppModal({ url, basePath, title }) {
    closeModal();

    modalOverlay = document.createElement('div');
    modalOverlay.className = 'catalog-modal-overlay';
    modalOverlay.innerHTML = `
        <div class="catalog-modal">
            <button class="catalog-modal__close" type="button" aria-label="Fechar modal">
                <span class="material-symbols-rounded">close</span>
            </button>
            <div class="catalog-modal__header">
                <span class="material-symbols-rounded">play_circle</span>
                <div>
                    <p class="catalog-modal__eyebrow">Miniapp</p>
                    <h3 class="catalog-modal__title">${title}</h3>
                </div>
            </div>
            <div class="catalog-modal__frame-wrapper">
                <div class="catalog-modal__loader" id="catalog-loader">
                    <svg aria-hidden="true" class="catalog-modal__spinner" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#e5e7eb"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9171 97.0079 33.5532C95.2932 28.8223 92.871 24.3692 89.8167 20.348C85.8318 15.352 80.8878 11.238 75.2124 7.95925C69.3789 4.47169 63.0454 2.19507 56.5135 1.07246C53.5136 0.514332 50.4131 0.473551 47.4653 0.999784C43.3421 1.77636 39.399 3.25708 35.8458 5.41995C33.454 6.94273 31.543 8.87895 30.0163 11.1397C28.4896 13.4005 27.3503 15.8996 26.6521 18.5273C25.9538 21.1551 25.6174 23.8821 25.6174 26.6346Z" fill="#ec4899"/></svg>
                    <p class="catalog-modal__loader-text">Carregando miniapp…</p>
                </div>
                <iframe title="Miniapp" class="catalog-modal__iframe" referrerpolicy="no-referrer"></iframe>
            </div>
        </div>
    `;

    document.body.appendChild(modalOverlay);

    modalOverlay.querySelector('.catalog-modal__close').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) closeModal();
    });

    const iframe = modalOverlay.querySelector('iframe');
    const loader = modalOverlay.querySelector('#catalog-loader');

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao carregar o arquivo do miniapp.');

        let htmlContent = await response.text();
        const baseTag = `<base href="${basePath}">`;

        if (htmlContent.includes('<head>')) {
            htmlContent = htmlContent.replace('<head>', `<head>${baseTag}`);
        } else {
            htmlContent = `${baseTag}${htmlContent}`;
        }

        iframe.srcdoc = htmlContent;
        iframe.onload = () => loader?.remove();
    } catch (error) {
        console.error(error);
        iframe.srcdoc = `<div style="padding:2rem; font-family:Inter, sans-serif; text-align:center;">
            <h3 style="margin:0; color:#ef4444;">Não foi possível abrir o miniapp</h3>
            <p style="color:#6b7280; margin-top:0.5rem;">${error.message}</p>
        </div>`;
        loader?.remove();
    }
}

function closeModal() {
    if (modalOverlay && modalOverlay.parentNode) {
        modalOverlay.parentNode.removeChild(modalOverlay);
        modalOverlay = null;
    }
}

function renderCatalog() {
    const grid = container.querySelector('#catalog-grid');
    grid.innerHTML = '';

    productCards.forEach((item) => {
        const card = createCard(item);
        grid.appendChild(card);
    });
}

async function loadExamData() {
    try {
        const response = await fetch('docs/microapps/educacao/exams.json');
        if (!response.ok) return;
        examData = await response.json();
        populateExamSelectors(examData);
    } catch (error) {
        console.warn('Não foi possível carregar exams.json', error);
    }
}

function populateExamSelectors(data) {
    if (!Array.isArray(data) || data.length === 0) return;

    const yearSelect = container.querySelector('#exam-year');
    const disciplineSelect = container.querySelector('#exam-discipline');
    const languageSelect = container.querySelector('#exam-language');

    data.forEach((exam) => {
        const option = document.createElement('option');
        option.value = exam.year;
        option.textContent = exam.title;
        yearSelect.appendChild(option);
    });

    yearSelect.addEventListener('change', () => syncDisciplineAndLanguage(yearSelect.value));
    syncDisciplineAndLanguage(yearSelect.value);
}

function syncDisciplineAndLanguage(selectedYear) {
    const exam = examData.find((item) => String(item.year) === String(selectedYear));
    const disciplineSelect = container.querySelector('#exam-discipline');
    const languageSelect = container.querySelector('#exam-language');

    disciplineSelect.innerHTML = '';
    languageSelect.innerHTML = '';

    if (!exam) return;

    exam.disciplines.forEach((discipline) => {
        const option = document.createElement('option');
        option.value = discipline.value;
        option.textContent = discipline.label;
        disciplineSelect.appendChild(option);
    });

    exam.languages.forEach((language) => {
        const option = document.createElement('option');
        option.value = language.value;
        option.textContent = language.label;
        languageSelect.appendChild(option);
    });
}

export function bootstrap() { return Promise.resolve(); }

export function mount() {
    container = document.getElementById('app-root');

    container.innerHTML = \`
    <div class="catalog-shell">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400..700,0..1,-50..200');

            :root { color-scheme: light; }

            .catalog-shell {
                padding: 24px;
                font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
                background: #f8fafc;
                min-height: 100vh;
                box-sizing: border-box;
            }
            .catalog-header h1 {
                margin: 0;
                font-size: 28px;
                color: #0f172a;
            }
            .catalog-header p {
                margin: 6px 0 0;
                color: #475569;
            }
            .card-base {
                position: relative;
                border-radius: 1rem;
                display: flex;
                flex-direction: column;
                transition: all 300ms;
                border-width: 1px;
                cursor: pointer;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                width: 100%;
                min-height: 150px;
                padding: 1rem;
                background: white;
            }
            .card-base:hover {
                box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                transform: translateY(-4px);
            }
            .app-grid-base-flexible {
                display: grid;
                gap: 1.5rem;
                width: 100%;
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                margin-top: 20px;
            }
            .catalog-card__icon {
                font-size: 46px;
                line-height: 1;
                margin-bottom: 12px;
            }
            .catalog-card__title {
                margin: 0;
                font-size: 18px;
                font-weight: 700;
            }
            .catalog-card__description {
                margin: 8px 0 0;
                color: #475569;
                line-height: 1.4;
            }
            .exam-panel {
                margin-top: 32px;
                background: white;
                border-radius: 16px;
                padding: 16px;
                box-shadow: 0 1px 2px rgb(0 0 0 / 0.04), 0 1px 3px rgb(0 0 0 / 0.1);
                border: 1px solid #e2e8f0;
            }
            .exam-panel h2 { margin: 0; font-size: 18px; color: #0f172a; }
            .exam-panel p { margin: 6px 0 0; color: #475569; }
            .exam-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 16px; }
            .exam-field { display: flex; flex-direction: column; gap: 6px; }
            .exam-field label { font-weight: 600; color: #1f2937; }
            .exam-field select {
                border: 1px solid #cbd5e1;
                border-radius: 10px;
                padding: 10px 12px;
                font-family: inherit;
                background: #f8fafc;
            }
            .exam-actions { margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap; }
            .catalog-button {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 16px;
                border-radius: 12px;
                border: 1px solid #ec4899;
                background: linear-gradient(135deg, #fce7f3, #fdf2f8);
                color: #be185d;
                font-weight: 700;
                cursor: pointer;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            .catalog-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            }
            .catalog-modal-overlay {
                position: fixed;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0,0,0,0.6);
                backdrop-filter: blur(6px);
                z-index: 9999;
                padding: 18px;
            }
            .catalog-modal {
                position: relative;
                width: min(1080px, 100%);
                height: min(90vh, 760px);
                background: white;
                border-radius: 20px;
                box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
                border: 1px solid #ec4899;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            .catalog-modal__close {
                position: absolute;
                top: 16px;
                right: 16px;
                border: none;
                background: white;
                color: #ef4444;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                cursor: pointer;
            }
            .catalog-modal__header {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 20px;
                border-bottom: 1px solid #fce7f3;
                background: linear-gradient(180deg, #fff5f7, #ffffff);
            }
            .catalog-modal__header span { color: #ec4899; font-size: 32px; }
            .catalog-modal__eyebrow { margin: 0; color: #ec4899; font-weight: 700; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
            .catalog-modal__title { margin: 0; font-size: 22px; color: #111827; }
            .catalog-modal__frame-wrapper { position: relative; flex: 1; }
            .catalog-modal__iframe { width: 100%; height: 100%; border: none; background: #0f172a08; }
            .catalog-modal__loader {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                background: rgba(255,255,255,0.9);
                backdrop-filter: blur(4px);
                z-index: 5;
                flex-direction: column;
                color: #6b7280;
                font-weight: 600;
            }
            .catalog-modal__spinner { width: 48px; height: 48px; }
            @media (max-width: 640px) {
                .catalog-shell { padding: 16px; }
                .catalog-modal { height: 80vh; }
            }
        </style>

        <div class="catalog-header">
            <h1>Catálogo de Produtos</h1>
            <p>Escolha um miniapp para abrir no simulador integrado ou ser redirecionado.</p>
        </div>

        <div id="catalog-grid" class="app-grid-base-flexible"></div>

        <div class="exam-panel">
            <h2>Simulados rápidos</h2>
            <p>Selecione o ano, área e idioma desejados antes de abrir o quiz.</p>
            <div class="exam-grid">
                <div class="exam-field">
                    <label for="exam-year">Ano da prova</label>
                    <select id="exam-year"></select>
                </div>
                <div class="exam-field">
                    <label for="exam-discipline">Área</label>
                    <select id="exam-discipline"></select>
                </div>
                <div class="exam-field">
                    <label for="exam-language">Idioma</label>
                    <select id="exam-language"></select>
                </div>
            </div>
            <div class="exam-actions">
                <button class="catalog-button" type="button" id="open-simulator-button">
                    <span class="material-symbols-rounded">play_arrow</span>
                    Abrir simulados
                </button>
            </div>
        </div>
    </div>
    \`;

    renderCatalog();
    loadExamData();

    const openButton = container.querySelector('#open-simulator-button');
    openButton.addEventListener('click', openSimulados);

    return Promise.resolve();
}

export function unmount() {
    closeModal();
    if (container) container.innerHTML = '';
    return Promise.resolve();
}
`;
