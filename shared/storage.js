export function readJsonStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (_error) {
    return fallback;
  }
}

export function writeJsonStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (_error) {
    return false;
  }
}

export function readStringStorage(key, fallback = "") {
  try {
    const value = window.localStorage.getItem(key);
    return value ?? fallback;
  } catch (_error) {
    return fallback;
  }
}

export function writeStringStorage(key, value) {
  try {
    window.localStorage.setItem(key, String(value ?? ""));
    return true;
  } catch (_error) {
    return false;
  }
}
