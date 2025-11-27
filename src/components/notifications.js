import { getState } from '../core/state.js';

export function renderNotifications() {
  const { user } = getState();
  return `
    <section class="card" aria-label="Notificações">
      <div class="section-title">
        <div>
          <h2>Notificações</h2>
          <p class="small">Controle de alertas locais.</p>
        </div>
      </div>
      <label><input type="checkbox" id="allow-notifications" ${user.preferences.notifications ? 'checked' : ''}/> Permitir notificações</label>
      <p class="small" style="margin-top: 0.5rem;">Créditos: ${user.credits.current} | Total ganho: ${user.credits.totalEarned}</p>
    </section>
  `;
}
