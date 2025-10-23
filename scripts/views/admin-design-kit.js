import { registerViewCleanup } from '../view-cleanup.js';
import { getActiveUser } from '../data/session-store.js';
import { createAdminNavigation } from './shared/admin-navigation.js';
import { createInputField, createTextareaField } from './shared/form-fields.js';

const BASE_CLASSES = 'card view dashboard-view view--admin admin-design-kit';

const SURFACE_MODELS = Object.freeze([
  {
    id: 'S01',
    title: 'Cartão padrão',
    description:
      'Base para painéis principais e blocos de conteúdo. Mantém preenchimento neutro, borda suave e sombra leve.',
    className: 'surface-card',
    sampleTitle: 'Título do cartão',
    sampleBody: 'Subtítulo ou descrição resumida do conteúdo exposto.',
    tokens: ['--panel-padding', '--panel-radius', '--panel-border', '--panel-shadow', '--panel-gap'],
  },
  {
    id: 'S02',
    title: 'Cartão compacto',
    description:
      'Variação enxuta para widgets com pouco conteúdo ou colunas estreitas. Reduz espaçamentos internos mantendo a hierarquia.',
    className: 'surface-card surface-card--compact',
    sampleTitle: 'Cartão compacto',
    sampleBody: 'Ideal para indicadores secundários ou grupos com menos informações.',
    tokens: [
      '--panel-inner-gap',
      '--panel-padding',
      '--panel-radius',
      '--panel-border',
      '--panel-shadow',
    ],
  },
  {
    id: 'S03',
    title: 'Cartão sutil',
    description:
      'Superfície com contraste médio para destacar agrupamentos sem competir com o conteúdo principal.',
    className: 'surface-card surface-card--subtle',
    sampleTitle: 'Cartão sutil',
    sampleBody: 'Utilizado para estados de apoio e detalhes dentro de um painel maior.',
    tokens: ['--panel-padding', '--panel-radius', '--panel-border', '--panel-gap'],
  },
  {
    id: 'S04',
    title: 'Cartão transparente',
    description:
      'Estrutura sem preenchimento para agrupar elementos sobre planos coloridos ou degradês.',
    className: 'surface-card surface-card--transparent',
    sampleTitle: 'Cartão transparente',
    sampleBody: 'Mantém tipografia e espaçamentos alinhados sem aplicar fundo.',
    tokens: ['--panel-padding', '--panel-radius', '--panel-gap'],
  },
]);

