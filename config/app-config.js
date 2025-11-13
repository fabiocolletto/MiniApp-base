(function applyAppConfig() {
  window.__APP_CONFIG__ = {
    /**
     * Substitua pelo client ID OAuth 2.0 do tipo Web liberado no Google Cloud Console.
     * Exemplo: "1234567890-abc123def456ghi789.apps.googleusercontent.com".
     */
    OAUTH_CLIENT_ID: 'SEU_CLIENT_ID_WEB.apps.googleusercontent.com',
    /**
     * Quando `true`, o shell ignora autenticação e permissões, mantendo todos os MiniApps acessíveis.
     * Utilize apenas em ambientes de teste ou durante implantações acompanhadas.
     */
    DISABLE_AUTH_GUARDS: true,
  };
}());
