import { registerViewCleanup } from '../view-cleanup.js';
import { getActiveUser } from '../data/session-store.js';
import { createAdminNavigation } from './shared/admin-navigation.js';

const BASE_CLASSES = 'card view dashboard-view view--admin admin-design-kit';

const BUTTON_SPEC_INDEX = Object.freeze([
  {
    key: 'primaryColor',
    label: 'Cor primária',
    helper:
      'Aceita valores CSS de background. Separe base e hover com "|" para definir gradientes distintos.',
    tokens: ['--button-bg', '--button-hover-bg'],
    placeholder: 'linear-gradient(...base...)|linear-gradient(...hover...)',
  },
  {
    key: 'secondaryColor',
    label: 'Cor secundária',
    helper:
      'Define a cor do texto e o contraste no hover. Utilize "base|hover" para estados diferentes.',
    tokens: ['--button-text-color', '--button-hover-text-color'],
    placeholder: 'var(--color-text-secondary)|var(--color-accent-deep)',
  },
  {
    key: 'width',
    label: 'Largura',
    helper: 'Controla a largura mínima do botão. Aceita clamp, %, px ou auto.',
    tokens: ['width', 'min-width'],
    placeholder: 'clamp(9rem, 28vw, 12rem)',
  },
  {
    key: 'height',
    label: 'Altura',
    helper:
      'Ajusta o padding vertical e altura direta quando necessário. Use "auto" para herdar do layout.',
    tokens: ['--button-padding-block', 'height'],
    placeholder: 'clamp(0.55rem, 1.9vw, 0.9rem)',
  },
  {
    key: 'radius',
    label: 'Raio da borda',
    helper: 'Controla o arredondamento do botão, aceitando px, rem ou porcentagem.',
    tokens: ['--button-radius', 'border-radius'],
    placeholder: '0.85rem',
  },
]);

const BUTTON_SPEC_DEFAULTS = Object.freeze({
  '01': {
    primaryColor:
      'linear-gradient(135deg, rgba(var(--color-accent-rgb), 0.22), rgba(var(--color-accent-deep-rgb), 0.14))|linear-gradient(135deg, rgba(var(--color-accent-rgb), 0.28), rgba(var(--color-accent-deep-rgb), 0.22))',
    secondaryColor: 'var(--color-accent-deep)|var(--color-accent-deep)',
    width: 'clamp(9rem, 28vw, 12rem)',
    height: 'clamp(0.55rem, 1.9vw, 0.9rem)',
    radius: '0.85rem',
  },
  '02': {
    primaryColor: 'rgba(var(--color-accent-rgb), 0.08)|rgba(var(--color-accent-rgb), 0.14)',
    secondaryColor: 'var(--color-text-secondary)|var(--color-accent-deep)',
    width: 'clamp(9rem, 28vw, 12rem)',
    height: 'clamp(0.55rem, 1.9vw, 0.9rem)',
    radius: '0.85rem',
  },
  '03': {
    primaryColor: 'transparent|rgba(var(--color-accent-rgb), 0.12)',
    secondaryColor: 'var(--color-text-secondary)|var(--color-accent-deep)',
    width: 'clamp(9rem, 28vw, 12rem)',
    height: 'clamp(0.55rem, 1.9vw, 0.9rem)',
    radius: '0.85rem',
  },
  '04': {
    primaryColor:
      'linear-gradient(135deg, rgba(var(--color-accent-rgb), 0.22), rgba(var(--color-accent-deep-rgb), 0.14))|linear-gradient(135deg, rgba(var(--color-accent-rgb), 0.28), rgba(var(--color-accent-deep-rgb), 0.22))',
    secondaryColor: 'var(--color-accent-deep)|var(--color-accent-deep)',
    width: 'clamp(9rem, 28vw, 12rem)',
    height: 'clamp(0.55rem, 1.9vw, 0.9rem)',
    radius: '999px',
  },
  '05': {
    primaryColor: 'rgba(var(--color-accent-rgb), 0.08)|rgba(var(--color-accent-rgb), 0.14)',
    secondaryColor: 'var(--color-text-secondary)|var(--color-accent-deep)',
    width: '100%',
    height: 'clamp(0.55rem, 1.9vw, 0.9rem)',
    radius: '0.85rem',
  },
  '06': {
    primaryColor:
      'linear-gradient(135deg, rgba(var(--color-accent-rgb), 0.22), rgba(var(--color-accent-deep-rgb), 0.14))|linear-gradient(135deg, rgba(var(--color-accent-rgb), 0.28), rgba(var(--color-accent-deep-rgb), 0.22))',
    secondaryColor: 'var(--color-accent-deep)|var(--color-accent-deep)',
    width: 'clamp(9rem, 28vw, 12rem)',
    height: 'clamp(0.55rem, 1.9vw, 0.9rem)',
    radius: '0.85rem',
  },
  '07': {
    primaryColor: 'rgba(var(--color-accent-rgb), 0.12)|rgba(var(--color-accent-rgb), 0.2)',
    secondaryColor: 'var(--color-text-secondary)|var(--color-accent-deep)',
    width: 'clamp(2.25rem, 6vw, 2.85rem)',
    height: 'clamp(2.25rem, 6vw, 2.85rem)',
    radius: '999px',
  },
});