const FORM_MODELS = Object.freeze([
  {
    id: 'F01',
    title: 'Campo de texto padrão',
    description:
      'Entrada com rótulo superior e preenchimento neutro. Aplicação em formulários gerais do aplicativo.',
    build(idFactory) {
      const inputId = idFactory('input', this.id);
      return createInputField({
        id: inputId,
        label: 'Nome completo',
        type: 'text',
        placeholder: 'Informe o nome do usuário',
        autocomplete: 'name',
      });
    },
    tokens: [
      '--form-field-gap',
      '--panel-input-padding-block',
      '--panel-input-padding-inline',
      '--color-input-bg',
      '--color-input-border',
      '--color-input-placeholder',
    ],
  },
  {
    id: 'F02',
    title: 'Campo de seleção',
    description:
      'Seletores utilizam a mesma base de espaçamento e bordas dos inputs, garantindo consistência entre controles.',
    build(idFactory) {
      const selectId = idFactory('select', this.id);
      const fieldWrapper = document.createElement('label');
      fieldWrapper.className = 'form-field user-form__field';
      fieldWrapper.setAttribute('for', selectId);

      const label = document.createElement('span');
      label.className = 'form-label user-form__label';
      label.textContent = 'Status do mini-app';

      const select = document.createElement('select');
      select.className = 'form-select';
      select.id = selectId;
      select.name = selectId;

      const options = [
        { value: '', label: 'Selecione um status' },
        { value: 'draft', label: 'Rascunho' },
        { value: 'testing', label: 'Em testes' },
        { value: 'deployment', label: 'Em implantação' },
      ];

      options.forEach(({ value, label: optionLabel }) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = optionLabel;
        select.append(option);
      });

      fieldWrapper.append(label, select);
      return fieldWrapper;
    },
    tokens: [
      '--panel-input-padding-block',
      '--panel-input-padding-inline',
      '--color-input-bg',
      '--color-input-border',
    ],
  },
  {
    id: 'F03',
    title: 'Área de texto',
    description:
      'Textareas seguem o mesmo padrão de rótulo e preenchimento, com altura inicial pensada para descrições curtas.',
    build(idFactory) {
      const textareaId = idFactory('textarea', this.id);
      return createTextareaField({
        id: textareaId,
        label: 'Descrição do mini-app',
        placeholder: 'Explique brevemente o propósito e as funcionalidades disponibilizadas.',
        rows: 4,
      });
    },
    tokens: [
      '--form-field-gap',
      '--panel-input-padding-block',
      '--panel-input-padding-inline',
      '--color-input-bg',
      '--color-input-border',
    ],
  },
  {
    id: 'F04',
    title: 'Grupo com checkboxes',
    description:
      'Agrupa permissões ou categorias em colunas compactas mantendo o controle alinhado ao texto.',
    build(idFactory) {
      const fieldset = document.createElement('fieldset');
      fieldset.className = 'admin-design-kit__form-check-group';

      const legend = document.createElement('legend');
      legend.className = 'admin-design-kit__form-check-legend';
      legend.textContent = 'Perfis habilitados';

      const options = [
        { id: idFactory('checkbox', `${this.id}-admin`), label: 'Administradores' },
        { id: idFactory('checkbox', `${this.id}-collab`), label: 'Colaboradores' },
        { id: idFactory('checkbox', `${this.id}-user`), label: 'Usuários finais' },
      ];

      const list = document.createElement('div');
      list.className = 'admin-design-kit__form-check-options';

      options.forEach(({ id, label: optionLabel }, index) => {
        const option = document.createElement('label');
        option.className = 'admin-design-kit__form-check-option';
        option.setAttribute('for', id);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.name = id;
        checkbox.className = 'admin-design-kit__form-checkbox';
        checkbox.checked = index === 0;

        const text = document.createElement('span');
        text.textContent = optionLabel;

        option.append(checkbox, text);
        list.append(option);
      });

      fieldset.append(legend, list);
      return fieldset;
    },
    tokens: [
      '--panel-radius',
      '--color-border-strong',
      '--color-accent-rgb',
      '--radius-sm',
    ],
  },
]);

const FEEDBACK_MODELS = Object.freeze([
  {
    id: 'FB01',
    title: 'Mensagem de sucesso',
    description:
      'Confirma ações concluídas. Utiliza texto forte com contraste sobre fundo positivo suave.',
    variant: 'success',
    sample: 'Operação concluída com sucesso.',
    tokens: ['--color-success-bg', '--color-success-text'],
  },
  {
    id: 'FB02',
    title: 'Mensagem de erro',
    description:
      'Alerta problemas e bloqueios, mantendo foco em acessibilidade e leitura imediata.',
    variant: 'error',
    sample: 'Não foi possível salvar os dados. Revise o formulário.',
    tokens: ['--color-error-bg', '--color-error-text'],
  },
  {
    id: 'FB03',
    title: 'Mensagem informativa',
    description:
      'Orientações de sistema, mudanças ou estados temporários utilizam o tom informativo.',
    variant: 'info',
    sample: 'Sincronizando dados do catálogo. Isso pode levar alguns segundos.',
    tokens: ['--color-info-bg', '--color-info-text'],
  },
  {
    id: 'FB04',
    title: 'Mensagem neutra',
    description:
      'Avisos genéricos ou placeholders utilizam contraste moderado e borda sutil.',
    variant: 'neutral',
    sample: 'Nenhuma alteração pendente no momento.',
    tokens: ['--color-neutral-bg', '--color-neutral-border', '--color-neutral-text'],
  },
]);

