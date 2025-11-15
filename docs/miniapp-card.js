import { getAll, saveRecord, deleteRecord } from '../js/indexeddb-store.js';

const FAVORITES_STORE = 'favorites';
let favoritesCache = new Map();
let favoritesLoaded = false;

function getShowMessageFn() {
    if (typeof globalThis !== 'undefined' && typeof globalThis.showMessage === 'function') {
        return globalThis.showMessage;
    }
    return null;
}

function getOpenMiniAppFn() {
    if (typeof globalThis !== 'undefined' && typeof globalThis.openMiniAppPanel === 'function') {
        return globalThis.openMiniAppPanel;
    }
    return null;
}

async function loadFavoritesCache() {
    if (!favoritesLoaded) {
        try {
            const favorites = await getAll(FAVORITES_STORE);
            favoritesCache = new Map(
                favorites
                    .filter((item) => item && item.miniAppTitle)
                    .map((item) => [item.miniAppTitle, true])
            );
        } catch (error) {
            console.error('Erro ao carregar favoritos do IndexedDB', error);
            favoritesCache = new Map();
        }
        favoritesLoaded = true;
    }
    return favoritesCache;
}

function updateFavoriteButtonState(favoriteButton, isFavorited) {
    const iconSpan = favoriteButton.querySelector('.material-icons-sharp');
    favoriteButton.classList.toggle('favorited', isFavorited);
    favoriteButton.dataset.favorite = isFavorited ? 'true' : 'false';

    if (!iconSpan) {
        return;
    }

    if (isFavorited) {
        iconSpan.textContent = 'favorite';
    } else {
        iconSpan.textContent = 'favorite_border';
    }
}

async function persistFavorite(app, shouldFavorite) {
    if (!app || !app.title) {
        throw new Error('MiniApp inválido para favorito.');
    }

    if (shouldFavorite) {
        await saveRecord(FAVORITES_STORE, {
            miniAppTitle: app.title,
            savedAt: new Date().toISOString(),
            data: app
        });
        favoritesCache.set(app.title, true);
    } else {
        await deleteRecord(FAVORITES_STORE, app.title);
        favoritesCache.delete(app.title);
    }
}

// miniapp-card.js
// Este módulo é responsável por gerar o template HTML e anexar os event listeners
// para os cards, sem a responsabilidade de carregar os dados.

/**
 * Constrói a string HTML para um único MiniApp Card.
 * @param {object} app - Objeto com os dados de um MiniApp.
 * @returns {string} String HTML do card.
 */
function createMiniAppCardHTML(app) {
    // Note: O template HTML permanece o mesmo, usando os dados passados em 'app'.
    return `
        <div class="miniapp-card"
             data-id="${app.id ?? ''}"
             data-title="${app.title}"
             data-description="${app.description}"
             data-price="${app.price}"
             data-category="${app.category}"
             data-contract="${app.contract}"
             data-url="${app.url}"
             data-image="${app.image}">
            
            <img src="${app.image}" 
                 onerror="this.onerror=null;this.src='https://placehold.co/400x300/1f2937/f3f4f6?text=MiniApp';"
                 class="miniapp-image">
            
            <button class="favorite-button" data-favorite="false">
                <span class="material-icons-sharp text-base">favorite_border</span>
            </button>

            <button class="details-button">
                <span class="material-icons-sharp text-base">info</span>
            </button>

            <div class="category-tag">${app.category}</div>
            <div class="contract-tag">${app.contract}</div>
        </div>
    `;
}

/**
 * Anexa os event listeners aos cards recém-criados.
 * Depende das funções globais: openProductModal e showMessage.
 * @param {Array<object>} data - A array de MiniApps que foi renderizada.
 */
async function attachCardListeners(data) {
    const showMessageFn = getShowMessageFn();
    const openMiniAppFn = getOpenMiniAppFn();
    const favorites = await loadFavoritesCache();

    document.querySelectorAll('.miniapp-card').forEach((card) => {
        // Encontra o objeto de dados correspondente pelo título (mais seguro que índice)
        const app = data.find((item) => {
            if (card.dataset.id) {
                return item.id === card.dataset.id;
            }
            return item.title === card.dataset.title;
        });

        if (!app) return;

        const favoriteButton = card.querySelector('.favorite-button');
        if (favoriteButton) {
            const initiallyFavorited = favorites.has(app.title);
            updateFavoriteButtonState(favoriteButton, initiallyFavorited);
        }

        const detailsButton = card.querySelector('.details-button');

        // Listener para abrir modal de detalhes (restrito ao botão Info)
        if (detailsButton) {
            detailsButton.addEventListener('click', (event) => {
                event.stopPropagation();
                if (typeof openProductModal === 'function') {
                    openProductModal(app);
                }
            });
        }

        // Listener principal para abrir o MiniApp
        card.addEventListener('click', (event) => {
            if (event.target.closest('.favorite-button')) {
                return;
            }
            if (event.target.closest('.details-button')) {
                return;
            }

            if (typeof openMiniAppFn === 'function') {
                openMiniAppFn(app);
            } else {
                console.warn('Função global openMiniAppPanel não encontrada.');
                if (typeof showMessageFn === 'function') {
                    showMessageFn('❌ Não foi possível abrir o MiniApp. Função não configurada.', true);
                }
            }
        });

        // Listener para Favoritar
        if (!favoriteButton) {
            return;
        }

        favoriteButton.addEventListener('click', async (event) => {
            event.stopPropagation();
            if (favoriteButton.disabled) {
                return;
            }

            const currentlyFavorited = favoriteButton.classList.contains('favorited');
            const shouldFavorite = !currentlyFavorited;

            favoriteButton.disabled = true;

            try {
                await persistFavorite(app, shouldFavorite);
                updateFavoriteButtonState(favoriteButton, shouldFavorite);

                if (typeof showMessageFn === 'function') {
                    if (shouldFavorite) {
                        showMessageFn(`⭐ MiniApp "${app.title}" adicionado aos Favoritos!`, false);
                    } else {
                        showMessageFn(`MiniApp "${app.title}" removido dos Favoritos.`, true);
                    }
                }
            } catch (error) {
                console.error('Erro ao atualizar favorito', error);
                updateFavoriteButtonState(favoriteButton, currentlyFavorited);
                if (typeof showMessageFn === 'function') {
                    showMessageFn('❌ Não foi possível atualizar seus favoritos. Tente novamente.', true);
                }
            } finally {
                favoriteButton.disabled = false;
            }
        });
    });
}


/**
 * Função principal para renderizar e anexar listeners aos MiniApps.
 * @param {Array<object>} data - Array de objetos de MiniApps. (NOVO: Dados passados como argumento)
 * @param {HTMLElement} targetElement - O elemento onde os cards serão injetados.
 */
export async function renderMiniApps(data, targetElement) {
    targetElement.innerHTML = data.map(createMiniAppCardHTML).join('');

    // Anexa listeners, passando os dados necessários.
    await attachCardListeners(data);
}