const BUTTON_STYLE_INDEX = Object.freeze({
  primaryColor: {
    tokens: ['--button-bg', '--button-hover-bg'],
    apply(button, value) {
      if (!(button instanceof HTMLElement)) {
        return;
      }

      if (!value) {
        button.style.removeProperty('--button-bg');
        button.style.removeProperty('--button-hover-bg');
        button.style.background = '';
        button.dataset.specPrimaryColor = '';
        button.dataset.specPrimaryColorBase = '';
        button.dataset.specPrimaryColorHover = '';
        return;
      }

      const [base, hover] = value.split('|').map((part) => part.trim());
      const baseValue = base || value.trim();
      const hoverValue = hover || baseValue;

      button.style.setProperty('--button-bg', baseValue);
      button.style.setProperty('--button-hover-bg', hoverValue);
      button.style.background = baseValue;
      button.dataset.specPrimaryColor = value;
      button.dataset.specPrimaryColorBase = baseValue;
      button.dataset.specPrimaryColorHover = hoverValue;
    },
  },
  secondaryColor: {
    tokens: ['--button-text-color', '--button-hover-text-color'],
    apply(button, value) {
      if (!(button instanceof HTMLElement)) {
        return;
      }

      if (!value) {
        button.style.removeProperty('--button-text-color');
        button.style.removeProperty('--button-hover-text-color');
        button.style.color = '';
        button.dataset.specSecondaryColor = '';
        button.dataset.specSecondaryColorBase = '';
        button.dataset.specSecondaryColorHover = '';
        return;
      }

      const [base, hover] = value.split('|').map((part) => part.trim());
      const baseValue = base || value.trim();
      const hoverValue = hover || baseValue;

      button.style.setProperty('--button-text-color', baseValue);
      button.style.setProperty('--button-hover-text-color', hoverValue);
      button.style.color = baseValue;
      button.dataset.specSecondaryColor = value;
      button.dataset.specSecondaryColorBase = baseValue;
      button.dataset.specSecondaryColorHover = hoverValue;
    },
  },
  width: {
    tokens: ['width', 'min-width'],
    apply(button, value) {
      if (!(button instanceof HTMLElement)) {
        return;
      }

      if (!value) {
        button.style.removeProperty('width');
        button.style.removeProperty('minWidth');
        button.style.removeProperty('maxWidth');
        button.dataset.specWidth = '';
        return;
      }

      if (value.trim().toLowerCase() === 'auto') {
        button.style.removeProperty('width');
        button.style.removeProperty('minWidth');
        button.style.removeProperty('maxWidth');
      } else {
        button.style.width = value;
        button.style.minWidth = value;
      }

      button.dataset.specWidth = value;
    },
  },
  height: {
    tokens: ['--button-padding-block', 'height'],
    apply(button, value) {
      if (!(button instanceof HTMLElement)) {
        return;
      }

      const normalized = value?.trim();
      if (!normalized || normalized.toLowerCase() === 'auto') {
        button.style.removeProperty('--button-padding-block');
        button.style.removeProperty('height');
        button.style.removeProperty('paddingBlock');
        button.dataset.specHeight = normalized ?? '';
        return;
      }

      if (button.classList.contains('button--icon')) {
        button.style.removeProperty('--button-padding-block');
        button.style.removeProperty('paddingBlock');
        button.style.height = normalized;
      } else {
        button.style.setProperty('--button-padding-block', normalized);
        button.style.paddingBlock = normalized;
        button.style.removeProperty('height');
      }
      button.dataset.specHeight = normalized;
    },
  },
  radius: {
    tokens: ['--button-radius', 'border-radius'],
    apply(button, value) {
      if (!(button instanceof HTMLElement)) {
        return;
      }

      if (!value) {
        button.style.removeProperty('--button-radius');
        button.style.removeProperty('borderRadius');
        button.dataset.specRadius = '';
        return;
      }

      button.style.setProperty('--button-radius', value);
      button.style.borderRadius = value;
      button.dataset.specRadius = value;
    },
  },
});