const LABEL_MODELS = Object.freeze([
  {
    id: 'L01',
    title: 'Chip de categoria',
    description:
      'Etiqueta ampla para destacar atributos principais de miniapps ou filtros aplicados.',
    variant: 'accent',
    label: 'Analytics',
    tokens: ['--color-chip-bg', '--color-chip-border', '--radius-pill'],
  },
  {
    id: 'L02',
    title: 'Badge de status',
    description:
      'Aplicada em listagens administrativas indicando estado atual do item.',
    variant: 'neutral',
    label: 'Em análise',
    tokens: ['--color-neutral-bg', '--color-neutral-border', '--radius-pill'],
  },
  {
    id: 'L03',
    title: 'Etiqueta de sucesso',
    description:
      'Realça conquistas ou itens aprovados utilizando o tom positivo do sistema.',
    variant: 'success',
    label: 'Aprovado',
    tokens: ['--color-success-bg', '--color-success-text', '--radius-pill'],
  },
]);

function createDesignKitIdFactory() {
  let counter = 0;
  return function designKitIdFactory(prefix, suffix) {
    counter += 1;
    const normalizedPrefix = prefix ? String(prefix).trim() : 'field';
    const normalizedSuffix = suffix ? String(suffix).trim() : counter;
    return `admin-design-kit-${normalizedPrefix}-${normalizedSuffix}-${counter}`;
  };
}

function createSurfacePreview(model) {
  const preview = document.createElement('div');
  preview.className = 'admin-design-kit__preview admin-design-kit__preview--surface';

  const card = document.createElement('article');
  card.className = `${model.className} admin-design-kit__surface-sample`;

  const title = document.createElement('h4');
  title.className = 'admin-design-kit__surface-heading';
  title.textContent = model.sampleTitle ?? 'Título do cartão';

  const description = document.createElement('p');
  description.className = 'admin-design-kit__surface-text';
  description.textContent = model.sampleBody ?? 'Descrição do conteúdo apresentado nesta superfície.';

  card.append(title, description);
  preview.append(card);
  return preview;
}

function createFormPreview(model, idFactory) {
  const preview = document.createElement('div');
  preview.className = 'admin-design-kit__preview admin-design-kit__preview--form';

  if (typeof model.build === 'function') {
    const field = model.build(idFactory);
    if (field instanceof HTMLElement) {
      preview.append(field);
    }
  }

  return preview;
}

function createFeedbackPreview(model) {
  const preview = document.createElement('div');
  preview.className = 'admin-design-kit__preview admin-design-kit__preview--feedback';

  const message = document.createElement('p');
  message.className = 'admin-design-kit__feedback-sample';
  message.dataset.variant = model.variant ?? 'neutral';
  message.textContent = model.sample ?? '';

  preview.append(message);
  return preview;
}

function createLabelPreview(model) {
  const preview = document.createElement('div');
  preview.className = 'admin-design-kit__preview admin-design-kit__preview--labels';

  const chip = document.createElement('span');
  chip.className = 'admin-design-kit__chip';
  chip.dataset.variant = model.variant ?? 'accent';
  chip.textContent = model.label ?? 'Etiqueta';

  preview.append(chip);
  return preview;
}

function createSurfaceShowcase() {
  const section = document.createElement('section');
  section.className = 'admin-design-kit__section';

  const heading = document.createElement('h2');
  heading.className = 'admin-design-kit__section-title';
  heading.textContent = 'Superfícies e cartões';

  const description = document.createElement('p');
  description.className = 'admin-design-kit__paragraph';
  description.textContent =
    'Estruturas base que organizam conteúdo em blocos reutilizáveis. Mantêm tokens de padding, raio e sombra alinhados.';

  const grid = document.createElement('div');
  grid.className = 'admin-design-kit__grid';

  SURFACE_MODELS.forEach((model) => {
    const card = document.createElement('article');
    card.className = 'surface-card admin-design-kit__item';

    const header = document.createElement('div');
    header.className = 'admin-design-kit__item-header';

    const title = document.createElement('h3');
    title.className = 'admin-design-kit__item-title';
    title.textContent = `${model.id} — ${model.title}`;

    header.append(title);

    const preview = createSurfacePreview(model);

    card.append(header, preview);
    grid.append(card);
  });

  section.append(heading, description, grid);
  return section;
}

