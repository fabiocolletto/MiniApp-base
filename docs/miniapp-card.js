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
function attachCardListeners(data) {
    document.querySelectorAll('.miniapp-card').forEach((card) => {
        // Encontra o objeto de dados correspondente pelo título (mais seguro que índice)
        const app = data.find(item => item.title === card.dataset.title); 

        if (!app) return;

        // Listener para abrir modal
        const openModalHandler = (e) => {
             e.stopPropagation();
             if (typeof openProductModal === 'function') {
                 openProductModal(app);
             }
        };

        card.querySelector('.miniapp-image').addEventListener('click', openModalHandler);
        card.querySelector('.details-button').addEventListener('click', openModalHandler);

        // Listener para Favoritar
        const favoriteButton = card.querySelector('.favorite-button');
        favoriteButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const iconSpan = favoriteButton.querySelector('.material-icons-sharp');
            favoriteButton.classList.toggle('favorited');
            
            if (favoriteButton.classList.contains('favorited')) {
                iconSpan.textContent = 'favorite';
                iconSpan.classList.add('text-orange-500');
                iconSpan.classList.remove('text-white');
                if (typeof showMessage === 'function') {
                    showMessage(`⭐ MiniApp "${app.title}" adicionado aos Favoritos!`, false);
                }
            } else {
                iconSpan.textContent = 'favorite_border';
                iconSpan.classList.add('text-white');
                iconSpan.classList.remove('text-orange-500');
                if (typeof showMessage === 'function') {
                    showMessage(`MiniApp "${app.title}" removido dos Favoritos.`, true);
                }
            }
        });
    });
}


/**
 * Função principal para renderizar e anexar listeners aos MiniApps.
 * @param {Array<object>} data - Array de objetos de MiniApps. (NOVO: Dados passados como argumento)
 * @param {HTMLElement} targetElement - O elemento onde os cards serão injetados.
 */
export function renderMiniApps(data, targetElement) {
    targetElement.innerHTML = data.map(createMiniAppCardHTML).join('');
    
    // Anexa listeners, passando os dados necessários.
    setTimeout(() => {
        attachCardListeners(data);
    }, 0); 
}
