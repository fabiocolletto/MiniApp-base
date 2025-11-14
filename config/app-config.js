(function applyAppConfig() {
  var globalConfig = window.__APP_CONFIG__ || {};
  window.__APP_CONFIG__ = globalConfig;

  if (!globalConfig.assetBaseUrl && document.currentScript) {
    var declared = document.currentScript.getAttribute('data-base-url');
    if (declared && typeof declared === 'string') {
      globalConfig.assetBaseUrl = declared;
    }
  }
}());
