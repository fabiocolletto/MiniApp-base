export function renderCatalog() {
  return `
    <section class="card" aria-label="Catálogo de miniapps">
      <div class="section-title">
        <div>
          <h2>Catálogo</h2>
          <p class="small">Seleção resumida do portfólio 5 Horas.</p>
        </div>
      </div>
      <div class="grid two">
        ${['Aulas', 'Atividades', 'Notas', 'Configurações']
          .map(
            (label) => `
            <div class="card" style="border-style: dashed;">
              <h3>${label}</h3>
              <p class="small">Acesso rápido ao módulo de ${label.toLowerCase()}.</p>
            </div>
          `,
          )
          .join('')}
      </div>
    </section>
  `;
}
