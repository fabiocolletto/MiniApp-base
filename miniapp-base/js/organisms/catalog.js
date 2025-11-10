(function (window, document) {
  'use strict';

  var root = window.miniappBase || (window.miniappBase = {});
  var atoms = root.atoms || (root.atoms = {});
  var molecules = root.molecules || (root.molecules = {});

  var createFavoriteManager = molecules.createFavoriteManager || function () { return null; };
  var carousel = molecules.carousel || { mount: function () {}, refresh: function () {} };
  var shellSync = molecules.shellSync || {
    sendMiniAppHeader: function () {},
  };

  var normalizeLocale = atoms.normalizeLocale || function (locale, supported, fallback) {
    if (Array.isArray(supported) && supported.indexOf(locale) !== -1) {
      return locale;
    }
    return fallback || (supported && supported[0]) || 'pt-BR';
  };
  var getDocumentLocale = atoms.getDocumentLocale || function (supported, fallback) {
    var docLang = (document.documentElement && document.documentElement.lang) || '';
    return normalizeLocale(docLang, supported, fallback);
  };

  document.addEventListener('DOMContentLoaded', function () {
    var miniapps = [
      {
        id: 'miniapp-prefeito',
        name: 'Painel do Prefeito',
        description: 'Painel com KPIs, filtros e relatórios setoriais.',
        icon: 'monitoring',
        theme: 'prefeito',
        href: '../miniapp-prefeito/index.html',
        favorite: true,
      },
      {
        id: 'miniapp-cadastro',
        name: 'Cadastro de Usuários',
        description: 'Fluxo guiado para cadastrar novos usuários e registrar aceite de termos.',
        icon: 'person_add',
        theme: 'cadastro',
        href: '../miniapp-cadastro/index.html',
        favorite: true,
      },
      {
        id: 'miniapp-importador',
        name: 'Importador de Pesquisas',
        description: 'Fluxo para importar arquivos CSV de pesquisas e revisar resultados.',
        icon: 'cloud_upload',
        theme: 'importador',
        href: '../miniapp-importador/index.html',
        favorite: false,
      },
      {
        id: 'miniapp-tts',
        name: 'Gerador de Roteiros TTS',
        description: 'Formulário guiado com prévias de áudio e exportação otimizada para locução.',
        icon: 'text_to_speech',
        theme: 'tts',
        href: '../miniapp-tts/index.html',
        favorite: false,
      },
    ];

    var FAVORITES_STORAGE_KEY = 'miniappCatalog.favorites';
    var SUPPORTED_LOCALES = ['pt-BR', 'en-US', 'es-ES'];
    var FAVORITE_COPY = {
      'pt-BR': { add: 'Adicionar aos favoritos', remove: 'Remover dos favoritos' },
      'en-US': { add: 'Add to favorites', remove: 'Remove from favorites' },
      'es-ES': { add: 'Agregar a favoritos', remove: 'Quitar de favoritos' },
    };
    var CATALOG_HEADER_COPY = {
      'pt-BR': {
        title: 'Catálogo de MiniApps',
        subtitle: 'Escolha um MiniApp para abrir.',
        icon: 'apps',
        iconTheme: 'catalog',
      },
      'en-US': {
        title: 'MiniApps Catalog',
        subtitle: 'Choose a MiniApp to open.',
        icon: 'apps',
        iconTheme: 'catalog',
      },
      'es-ES': {
        title: 'Catálogo de MiniApps',
        subtitle: 'Elige un MiniApp para abrir.',
        icon: 'apps',
        iconTheme: 'catalog',
      },
    };

    var favoritesManager = createFavoriteManager({
      storageKey: FAVORITES_STORAGE_KEY,
      apps: miniapps,
      defaultFavorites: miniapps
        .filter(function (app) {
          return app.favorite;
        })
        .map(function (app) {
          return app.id;
        }),
      supportedLocales: SUPPORTED_LOCALES,
      copy: FAVORITE_COPY,
    });

    if (!favoritesManager) {
      return;
    }

    var favoritesContainer = document.querySelector('[data-carousel="favorites"]');
    var allContainer = document.querySelector('[data-carousel="all"]');

    function getActiveLocale() {
      return getDocumentLocale(SUPPORTED_LOCALES, 'pt-BR');
    }

    function getFavoriteActionCopy(isActive) {
      var locale = getActiveLocale();
      return favoritesManager.getActionCopy(locale, isActive);
    }

    function createFavoriteButton(app) {
      var isActive = favoritesManager.isFavorite(app.id);
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'catalog-card__favorite';

      if (isActive) {
        button.classList.add('is-active');
      }

      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');

      var label = getFavoriteActionCopy(isActive);
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);

      var icon = document.createElement('span');
      icon.className = 'material-symbols-rounded catalog-card__favorite-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = 'star';

      button.appendChild(icon);

      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(app.id);
      });

      return button;
    }

    function createCard(app) {
      var article = document.createElement('article');
      article.className = 'app-card catalog-card';
      article.setAttribute('data-miniapp-id', app.id);

      if (favoritesManager.isFavorite(app.id)) {
        article.classList.add('is-favorited');
      }

      var link = document.createElement('a');
      link.className = 'catalog-card__link';
      link.href = app.href;
      link.target = 'miniapp-panel';
      link.setAttribute('data-miniapp-target', app.href);
      link.setAttribute('data-miniapp-name', app.name);
      link.setAttribute('data-miniapp-description', app.description);
      link.setAttribute('data-miniapp-icon-symbol', app.icon);
      link.setAttribute('data-miniapp-icon-theme', app.theme);

      var header = document.createElement('div');
      header.className = 'catalog-card__header';

      var icon = document.createElement('span');
      icon.className = 'material-symbols-rounded app-icon app-icon--theme-' + app.theme;
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = app.icon;

      var content = document.createElement('div');
      content.className = 'catalog-card__content';

      var title = document.createElement('h3');
      title.textContent = app.name;

      var description = document.createElement('p');
      description.textContent = app.description;

      content.appendChild(title);
      content.appendChild(description);
      header.appendChild(icon);
      header.appendChild(content);
      link.appendChild(header);
      article.appendChild(link);

      article.appendChild(createFavoriteButton(app));

      return article;
    }

    function mountCarousel(container, items) {
      if (!container) {
        return;
      }

      var section = container.closest('section');
      var hasItems = Array.isArray(items) && items.length > 0;

      var trackElement = container.querySelector('.carousel-track');

      if (!hasItems) {
        if (section) {
          section.hidden = true;
        }

        if (container.hasAttribute('data-carousel-bound')) {
          if (trackElement) {
            trackElement.innerHTML = '';
          } else {
            container.innerHTML = '';
          }
          carousel.refresh(container);
        } else {
          container.innerHTML = '';
        }
        return;
      }

      if (section) {
        section.hidden = false;
      }

      var fragment = document.createDocumentFragment();
      var isBound = container.hasAttribute('data-carousel-bound');

      items.forEach(function (app) {
        var card = createCard(app);
        if (isBound) {
          var slide = document.createElement('div');
          slide.className = 'carousel-slide';
          slide.setAttribute('role', 'listitem');
          slide.appendChild(card);
          fragment.appendChild(slide);
        } else {
          fragment.appendChild(card);
        }
      });

      if (isBound) {
        if (trackElement) {
          trackElement.innerHTML = '';
          trackElement.appendChild(fragment);
        }
        carousel.refresh(container);
      } else {
        container.innerHTML = '';
        container.appendChild(fragment);
        carousel.mount(container);
      }
    }

    function renderCatalog(options) {
      var focusMiniAppId = options && options.focusMiniAppId;

      miniapps.forEach(function (app) {
        app.favorite = favoritesManager.isFavorite(app.id);
      });

      var favorites = miniapps.filter(function (app) {
        return favoritesManager.isFavorite(app.id);
      });

      mountCarousel(favoritesContainer, favorites);
      mountCarousel(allContainer, miniapps);

      if (!focusMiniAppId) {
        return;
      }

      requestAnimationFrame(function () {
        var selector = '[data-miniapp-id="' + focusMiniAppId + '"] .catalog-card__favorite';
        var button = document.querySelector(selector);
        if (button && typeof button.focus === 'function') {
          button.focus();
        }
      });
    }

    function toggleFavorite(appId) {
      if (!favoritesManager.toggle(appId)) {
        return;
      }

      renderCatalog({ focusMiniAppId: appId });
    }

    function applyLocale(locale) {
      var nextLocale = normalizeLocale(locale, SUPPORTED_LOCALES, 'pt-BR');

      if (document.documentElement) {
        document.documentElement.lang = nextLocale;
      }

      renderCatalog();
      notifyShell();
    }

    function notifyShell() {
      var locale = getActiveLocale();
      var copy = CATALOG_HEADER_COPY[locale] || CATALOG_HEADER_COPY['pt-BR'];
      shellSync.sendMiniAppHeader(copy);
    }

    window.addEventListener('message', function (event) {
      if (!event || !event.data || typeof event.data !== 'object') {
        return;
      }

      if (window.parent && event.source && event.source !== window.parent) {
        return;
      }

      if (event.data.action === 'set-locale' && 'locale' in event.data) {
        applyLocale(event.data.locale);
      }
    });

    applyLocale((document.documentElement && document.documentElement.lang) || 'pt-BR');

    notifyShell();

    if (atoms.isEmbedded && atoms.isEmbedded()) {
      if (atoms.postToParent && atoms.postToParent({ action: 'request-locale' })) {
        return;
      }

      try {
        window.parent.postMessage({ action: 'request-locale' }, window.location.origin || '*');
      } catch (error) {
        console.error('Não foi possível solicitar o idioma ao shell.', error);
      }
    }
  });
})(window, document);
