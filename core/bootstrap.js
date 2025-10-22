import {
  clearSession as defaultClearSession,
  getAllAccounts as defaultGetAllAccounts,
  getSession as defaultGetSession,
  validateSchemaOrReset as defaultValidateSchema,
} from './account-store.js';
import { logError, logInfo, logWarn } from '../sys/log.js';

function resolveOverrides() {
  if (typeof globalThis !== 'object' || !globalThis) {
    return null;
  }

  const value = globalThis.__MINIAPP_BOOTSTRAP_OVERRIDES__;
  if (!value || typeof value !== 'object') {
    return null;
  }

  return value;
}

function pickOverride(overrides, key, fallback) {
  const candidate = overrides && overrides[key];
  return typeof candidate === 'function' ? candidate : fallback;
}

export async function determineInitialRoute() {
  try {
    const overrides = resolveOverrides();
    const validateSchema = pickOverride(overrides, 'validateSchemaOrReset', defaultValidateSchema);
    const validationResult = await validateSchema();

    if (validationResult === 'reset') {
      logWarn('bootstrap.schema.reset', 'Estrutura inválida do IndexedDB. Iniciando fluxo de cadastro.');
      return 'register';
    }

    const getAllAccounts = pickOverride(overrides, 'getAllAccounts', defaultGetAllAccounts);
    const getSession = pickOverride(overrides, 'getSession', defaultGetSession);
    const [accounts, session] = await Promise.all([getAllAccounts(), getSession()]);

    if (session && typeof session.activeAccountId === 'string') {
      const activeAccount = accounts.find((account) => account.id === session.activeAccountId);

      if (activeAccount) {
        logInfo('bootstrap.route.dashboard', 'Conta ativa encontrada. Abrindo Início.');
        return 'dashboard';
      }

      logWarn('bootstrap.session.orphan', 'Sessão ativa não corresponde a um cadastro válido. Limpando sessão.');
      const clear = pickOverride(overrides, 'clearSession', defaultClearSession);
      await clear();
    }

    if (accounts.length > 0) {
      logInfo('bootstrap.route.login', 'Cadastros encontrados sem sessão ativa. Direcionando ao login.');
      return 'login';
    }

    logInfo('bootstrap.route.register', 'Nenhum cadastro encontrado. Direcionando ao primeiro acesso.');
    return 'register';
  } catch (error) {
    logError('bootstrap.route.error', 'Falha ao determinar rota inicial. Aplicando fluxo de cadastro.', error);
    return 'register';
  }
}
