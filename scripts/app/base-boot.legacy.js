(function () {
  if (typeof document === 'undefined') {
    return;
  }

  var doc = document;
  var win = typeof window !== 'undefined' ? window : null;

  function onReady(callback) {
    if (typeof callback !== 'function') {
      return;
    }

    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function trimWhitespace(value) {
    if (typeof value !== 'string') {
      return '';
    }

    return value.replace(/^\s+|\s+$/g, '');
  }

  function removeClass(element, className) {
    if (!element || !className) {
      return;
    }

    if (element.classList && typeof element.classList.remove === 'function') {
      element.classList.remove(className);
      return;
    }

    var current = typeof element.className === 'string' ? element.className : '';
    if (!current) {
      return;
    }

    var pattern = new RegExp('(?:^|\\s+)' + className + '(?=\\s+|$)', 'g');
    var updated = trimWhitespace(current.replace(pattern, ''));
    element.className = updated;
  }

  function addClass(element, className) {
    if (!element || !className) {
      return;
    }

    if (element.classList && typeof element.classList.add === 'function') {
      element.classList.add(className);
      return;
    }

    var current = typeof element.className === 'string' ? element.className : '';
    if (!current) {
      element.className = className;
      return;
    }

    var pattern = new RegExp('(?:^|\\s+)' + className + '(?=\\s+|$)');
    if (!pattern.test(current)) {
      element.className = trimWhitespace(current + ' ' + className);
    }
  }

  onReady(function () {
    var body = doc.body;
    var footer = doc.querySelector('.auth-shell__footer');
    var footerToggle = doc.querySelector('[data-footer-toggle]');
    var footerMenuOverlay = doc.querySelector('[data-menu-overlay]');
    var footerMenuPanel = doc.getElementById('authFooterMenu');
    var footerMenuNav = doc.querySelector('.auth-shell__footer-nav');
    var menuButtons = doc.querySelectorAll('.auth-shell__menu-button');
    var footerExpanded = false;
    var menuOpen = false;
    var lastMenuTrigger = null;
    var mediaQuery = null;

    if (win && typeof win.matchMedia === 'function') {
      try {
        mediaQuery = win.matchMedia('(max-width: 48rem)');
      } catch (error) {
        mediaQuery = null;
      }
    }

    var FOOTER_TOGGLE_LABELS = {
      expand: 'Mostrar detalhes do rodapé',
      collapse: 'Ocultar detalhes do rodapé',
    };

    function updateFooterOffset() {
      if (!body || !footer) {
        return;
      }

      var isMobile = mediaQuery ? mediaQuery.matches : false;
      var footerHeight = 0;

      if (isMobile) {
        try {
          var rect = footer.getBoundingClientRect();
          if (rect && rect.height) {
            footerHeight = Math.ceil(rect.height);
          }
        } catch (error) {
          footerHeight = 0;
        }
      }

      if (body.style && typeof body.style.setProperty === 'function') {
        if (footerHeight > 0) {
          body.style.setProperty('--layout-footer-offset', footerHeight + 'px');
        } else {
          body.style.removeProperty('--layout-footer-offset');
        }
        return;
      }

      if (typeof body.getAttribute === 'function' && typeof body.setAttribute === 'function') {
        var token = '--layout-footer-offset';
        var existing = body.getAttribute('style') || '';
        var parts = existing.split(';');
        var filtered = [];
        for (var i = 0; i < parts.length; i += 1) {
          var entry = trimWhitespace(parts[i]);
          if (entry && entry.indexOf(token) !== 0) {
            filtered.push(entry);
          }
        }

        if (footerHeight > 0) {
          filtered.push(token + ': ' + footerHeight + 'px');
        }

        if (filtered.length > 0) {
          body.setAttribute('style', filtered.join('; ') + ';');
        } else {
          body.removeAttribute('style');
        }
      }
    }

    function setFooterExpanded(state) {
      footerExpanded = !!state;

      if (footer) {
        if (footerExpanded) {
          footer.setAttribute('data-footer-expanded', 'true');
        } else {
          footer.removeAttribute('data-footer-expanded');
        }
      }

      if (footerToggle) {
        footerToggle.setAttribute('aria-expanded', footerExpanded ? 'true' : 'false');
        footerToggle.setAttribute(
          'aria-label',
          footerExpanded ? FOOTER_TOGGLE_LABELS.collapse : FOOTER_TOGGLE_LABELS.expand,
        );
      }

      updateFooterOffset();
    }

    function collapseFooter() {
      setFooterExpanded(false);
    }

    function syncFooterToggleVisibility() {
      if (footerToggle) {
        footerToggle.hidden = false;
        footerToggle.removeAttribute('aria-hidden');
      }

      updateFooterOffset();
    }

    function setMenuState(isOpen) {
      menuOpen = !!isOpen;

      if (footerMenuNav) {
        footerMenuNav.setAttribute('data-state', menuOpen ? 'open' : 'closed');
      }

      for (var index = 0; index < menuButtons.length; index += 1) {
        var button = menuButtons[index];
        if (button) {
          button.setAttribute('aria-expanded', menuOpen ? 'true' : 'false');
        }
      }

      if (footerMenuOverlay) {
        footerMenuOverlay.hidden = !menuOpen;
      }

      if (footerMenuPanel) {
        footerMenuPanel.hidden = !menuOpen;
      }

      if (body) {
        if (menuOpen) {
          addClass(body, 'auth-shell--menu-open');
        } else {
          removeClass(body, 'auth-shell--menu-open');
        }
      }

      updateFooterOffset();
    }

    function focusElement(element) {
      if (!element) {
        return;
      }

      try {
        element.focus();
      } catch (error) {
        // ignore
      }
    }

    function openMenu(trigger) {
      lastMenuTrigger = trigger && typeof trigger.focus === 'function' ? trigger : null;
      setMenuState(true);

      if (footerMenuPanel && typeof footerMenuPanel.focus === 'function') {
        footerMenuPanel.focus();
      }
    }

    function closeMenu(options) {
      var shouldFocusToggle = options && options.focusToggle;
      setMenuState(false);

      if (shouldFocusToggle && lastMenuTrigger) {
        focusElement(lastMenuTrigger);
      }

      lastMenuTrigger = null;
    }

    function handleMenuButtonClick(event) {
      var target = event ? (event.currentTarget || event.target) : null;

      if (menuOpen) {
        closeMenu({ focusToggle: true });
      } else {
        openMenu(target);
      }
    }

    function handleEscape(event) {
      var key = event && (event.key || event.keyCode || event.which);
      var isEscape = key === 'Escape' || key === 'Esc' || key === 27;

      if (isEscape && menuOpen) {
        event.preventDefault();
        closeMenu({ focusToggle: true });
      }
    }

    for (var buttonIndex = 0; buttonIndex < menuButtons.length; buttonIndex += 1) {
      var menuButton = menuButtons[buttonIndex];
      if (!menuButton) {
        continue;
      }

      menuButton.addEventListener('click', handleMenuButtonClick);
      menuButton.addEventListener('keydown', handleEscape);
    }

    if (footerMenuOverlay) {
      footerMenuOverlay.addEventListener('click', function (event) {
        if (event && event.target === footerMenuOverlay) {
          closeMenu({ focusToggle: true });
        }
      });
    }

    if (footerMenuPanel) {
      if (!footerMenuPanel.hasAttribute('tabindex')) {
        footerMenuPanel.setAttribute('tabindex', '-1');
      }

      footerMenuPanel.addEventListener('keydown', handleEscape);
    }

    doc.addEventListener('keydown', handleEscape);

    if (footerToggle) {
      footerToggle.addEventListener('click', function () {
        var expanded = footer ? footer.getAttribute('data-footer-expanded') === 'true' : false;
        setFooterExpanded(!expanded);
      });

      footerToggle.addEventListener('keydown', function (event) {
        var key = event && (event.key || event.keyCode || event.which);
        var isEscape = key === 'Escape' || key === 'Esc' || key === 27;

        if (isEscape && footer && footer.getAttribute('data-footer-expanded') === 'true') {
          event.preventDefault();
          collapseFooter();
        }
      });
    }

    if (mediaQuery) {
      var syncHandler = function () {
        syncFooterToggleVisibility();
      };

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', syncHandler);
      } else if (typeof mediaQuery.addListener === 'function') {
        mediaQuery.addListener(syncHandler);
      }

      syncFooterToggleVisibility();
    } else {
      syncFooterToggleVisibility();
    }

    if (win && typeof win.addEventListener === 'function') {
      win.addEventListener('resize', updateFooterOffset);
    }

    if (win && win.ResizeObserver && typeof win.ResizeObserver === 'function' && footer) {
      try {
        var observer = new win.ResizeObserver(function () {
          updateFooterOffset();
        });
        observer.observe(footer);
      } catch (error) {
        // ignore
      }
    }

    collapseFooter();
    setMenuState(false);
  });
})();
