(function () {
      const CATALOG_FALLBACK = '../miniapp-catalogo/index.html';
      const CATALOG_LABELS = {
        'pt-BR': 'Catálogo',
        'en-US': 'Catalog',
        'es-ES': 'Catálogo',
      };
      const SUPPORTED_LOCALES = Object.keys(CATALOG_LABELS);
      let i18nConnected = false;
      let pendingLocale = null;

      function getActiveLocale() {
        const docLang = (document.documentElement && document.documentElement.lang) || '';
        const normalized = SUPPORTED_LOCALES.find((locale) => locale.toLowerCase() === docLang.toLowerCase());

        if (normalized) {
          return normalized;
        }

        const base = docLang.split('-')[0];
        return SUPPORTED_LOCALES.find((locale) => locale.startsWith(base)) || 'pt-BR';
      }

      function notifyShell() {
        if (!window.parent || window.parent === window) {
          return;
        }

        try {
          window.parent.postMessage(
            {
              action: 'miniapp-header',
              title: 'Painel do Prefeito',
              subtitle: 'Indicadores estratégicos, tendências e alertas prioritários.',
              icon: 'monitoring',
              iconTheme: 'prefeito',
            },
            window.location.origin,
          );
        } catch (error) {
          console.error('Não foi possível enviar o cabeçalho do miniapp para o shell.', error);
        }
      }

      function requestCatalog() {
        if (window.parent && window.parent !== window) {
          try {
            window.parent.postMessage(
              { action: 'open-catalog' },
              window.location.origin,
            );
            return;
          } catch (error) {
            console.error('Não foi possível solicitar a abertura do catálogo ao shell.', error);
          }
        }

        try {
          window.location.href = CATALOG_FALLBACK;
        } catch (navigationError) {
          console.error('Não foi possível carregar o catálogo diretamente.', navigationError);
        }
      }

      function setupCatalogButton() {
        const trigger = document.querySelector('[data-js="open-catalog"]');

        if (!trigger) {
          return;
        }

        const locale = getActiveLocale();
        const label = CATALOG_LABELS[locale] || CATALOG_LABELS['pt-BR'];
        const labelElement = trigger.querySelector('[data-js="catalog-label"]');

        if (labelElement) {
          labelElement.textContent = label;
        }

        trigger.setAttribute('aria-label', label);
        trigger.setAttribute('title', label);

        trigger.addEventListener('click', (event) => {
          event.preventDefault();
          requestCatalog();
        });
      }

      function refreshLocalizedComponents() {
        setupCatalogButton();
        notifyShell();
      }

      async function applyIncomingLocale(locale) {
        if (locale) {
          pendingLocale = locale;
        }

        if (!pendingLocale || !window.I18nManager || typeof window.I18nManager.setLocale !== 'function') {
          return;
        }

        const nextLocale = pendingLocale;
        pendingLocale = null;

        connectI18n();

        try {
          await window.I18nManager.setLocale(nextLocale, { persist: false });
          if (typeof window.I18nManager.apply === 'function') {
            window.I18nManager.apply();
          }
          refreshLocalizedComponents();
        } catch (error) {
          pendingLocale = nextLocale;
          console.error('Não foi possível aplicar o idioma recebido do shell.', error);
        }
      }

      function connectI18n() {
        if (i18nConnected || !window.I18nManager) {
          return;
        }

        const manager = window.I18nManager;

        if (typeof manager.onChange === 'function') {
          manager.onChange(() => {
            refreshLocalizedComponents();
          });
        }

        i18nConnected = true;
      }

      function initialize() {
        notifyShell();
        setupCatalogButton();
        connectI18n();
        applyIncomingLocale();
      }

      if (document.readyState === 'interactive' || document.readyState === 'complete') {
        initialize();
      } else {
        document.addEventListener('DOMContentLoaded', initialize);
      }

      window.addEventListener('message', (event) => {
        if (!event || typeof event.data !== 'object') {
          return;
        }

        if (event.origin && event.origin !== window.location.origin) {
          return;
        }

        const { action, locale } = event.data;

        if (action === 'set-locale' && locale) {
          pendingLocale = locale;
          applyIncomingLocale();
        }
      });

      connectI18n();
      applyIncomingLocale();

      let i18nRetries = 0;
      const maxI18nRetries = 50;
      const i18nInterval = setInterval(() => {
        if (i18nConnected) {
          clearInterval(i18nInterval);
          return;
        }

        if (window.I18nManager) {
          connectI18n();
          applyIncomingLocale();
          clearInterval(i18nInterval);
          return;
        }

        i18nRetries += 1;
        if (i18nRetries > maxI18nRetries) {
          clearInterval(i18nInterval);
        }
      }, 100);
    })();
