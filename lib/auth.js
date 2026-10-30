// Demo authentication, session and guard helpers.
//
// !! Frontend checks are NOT production security. Browser storage is fully
// !! user-editable. These guards demonstrate sensible UI + action design only.
import { getUserById, getUsers, saveUser } from './data.js';
import { KEYS, emitChange, readStorage, removeStorage, writeStorage } from './storage.js';
import { isValidISODate } from './format.js';

export function fail(error, code = 'invalid') {
  return { ok: false, error, code };
}

export function hasRole(user, role) {
  return !!user && Array.isArray(user.roles) && user.roles.includes(role);
}

/**
 * Current demo session. Only a user ID + metadata live in sessionStorage; the
 * user record itself is looked up from localStorage so edits (e.g. a
 * suspension) take effect immediately. Returns null when signed out or when the
 * stored session points to a user that no longer exists.
 */
export function getCurrentSession() {
  const raw = readStorage(KEYS.session, null, 'session');
  if (!raw || typeof raw !== 'object' || typeof raw.userId !== 'string') return null;
  const user = getUserById(raw.userId);
  if (!user) {
    removeStorage(KEYS.session, 'session');
    return null;
  }
  return { user, signedInAt: raw.signedInAt || null };
}

export function signInAsDemo(userId) {
  const user = getUserById(userId);
  if (!user) return fail('No demo account found for that ID.', 'not_found');
  const res = writeStorage(
    KEYS.session,
    { userId: user.id, signedInAt: new Date().toISOString(), v: 1 },
    'session',
  );
  if (!res.ok) return fail(res.error, 'storage');
  emitChange();
  return { ok: true, user };
}

/** Demo sign-in by email. There are no passwords in this project. */
export function signInWithEmail(email) {
  const value = String(email || '').trim().toLowerCase();
  if (!value) return fail('Enter the email of a demo account.');
  const user = getUsers().find((u) => String(u.email).toLowerCase() === value);
  if (!user) return fail('No demo account uses that email. Pick one of the demo accounts instead.', 'not_found');
  return signInAsDemo(user.id);
}

export function signOut() {
  removeStorage(KEYS.session, 'session');
  removeStorage(KEYS.checkoutDraft, 'session');
  emitChange();
  return { ok: true };
}

/**
 * Guard used at the top of every protected action.
 * Checks, in order: session exists -> account is active -> expected role.
 */
export function requireRole(role) {
  const session = getCurrentSession();
  if (!session) return fail('Not signed in', 'unauthenticated');
  const { user } = session;
  if (user.status === 'suspended') return fail('Account suspended', 'suspended');
  if (role && !hasRole(user, role)) return fail(`Your account does not have ${role} access`, 'forbidden');
  return { ok: true, user };
}

/**
 * Accept only same-site relative paths ("/cars?x=1"). Anything that could leave
 * the site (absolute URLs, protocol-relative "//host", backslashes, control
 * characters) falls back to a safe default.
 */
export function safeReturnPath(value, fallback = '/') {
  if (typeof value !== 'string') return fallback;
  let v = value.trim();
  if (!v.startsWith('/')) return fallback;
  if (v.startsWith('//') || v.startsWith('/\\')) return fallback;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f\\]/.test(v)) return fallback;
  try {
    const base = 'http://sheggar.invalid';
    const url = new URL(v, base);
    if (url.origin !== base) return fallback;
    v = url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
  if (/^\/(signin|signup)(\/|\?|#|$)/.test(v)) return fallback;
  return v;
}

export function homePathFor(user) {
  if (hasRole(user, 'admin')) return '/admin';
  return '/dashboard';
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9][0-9\s-]{7,14}$/;

/** Create a demo renter account (optionally with owner capability) and sign in. Never admin. */
export function signUp({ name, email, phone, alsoOwner = false }) {
  const errors = {};
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPhone = String(phone || '').trim();
  if (cleanName.length < 2) errors.name = 'Enter your full name.';
  if (!EMAIL_RE.test(cleanEmail)) errors.email = 'Enter a valid email address.';
  if (!PHONE_RE.test(cleanPhone)) errors.phone = 'Enter a valid phone number, e.g. +251911234567.';
  if (!errors.email && getUsers().some((u) => String(u.email).toLowerCase() === cleanEmail)) {
    errors.email = 'That email is already used by another demo account.';
  }
  if (Object.keys(errors).length) return { ok: false, error: 'Please fix the highlighted fields.', code: 'invalid', errors };

  const user = {
    id: `user-${globalThis.crypto && globalThis.crypto.randomUUID ? globalThis.crypto.randomUUID() : Date.now().toString(36)}`,
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    roles: alsoOwner ? ['renter', 'owner'] : ['renter'],
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  const saved = saveUser(user);
  if (!saved.ok) return fail(saved.error, 'storage');
  const session = signInAsDemo(user.id);
  return session.ok ? { ok: true, user } : session;
}

/** Let the signed-in user add the owner capability to their own account. */
export function enableOwnerRole() {
  const auth = requireRole('renter');
  if (!auth.ok) return auth;
  if (hasRole(auth.user, 'owner')) return { ok: true, user: auth.user };
  const updated = { ...auth.user, roles: [...auth.user.roles, 'owner'] };
  const saved = saveUser(updated);
  if (!saved.ok) return fail(saved.error, 'storage');
  return { ok: true, user: updated };
}

export function isIsoDateInput(value) {
  return isValidISODate(value);
}
