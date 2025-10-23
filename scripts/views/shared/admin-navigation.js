import eventBus from '../../events/event-bus.js';

const NAVIGATION_ITEMS = [
  {
    key: 'overview',
    view: 'admin',
    label: 'Painel do Admin',
    description: 'Indicadores em tempo real e gestão de recursos.',
  },
  {
    key: 'design-kit',
    view: 'admin-design-kit',
    label: 'Kit de Design',
    description: 'Catálogo de componentes padrões para o dia de design.',
  },
];

function createButton({ label, description, active, view }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `button button--stacked ${active ? 'button--primary' : 'button--ghost'} admin-menu__button`;
  button.setAttribute('aria-pressed', active ? 'true' : 'false');
  button.dataset.state = active ? 'active' : 'inactive';

  const title = document.createElement('span');
  title.className = 'admin-menu__button-title';
  title.textContent = label;

  const subtitle = document.createElement('span');
  subtitle.className = 'admin-menu__button-description';
  subtitle.textContent = description;

  button.append(title, subtitle);

  if (!active) {
    const handleClick = () => {
      eventBus.emit('app:navigate', { view });
    };
    button.addEventListener('click', handleClick);
    return { button, cleanup: () => button.removeEventListener('click', handleClick) };
  }

  return { button, cleanup: () => {} };
}

export function createAdminNavigation(options = {}) {
  const activeKey = typeof options.active === 'string' ? options.active : 'overview';

  const nav = document.createElement('nav');
  nav.className = 'admin-menu surface-card';
  nav.setAttribute('aria-label', 'Menu do administrador');

  const container = document.createElement('div');
  container.className = 'admin-menu__list';
  nav.append(container);

  const cleanups = [];

  NAVIGATION_ITEMS.forEach((item) => {
    const isActive = item.key === activeKey;
    const { button, cleanup } = createButton({
      label: item.label,
      description: item.description,
      active: isActive,
      view: item.view,
    });
    container.append(button);
    cleanups.push(cleanup);
  });

  return {
    element: nav,
    cleanup: () => {
      while (cleanups.length > 0) {
        const fn = cleanups.pop();
        try {
          if (typeof fn === 'function') {
            fn();
          }
        } catch (error) {
          console.error('Erro ao limpar navegação do administrador.', error);
        }
      }
    },
  };
}
