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
    var miniappDefinitions = [
      {
        id: 'miniapp-prefeito',
        name: 'Painel do Prefeito',
        description: 'Painel com KPIs, filtros e relatórios setoriais.',
        icon: 'monitoring',
        theme: 'prefeito',
        href: '../miniapp-prefeito/index.html',
        isDefaultFavorite: true,
      },
      {
        id: 'miniapp-cadastro',
        name: 'Cadastro de Usuários',
        description:
          'Fluxo guiado para cadastrar novos usuários e registrar aceite de termos.',
        icon: 'person_add',
        theme: 'cadastro',
        href: '../miniapp-cadastro/index.html',
        isDefaultFavorite: true,
      },
      {
        id: 'miniapp-importador',
        name: 'Importador de Pesquisas',
        description:
          'Fluxo para importar arquivos CSV de pesquisas e revisar resultados.',
        icon: 'cloud_upload',
        theme: 'importador',
        href: '../miniapp-importador/index.html',
        isDefaultFavorite: false,
      },
      {
        id: 'miniapp-tts',
        name: 'Gerador de Roteiros TTS',
        description:
          'Formulário guiado com prévias de áudio e exportação otimizada para locução.',
        icon: 'text_to_speech',
        theme: 'tts',
        href: '../miniapp-tts/index.html',
        isDefaultFavorite: false,
      },
    ];

    var MINIAPP_COPY = {
      'pt-BR': miniappDefinitions.reduce(function (dictionary, app) {
        dictionary[app.id] = {
          name: app.name,
          description: app.description,
        };
        return dictionary;
      }, {}),
      'en-US': {
        'miniapp-prefeito': {
          name: "Mayor's Dashboard",
          description: 'Dashboard with KPIs, filters, and sector reports.',
        },
        'miniapp-cadastro': {
          name: 'User Registration',
          description:
            'Guided flow to register new users and record terms acceptance.',
        },
        'miniapp-importador': {
          name: 'Survey Importer',
          description: 'Flow to import survey CSV files and review results.',
        },
        'miniapp-tts': {
          name: 'TTS Script Generator',
          description:
            'Guided form with audio previews and optimized export for voice-over.',
        },
      },
      'es-ES': {
        'miniapp-prefeito': {
          name: 'Panel del Alcalde',
          description: 'Panel con KPI, filtros e informes sectoriales.',
        },
        'miniapp-cadastro': {
          name: 'Registro de Usuarios',
          description:
            'Flujo guiado para registrar nuevos usuarios y guardar la aceptación de términos.',
        },
        'miniapp-importador': {
          name: 'Importador de Encuestas',
          description:
            'Flujo para importar archivos CSV de encuestas y revisar resultados.',
        },
        'miniapp-tts': {
          name: 'Generador de Guiones TTS',
          description:
            'Formulario guiado con vistas previas de audio y exportación optimizada para locución.',
        },
      },
    };

    var FAVORITES_STORAGE_KEY = 'miniappCatalog.favorites';
    var SUPPORTED_LOCALES = ['pt-BR', 'en-US', 'es-ES'];
    var FAVORITE_COPY = {
      'pt-BR': { add: 'Adicionar aos favoritos', remove: 'Remover dos favoritos' },
      'en-US': { add: 'Add to favorites', remove: 'Remove from favorites' },
      'es-ES': { add: 'Agregar a favoritos', remove: 'Quitar de favoritos' },
    };
    var CATALOG_SECTION_COPY = {
      'pt-BR': {
        boardLabel: 'Catálogo de MiniApps',
        favorites: {
          title: 'Favoritos',
          description: 'MiniApps fixos para acesso rápido.',
          carouselLabel: 'MiniApps favoritos',
        },
        all: {
          title: 'Todos os MiniApps',
          description: 'Lista completa de MiniApps disponíveis.',
          carouselLabel: 'MiniApps disponíveis',
        },
      },
      'en-US': {
        boardLabel: 'MiniApps Catalog',
        favorites: {
          title: 'Favorites',
          description: 'Pinned MiniApps for quick access.',
          carouselLabel: 'Favorite MiniApps',
        },
        all: {
          title: 'All MiniApps',
          description: 'Complete list of available MiniApps.',
          carouselLabel: 'Available MiniApps',
        },
      },
      'es-ES': {
        boardLabel: 'Catálogo de MiniApps',
        favorites: {
          title: 'Favoritos',
          description: 'MiniApps fijos para acceso rápido.',
          carouselLabel: 'MiniApps favoritos',
        },
        all: {
          title: 'Todos los MiniApps',
          description: 'Lista completa de MiniApps disponibles.',
          carouselLabel: 'MiniApps disponibles',
        },
      },
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
      apps: miniappDefinitions,
      defaultFavorites: miniappDefinitions
        .filter(function (app) {
          return app.isDefaultFavorite;
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
    var favoritesSection = favoritesContainer && favoritesContainer.closest('section');
    var allSection = allContainer && allContainer.closest('section');
    var catalogBoard = document.querySelector('.catalog-board');
    var cardTemplateElement = document.querySelector('[data-miniapp-card-template]');
    var cardTemplateRoot =
      cardTemplateElement && cardTemplateElement.content
        ? cardTemplateElement.content.querySelector('[data-miniapp-card]') ||
          cardTemplateElement.content.firstElementChild
        : null;

    function getActiveLocale() {
      return getDocumentLocale(SUPPORTED_LOCALES, 'pt-BR');
    }

    function getFavoriteActionCopy(isActive) {
      var locale = getActiveLocale();
      return favoritesManager.getActionCopy(locale, isActive);
    }

    function configureFavoriteButton(button, app) {
      var target = button || document.createElement('button');
      var isActive = favoritesManager.isFavorite(app.id);

      target.type = 'button';
      target.classList.add('catalog-card__favorite');
      target.classList.toggle('is-active', isActive);
      target.setAttribute('aria-pressed', isActive ? 'true' : 'false');

      var label = getFavoriteActionCopy(isActive) || '';
      target.setAttribute('aria-label', label);
      target.setAttribute('title', label);

      var icon = target.querySelector('.catalog-card__favorite-icon');
      if (!icon) {
        icon = document.createElement('span');
        icon.className = 'material-symbols-rounded catalog-card__favorite-icon';
        icon.setAttribute('aria-hidden', 'true');
        target.appendChild(icon);
      }
      icon.textContent = 'star';

      target.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(app.id);
      });

      return target;
    }

    function createCardFromTemplate(app) {
      var article = cardTemplateRoot.cloneNode(true);
      article.setAttribute('data-miniapp-id', app.id);

      article.classList.remove('is-favorited');
      if (favoritesManager.isFavorite(app.id)) {
        article.classList.add('is-favorited');
      }

      var link =
        article.querySelector('[data-miniapp-card-link]') ||
        article.querySelector('.catalog-card__link');
      if (link) {
        link.href = app.href;
        link.target = 'miniapp-panel';
        link.setAttribute('data-miniapp-target', app.href);
        link.setAttribute('data-miniapp-name', app.name);
        link.setAttribute('data-miniapp-description', app.description);
        link.setAttribute('data-miniapp-icon-symbol', app.icon);
        link.setAttribute('data-miniapp-icon-theme', app.theme);
      }

      var icon =
        article.querySelector('[data-miniapp-card-icon]') ||
        article.querySelector('.catalog-card__header .app-icon');
      if (icon) {
        icon.className =
          'material-symbols-rounded app-icon app-icon--theme-' + app.theme;
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = app.icon;
      }

      var title =
        article.querySelector('[data-miniapp-card-title]') ||
        article.querySelector('.catalog-card__content h3');
      if (title) {
        title.textContent = app.name;
      }

      var description =
        article.querySelector('[data-miniapp-card-description]') ||
        article.querySelector('.catalog-card__content p');
      if (description) {
        description.textContent = app.description;
      }

      var favoriteButton =
        configureFavoriteButton(
          article.querySelector('[data-miniapp-card-favorite]') ||
            article.querySelector('.catalog-card__favorite'),
          app,
        );

      if (!favoriteButton.parentNode) {
        article.appendChild(favoriteButton);
      }

      return article;
    }

    function createLegacyCard(app) {
      var article = document.createElement('article');
      article.className = 'catalog-card';
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

      var title = document.createElement('h3');
      title.textContent = app.name;

      header.appendChild(icon);
      header.appendChild(title);

      var content = document.createElement('div');
      content.className = 'catalog-card__content';

      var description = document.createElement('p');
      description.textContent = app.description;

      content.appendChild(description);

      var footer = document.createElement('div');
      footer.className = 'catalog-card__footer';

      link.appendChild(header);
      link.appendChild(content);
      link.appendChild(footer);
      article.appendChild(link);

      article.appendChild(configureFavoriteButton(null, app));

      return article;
    }

    function createCard(app) {
      if (cardTemplateRoot) {
        return createCardFromTemplate(app);
      }

      return createLegacyCard(app);
    }

    function getLocalizedMiniapps(locale) {
      var normalized = normalizeLocale(locale, SUPPORTED_LOCALES, 'pt-BR');
      var fallbackDictionary = MINIAPP_COPY['pt-BR'] || {};
      var dictionary = MINIAPP_COPY[normalized] || fallbackDictionary;

      return miniappDefinitions.map(function (definition) {
        var localized = dictionary[definition.id] || fallbackDictionary[definition.id] || {};

        return {
          id: definition.id,
          icon: definition.icon,
          theme: definition.theme,
          href: definition.href,
          name: localized.name || definition.name,
          description: localized.description || definition.description,
        };
      });
    }

    function updateSectionCopy(locale) {
      var normalized = normalizeLocale(locale, SUPPORTED_LOCALES, 'pt-BR');
      var fallback = CATALOG_SECTION_COPY['pt-BR'] || {};
      var dictionary = CATALOG_SECTION_COPY[normalized] || fallback;

      if (catalogBoard && dictionary.boardLabel) {
        catalogBoard.setAttribute('aria-label', dictionary.boardLabel);
      }

      if (favoritesSection) {
        var favoritesHeader = favoritesSection.querySelector('.catalog-favorites__header');
        if (favoritesHeader) {
          var favoritesTitle = favoritesHeader.querySelector('h2');
          var favoritesDescription = favoritesHeader.querySelector('p');
          if (favoritesTitle && dictionary.favorites && dictionary.favorites.title) {
            favoritesTitle.textContent = dictionary.favorites.title;
          }
          if (
            favoritesDescription &&
            dictionary.favorites &&
            dictionary.favorites.description
          ) {
            favoritesDescription.textContent = dictionary.favorites.description;
          }
        }

        if (
          favoritesContainer &&
          dictionary.favorites &&
          dictionary.favorites.carouselLabel
        ) {
          favoritesContainer.setAttribute(
            'data-carousel-label',
            dictionary.favorites.carouselLabel,
          );
        }
      }

      if (allSection) {
        var allHeader = allSection.querySelector('.catalog-favorites__header');
        if (allHeader) {
          var allTitle = allHeader.querySelector('h2');
          var allDescription = allHeader.querySelector('p');
          if (allTitle && dictionary.all && dictionary.all.title) {
            allTitle.textContent = dictionary.all.title;
          }
          if (allDescription && dictionary.all && dictionary.all.description) {
            allDescription.textContent = dictionary.all.description;
          }
        }

        if (allContainer && dictionary.all && dictionary.all.carouselLabel) {
          allContainer.setAttribute('data-carousel-label', dictionary.all.carouselLabel);
        }
      }
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

      var locale = getActiveLocale();
      var localizedMiniapps = getLocalizedMiniapps(locale);

      var favorites = localizedMiniapps.filter(function (app) {
        return favoritesManager.isFavorite(app.id);
      });

      updateSectionCopy(locale);

      mountCarousel(favoritesContainer, favorites);
      mountCarousel(allContainer, localizedMiniapps);

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