function createFormShowcase() {
  const section = document.createElement('section');
  section.className = 'admin-design-kit__section';

  const heading = document.createElement('h2');
  heading.className = 'admin-design-kit__section-title';
  heading.textContent = 'Campos de formulário';

  const description = document.createElement('p');
  description.className = 'admin-design-kit__paragraph';
  description.textContent =
    'Controles de entrada homologados para coleta de dados. Todos reutilizam o mesmo espaçamento interno e bordas.';

  const grid = document.createElement('div');
  grid.className = 'admin-design-kit__grid';
  const idFactory = createDesignKitIdFactory();

  FORM_MODELS.forEach((model) => {
    const card = document.createElement('article');
    card.className = 'surface-card admin-design-kit__item';

    const header = document.createElement('div');
    header.className = 'admin-design-kit__item-header';

    const title = document.createElement('h3');
    title.className = 'admin-design-kit__item-title';
    title.textContent = `${model.id} — ${model.title}`;

    header.append(title);

    const preview = createFormPreview(model, idFactory);

    card.append(header, preview);
    grid.append(card);
  });

  section.append(heading, description, grid);
  return section;
}

function createFeedbackShowcase() {
  const section = document.createElement('section');
  section.className = 'admin-design-kit__section';

  const heading = document.createElement('h2');
  heading.className = 'admin-design-kit__section-title';
  heading.textContent = 'Mensagens de feedback';

  const description = document.createElement('p');
  description.className = 'admin-design-kit__paragraph';
  description.textContent =
    'Estados visuais para comunicar sucesso, erro, avisos e neutralidade em formulários ou fluxos do sistema.';

  const grid = document.createElement('div');
  grid.className = 'admin-design-kit__grid';

  FEEDBACK_MODELS.forEach((model) => {
    const card = document.createElement('article');
    card.className = 'surface-card admin-design-kit__item';

    const header = document.createElement('div');
    header.className = 'admin-design-kit__item-header';

    const title = document.createElement('h3');
    title.className = 'admin-design-kit__item-title';
    title.textContent = `${model.id} — ${model.title}`;

    header.append(title);

    const preview = createFeedbackPreview(model);

    card.append(header, preview);
    grid.append(card);
  });

  section.append(heading, description, grid);
  return section;
}

function createLabelShowcase() {
  const section = document.createElement('section');
  section.className = 'admin-design-kit__section';

  const heading = document.createElement('h2');
  heading.className = 'admin-design-kit__section-title';
  heading.textContent = 'Etiquetas e badges';

  const description = document.createElement('p');
  description.className = 'admin-design-kit__paragraph';
  description.textContent =
    'Chips reutilizáveis para categorias, estados e indicadores rápidos. Mantêm raio pill e contrastes aprovados.';

  const grid = document.createElement('div');
  grid.className = 'admin-design-kit__grid';

  LABEL_MODELS.forEach((model) => {
    const card = document.createElement('article');
    card.className = 'surface-card admin-design-kit__item';

    const header = document.createElement('div');
    header.className = 'admin-design-kit__item-header';

    const title = document.createElement('h3');
    title.className = 'admin-design-kit__item-title';
    title.textContent = `${model.id} — ${model.title}`;

    header.append(title);

    const preview = createLabelPreview(model);

    card.append(header, preview);
    grid.append(card);
  });

  section.append(heading, description, grid);
  return section;
}


