const listeners = new Set();
const users = [];
let nextId = 1;

function cloneUser(user) {
  return {
    id: user.id,
    phone: user.phone,
    password: user.password,
    createdAt: new Date(user.createdAt),
  };
}

function notify() {
  const snapshot = users.map(cloneUser);
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error('Erro ao notificar assinante da lista de usuários.', error);
    }
  });
}

export function getUsers() {
  return users.map(cloneUser);
}

export function addUser({ phone, password }) {
  const sanitizedPhone = typeof phone === 'string' ? phone.trim() : '';
  const sanitizedPassword = typeof password === 'string' ? password : '';

  if (!sanitizedPhone || !sanitizedPassword) {
    throw new Error('Telefone e senha são obrigatórios para cadastrar um usuário.');
  }

  const newUser = {
    id: nextId++,
    phone: sanitizedPhone,
    password: sanitizedPassword,
    createdAt: new Date(),
  };

  users.push(newUser);
  notify();
  return cloneUser(newUser);
}

export function subscribeUsers(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  listeners.add(listener);
  try {
    listener(getUsers());
  } catch (error) {
    console.error('Erro ao inicializar assinante da lista de usuários.', error);
  }

  return () => {
    listeners.delete(listener);
  };
}
