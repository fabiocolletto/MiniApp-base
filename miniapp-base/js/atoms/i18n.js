(function (window) {
  'use strict';

  var root = window.miniappBase || (window.miniappBase = {});
  var atoms = root.atoms || (root.atoms = {});

  /**
   * Resolve uma chave de tradução utilizando a função global `$t`, quando disponível.
   * Se a chave não existir, utiliza o fallback informado aplicando interpolação básica.
   *
   * @param {string} key - Chave semântica da tradução.
   * @param {string} fallback - Texto padrão caso a tradução não seja encontrada.
   * @param {Record<string, string|number>} [params] - Parâmetros opcionais para interpolação.
   * @returns {string}
   */
  function translate(key, fallback, params) {
    if (typeof window.$t === 'function') {
      try {
        var translated = window.$t(key, params);
        if (typeof translated === 'string' && translated && translated !== key) {
          return translated;
        }
      } catch (_error) {
        // Ignora falhas do mecanismo de tradução e aplica o fallback local.
      }
    }

    if (typeof fallback === 'string' && params && fallback.indexOf('{{') !== -1) {
      return fallback.replace(/{{(\w+)}}/g, function (_match, token) {
        return Object.prototype.hasOwnProperty.call(params, token)
          ? String(params[token])
          : '';
      });
    }

    return typeof fallback === 'string' ? fallback : key;
  }

  atoms.translate = translate;
})(window);
