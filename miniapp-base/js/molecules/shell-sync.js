(function (window) {
  'use strict';

  var root = window.miniappBase || (window.miniappBase = {});
  var atoms = root.atoms || (root.atoms = {});
  var molecules = root.molecules || (root.molecules = {});

  var postToParent = atoms.postToParent || function () { return false; };
  var isEmbedded = atoms.isEmbedded || function () { return false; };

  function sendMiniAppHeader(data) {
    if (!data || typeof data !== 'object') {
      return false;
    }

    var payload = {
      action: 'miniapp-header',
      title: data.title || '',
      subtitle: data.subtitle || '',
      icon: data.icon || 'apps',
      iconTheme: data.iconTheme || 'shell',
    };

    return postToParent(payload);
  }

  function requestCatalog() {
    return postToParent({ action: 'open-catalog' });
  }

  function canSyncWithShell() {
    return isEmbedded();
  }

  molecules.shellSync = {
    sendMiniAppHeader: sendMiniAppHeader,
    requestCatalog: requestCatalog,
    canSyncWithShell: canSyncWithShell,
  };
})(window);
