window.WB_UI = {
  save(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  load(key, fallback) {
    const raw = sessionStorage.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }
};