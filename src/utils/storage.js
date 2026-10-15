export const KEYS = {
  member: 'dsr.memberName',
  team: 'dsr.teamName',
  draft: 'dsr.draftClients',
  templates: 'dsr.savedClients',
  theme: 'dsr.theme',
  remember: 'dsr.rememberDetails',
  torch: 'dsr.nightTorch',
};

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage blocked — nothing to remove.
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode) — the app still works without it.
  }
}
