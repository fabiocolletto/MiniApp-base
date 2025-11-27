import { getState } from '../core/state.js';

export function renderModals() {
  const { modal } = getState();
  if (!modal) return '';
  return `
    <div class="card" role="alertdialog">
      <h3>${modal.title}</h3>
      <p>${modal.message}</p>
      <div style="display:flex; gap:0.5rem; margin-top: 0.5rem;">
        <button class="primary" id="modal-confirm">Confirmar</button>
        <button class="secondary" id="modal-cancel">Cancelar</button>
      </div>
    </div>
  `;
}
