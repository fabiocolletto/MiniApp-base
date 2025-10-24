import { registerViewCleanup } from '../view-cleanup.js';
import { getActiveUser } from '../data/session-store.js';
import {
  getDesignKitReleaseInfo,
  formatDesignKitReleaseDate,
} from '../data/design-kit-store.js';
import { createInputField, createTextareaField } from './shared/form-fields.js';
import { PANEL_PREVIEW_WIDGET_MODELS } from './shared/panel-preview-widget.js';
import { SYSTEM_LOG_WIDGET_MODELS } from './shared/system-log-widgets.js';
import { USER_DASHBOARD_WIDGET_MODELS } from './shared/user-dashboard-widgets.js';
import { APP_SHELL_LAYOUT_MODELS } from './shared/app-shell-models.js';

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

const COLOR_PALETTE_MODELS = Object.freeze([
  {
    id: 'C01',
    title: 'Primária intensa',
    description:
      'Gradiente âmbar de maior contraste utilizado em botões de destaque e ações críticas.',
    baseToken: '--kit-color-primary-strong-base',
    hoverToken: '--kit-color-primary-strong-hover',
    textToken: '--kit-color-text-contrast-base',
    tokens: [
      '--kit-color-primary-strong-base',
      '--kit-color-primary-strong-hover',
      '--kit-color-text-contrast-base',
    ],
  },
  {
    id: 'C02',
    title: 'Primária suave',
    description:
      'Preenchimento translúcido adotado em botões secundários e superfícies de apoio.',
    baseToken: '--kit-color-primary-soft-base',
    hoverToken: '--kit-color-primary-soft-hover',
    textToken: '--kit-color-text-standard-base',
    tokens: [
      '--kit-color-primary-soft-base',
      '--kit-color-primary-soft-hover',
      '--kit-color-text-standard-base',
    ],
  },
  {
    id: 'C03',
    title: 'Destaque para pills',
    description:
      'Realce aplicado em etiquetas e ícones, mantendo contraste suave em fundos claros.',
    baseToken: '--kit-color-primary-highlight-base',
    hoverToken: '--kit-color-primary-highlight-hover',
    textToken: '--kit-color-text-standard-base',
    tokens: [
      '--kit-color-primary-highlight-base',
      '--kit-color-primary-highlight-hover',
      '--kit-color-text-standard-base',
    ],
  },
  {
    id: 'C04',
    title: 'Fantasma com contorno',
    description:
      'Alternativa com foco no contorno para botões fantasma sobre superfícies coloridas.',
    baseToken: '--kit-color-primary-ghost-base',
    hoverToken: '--kit-color-primary-ghost-hover',
    textToken: '--kit-color-text-standard-base',
    tokens: [
      '--kit-color-primary-ghost-base',
      '--kit-color-primary-ghost-hover',
      '--kit-color-text-standard-base',
    ],
  },
]);

