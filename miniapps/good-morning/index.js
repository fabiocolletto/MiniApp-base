const STYLE_ID = 'miniapp-good-morning-style';

const GREETINGS = Object.freeze({
  'pt-BR': 'Bom dia',
  en: 'Good morning',
  es: 'Buenos días',
});

function ensureStyle(doc) {
  if (!doc || doc.getElementById(STYLE_ID)) {
    return;
  }

  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .good-morning-miniapp {
      display: grid;
      gap: clamp(0.85rem, 3vw, 1.35rem);
      border-radius: var(--radius-lg, 18px);
      padding: clamp(1.5rem, 4vw, 2.4rem);
      background: color-mix(in srgb, var(--color-bg-card, #ffffff) 82%, transparent);
      border: 1px solid color-mix(in srgb, var(--color-border-muted, rgba(15, 23, 42, 0.12)) 70%, transparent);
      box-shadow: 0 20px 42px rgba(15, 23, 42, 0.12);
      color: var(--color-text-primary, #0f172a);
    }

    :root[data-theme='dark'] .good-morning-miniapp,
    :root[data-theme='dark'] body:not([data-theme]) .good-morning-miniapp,
    body[data-theme='dark'] .good-morning-miniapp {
      background: color-mix(in srgb, rgba(15, 23, 42, 0.82) 92%, transparent);
      border-color: color-mix(in srgb, rgba(148, 163, 184, 0.22) 80%, transparent);
      box-shadow: 0 18px 36px rgba(8, 12, 24, 0.32);
      color: var(--color-text-primary, #e2e8f0);
    }

    .good-morning-miniapp__title {
      margin: 0;
      font: 700 clamp(1.6rem, 4vw, 2.2rem) / 1.15 var(--ac-font-primary, 'Inter', system-ui, sans-serif);
      text-wrap: balance;
    }

    .good-morning-miniapp__subtitle {
      margin: 0;
      font: 500 clamp(1rem, 2.6vw, 1.2rem) / 1.55 var(--ac-font-primary, 'Inter', system-ui, sans-serif);
      color: color-mix(in srgb, currentColor 78%, transparent);
      text-wrap: balance;
    }

    .good-morning-miniapp__features {
      margin: 0;
      padding-inline-start: clamp(1.2rem, 3vw, 1.75rem);
      display: grid;
      gap: clamp(0.45rem, 1.6vw, 0.75rem);
      font: 500 clamp(0.92rem, 2.2vw, 1.05rem) / 1.55 var(--ac-font-primary, 'Inter', system-ui, sans-serif);
      color: color-mix(in srgb, currentColor 82%, transparent);
    }

    .good-morning-miniapp__features li::marker {
      color: color-mix(in srgb, var(--color-accent, #4358e6) 75%, transparent);
      font-weight: 700;
    }
  `;

  doc.head.append(style);
}

function resolveLanguage(context, doc) {
  const docLang = doc?.documentElement?.getAttribute('lang');
  const candidates = [context?.lang, doc?.documentElement?.dataset?.lang, docLang, 'pt-BR'];

  for (const candidate of candidates) {
    if (typeof candidate !== 'string') {
      continue;
    }

    const normalized = candidate.trim();
    if (Object.prototype.hasOwnProperty.call(GREETINGS, normalized)) {
      return normalized;
    }
  }

  return 'pt-BR';
}

function resolveGreetingName(context) {
  if (!context || typeof context.name !== 'string') {
    return '';
  }

  const trimmed = context.name.trim();
  return trimmed;
}

function formatGreeting(language, name) {
  const prefix = GREETINGS[language] ?? GREETINGS['pt-BR'];
  if (!name) {
    return `${prefix}!`;
  }

  return `${prefix}, ${name}!`;
}

function resolveFeatures(context) {
  if (!context || !Array.isArray(context.features)) {
    return [];
  }

  return context.features
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry) => entry.length > 0);
}

export async function mount(target, context = {}) {
  const doc =
    context.document ?? target?.ownerDocument ?? (typeof document !== 'undefined' ? document : null);

  if (!doc || !target) {
    throw new Error('Elemento de destino inválido para montar o MiniApp de bom dia.');
  }

  ensureStyle(doc);

  const language = resolveLanguage(context, doc);
  const name = resolveGreetingName(context);
  const message = formatGreeting(language, name);
  const subtitle =
    typeof context.subtitle === 'string' && context.subtitle.trim().length > 0
      ? context.subtitle.trim()
      : {
          'pt-BR': 'Aproveite o dia para explorar os módulos disponíveis no shell MiniApp Base.',
          en: 'Start your day exploring the modules available in the MiniApp Base shell.',
          es: 'Comienza tu día explorando los módulos disponibles en el shell MiniApp Base.',
        }[language] ?? 'Aproveite o dia para explorar os módulos disponíveis no shell MiniApp Base.';

  const features = resolveFeatures(context);

  target.replaceChildren();

  const container = doc.createElement('article');
  container.className = 'good-morning-miniapp';
  container.dataset.miniappId = 'good-morning';

  const title = doc.createElement('h2');
  title.className = 'good-morning-miniapp__title';
  title.textContent = message;

  const subtitleElement = doc.createElement('p');
  subtitleElement.className = 'good-morning-miniapp__subtitle';
  subtitleElement.textContent = subtitle;

  container.append(title, subtitleElement);

  if (features.length > 0) {
    const featureList = doc.createElement('ul');
    featureList.className = 'good-morning-miniapp__features';
    features.forEach((item) => {
      const entry = doc.createElement('li');
      entry.textContent = item;
      featureList.append(entry);
    });
    container.append(featureList);
  }

  target.append(container);

  if (typeof context.onReady === 'function') {
    try {
      context.onReady({ language, name, features });
    } catch (error) {
      console.error('MiniApp Good Morning: callback onReady falhou.', error);
    }
  }
}

export default { mount };
