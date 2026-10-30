// Booking domain logic: finite lifecycle, availability and guarded write actions.
// Every write action re-checks: session -> role -> record exists -> ownership -> state,
// and only then writes. UI hiding is never the only protection.
import { fail, hasRole, requireRole, getCurrentSession } from './auth.js';
import { getBookingById, getBookings, getCarById, getUserById, saveBooking } from './data.js';
import { KEYS, readStorage, removeStorage, writeStorage, emitChange } from './storage.js';
import {
  eachDay,
  isValidISODate,
  rangesOverlap,
  todayISO,
  inclusiveDays,
} from './format.js';
import { MAX_RENTAL_DAYS, quote } from './pricing.js';

// ---- lifecycle -------------------------------------------------------------

export const BOOKING_STATUSES = [
  'requested',
  'confirmed',
  'in_progress',
  'completed',
  'reviewed',
  'declined',
  'cancelled',
  'disputed',
  'resolved',
];

/** Allowed next states. Anything not listed is an invalid transition. */
export const TRANSITIONS = {
  requested: ['confirmed', 'declined', 'cancelled'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'disputed'],
  completed: ['reviewed'],
  reviewed: [],
  declined: [],
  cancelled: [],
  disputed: ['resolved'],
  resolved: [],
};

export const TERMINAL_STATUSES = ['reviewed', 'declined', 'cancelled', 'resolved'];
/** Statuses that actually reserve the car. Two of these may never overlap. */
export const ACTIVE_STATUSES = ['confirmed', 'in_progress', 'disputed'];
/** Statuses that count as earned income for the owner. */
export const EARNED_STATUSES = ['completed', 'reviewed', 'resolved'];

export function canTransition(from, to) {
  return Array.isArray(TRANSITIONS[from]) && TRANSITIONS[from].includes(to);
}

// ---- availability ----------------------------------------------------------

export function validateDates(startDate, endDate, today = todayISO()) {
  if (!isValidISODate(startDate) || !isValidISODate(endDate)) return 'Choose a valid start and end date.';
  if (startDate < today) return 'The start date cannot be in the past.';
  if (endDate < startDate) return 'The end date cannot be before the start date.';
  if (inclusiveDays(startDate, endDate) > MAX_RENTAL_DAYS) return `Rentals are limited to ${MAX_RENTAL_DAYS} days.`;
  return null;
}

/** Returns a human-readable conflict, or null when the car is free for the whole range. */
export function getAvailabilityConflict(car, bookings, startDate, endDate, ignoreBookingId = null) {
  const blocked = eachDay(startDate, endDate).filter((d) => (car.unavailableDates || []).includes(d));
  if (blocked.length) return 'The owner marked some of these dates as unavailable.';
  const clash = bookings.find(
    (b) =>
      b.carId === car.id &&
      b.id !== ignoreBookingId &&
      ACTIVE_STATUSES.includes(b.status) &&
      rangesOverlap(startDate, endDate, b.startDate, b.endDate),
  );
  if (clash) return 'The car is already booked for part of this period.';
  return null;
}

// ---- checkout draft (sessionStorage) --------------------------------------

export function saveCheckoutDraft({ carId, startDate, endDate }) {
  return writeStorage(
    KEYS.checkoutDraft,
    { carId, startDate, endDate, savedAt: new Date().toISOString() },
    'session',
  );
}

export function readCheckoutDraft() {
  const d = readStorage(KEYS.checkoutDraft, null, 'session');
  if (!d || typeof d !== 'object' || typeof d.carId !== 'string') return null;
  return d;
}

export function clearCheckoutDraft() {
  removeStorage(KEYS.checkoutDraft, 'session');
  emitChange();
}

// ---- actions ---------------------------------------------------------------

function randomRef() {
  const part = globalThis.crypto && globalThis.crypto.randomUUID
    ? globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `TB-DEMO-${part.toUpperCase()}`;
}

function persistTransition(booking, nextStatus, patch = {}) {
  if (!canTransition(booking.status, nextStatus)) {
    return fail(`Invalid change: a ${booking.status.replace('_', ' ')} booking cannot become ${nextStatus.replace('_', ' ')}.`, 'invalid_transition');
  }
  const updated = { ...booking, ...patch, status: nextStatus, updatedAt: new Date().toISOString() };
  const saved = saveBooking(updated);
  if (!saved.ok) return fail(saved.error, 'storage');
  return { ok: true, booking: updated };
}

/**
 * Renter requests a booking and completes the mock TeleBirr authorisation.
 * Not signed in -> { ok:false, error:'Not signed in' } and nothing is written.
 */
