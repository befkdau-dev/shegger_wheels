import { fail, requireRole } from './auth.js';
import { getAnnouncements, getUserById, saveAnnouncement, saveUser } from './data.js';

/** Suspend or reinstate a demo user. Admin accounts can never be suspended. */
export function setUserStatus(userId, status) {
  const auth = requireRole('admin');
  if (!auth.ok) return auth;
  if (status !== 'active' && status !== 'suspended') return fail('Unknown status.');
  const user = getUserById(userId);
  if (!user) return fail('User not found.', 'not_found');
  if (user.roles.includes('admin')) return fail('Admin accounts cannot be suspended.', 'forbidden');
  if (user.status === status) return { ok: true, user };
  const updated = { ...user, status };
  const saved = saveUser(updated);
  return saved.ok ? { ok: true, user: updated } : fail(saved.error, 'storage');
}

export function createAnnouncement({ title, message }) {
  const auth = requireRole('admin');
  if (!auth.ok) return auth;
  const t = String(title || '').trim();
  const m = String(message || '').trim();
  const errors = {};
  if (t.length < 3) errors.title = 'Enter a title of at least 3 characters.';
  if (t.length > 80) errors.title = 'Keep the title under 80 characters.';
  if (m.length < 10) errors.message = 'Write a message of at least 10 characters.';
  if (m.length > 400) errors.message = 'Keep the message under 400 characters.';
  if (Object.keys(errors).length) return { ok: false, error: 'Please fix the highlighted fields.', code: 'invalid', errors };
  const announcement = {
    id: `ann-${globalThis.crypto && globalThis.crypto.randomUUID ? globalThis.crypto.randomUUID() : Date.now().toString(36)}`,
    title: t,
    message: m,
    active: true,
    createdAt: new Date().toISOString(),
    createdBy: auth.user.id,
  };
  const saved = saveAnnouncement(announcement);
  return saved.ok ? { ok: true, announcement } : fail(saved.error, 'storage');
}

export function setAnnouncementActive(id, active) {
  const auth = requireRole('admin');
  if (!auth.ok) return auth;
  const found = getAnnouncements().find((a) => a.id === id);
  if (!found) return fail('Announcement not found.', 'not_found');
  const updated = { ...found, active: !!active };
  const saved = saveAnnouncement(updated);
  return saved.ok ? { ok: true, announcement: updated } : fail(saved.error, 'storage');
}
