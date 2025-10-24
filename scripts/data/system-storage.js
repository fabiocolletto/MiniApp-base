import {
  getUsers,
  getStorageStatus,
  subscribeUsers,
  subscribeStorageStatus,
} from './user-store.js';
import { getIndexedUserDbMetadata } from './indexed-user-store.js';
import { getAllAccounts, getSession, getGlobalDbMetadata } from '../../core/account-store.js';

const textEncoder = typeof TextEncoder === 'function' ? new TextEncoder() : null;
const countFormatter = new Intl.NumberFormat('pt-BR');

function estimateSerializedSize(value) {
  try {
    const json = JSON.stringify(value ?? null);
    if (!json) {
      return 0;
    }

    if (textEncoder) {
      return textEncoder.encode(json).length;
    }

    if (typeof Buffer === 'function') {
      return Buffer.from(json).length;
    }

    return json.length;
  } catch (error) {
    console.error('Erro ao estimar o tamanho serializado do IndexedDB.', error);
    return 0;
  }
}

function sanitizeStatus(status) {
  const state = typeof status?.state === 'string' ? status.state : 'loading';
  const message =
    typeof status?.message === 'string' && status.message.trim()
      ? status.message.trim()
      : 'Memória carregando';
  const details = typeof status?.details === 'string' ? status.details.trim() : '';

  return { state, message, details };
}

function formatCount(value) {
  const numericValue = Number.isFinite(value) ? value : 0;
  return countFormatter.format(Math.max(0, Math.trunc(numericValue)));
}

function buildUserDatabase(users, storageStatus) {
  const metadata = getIndexedUserDbMetadata();
  const records = Array.isArray(users) ? users : [];
  const approximateSize = estimateSerializedSize(records);
  const storeName = metadata?.stores?.[0] ?? 'users';

  const details =
    records.length > 0
      ? records.length === 1
        ? 'Cadastro sincronizado com perfil completo e preferências do painel.'
        : `${formatCount(records.length)} cadastros sincronizados com perfil completo e preferências do painel.`
      : 'Aguardando primeiros cadastros sincronizados no IndexedDB.';

  return {
    id: 'user-database',
    name: metadata?.name ?? 'miniapp-user-store',
    version: metadata?.version ?? 1,
    stores: [
      {
        id: storeName,
        name: storeName,
        records: records.length,
        approximateSizeBytes: approximateSize,
        details,
      },
    ],
    total: {
      records: records.length,
      approximateSizeBytes: approximateSize,
    },
    status: sanitizeStatus(storageStatus),
  };
}

function buildGlobalDatabase(accounts, session) {
  const metadata = getGlobalDbMetadata();
  const accountEntries = Array.isArray(accounts) ? accounts : [];
  const normalizedSessionId =
    typeof session?.activeAccountId === 'string' && session.activeAccountId.trim()
      ? session.activeAccountId.trim()
      : '';
  const sessionEntries = normalizedSessionId ? [{ id: 'active', activeAccountId: normalizedSessionId }] : [];

  const accountSize = estimateSerializedSize(accountEntries);
  const sessionSize = estimateSerializedSize(sessionEntries);

  const stores = [
    {
      id: 'accounts',
      name: 'accounts',
      records: accountEntries.length,
      approximateSizeBytes: accountSize,
      details:
        accountEntries.length > 0
          ? `${formatCount(accountEntries.length)} cadastros espelhados para o painel administrativo.`
          : 'Aguardando sincronização dos cadastros globais.',
    },
    {
      id: 'session',
      name: 'session',
      records: sessionEntries.length,
      approximateSizeBytes: sessionSize,
      details: sessionEntries.length > 0
        ? 'Sessão ativa registrada para reconexão automática.'
        : 'Nenhuma sessão ativa sincronizada no momento.',
    },
  ];

  const totalRecords = stores.reduce(
    (sum, entry) => sum + (Number.isFinite(entry.records) ? entry.records : 0),
    0,
  );
  const totalBytes = stores.reduce(
    (sum, entry) => sum + (Number.isFinite(entry.approximateSizeBytes) ? entry.approximateSizeBytes : 0),
    0,
  );

  const hasAccounts = accountEntries.length > 0;
  const hasSession = sessionEntries.length > 0;
  const status = hasAccounts || hasSession
    ? {
        state: 'updated',
        message: 'Banco global sincronizado',
        details: `${
          hasAccounts
            ? `${formatCount(accountEntries.length)} cadastros espelhados`
            : 'Nenhum cadastro espelhado'
        } e ${hasSession ? 'sessão ativa registrada.' : 'nenhuma sessão ativa registrada.'}`,
      }
    : {
        state: 'empty',
        message: 'Banco global vazio',
        details: 'Sincronize usuários para popular contas espelhadas e a sessão ativa.',
      };

  return {
    id: 'global-database',
    name: metadata?.name ?? 'miniapp_global_v1',
    version: metadata?.version ?? 1,
    stores,
    total: {
      records: totalRecords,
      approximateSizeBytes: totalBytes,
    },
    status,
  };
}

export async function getIndexedDbSnapshot() {
  const [users, storageStatus, accounts, session] = await Promise.all([
    Promise.resolve().then(() => getUsers()),
    Promise.resolve().then(() => getStorageStatus()),
    getAllAccounts().catch(() => []),
    getSession().catch(() => ({})),
  ]);

  const userDatabase = buildUserDatabase(users, storageStatus);
  const globalDatabase = buildGlobalDatabase(accounts, session);

  const databases = [userDatabase, globalDatabase];
  const summary = {
    databases: databases.length,
    stores: databases.reduce((sum, database) => sum + database.stores.length, 0),
    records: databases.reduce((sum, database) => sum + database.total.records, 0),
    approximateSizeBytes: databases.reduce(
      (sum, database) => sum + database.total.approximateSizeBytes,
      0,
    ),
    status: userDatabase.status,
  };

  return { summary, databases };
}

export function subscribeIndexedDbSnapshot(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  let active = true;
  let pending = false;

  const deliver = () => {
    if (!active || pending) {
      return;
    }

    pending = true;

    Promise.resolve()
      .then(() => getIndexedDbSnapshot())
      .then((snapshot) => {
        if (!active) {
          return;
        }

        try {
          listener(snapshot);
        } catch (error) {
          console.error('Erro ao entregar panorama do IndexedDB ao assinante.', error);
        }
      })
      .catch((error) => {
        console.error('Erro ao coletar panorama do IndexedDB.', error);
      })
      .finally(() => {
        pending = false;
      });
  };

  const unsubscribeUsers = subscribeUsers(() => {
    deliver();
  });

  const unsubscribeStatus = subscribeStorageStatus(() => {
    deliver();
  });

  deliver();

  return () => {
    active = false;
    try {
      if (typeof unsubscribeUsers === 'function') {
        unsubscribeUsers();
      }
    } catch (error) {
      console.error('Erro ao encerrar assinatura de usuários do IndexedDB.', error);
    }

    try {
      if (typeof unsubscribeStatus === 'function') {
        unsubscribeStatus();
      }
    } catch (error) {
      console.error('Erro ao encerrar assinatura de status do IndexedDB.', error);
    }
  };
}
