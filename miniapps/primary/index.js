const STYLE_ID = 'miniapp-primary-style';

function ensureStyle(doc) {
  if (!doc || doc.getElementById(STYLE_ID)) {
    return;
  }

  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .primary-miniapp {
      display: grid;
      gap: clamp(1rem, 2.6vw, 1.6rem);
      background: color-mix(in srgb, var(--color-bg-card, #141c2e) 95%, white 5%);
      border-radius: var(--radius-lg, 18px);
      border: 1px solid color-mix(in srgb, var(--color-accent, #4358e6) 22%, transparent);
      box-shadow: 0 1.5rem 3rem rgba(12, 18, 36, 0.28);
      padding: clamp(1.75rem, 4vw, 2.5rem);
      color: var(--color-text-primary, #e8edff);
    }

    .primary-miniapp__title {
      margin: 0;
      font: 800 clamp(1.75rem, 4vw, 2.4rem) / 1.1 var(--ac-font-primary, 'Inter', system-ui, sans-serif);
      color: var(--color-text-primary, #e8edff);
      text-wrap: balance;
    }

    .primary-miniapp__tagline {
      margin: 0;
      font: 500 clamp(1rem, 2.6vw, 1.2rem) / 1.6 var(--ac-font-primary, 'Inter', system-ui, sans-serif);
      color: var(--color-text-secondary, #c7d2fe);
      max-width: 60ch;
      text-wrap: balance;
    }

    .primary-miniapp__checklist {
      margin: 0;
      padding-inline-start: clamp(1.25rem, 3vw, 1.75rem);
      display: grid;
      gap: clamp(0.65rem, 1.8vw, 1rem);
      color: var(--color-text-secondary, #c7d2fe);
      font: 500 clamp(0.95rem, 2.2vw, 1.05rem) / 1.55 var(--ac-font-primary, 'Inter', system-ui, sans-serif);
    }

    .primary-miniapp__badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border-radius: var(--radius-pill, 999px);
      padding: 0.35rem 0.85rem;
      background: color-mix(in srgb, var(--color-accent, #4358e6) 18%, transparent);
      color: var(--color-text-inverse, #f9fafb);
      font: 600 clamp(0.75rem, 2vw, 0.85rem) / 1.2 var(--ac-font-primary, 'Inter', system-ui, sans-serif);
      letter-spacing: 0.02em;
    }

    .primary-miniapp__cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1.2rem;
      border-radius: var(--radius-pill, 999px);
      background: var(--color-accent, #4358e6);
      color: var(--color-text-inverse, #f9fafb);
      font: 600 clamp(0.95rem, 2.2vw, 1.05rem) / 1.2 var(--ac-font-primary, 'Inter', system-ui, sans-serif);
      text-decoration: none;
      box-shadow: 0 1rem 2.2rem rgba(67, 88, 230, 0.28);
      transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
    }

    .primary-miniapp__cta:hover,
    .primary-miniapp__cta:focus-visible {
      transform: translateY(-1px);
      box-shadow: 0 1.25rem 2.6rem rgba(67, 88, 230, 0.32);
      background: color-mix(in srgb, var(--color-accent, #4358e6) 88%, white 12%);
    }
  `;

  doc.head.append(style);
}

export async function mount(target, context = {}) {
  const doc = context.document ?? target?.ownerDocument ?? (typeof document !== 'undefined' ? document : null);
  if (!doc || !target) {
    throw new Error('Elemento de destino inválido para montar o MiniApp.');
  }

  ensureStyle(doc);

  const brandName = typeof context.brandName === 'string' && context.brandName.trim()
    ? context.brandName.trim()
    : 'sua marca';
  const callToAction =
    typeof context.callToAction === 'string' && context.callToAction.trim()
      ? context.callToAction.trim()
      : 'Planejar integração';

  target.replaceChildren();

  const container = doc.createElement('article');
  container.className = 'primary-miniapp';

  const badge = doc.createElement('span');
  badge.className = 'primary-miniapp__badge';
  badge.textContent = 'MiniApp ativo';

  const title = doc.createElement('h2');
  title.className = 'primary-miniapp__title';
  title.textContent = `Experiência principal da ${brandName}`;

  const tagline = doc.createElement('p');
  tagline.className = 'primary-miniapp__tagline';
  tagline.textContent =
    context.tagline?.trim() ||
    'Este módulo recebe o conteúdo definitivo da sua solução. Conecte APIs, widgets ou fluxos customizados aqui.';

  const checklist = doc.createElement('ul');
  checklist.className = 'primary-miniapp__checklist';

  const points = Array.isArray(context.highlights) && context.highlights.length > 0
    ? context.highlights
    : [
        'Personalize o tema com tokens compartilhados (`design/tokens.json`).',
        'Sincronize preferências utilizando `shared/storage/idb/prefs.js`.',
        'Exiba métricas, dashboards ou jornadas específicas da marca.'
      ];

  points.forEach((item) => {
    const entry = doc.createElement('li');
    entry.textContent = typeof item === 'string' ? item : '';
    checklist.append(entry);
  });

  const cta = doc.createElement('a');
  cta.className = 'primary-miniapp__cta';
  cta.href = context.ctaHref ?? '#';
  cta.textContent = callToAction;
  cta.setAttribute('role', 'button');

  container.append(badge, title, tagline, checklist, cta);
  target.append(container);
}

export default { mount };
