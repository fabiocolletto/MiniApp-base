import { formatPhoneNumberForDisplay } from './validation.js';

const collator = new Intl.Collator('pt-BR', {
  sensitivity: 'base',
  numeric: true,
});

function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function sanitizeDigits(value) {
  return String(value ?? '').replace(/\D+/g, '');
}

function userMatchesQuery(user, normalizedQuery, numericQuery) {
  if (!normalizedQuery && !numericQuery) {
    return true;
  }

  const fields = [
    user?.name,
    user?.phone,
    formatPhoneNumberForDisplay(user?.phone),
    user?.profile?.email,
    user?.profile?.document,
    user?.device,
  ];

  return fields.some((field) => {
    if (field == null) {
      return false;
    }

    const normalizedField = normalizeSearchText(field);

    if (normalizedQuery && normalizedField.includes(normalizedQuery)) {
      return true;
    }

    if (numericQuery) {
      const digits = sanitizeDigits(field);
      if (digits && digits.includes(numericQuery)) {
        return true;
      }
    }

    return false;
  });
}

export function filterUsersByQuery(users = [], query = '', { alwaysIncludeId } = {}) {
  const source = Array.isArray(users) ? users : [];
  const normalizedQuery = normalizeSearchText(query);
  const numericQuery = sanitizeDigits(query);
  const seenIds = new Set();
  const results = [];

  function addUser(user) {
    if (!user) {
      return;
    }

    const userId = user.id;
    if (seenIds.has(userId)) {
      return;
    }

    seenIds.add(userId);
    results.push(user);
  }

  if (!normalizedQuery && !numericQuery) {
    source.forEach(addUser);
  } else {
    source.forEach((user) => {
      if (userMatchesQuery(user, normalizedQuery, numericQuery)) {
        addUser(user);
      }
    });
  }

  if (alwaysIncludeId != null) {
    const preservedUser = source.find((user) => user?.id === alwaysIncludeId);
    if (preservedUser) {
      addUser(preservedUser);
    }
  }

  return results;
}

export function sortUsersForAdmin(users = [], option = 'createdAtDesc') {
  const list = Array.isArray(users) ? users.slice() : [];

  switch (option) {
    case 'createdAtAsc':
      return list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    case 'nameAsc':
      return list.sort((a, b) => collator.compare(a?.name ?? '', b?.name ?? ''));
    case 'nameDesc':
      return list.sort((a, b) => collator.compare(b?.name ?? '', a?.name ?? ''));
    case 'updatedAtDesc':
      return list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    case 'updatedAtAsc':
      return list.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
    case 'createdAtDesc':
    default:
      return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

function formatUserCount(count) {
  const normalized = Number(count) || 0;
  if (normalized === 1) {
    return '1 usuário';
  }
  return `${normalized} usuários`;
}

export function createAdminSummary(totalUsers, visibleUsers, query = '') {
  const total = Number(totalUsers) || 0;
  const visible = Number(visibleUsers) || 0;
  const trimmedQuery = String(query ?? '').trim();

  if (total === 0) {
    return 'Nenhum usuário cadastrado até o momento.';
  }

  if (visible === 0) {
    if (trimmedQuery) {
      return `Nenhum usuário encontrado para “${trimmedQuery}”.`;
    }
    return 'Nenhum usuário disponível para exibição.';
  }

  if (visible === total) {
    return `Exibindo ${formatUserCount(visible)}.`;
  }

  let message = `Exibindo ${formatUserCount(visible)} de ${formatUserCount(total)}.`;

  if (trimmedQuery) {
    message += ` Filtro: “${trimmedQuery}”.`;
  }

  return message;
}