let buttonPreviewRegistry = new Map();
let buttonSpecState = new Map();

function resetButtonRegistries() {
  buttonPreviewRegistry = new Map();
  buttonSpecState = new Map();
}

function ensureButtonSpecState(buttonId) {
  if (!buttonId) {
    return {};
  }

  if (!buttonSpecState.has(buttonId)) {
    const defaults = BUTTON_SPEC_DEFAULTS[buttonId] || {};
    buttonSpecState.set(buttonId, { ...defaults });
  }

  return buttonSpecState.get(buttonId);
}

function applyButtonSpec(buttonId, specKey) {
  const button = buttonPreviewRegistry.get(buttonId);
  if (!button) {
    return;
  }

  const state = ensureButtonSpecState(buttonId);
  const value = state?.[specKey] ?? '';
  const handler = BUTTON_STYLE_INDEX[specKey];

  if (handler && typeof handler.apply === 'function') {
    handler.apply(button, value);
  }
}

function applyAllButtonSpecs(buttonId) {
  BUTTON_SPEC_INDEX.forEach((column) => applyButtonSpec(buttonId, column.key));
}

function updateButtonSpec(buttonId, specKey, value) {
  if (!buttonId || !specKey) {
    return;
  }

  const state = ensureButtonSpecState(buttonId);
  state[specKey] = value;
  applyButtonSpec(buttonId, specKey);
}

function isAdminUser(user) {
  if (!user || typeof user !== 'object') {
    return false;
  }

  const type = String(user.userType ?? '')
    .trim()
    .toLowerCase();

  return type === 'administrador';
}

function createRestrictedMessage() {
  const wrapper = document.createElement('section');
  wrapper.className = 'surface-card admin-design-kit__restricted';
  wrapper.setAttribute('aria-live', 'polite');

  const title = document.createElement('h2');
  title.className = 'admin-design-kit__section-title';
  title.textContent = 'Acesso restrito';

  const message = document.createElement('p');
  message.className = 'admin-design-kit__paragraph';
  message.textContent = 'Somente administradores podem visualizar o kit de design.';

  const hint = document.createElement('p');
  hint.className = 'admin-design-kit__paragraph';
  hint.textContent = 'Solicite a um administrador que atualize o seu perfil para liberar o acesso.';

  wrapper.append(title, message, hint);
  return wrapper;
}

const BUTTON_MODELS = [
  {
    id: '01',
    title: 'Botão primário',
    description: 'Uso principal para chamadas prioritárias. Garante contraste e destaque.',
    className: 'button button--primary',
    label: 'Confirmar ação',
  },
  {
    id: '02',
    title: 'Botão secundário',
    description: 'Alternativa de apoio para fluxos que exigem mais de uma ação visível.',
    className: 'button button--secondary',
    label: 'Ação secundária',
  },
  {
    id: '03',
    title: 'Botão fantasma',
    description: 'Ideal para ações menos frequentes, mantendo o foco no conteúdo principal.',
    className: 'button button--ghost',
    label: 'Ação auxiliar',
  },
  {
    id: '04',
    title: 'Botão pill',
    description: 'Versão arredondada para CTAs rápidos em listas ou cards compactos.',
    className: 'button button--primary button--pill',
    label: 'Iniciar jornada',
  },
  {
    id: '05',
    title: 'Botão em bloco',
    description: 'Ocupação total da largura, recomendado para formulários em dispositivos móveis.',
    className: 'button button--secondary button--block',
    label: 'Avançar etapa',
  },
  {
    id: '06',
    title: 'Botão empilhado',
    description: 'Combina título e descrição para ações ricas em contexto.',
    className: 'button button--primary button--stacked',
    label: 'Salvar alterações',
    helper: 'Mantém os dados sincronizados em segundo plano.',
  },
  {
    id: '07',
    title: 'Botão icônico',
    description: 'Utilizado para ações rápidas e repetitivas. Sempre acompanhar com rótulo acessível.',
    className: 'button button--icon',
    iconLabel: 'Favoritar item',
    icon: '★',
  },
];

