// Safe browser-storage layer. Everything that touches localStorage or
// sessionStorage goes through this file so malformed JSON, missing keys,
// disabled storage and quota errors never crash the app.
//
// IMPORTANT: server code cannot read browser storage. These helpers return
// fallbacks when `window` is not available (e.g. during server rendering).

export const KEYS = {
  users: 'sw_users_v1',
  cars: 'sw_cars_v1',
  bookings: 'sw_bookings_v1',
  reviews: 'sw_reviews_v1',
  disputes: 'sw_disputes_v1',
  announcements: 'sw_announcements_v1',
  session: 'sw_session_v1', // sessionStorage
  checkoutDraft: 'sw_checkout_draft_v1', // sessionStorage
  dismissed: 'sw_dismissed_v1', // sessionStorage (one-time UI flags)
};

export const SESSION_KEYS = new Set([KEYS.session, KEYS.checkoutDraft, KEYS.dismissed]);
export const DATA_KEYS = [
  KEYS.users,
  KEYS.cars,
  KEYS.bookings,
  KEYS.reviews,
  KEYS.disputes,
  KEYS.announcements,
];

// key -> human readable problem. Surfaced by <StorageNotice /> with a reset button.
const problems = new Map();

export function isBrowser() {
  return typeof window !== 'undefined';
}

function getStore(kind) {
  try {
    if (!isBrowser()) return null;
    return kind === 'session' ? window.sessionStorage : window.localStorage;
  } catch {
    // Accessing window.localStorage can itself throw (blocked cookies / privacy mode).
    return null;
  }
}

function kindFor(key, kind) {
  return kind || (SESSION_KEYS.has(key) ? 'session' : 'local');
}

export function storageAvailable(kind = 'local') {
  const store = getStore(kind);
  if (!store) return false;
  try {
    const probe = '__sw_probe__';
    store.setItem(probe, '1');
    store.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function hasKey(key, kind) {
  const store = getStore(kindFor(key, kind));
  if (!store) return false;
  try {
    return store.getItem(key) !== null;
  } catch {
    return false;
  }
}

/** Read + JSON.parse safely. Returns `fallback` when missing, unreadable or malformed. */
export function readStorage(key, fallback, kind) {
  const store = getStore(kindFor(key, kind));
  if (!store) return fallback;
  let raw;
  try {
    raw = store.getItem(key);
  } catch {
    problems.set(key, 'Browser storage could not be read.');
    return fallback;
  }
  if (raw === null || raw === undefined) return fallback;
  try {
    const value = JSON.parse(raw);
    return value;
  } catch {
    problems.set(key, `Saved data for "${key}" is malformed and was ignored.`);
    return fallback;
  }
}

/** Serialize + save. Never throws; returns { ok, error }. */
export function writeStorage(key, value, kind) {
  const store = getStore(kindFor(key, kind));
  if (!store) return { ok: false, error: 'Browser storage is not available in this browser.' };
  try {
    store.setItem(key, JSON.stringify(value));
    problems.delete(key);
    return { ok: true };
  } catch (e) {
    const quota = e && (e.name === 'QuotaExceededError' || e.code === 22);
    return {
      ok: false,
      error: quota
        ? 'Browser storage is full. Reset the demo data to free space.'
        : 'Could not save to browser storage.',
    };
  }
}

export function removeStorage(key, kind) {
  const store = getStore(kindFor(key, kind));
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    /* ignore */
  }
}

/**
 * Read an array of records. Anything that is not an array of objects with an
 * `id` is ignored and reported as a recoverable problem.
 */
export function readCollection(key) {
  const raw = readStorage(key, null);
  if (raw === null) return [];
  if (!Array.isArray(raw)) {
    problems.set(key, `Saved data for "${key}" has an unexpected shape and was ignored.`);
    return [];
  }
  const valid = raw.filter((r) => r && typeof r === 'object' && typeof r.id === 'string');
  if (valid.length !== raw.length) {
    problems.set(key, `Some records in "${key}" were invalid and were ignored.`);
  }
  return valid;
}

export function getStorageProblems() {
  return [...problems.entries()].map(([key, message]) => ({ key, message }));
}

export function clearProblem(key) {
  problems.delete(key);
}

/** Tell this tab's SWR hooks that data changed. Other tabs get the native `storage` event. */
export function emitChange() {
  if (isBrowser()) {
    try {
      window.dispatchEvent(new Event('sw:data'));
    } catch {
      /* ignore */
    }
  }
}