const TYPOGRAPHY_MODELS = Object.freeze([
  {
    id: 'T01',
    title: 'Cabeçalho do painel',
    description:
      'Utilizado nos títulos principais de widgets e seções do dashboard administrativo.',
    sample: 'Título do widget',
    fontSizeToken: '--panel-font-size-heading',
    fontWeight: '600',
    lineHeight: '1.32',
  },
  {
    id: 'T02',
    title: 'Título de bloco',
    description: 'Aplica hierarquia intermediária em chamadas e cards secundários.',
    sample: 'Subtítulo destacado',
    fontSizeToken: '--panel-font-size-title',
    fontWeight: '600',
    lineHeight: '1.3',
  },
  {
    id: 'T03',
    title: 'Texto base',
    description: 'Parágrafos e descrições padrão distribuídas pelos painéis.',
    sample: 'Corpo do conteúdo principal',
    fontSizeToken: '--panel-font-size-base',
    fontWeight: '500',
    lineHeight: '1.5',
  },
  {
    id: 'T04',
    title: 'Texto compacto',
    description: 'Detalhes de apoio, legendas e metadados em chips ou indicadores.',
    sample: 'Legenda auxiliar e metadados',
    fontSizeToken: '--panel-font-size-compact',
    fontWeight: '500',
    lineHeight: '1.45',
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

function createColorSwatchSample({ label, token, textToken }) {
  if (!token) {
    return null;
  }

  const swatch = document.createElement('figure');
  swatch.className = 'admin-design-kit__swatch';

  const sample = document.createElement('span');
  sample.className = 'admin-design-kit__swatch-sample';
  sample.textContent = label ?? '';
  sample.style.setProperty('--swatch-fill', `var(${token})`);
  if (textToken) {
    sample.style.setProperty('--swatch-text', `var(${textToken})`);
  }

  const caption = document.createElement('figcaption');
  caption.className = 'admin-design-kit__swatch-caption';
  caption.textContent = `${label ?? ''} — ${token}`;

  swatch.append(sample, caption);
  return swatch;
}

function createColorPalettePreview(model) {
  const preview = document.createElement('div');
  preview.className = 'admin-design-kit__preview admin-design-kit__preview--colors';

  const swatchList = document.createElement('div');
  swatchList.className = 'admin-design-kit__swatch-list';

  const baseSwatch = createColorSwatchSample({
    label: 'Base',
    token: model.baseToken,
    textToken: model.textToken,
  });
  if (baseSwatch) {
    swatchList.append(baseSwatch);
  }

  const hoverSwatch = createColorSwatchSample({
    label: 'Hover',
    token: model.hoverToken,
    textToken: model.textToken,
  });
  if (hoverSwatch) {
    swatchList.append(hoverSwatch);
  }

  preview.append(swatchList);
  return preview;
}

function createTypographyPreview(model) {
  const preview = document.createElement('div');
  preview.className = 'admin-design-kit__preview admin-design-kit__preview--typography';

  const sample = document.createElement('p');
  sample.className = 'admin-design-kit__type-sample';
  sample.textContent = model.sample ?? '';

  if (model.fontSizeToken) {
    sample.style.setProperty('--type-font-size', `var(${model.fontSizeToken})`);
  }

  if (model.fontWeight) {
    sample.style.setProperty('--type-font-weight', String(model.fontWeight));
  }

  if (model.lineHeight) {
    sample.style.setProperty('--type-line-height', String(model.lineHeight));
  }

  const helper = document.createElement('p');
  helper.className = 'admin-design-kit__type-helper';
  const helperParts = [];

  if (model.fontSizeToken) {
    helperParts.push(model.fontSizeToken);
  }

  if (model.fontWeight) {
    helperParts.push(`peso ${model.fontWeight}`);
  }

  if (model.lineHeight) {
    helperParts.push(`lh ${model.lineHeight}`);
  }

  if (model.description) {
    helperParts.push(model.description);
  }

  helper.textContent = helperParts.join(' • ');

  preview.append(sample, helper);
  return preview;
}

function createDesignKitModelsWidget({ title, description, models, renderModel }) {
  const widget = document.createElement('section');
  widget.className = [
    'surface-card',
    'surface-card--transparent',
    'user-panel__widget',
    'admin-dashboard__widget',
    'admin-design-kit__widget',
    'admin-design-kit__widget--transparent',
  ].join(' ');

  const header = document.createElement('div');
  header.className = 'admin-design-kit__widget-header';

  if (title) {
    const titleElement = document.createElement('h2');
    titleElement.className = 'user-widget__title';
    titleElement.textContent = title;
    header.append(titleElement);
  }

  if (description) {
    const descriptionElement = document.createElement('p');
    descriptionElement.className = 'user-widget__description';
    descriptionElement.textContent = description;
    header.append(descriptionElement);
  }

  const modelsRow = document.createElement('div');
  modelsRow.className = 'admin-design-kit__models';
  modelsRow.setAttribute('role', 'list');

  if (title) {
    const normalized = String(title).trim();
    if (normalized) {
      modelsRow.setAttribute('aria-label', `Modelos de ${normalized.toLocaleLowerCase('pt-BR')}`);
    }
  }

  models
    .map((model) => renderModel(model))
    .filter((element) => element instanceof HTMLElement)
    .forEach((modelElement) => {
      modelElement.classList.add('admin-design-kit__item');
      modelElement.setAttribute('role', 'listitem');
      modelsRow.append(modelElement);
    });

  widget.append(header, modelsRow);
  return widget;
}

function createSurfaceShowcase() {
  return createDesignKitModelsWidget({
    title: 'Superfícies e cartões',
    description:
      'Estruturas base que organizam conteúdo em blocos reutilizáveis. Mantêm tokens de padding, raio e sombra alinhados.',
    models: SURFACE_MODELS,
    renderModel(model) {
      const card = document.createElement('article');
      card.className = 'surface-card admin-design-kit__item-card';
      card.dataset.modelId = model.id;

      if (model.description) {
        card.title = model.description;
      }

      const header = document.createElement('div');
      header.className = 'admin-design-kit__item-header';

      const title = document.createElement('h3');
      title.className = 'admin-design-kit__item-title';
      title.textContent = `${model.id} — ${model.title}`;

      header.append(title);

      const preview = createSurfacePreview(model);

      card.append(header, preview);
      return card;
    },
  });
}

function createFormShowcase() {
  const idFactory = createDesignKitIdFactory();
  return createDesignKitModelsWidget({
    title: 'Campos de formulário',
    description:
      'Controles de entrada homologados para coleta de dados. Todos reutilizam o mesmo espaçamento interno e bordas.',
    models: FORM_MODELS,
    renderModel(model) {
      const card = document.createElement('article');
      card.className = 'surface-card admin-design-kit__item-card';
      card.dataset.modelId = model.id;

      if (model.description) {
        card.title = model.description;
      }

      const header = document.createElement('div');
      header.className = 'admin-design-kit__item-header';

      const title = document.createElement('h3');
      title.className = 'admin-design-kit__item-title';
      title.textContent = `${model.id} — ${model.title}`;

      header.append(title);

      const preview = createFormPreview(model, idFactory);

      card.append(header, preview);
      return card;
    },
  });
}

function createFeedbackShowcase() {
  return createDesignKitModelsWidget({
    title: 'Mensagens de feedback',
    description:
      'Estados visuais para comunicar sucesso, erro, avisos e neutralidade em formulários ou fluxos do sistema.',
    models: FEEDBACK_MODELS,
    renderModel(model) {
      const card = document.createElement('article');
      card.className = 'surface-card admin-design-kit__item-card';
      card.dataset.modelId = model.id;

      if (model.description) {
        card.title = model.description;
      }

      const header = document.createElement('div');
      header.className = 'admin-design-kit__item-header';

      const title = document.createElement('h3');
      title.className = 'admin-design-kit__item-title';
      title.textContent = `${model.id} — ${model.title}`;

      header.append(title);

      const preview = createFeedbackPreview(model);

      card.append(header, preview);
      return card;
    },
  });
}

function createLabelShowcase() {
  return createDesignKitModelsWidget({
    title: 'Etiquetas e chips',
    description:
      'Etiquetas em formato pill com opções de contraste para destacar categorias e estados.',
    models: LABEL_MODELS,
    renderModel(model) {
      const card = document.createElement('article');
      card.className = 'surface-card admin-design-kit__item-card';
      card.dataset.modelId = model.id;

      if (model.description) {
        card.title = model.description;
      }

      const header = document.createElement('div');
      header.className = 'admin-design-kit__item-header';

      const title = document.createElement('h3');
      title.className = 'admin-design-kit__item-title';
      title.textContent = `${model.id} — ${model.title}`;

      header.append(title);

      const preview = createLabelPreview(model);

      card.append(header, preview);
      return card;
    },
  });
}

function createSystemWidgetShowcase() {
  return createDesignKitModelsWidget({
    title: 'Widgets do sistema',
    description:
      'Modelos homologados para abertura de painéis com cartões transparentes e hierarquia padronizada.',
    models: SYSTEM_LOG_WIDGET_MODELS,
    renderModel(model) {
      const card = document.createElement('article');
      card.className = 'surface-card admin-design-kit__item-card';
      card.dataset.modelId = model.id;

      if (model.description) {
        card.title = model.description;
      }

      const header = document.createElement('div');
      header.className = 'admin-design-kit__item-header';

      const title = document.createElement('h3');
      title.className = 'admin-design-kit__item-title';
      title.textContent = `${model.id} — ${model.title}`;

      header.append(title);

      const preview = document.createElement('div');
      preview.className = 'admin-design-kit__preview admin-design-kit__preview--widgets';

      const widgetElement = typeof model.create === 'function' ? model.create() : null;

      if (widgetElement instanceof HTMLElement) {
        preview.append(widgetElement);
      } else {
        const fallback = document.createElement('p');
        fallback.className = 'admin-design-kit__paragraph';
        fallback.textContent = 'Prévia indisponível para este modelo.';
        preview.append(fallback);
      }

      card.append(header, preview);
      return card;
    },
  });
}

function createUserDashboardWidgetShowcase() {
  return createDesignKitModelsWidget({
    title: 'Widgets do painel do usuário',
    description:
      'Seções homologadas para atalhos rápidos e resumo de dados sincronizados com o painel administrativo.',
    models: USER_DASHBOARD_WIDGET_MODELS,
    renderModel(model) {
      const card = document.createElement('article');
      card.className = 'surface-card admin-design-kit__item-card';
      card.dataset.modelId = model.id;

      if (model.description) {
        card.title = model.description;
      }

      const header = document.createElement('div');
      header.className = 'admin-design-kit__item-header';

      const title = document.createElement('h3');
      title.className = 'admin-design-kit__item-title';
      title.textContent = `${model.id} — ${model.title}`;

      header.append(title);

      const preview = document.createElement('div');
      preview.className = 'admin-design-kit__preview admin-design-kit__preview--widgets';

      const widgetElement = typeof model.create === 'function' ? model.create() : null;

      if (widgetElement instanceof HTMLElement) {
        preview.append(widgetElement);
      } else {
        const fallback = document.createElement('p');
        fallback.className = 'admin-design-kit__paragraph';
        fallback.textContent = 'Prévia indisponível para este modelo.';
        preview.append(fallback);
      }

      card.append(header, preview);
      return card;
    },
  });
}

function createPanelPreviewShowcase() {
  return createDesignKitModelsWidget({
    title: 'Widgets de pré-visualização',
    description:
      'Miniaturas padrão para replicar as telas dos painéis e miniapps dentro de dashboards administrativos.',
    models: PANEL_PREVIEW_WIDGET_MODELS,
    renderModel(model) {
      const card = document.createElement('article');
      card.className = 'surface-card admin-design-kit__item-card';
      card.dataset.modelId = model.id;

      if (model.description) {
        card.title = model.description;
      }

      const header = document.createElement('div');
      header.className = 'admin-design-kit__item-header';

      const title = document.createElement('h3');
      title.className = 'admin-design-kit__item-title';
      title.textContent = `${model.id} — ${model.title}`;

      header.append(title);

      const preview = document.createElement('div');
      preview.className = 'admin-design-kit__preview admin-design-kit__preview--widgets';

      const widgetElement = typeof model.create === 'function' ? model.create() : null;

      if (widgetElement instanceof HTMLElement) {
        preview.append(widgetElement);
      } else {
        const fallback = document.createElement('p');
        fallback.className = 'admin-design-kit__paragraph';
        fallback.textContent = 'Prévia indisponível para este modelo.';
        preview.append(fallback);
      }

      card.append(header, preview);
      return card;
    },
  });
}

function createAppShellPreview(model) {
  const preview = document.createElement('div');
  preview.className = 'admin-design-kit__preview';

  if (Array.isArray(model.composition) && model.composition.length > 0) {
    const compositionLabel = document.createElement('p');
    compositionLabel.className = 'admin-design-kit__paragraph';
    compositionLabel.textContent = 'Composição base:';
    preview.append(compositionLabel);

    model.composition.forEach((piece) => {
      if (!piece || typeof piece !== 'object') {
        return;
      }

      const entry = document.createElement('p');
      entry.className = 'admin-design-kit__paragraph';

      const slot = document.createElement('strong');
      slot.textContent = `${piece.slot ?? 'Seção'}: `;
      entry.append(slot);

      const description = document.createTextNode(piece.description ?? 'Descrição indisponível.');
      entry.append(description);

      preview.append(entry);
    });
  }

  if (Array.isArray(model.tokens) && model.tokens.length > 0) {
    const tokensParagraph = document.createElement('p');
    tokensParagraph.className = 'admin-design-kit__paragraph';
    tokensParagraph.textContent = `Tokens de layout: ${model.tokens.join(', ')}`;
    preview.append(tokensParagraph);
  }

  if (Array.isArray(model.notes) && model.notes.length > 0) {
    const notesLabel = document.createElement('p');
    notesLabel.className = 'admin-design-kit__paragraph';
    notesLabel.textContent = 'Notas de implementação:';
    preview.append(notesLabel);

    const notesList = document.createElement('ul');
    notesList.setAttribute('role', 'list');

    model.notes.forEach((note) => {
      if (typeof note !== 'string' || note.trim() === '') {
        return;
      }

      const item = document.createElement('li');
      item.className = 'admin-design-kit__paragraph';
      item.textContent = note;
      notesList.append(item);
    });

    if (notesList.children.length > 0) {
      preview.append(notesList);
    }
  }

  return preview;
}

function createAppShellShowcase() {
  return createDesignKitModelsWidget({
    title: 'Layouts do app shell',
    description:
      'Modelos oficiais do container principal com offsets de cabeçalho e rodapé fixos para painéis administrativos e de usuário.',
    models: APP_SHELL_LAYOUT_MODELS,
    renderModel(model) {
      const card = document.createElement('article');
      card.className = 'surface-card admin-design-kit__item-card';
      card.dataset.modelId = model.id;

      if (model.description) {
        card.title = model.description;
      }

      const header = document.createElement('div');
      header.className = 'admin-design-kit__item-header';

      const title = document.createElement('h3');
      title.className = 'admin-design-kit__item-title';
      title.textContent = `${model.id} — ${model.title}`;
      header.append(title);

      if (model.description) {
        const description = document.createElement('p');
        description.className = 'admin-design-kit__item-description';
        description.textContent = model.description;
        header.append(description);
      }

      const preview = createAppShellPreview(model);

      card.append(header, preview);
      return card;
    },
  });
}



function createColorPaletteShowcase() {
  return createDesignKitModelsWidget({
    title: 'Paleta de cores',
    description:
      'Combinações homologadas para preenchimentos primários e variações translúcidas utilizadas em botões e etiquetas.',
    models: COLOR_PALETTE_MODELS,
    renderModel(model) {
      const card = document.createElement('article');
      card.className = 'surface-card admin-design-kit__item-card';
      card.dataset.modelId = model.id;

      if (model.description) {
        card.title = model.description;
      }

      const header = document.createElement('div');
      header.className = 'admin-design-kit__item-header';

      const title = document.createElement('h3');
      title.className = 'admin-design-kit__item-title';
      title.textContent = `${model.id} — ${model.title}`;

      header.append(title);

      const preview = createColorPalettePreview(model);

      card.append(header, preview);
      return card;
    },
  });
}

function createTypographyShowcase() {
  return createDesignKitModelsWidget({
    title: 'Gabarito tipográfico',
    description:
      'Escala de fontes e pesos aplicados nos painéis administrativos para assegurar hierarquia e legibilidade.',
    models: TYPOGRAPHY_MODELS,
    renderModel(model) {
      const card = document.createElement('article');
      card.className = 'surface-card admin-design-kit__item-card';
      card.dataset.modelId = model.id;

      if (model.description) {
        card.title = model.description;
      }

      const header = document.createElement('div');
      header.className = 'admin-design-kit__item-header';

      const title = document.createElement('h3');
      title.className = 'admin-design-kit__item-title';
      title.textContent = `${model.id} — ${model.title}`;

      header.append(title);

      const preview = createTypographyPreview(model);

      card.append(header, preview);
      return card;
    },
  });
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
  message.textContent = 'Somente administradores podem visualizar o painel de design.';

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
  return createDesignKitModelsWidget({
    title: 'Modelos de botões',
    description:
      'Referencie os modelos abaixo pelo identificador sequencial ao solicitar novos componentes.',
    models: BUTTON_MODELS,
    renderModel(model) {
      const card = document.createElement('article');
      card.className = 'surface-card admin-design-kit__item-card';
      card.dataset.modelId = model.id;

      if (model.description) {
        card.title = model.description;
      }

      const header = document.createElement('div');
      header.className = 'admin-design-kit__item-header';

      const title = document.createElement('h3');
      title.className = 'admin-design-kit__item-title';
      title.textContent = `Botão ${model.id} — ${model.title}`;

      header.append(title);

      const preview = createButtonPreview(model);

      card.append(header, preview);
      return card;
    },
  });
}

const USER_TYPE_LABELS = Object.freeze({
  administrador: 'Administrador',
  colaborador: 'Colaborador',
  usuario: 'Usuário',
});

function normalizeUserType(user) {
  if (!user || typeof user !== 'object') {
    return 'usuario';
  }

  const rawType = typeof user.userType === 'string' ? user.userType.trim().toLowerCase() : '';
  return USER_TYPE_LABELS[rawType] ? rawType : 'usuario';
}

function formatUserTypeLabel(user) {
  const normalized = normalizeUserType(user);
  return USER_TYPE_LABELS[normalized] ?? USER_TYPE_LABELS.usuario;
}

function formatUserName(user) {
  if (typeof user?.name === 'string') {
    const trimmed = user.name.trim();
    if (trimmed !== '') {
      return trimmed;
    }
  }

  return '—';
}

function formatUserEmail(user) {
  if (typeof user?.profile?.email === 'string') {
    const trimmed = user.profile.email.trim();
    if (trimmed !== '') {
      return trimmed;
    }
  }

  return '—';
}

function formatUserPhone(user) {
  if (typeof user?.phone === 'string') {
    const trimmed = user.phone.trim();
    if (trimmed !== '') {
      return trimmed;
    }
  }

  if (typeof user?.profile?.secondaryPhone === 'string') {
    const trimmed = user.profile.secondaryPhone.trim();
    if (trimmed !== '') {
      return trimmed;
    }
  }

  return '—';
}

function createSummaryEntry(term, value) {
  if (!term || !value) {
    return null;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'user-dashboard__summary-item';

  const termElement = document.createElement('dt');
  termElement.className = 'user-dashboard__summary-label';
  termElement.textContent = term;

  const valueElement = document.createElement('dd');
  valueElement.className = 'user-dashboard__summary-value';
  valueElement.textContent = value;

  wrapper.append(termElement, valueElement);
  return wrapper;
}

function createDesignKitTitleWidget() {
  const widget = document.createElement('section');
  widget.className = [
    'surface-card',
    'surface-card--transparent',
    'user-panel__widget',
    'admin-dashboard__widget',
    'admin-design-kit__widget',
    'admin-design-kit__widget--transparent',
  ].join(' ');

  const title = document.createElement('h2');
  title.className = 'user-widget__title';
  title.textContent = 'Painel de design 5Horas';

  widget.append(title);
  return widget;
}

function createDesignKitPanelLabelWidget(user) {
  const widget = document.createElement('section');
  widget.className = [
    'surface-card',
    'surface-card--transparent',
    'user-panel__widget',
    'admin-dashboard__widget',
    'admin-design-kit__widget',
    'admin-design-kit__widget--transparent',
  ].join(' ');

  const title = document.createElement('h2');
  title.className = 'user-widget__title';
  title.textContent = 'Etiqueta do painel';

  const description = document.createElement('p');
  description.className = 'user-widget__description';
  description.textContent = 'Compartilhe esta etiqueta para facilitar o acesso rápido ao painel.';

  const labelGroup = document.createElement('div');
  labelGroup.className = 'miniapp-details__highlights';

  const panelLabel = document.createElement('span');
  panelLabel.className = 'miniapp-details__chip';
  panelLabel.textContent = 'Painel de design';
  labelGroup.append(panelLabel);

  const releaseInfo = getDesignKitReleaseInfo();
  const releaseDetails = [];

  const formattedRelease = formatDesignKitReleaseDate(releaseInfo.publishedAt);
  if (formattedRelease) {
    releaseDetails.push(`Atualizado em ${formattedRelease}`);
  }

  if (releaseInfo.version) {
    releaseDetails.push(releaseInfo.version);
  }

  if (releaseDetails.length > 0) {
    const releaseChip = document.createElement('span');
    releaseChip.className = 'miniapp-details__chip';
    releaseChip.textContent = releaseDetails.join(' • ');
    labelGroup.append(releaseChip);
  }

  const profileLabel = document.createElement('span');
  profileLabel.className = 'miniapp-details__chip';
  profileLabel.textContent = `Perfil ${formatUserTypeLabel(user)}`;
  labelGroup.append(profileLabel);

  widget.append(title, description, labelGroup);

  const summary = document.createElement('div');
  summary.className = 'user-dashboard__summary';

  const userInfoList = document.createElement('dl');
  userInfoList.className = 'user-dashboard__summary-list';

  [
    ['Nome', formatUserName(user)],
    ['E-mail', formatUserEmail(user)],
    ['Telefone', formatUserPhone(user)],
  ]
    .map(([term, value]) => createSummaryEntry(term, value))
    .filter(Boolean)
    .forEach((entry) => {
      userInfoList.append(entry);
    });

  if (userInfoList.children.length > 0) {
    summary.append(userInfoList);
  }

  if (summary.children.length > 0) {
    widget.append(summary);
  }

  return widget;
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
        console.error('Erro ao limpar o painel de design.', error);
      }
    }
  });

  viewRoot.className = BASE_CLASSES;
  viewRoot.dataset.view = 'admin-design-kit';
  viewRoot.setAttribute('aria-label', 'Painel de design do administrador');

  const layout = document.createElement('div');
  layout.className = 'user-panel__layout admin-dashboard__layout admin-design-kit__layout';

  const activeUser = getActiveUser();
  if (!isAdminUser(activeUser)) {
    layout.append(createRestrictedMessage());
    viewRoot.replaceChildren(layout);
    return;
  }

  layout.append(createDesignKitTitleWidget());
  layout.append(createDesignKitPanelLabelWidget(activeUser));
  layout.append(createSystemWidgetShowcase());
  layout.append(createUserDashboardWidgetShowcase());
  layout.append(createPanelPreviewShowcase());
  layout.append(createAppShellShowcase());
  layout.append(createColorPaletteShowcase());
  layout.append(createTypographyShowcase());
  layout.append(createSurfaceShowcase());
  layout.append(createFormShowcase());
  layout.append(createFeedbackShowcase());
  layout.append(createLabelShowcase());
  layout.append(createButtonShowcase());

  viewRoot.replaceChildren(layout);
}
