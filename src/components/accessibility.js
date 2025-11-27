import { getState } from '../core/state.js';

export function renderAccessibility() {
  const { user } = getState();
  return `
    <section class="card" aria-label="Acessibilidade">
      <div class="section-title">
        <div>
          <h2>Acessibilidade</h2>
          <p class="small">Preferências locais e sincronizadas.</p>
        </div>
      </div>
      <div class="grid two">
        <label><input type="checkbox" id="high-contrast" ${user.accessibility.highContrast ? 'checked' : ''}/> Alto contraste</label>
        <label><input type="checkbox" id="large-text" ${user.accessibility.largeText ? 'checked' : ''}/> Texto grande</label>
      </div>
    </section>
  `;
}
