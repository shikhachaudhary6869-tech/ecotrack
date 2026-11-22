// Small helpers around localStorage. Every function is wrapped in try/catch
// so the app never crashes if storage is blocked or contains bad data.

export const KEYS = {
  users: 'ecotrack_users',
  session: 'ecotrack_session',
  records: (uid) => `ecotrack_records_${uid}`,
  challenges: (uid) => `ecotrack_challenges_${uid}`,
  tips: (uid) => `ecotrack_tips_${uid}`,
};

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
