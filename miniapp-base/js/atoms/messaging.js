(function (window) {
  'use strict';

  var root = window.miniappBase || (window.miniappBase = {});
  var atoms = root.atoms || (root.atoms = {});

  function isEmbedded() {
    return !!(window.parent && window.parent !== window);
  }

  function getMessageTargetOrigin() {
    try {
      return window.location.origin;
    } catch (_error) {
      return '*';
    }
  }

  function postToParent(payload) {
    if (!isEmbedded()) {
      return false;
    }

    try {
      window.parent.postMessage(payload, getMessageTargetOrigin());
      return true;
    } catch (_error) {
      return false;
    }
  }

  atoms.isEmbedded = isEmbedded;
  atoms.postToParent = postToParent;
})(window);
