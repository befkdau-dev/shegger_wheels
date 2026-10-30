// Data-access module. The ONLY place that knows storage keys and record shapes.
// Components and domain functions call these helpers instead of touching
// localStorage directly. (Browser-only: server code cannot read these keys.)
import {
  KEYS,
  DATA_KEYS,
  emitChange,
  getStorageProblems,
  hasKey,
  readCollection,
  removeStorage,
  storageAvailable,
  writeStorage,
} from './storage.js';
import { buildSeed } from './seed.js';

let seeded = false;

/** Seed once, only for keys that are absent. Never overwrites existing user data. */
export function initializeDemoData() {
  if (seeded) return { ok: true };
  if (!storageAvailable('local')) return { ok: false, error: 'Browser storage is not available.' };
  const seed = buildSeed();
  const byKey = {
    [KEYS.users]: seed.users,
    [KEYS.cars]: seed.cars,
    [KEYS.bookings]: seed.bookings,
    [KEYS.reviews]: seed.reviews,
    [KEYS.disputes]: seed.disputes,
    [KEYS.announcements]: seed.announcements,
  };
  for (const key of DATA_KEYS) {
    if (!hasKey(key)) writeStorage(key, byKey[key]);
  }
  seeded = true;
  return { ok: true };
}

/** Development-only control: wipe demo data and restore the seed. */
export function resetDemoData() {
  for (const key of DATA_KEYS) removeStorage(key);
  removeStorage(KEYS.session);
  removeStorage(KEYS.checkoutDraft);
  removeStorage(KEYS.dismissed);
  seeded = false;
  const result = initializeDemoData();
  emitChange();
  return result;
}

/** Test helper: forget the in-memory "already seeded" flag. */
export function _forgetSeededFlag() {
  seeded = false;
}

function read(key) {
  initializeDemoData();
  return readCollection(key);
}

export const getUsers = () => read(KEYS.users);
export const getCars = () => read(KEYS.cars);
export const getBookings = () => read(KEYS.bookings);
export const getReviews = () => read(KEYS.reviews);
export const getDisputes = () => read(KEYS.disputes);
export const getAnnouncements = () => read(KEYS.announcements);

export const getUserById = (id) => getUsers().find((u) => u.id === id) || null;
export const getCarById = (id) => getCars().find((c) => c.id === id) || null;
export const getBookingById = (id) => getBookings().find((b) => b.id === id) || null;
export const getDisputeById = (id) => getDisputes().find((d) => d.id === id) || null;

function upsert(key, record) {
  const list = read(key);
  const index = list.findIndex((r) => r.id === record.id);
  const next = index >= 0 ? list.map((r, i) => (i === index ? record : r)) : [...list, record];
  const res = writeStorage(key, next);
  if (res.ok) emitChange();
  return res;
}

export const saveUser = (u) => upsert(KEYS.users, u);
export const saveCar = (c) => upsert(KEYS.cars, c);
export const saveBooking = (b) => upsert(KEYS.bookings, b);
export const saveReview = (r) => upsert(KEYS.reviews, r);
export const saveDispute = (d) => upsert(KEYS.disputes, d);
export const saveAnnouncement = (a) => upsert(KEYS.announcements, a);

/** Cars visible on the public site: approved AND owned by an active (not suspended) user. */
export function getPublicCars() {
  const users = getUsers();
  return getCars().filter((car) => {
    if (car.status !== 'approved') return false;
    const owner = users.find((u) => u.id === car.ownerId);
    return !!owner && owner.status === 'active';
  });
}

/** Read every collection once and report anything recoverable that went wrong. */
export function checkStorageHealth() {
  const available = storageAvailable('local');
  if (available) {
    getUsers();
    getCars();
    getBookings();
    getReviews();
    getDisputes();
    getAnnouncements();
  }
  return { available, problems: getStorageProblems() };
}
