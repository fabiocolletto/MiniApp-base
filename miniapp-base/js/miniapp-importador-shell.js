(function () {
            const CATALOG_FALLBACK = '../miniapp-catalogo/index.html';
            const DEFAULT_HEADER = {
              title: 'Importador de Pesquisas',
              subtitle: 'Importar arquivos, revisar resultados e sincronizar dados.',
            };

            function resolveHeaderTitle(detail) {
              const provided = detail && typeof detail.headerTitle === 'string' ? detail.headerTitle.trim() : '';
              if (provided) {
                return provided;
              }

              const titleElement = document.querySelector('h1[data-i18n="app.title"]');
              const titleText = titleElement && titleElement.textContent ? titleElement.textContent.trim() : '';
              return titleText || DEFAULT_HEADER.title;
            }

            function resolveHeaderSubtitle(detail) {
              const provided = detail && typeof detail.headerSubtitle === 'string' ? detail.headerSubtitle.trim() : '';
              return provided || DEFAULT_HEADER.subtitle;
            }

            function notifyShell(detail) {
              if (!window.parent || window.parent === window) {
                return;
              }

              try {
                window.parent.postMessage(
                  {
                    action: 'miniapp-header',
                    title: resolveHeaderTitle(detail),
                    subtitle: resolveHeaderSubtitle(detail),
                    icon: 'cloud_upload',
                    iconTheme: 'importador',
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

            function updateCatalogButtonLabel() {
              const trigger = document.querySelector('[data-js="open-catalog"]');

              if (!trigger) {
                return;
              }

              const labelElement = trigger.querySelector('[data-js="catalog-label"]');
              const fallbackLabel = 'Catálogo';
              const labelText =
                labelElement && labelElement.textContent
                  ? labelElement.textContent.trim()
                  : '';
              const label = labelText || fallbackLabel;

              if (labelElement && !labelText) {
                labelElement.textContent = fallbackLabel;
              }

              trigger.setAttribute('aria-label', label);
              trigger.setAttribute('title', label);
            }

            function setupCatalogButton() {
              const trigger = document.querySelector('[data-js="open-catalog"]');

              if (!trigger) {
                return;
              }

              updateCatalogButtonLabel();

              trigger.addEventListener('click', (event) => {
                event.preventDefault();
                requestCatalog();
              });
            }

            function handleLanguageChange(event) {
              const detail = event && event.detail ? event.detail : undefined;
              notifyShell(detail);
              updateCatalogButtonLabel();
            }

            function initialize() {
              notifyShell();
              setupCatalogButton();
              window.addEventListener('miniapp:language-changed', handleLanguageChange);
            }

            if (document.readyState === 'interactive' || document.readyState === 'complete') {
              initialize();
            } else {
              document.addEventListener('DOMContentLoaded', initialize);
            }
          })();
