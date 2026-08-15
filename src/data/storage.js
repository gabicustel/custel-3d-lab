// Camada de armazenamento. Hoje usa LocalStorage; no futuro basta trocar
// a implementação destas funções por chamadas a uma API/banco de dados,
// sem precisar alterar o restante do sistema.

const PREFIX = 'custel_';

export function loadCollection(key, fallback = []) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveCollection(key, data) {
  localStorage.setItem(PREFIX + key, JSON.stringify(data));
}

export function nextId(list) {
  return list.length ? Math.max(...list.map((i) => i.id)) + 1 : 1;
}

export function isSeeded() {
  return localStorage.getItem(PREFIX + 'seeded') === 'true';
}

export function markSeeded() {
  localStorage.setItem(PREFIX + 'seeded', 'true');
}
