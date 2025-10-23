import { registerViewCleanup } from '../view-cleanup.js';
import { getActiveUser } from '../data/session-store.js';
import { createAdminNavigation } from './shared/admin-navigation.js';

const BASE_CLASSES = 'card view dashboard-view view--admin admin-design-kit';

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

  const cleanupHandlers = [];

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
  layout.className = 'admin-design-kit__layout';

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

  viewRoot.replaceChildren(layout);
}
