import eventBus from '../../events/event-bus.js';
import { getSystemReleaseInfo, formatSystemReleaseDate } from '../../data/system-info.js';

const NAVIGATION_ITEMS = [
  {
    key: 'overview',
    view: 'admin',
    label: 'Painel do Admin',
    description: 'Indicadores em tempo real e gestão de recursos.',
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

  const releaseInfo = getSystemReleaseInfo();
  const metaGroup = document.createElement('div');
  metaGroup.className = 'admin-menu__meta miniapp-details__highlights';
  metaGroup.setAttribute('aria-label', 'Informações do sistema');

  const kitChip = document.createElement('span');
  kitChip.className = 'miniapp-details__chip';
  kitChip.textContent = 'Painel de design';
  metaGroup.append(kitChip);

  const versionLabel = typeof releaseInfo?.version === 'string' ? releaseInfo.version.trim() : '';
  if (versionLabel) {
    const normalizedVersion = versionLabel.replace(/^v/i, '');
    const versionChip = document.createElement('span');
    versionChip.className = 'miniapp-details__chip';
    versionChip.dataset.type = 'version';
    versionChip.textContent = `Versão v${normalizedVersion}`;
    metaGroup.append(versionChip);
  }

  const publishedLabel = formatSystemReleaseDate(releaseInfo?.publishedAt);
  if (publishedLabel) {
    const publishedChip = document.createElement('span');
    publishedChip.className = 'miniapp-details__chip';
    publishedChip.dataset.type = 'published-at';
    publishedChip.textContent = `Publicado em ${publishedLabel}`;
    metaGroup.append(publishedChip);
  }

  if (metaGroup.childElementCount > 0) {
    nav.append(metaGroup);
  }

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