const BUTTON_SPEC_INDEX = Object.freeze([
  {
    key: 'primaryColor',
    label: 'Cor primária',
    helper:
      'Selecione uma das variações homologadas de preenchimento. Cada opção aplica base e hover pré-definidos.',
    tokens: [
      '--button-bg',
      '--button-hover-bg',
      '--kit-color-primary-strong-base',
      '--kit-color-primary-strong-hover',
      '--kit-color-primary-soft-base',
      '--kit-color-primary-soft-hover',
      '--kit-color-primary-highlight-base',
      '--kit-color-primary-highlight-hover',
      '--kit-color-primary-ghost-base',
      '--kit-color-primary-ghost-hover',
    ],
    options: [
      {
        value:
          'var(--kit-color-primary-strong-base)|var(--kit-color-primary-strong-hover)',
        label: 'Primária intensa — gradiente âmbar',
      },
      {
        value: 'var(--kit-color-primary-soft-base)|var(--kit-color-primary-soft-hover)',
        label: 'Primária suave — translúcida',
      },
      {
        value:
          'var(--kit-color-primary-highlight-base)|var(--kit-color-primary-highlight-hover)',
        label: 'Primária destaque — pill e ícones',
      },
      {
        value: 'var(--kit-color-primary-ghost-base)|var(--kit-color-primary-ghost-hover)',
        label: 'Fantasma — contorno discreto',
      },
    ],
  },
  {
    key: 'secondaryColor',
    label: 'Cor do texto',
    helper:
      'Determina contraste e leitura das etiquetas. As opções já combinam variações para base e hover.',
    tokens: [
      '--button-text-color',
      '--button-hover-text-color',
      '--kit-color-text-contrast-base',
      '--kit-color-text-contrast-hover',
      '--kit-color-text-standard-base',
      '--kit-color-text-standard-hover',
      '--kit-color-text-inverse-base',
      '--kit-color-text-inverse-hover',
    ],
    options: [
      {
        value: 'var(--kit-color-text-contrast-base)|var(--kit-color-text-contrast-hover)',
        label: 'Contraste âmbar — fundos fortes',
      },
      {
        value: 'var(--kit-color-text-standard-base)|var(--kit-color-text-standard-hover)',
        label: 'Neutro aquecido — fundos suaves',
      },
      {
        value: 'var(--kit-color-text-inverse-base)|var(--kit-color-text-inverse-hover)',
        label: 'Inverso claro — fundos escuros',
      },
    ],
  },
  {
    key: 'elevation',
    label: 'Elevação',
    helper:
      'Escolha a sombra aplicada ao botão. Cada opção combina valores para o estado base e de foco/hover.',
    tokens: [
      '--button-shadow',
      '--button-hover-shadow',
      '--kit-elevation-button-flat-base',
      '--kit-elevation-button-flat-hover',
      '--kit-elevation-button-soft-base',
      '--kit-elevation-button-soft-hover',
      '--kit-elevation-button-regular-base',
      '--kit-elevation-button-regular-hover',
      '--kit-elevation-button-strong-base',
      '--kit-elevation-button-strong-hover',
    ],
    options: [
      {
        value:
          'var(--kit-elevation-button-flat-base)|var(--kit-elevation-button-flat-hover)',
        label: 'Sem sombra — estado plano',
      },
      {
        value:
          'var(--kit-elevation-button-soft-base)|var(--kit-elevation-button-soft-hover)',
        label: 'Suave — reforço discreto',
      },
      {
        value:
          'var(--kit-elevation-button-regular-base)|var(--kit-elevation-button-regular-hover)',
        label: 'Média — destaque equilibrado',
      },
      {
        value:
          'var(--kit-elevation-button-strong-base)|var(--kit-elevation-button-strong-hover)',
        label: 'Intensa — foco principal',
      },
    ],
  },
  {
    key: 'width',
    label: 'Largura',
    helper: 'Selecione uma das larguras padronizadas disponíveis no kit.',
    tokens: ['width', 'min-width'],
    options: [
      { value: 'var(--size-inline-sm)', label: 'Compacta — controles icônicos' },
      { value: 'var(--size-inline-md)', label: 'Padrão — botões regulares' },
      { value: 'var(--size-inline-lg)', label: 'Fluida — largura total' },
    ],
  },
  {
    key: 'height',
    label: 'Altura',
    helper: 'Escolha uma das alturas homologadas para controles interativos.',
    tokens: ['--button-padding-block', 'height'],
    options: [
      { value: 'var(--size-block-sm)', label: 'Compacta — padding reduzido' },
      { value: 'var(--size-block-md)', label: 'Padrão — altura regular' },
      { value: 'var(--size-block-lg)', label: 'Quadrada — botões icônicos' },
    ],
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
      'var(--kit-color-primary-strong-base)|var(--kit-color-primary-strong-hover)',
    secondaryColor:
      'var(--kit-color-text-contrast-base)|var(--kit-color-text-contrast-hover)',
    elevation:
      'var(--kit-elevation-button-strong-base)|var(--kit-elevation-button-strong-hover)',
    width: 'var(--size-inline-md)',
    height: 'var(--size-block-md)',
    radius: '0.85rem',
  },
  '02': {
    primaryColor:
      'var(--kit-color-primary-soft-base)|var(--kit-color-primary-soft-hover)',
    secondaryColor:
      'var(--kit-color-text-standard-base)|var(--kit-color-text-standard-hover)',
    elevation:
      'var(--kit-elevation-button-regular-base)|var(--kit-elevation-button-regular-hover)',
    width: 'var(--size-inline-md)',
    height: 'var(--size-block-md)',
    radius: '0.85rem',
  },
  '03': {
    primaryColor:
      'var(--kit-color-primary-ghost-base)|var(--kit-color-primary-ghost-hover)',
    secondaryColor:
      'var(--kit-color-text-standard-base)|var(--kit-color-text-standard-hover)',
    elevation:
      'var(--kit-elevation-button-flat-base)|var(--kit-elevation-button-flat-hover)',
    width: 'var(--size-inline-md)',
    height: 'var(--size-block-md)',
    radius: '0.85rem',
  },
  '04': {
    primaryColor:
      'var(--kit-color-primary-strong-base)|var(--kit-color-primary-strong-hover)',
    secondaryColor:
      'var(--kit-color-text-contrast-base)|var(--kit-color-text-contrast-hover)',
    elevation:
      'var(--kit-elevation-button-strong-base)|var(--kit-elevation-button-strong-hover)',
    width: 'var(--size-inline-md)',
    height: 'var(--size-block-md)',
    radius: '999px',
  },
  '05': {
    primaryColor:
      'var(--kit-color-primary-soft-base)|var(--kit-color-primary-soft-hover)',
    secondaryColor:
      'var(--kit-color-text-standard-base)|var(--kit-color-text-standard-hover)',
    elevation:
      'var(--kit-elevation-button-regular-base)|var(--kit-elevation-button-regular-hover)',
    width: 'var(--size-inline-lg)',
    height: 'var(--size-block-md)',
    radius: '0.85rem',
  },
  '06': {
    primaryColor:
      'var(--kit-color-primary-strong-base)|var(--kit-color-primary-strong-hover)',
    secondaryColor:
      'var(--kit-color-text-contrast-base)|var(--kit-color-text-contrast-hover)',
    elevation:
      'var(--kit-elevation-button-strong-base)|var(--kit-elevation-button-strong-hover)',
    width: 'var(--size-inline-md)',
    height: 'var(--size-block-md)',
    radius: '0.85rem',
  },
  '07': {
    primaryColor:
      'var(--kit-color-primary-highlight-base)|var(--kit-color-primary-highlight-hover)',
    secondaryColor:
      'var(--kit-color-text-standard-base)|var(--kit-color-text-standard-hover)',
    elevation:
      'var(--kit-elevation-button-soft-base)|var(--kit-elevation-button-soft-hover)',
    width: 'var(--size-inline-sm)',
    height: 'var(--size-block-lg)',
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
  elevation: {
    tokens: ['--button-shadow', '--button-hover-shadow'],
    apply(button, value) {
      if (!(button instanceof HTMLElement)) {
        return;
      }

      if (!value) {
        button.style.removeProperty('--button-shadow');
        button.style.removeProperty('--button-hover-shadow');
        button.style.boxShadow = '';
        button.dataset.specElevation = '';
        button.dataset.specElevationBase = '';
        button.dataset.specElevationHover = '';
        return;
      }

      const [base, hover] = value.split('|').map((part) => part.trim());
      const baseValue = base || value.trim();
      const hoverValue = hover || baseValue;

      button.style.setProperty('--button-shadow', baseValue);
      button.style.setProperty('--button-hover-shadow', hoverValue);
      button.style.boxShadow = baseValue;
      button.dataset.specElevation = value;
      button.dataset.specElevationBase = baseValue;
      button.dataset.specElevationHover = hoverValue;
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

    header.append(title);

    const preview = createButtonPreview(model);

    card.append(header, preview);
    grid.append(card);
  });

  section.append(heading, description, grid);
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
  layout.append(createSurfaceShowcase());
  layout.append(createFormShowcase());
  layout.append(createFeedbackShowcase());
  layout.append(createLabelShowcase());
  layout.append(createButtonShowcase());

  viewRoot.replaceChildren(layout);
}