function createButtonPreview(model) {
  const preview = document.createElement('div');
  preview.className = 'admin-design-kit__preview';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = `${model.className} admin-design-kit__sample-button`;
  button.dataset.buttonId = model.id;
  button.dataset.specId = model.id;

  if (model.icon) {
    button.setAttribute('aria-label', model.iconLabel ?? model.title);

    const icon = document.createElement('span');
    icon.className = 'admin-design-kit__button-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = model.icon;

    const srLabel = document.createElement('span');
    srLabel.className = 'sr-only';
    srLabel.textContent = model.iconLabel ?? model.title;

    button.append(icon, srLabel);
  } else {
    const label = document.createElement('span');
    label.className = 'admin-design-kit__button-label';
    label.textContent = model.label;
    button.append(label);

    if (model.helper) {
      const helper = document.createElement('span');
      helper.className = 'admin-design-kit__button-helper';
      helper.textContent = model.helper;
      button.append(helper);
    }
  }

  buttonPreviewRegistry.set(model.id, button);
  ensureButtonSpecState(model.id);
  applyAllButtonSpecs(model.id);

  preview.append(button);
  return preview;
}

function createButtonShowcase() {
  const section = document.createElement('section');
  section.className = 'admin-design-kit__section';

  const heading = document.createElement('h2');
  heading.className = 'admin-design-kit__section-title';
  heading.textContent = 'Modelos de botões';

  const description = document.createElement('p');
  description.className = 'admin-design-kit__paragraph';
  description.textContent =
    'Referencie os modelos abaixo pelo identificador sequencial ao solicitar novos componentes.';

  const grid = document.createElement('div');
  grid.className = 'admin-design-kit__grid';

  BUTTON_MODELS.forEach((model) => {
    const card = document.createElement('article');
    card.className = 'surface-card admin-design-kit__item';

    const header = document.createElement('div');
    header.className = 'admin-design-kit__item-header';

    const title = document.createElement('h3');
    title.className = 'admin-design-kit__item-title';
    title.textContent = `Botão ${model.id} — ${model.title}`;

    const helper = document.createElement('p');
    helper.className = 'admin-design-kit__item-description';
    helper.textContent = model.description;

    header.append(title, helper);

    const preview = createButtonPreview(model);

    card.append(header, preview);
    grid.append(card);
  });

  section.append(heading, description, grid);
  return section;
}