export function createBooking({ carId, startDate, endDate }) {
  const auth = requireRole('renter');
  if (!auth.ok) return auth;
  const car = getCarById(carId);
  if (!car) return fail('That car could not be found.', 'not_found');
  const owner = getUserById(car.ownerId);
  if (car.status !== 'approved' || !owner || owner.status !== 'active') {
    return fail('This car is not available for booking.', 'not_available');
  }
  if (car.ownerId === auth.user.id) return fail('You cannot book your own car.', 'forbidden');
  const dateError = validateDates(startDate, endDate);
  if (dateError) return fail(dateError);
  const conflict = getAvailabilityConflict(car, getBookings(), startDate, endDate);
  if (conflict) return fail(conflict, 'conflict');

  const q = quote(car.pricePerDay, startDate, endDate); // price snapshot at booking time
  const now = new Date().toISOString();
  const booking = {
    id: `book-${globalThis.crypto && globalThis.crypto.randomUUID ? globalThis.crypto.randomUUID() : Date.now().toString(36)}`,
    carId: car.id,
    renterId: auth.user.id,
    ownerId: car.ownerId,
    startDate,
    endDate,
    days: q.days,
    pricePerDay: q.pricePerDay,
    subtotal: q.subtotal,
    fee: q.fee,
    total: q.total,
    paymentStatus: 'authorized', // demo payment authorised; held once the owner confirms
    paymentRef: randomRef(),
    status: 'requested',
    createdAt: now,
    updatedAt: now,
  };
  const saved = saveBooking(booking);
  if (!saved.ok) return fail(saved.error, 'storage');
  return { ok: true, booking };
}

function loadBookingFor(auth, bookingId) {
  const booking = getBookingById(bookingId);
  if (!booking) return { error: fail('Booking not found.', 'not_found') };
  return { booking };
}

/** Owner approves or declines a request for one of THEIR cars. */
export function respondToRequest(bookingId, decision) {
  const auth = requireRole('owner');
  if (!auth.ok) return auth;
  const { booking, error } = loadBookingFor(auth, bookingId);
  if (error) return error;
  if (booking.ownerId !== auth.user.id) return fail('Not yours', 'forbidden');
  if (decision !== 'approve' && decision !== 'decline') return fail('Unknown decision.');

  if (decision === 'decline') {
    return persistTransition(booking, 'declined', { paymentStatus: 'refunded' });
  }
  if (booking.status !== 'requested') {
    return fail('Only a requested booking can be approved.', 'invalid_transition');
  }
  const car = getCarById(booking.carId);
  if (!car) return fail('The car for this booking no longer exists.', 'not_found');
  const conflict = getAvailabilityConflict(car, getBookings(), booking.startDate, booking.endDate, booking.id);
  if (conflict) {
    return fail(`Cannot confirm: ${conflict} Decline this request or ask the renter to choose other dates.`, 'conflict');
  }
  return persistTransition(booking, 'confirmed', { paymentStatus: 'held' });
}

/** Renter cancels THEIR OWN booking while it is still eligible. */
export function cancelBooking(bookingId) {
  const auth = requireRole('renter');
  if (!auth.ok) return auth;
  const { booking, error } = loadBookingFor(auth, bookingId);
  if (error) return error;
  if (booking.renterId !== auth.user.id) return fail('Not yours', 'forbidden');
  if (booking.status === 'confirmed' && booking.startDate <= todayISO()) {
    return fail('Confirmed bookings can only be cancelled before the start date.', 'not_eligible');
  }
  return persistTransition(booking, 'cancelled', { paymentStatus: 'refunded' });
}

function participantGuard(bookingId) {
  const auth = requireRole(null);
  if (!auth.ok) return { error: auth };
  const booking = getBookingById(bookingId);
  if (!booking) return { error: fail('Booking not found.', 'not_found') };
  const isParticipant = booking.renterId === auth.user.id || booking.ownerId === auth.user.id;
  if (!isParticipant) return { error: fail('Not yours', 'forbidden') };
  if (!hasRole(auth.user, 'renter') && !hasRole(auth.user, 'owner')) {
    return { error: fail('Your account cannot perform this action.', 'forbidden') };
  }
  return { auth, booking };
}

/** Simulation: hand over the keys. Either party of the booking can trigger it. */
export function startRental(bookingId) {
  const { error, booking } = participantGuard(bookingId);
  if (error) return error;
  return persistTransition(booking, 'in_progress');
}

/** Simulation: mark the car returned. Releases the held demo payment. */
export function completeRental(bookingId) {
  const { error, booking } = participantGuard(bookingId);
  if (error) return error;
  return persistTransition(booking, 'completed', { paymentStatus: 'released' });
}

// ---- views ----------------------------------------------------------------

/** Renter-only read: a renter can never load someone else's booking. */
export function getMyBooking(bookingId) {
  const session = getCurrentSession();
  if (!session) return fail('Not signed in', 'unauthenticated');
  if (session.user.status === 'suspended') return fail('Account suspended', 'suspended');
  const booking = getBookingById(bookingId);
  if (!booking) return fail('Booking not found.', 'not_found');
  if (booking.renterId !== session.user.id) return fail('Not yours', 'forbidden');
  return { ok: true, booking };
}

/** What may the signed-in renter do with this booking right now? */
export function renterAllowedActions(booking, today = todayISO()) {
  const actions = [];
  if (booking.status === 'requested') actions.push('cancel');
  if (booking.status === 'confirmed' && booking.startDate > today) actions.push('cancel');
  if (booking.status === 'confirmed' || booking.status === 'in_progress') actions.push('track');
  if (booking.status === 'confirmed') actions.push('start');
  if (booking.status === 'in_progress') actions.push('complete', 'dispute', 'track');
  if (booking.status === 'completed') actions.push('review');
  return [...new Set(actions)];
}

export function ownerAllowedActions(booking) {
  const actions = [];
  if (booking.status === 'requested') actions.push('approve', 'decline');
  if (booking.status === 'confirmed') actions.push('start');
  if (booking.status === 'in_progress') actions.push('complete', 'dispute');
  return actions;
}