function createButtonSpecsSection() {
  const section = document.createElement('section');
  section.className = 'admin-design-kit__section';

  const heading = document.createElement('h2');
  heading.className = 'admin-design-kit__section-title';
  heading.textContent = 'Ficha técnica dos botões';

  const description = document.createElement('p');
  description.className = 'admin-design-kit__paragraph';
  description.textContent =
    'Detalhes consolidados das cores, dimensões e cantos aplicados em cada variação do catálogo.';

  const card = document.createElement('article');
  card.className = 'surface-card admin-design-kit__table-card';

  const wrapper = document.createElement('div');
  wrapper.className = 'admin-design-kit__table-wrapper';

  const table = document.createElement('table');
  table.className = 'admin-design-kit__table';

  const caption = document.createElement('caption');
  caption.className = 'sr-only';
  caption.textContent = 'Tabela técnica com parâmetros de cores e dimensões dos botões do kit de design.';
  table.append(caption);

  const tableHead = document.createElement('thead');
  tableHead.className = 'admin-design-kit__table-head';
  const headRow = document.createElement('tr');
  headRow.className = 'admin-design-kit__table-row';

  const columns = [
    'Botão',
    ...BUTTON_SPEC_INDEX.map((column) => column.label),
  ];

  columns.forEach((label) => {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.className = 'admin-design-kit__table-header';
    cell.textContent = label;
    headRow.append(cell);
  });

  tableHead.append(headRow);
  table.append(tableHead);

  const tableBody = document.createElement('tbody');
  tableBody.className = 'admin-design-kit__table-body';

  BUTTON_MODELS.forEach((model) => {
    const specs = ensureButtonSpecState(model.id);

    const row = document.createElement('tr');
    row.className = 'admin-design-kit__table-row';

    const buttonCell = document.createElement('th');
    buttonCell.scope = 'row';
    buttonCell.className = 'admin-design-kit__table-cell admin-design-kit__table-cell--label';
    buttonCell.textContent = `Botão ${model.id} — ${model.title}`;
    row.append(buttonCell);

    BUTTON_SPEC_INDEX.forEach((column, columnIndex) => {
      const value = specs?.[column.key] ?? '';
      const cell = document.createElement('td');
      cell.className = 'admin-design-kit__table-cell';

      const field = document.createElement('div');
      field.className = 'admin-design-kit__table-field';

      const inputId = `admin-design-kit__spec-${model.id}-${columnIndex}`;

      const label = document.createElement('label');
      label.className = 'admin-design-kit__table-label';
      label.setAttribute('for', inputId);

      const indexBadge = document.createElement('span');
      indexBadge.className = 'admin-design-kit__table-index';
      indexBadge.textContent = `#${column.key}`;
      label.append(indexBadge);

      const labelText = document.createElement('span');
      labelText.className = 'admin-design-kit__table-label-text';
      labelText.textContent = column.label;
      label.append(labelText);

      const input = document.createElement('input');
      input.id = inputId;
      input.type = 'text';
      input.value = value;
      input.placeholder = column.placeholder ?? '';
      input.dataset.buttonId = model.id;
      input.dataset.specKey = column.key;
      if (Array.isArray(column.tokens) && column.tokens.length > 0) {
        input.dataset.specTokens = column.tokens.join(' ');
      }
      input.className = 'form-input admin-design-kit__table-input';

      const handleInput = (event) => {
        if (!(event instanceof Event)) {
          return;
        }

        const target = event.currentTarget;
        if (!(target instanceof HTMLInputElement)) {
          return;
        }

        const { buttonId, specKey } = target.dataset;
        updateButtonSpec(buttonId, specKey, target.value);
      };

      input.addEventListener('input', handleInput);

      const helperId = `${inputId}-helper`;
      let helper;
      if (column.helper) {
        helper = document.createElement('span');
        helper.id = helperId;
        helper.className = 'admin-design-kit__table-helper';
        helper.textContent = column.helper;
        input.setAttribute('aria-describedby', helperId);
      }

      if (Array.isArray(column.tokens) && column.tokens.length > 0) {
        const tokensWrapper = document.createElement('div');
        tokensWrapper.className = 'admin-design-kit__table-tokens';

        column.tokens.forEach((token) => {
          const tokenBadge = document.createElement('span');
          tokenBadge.className = 'admin-design-kit__table-token';
          tokenBadge.textContent = token;
          tokensWrapper.append(tokenBadge);
        });

        field.append(label, input, tokensWrapper);
      } else {
        field.append(label, input);
      }

      if (helper) {
        field.append(helper);
      }

      cell.append(field);
      row.append(cell);

      cleanupHandlers.push(() => {
        input.removeEventListener('input', handleInput);
      });
    });

    tableBody.append(row);
  });

  table.append(tableBody);
  wrapper.append(table);
  card.append(wrapper);
  section.append(heading, description, card);
  return section;
}

function createIntroSection() {
  const section = document.createElement('section');
  section.className = 'admin-design-kit__section admin-design-kit__intro';

  const heading = document.createElement('h1');
  heading.className = 'admin-design-kit__title';
  heading.textContent = 'Kit de design 5Horas';

  const description = document.createElement('p');
  description.className = 'admin-design-kit__paragraph';
  description.textContent =
    'Centralizamos aqui os componentes padrão do aplicativo para acelerar o dia de design e garantir consistência.';

  const helper = document.createElement('p');
  helper.className = 'admin-design-kit__paragraph';
  helper.textContent =
    'Atualize esta referência sempre que um novo padrão for aprovado para garantir que todos os times estejam alinhados.';

  section.append(heading, description, helper);
  return section;
}

export function renderAdminDesignKit(viewRoot) {
  if (!(viewRoot instanceof HTMLElement)) {
    return;
  }

  resetButtonRegistries();
  const cleanupHandlers = [];

  cleanupHandlers.push(() => {
    resetButtonRegistries();
  });

  registerViewCleanup(viewRoot, () => {
    while (cleanupHandlers.length > 0) {
      const cleanup = cleanupHandlers.pop();
      try {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      } catch (error) {
        console.error('Erro ao limpar o kit de design.', error);
      }
    }
  });

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'admin-design-kit';
  viewRoot.setAttribute('aria-label', 'Kit de design do administrador');

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout admin-dashboard__layout admin-design-kit__layout';

  const navigation = createAdminNavigation({ active: 'design-kit' });
  cleanupHandlers.push(navigation.cleanup);
  layout.append(navigation.element);

  const activeUser = getActiveUser();
  if (!isAdminUser(activeUser)) {
    layout.append(createRestrictedMessage());
    viewRoot.replaceChildren(layout);
    return;
  }

  layout.append(createIntroSection());
  layout.append(createButtonShowcase());
  layout.append(createButtonSpecsSection());

  viewRoot.replaceChildren(layout);
}
