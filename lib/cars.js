// Car listing actions (owner) and moderation (admin). Same guard order as bookings.
import { fail, hasRole, requireRole } from './auth.js';
import { getBookings, getCarById, saveCar } from './data.js';
import { ACTIVE_STATUSES } from './bookings.js';
import { ADDIS_BOUNDS, CITY, NEIGHBOURHOODS, findNeighbourhood } from './places.js';
import { eachDay, isValidISODate, rangesOverlap, todayISO } from './format.js';

export const TRANSMISSIONS = ['Automatic', 'Manual'];

/** Validate and normalise listing form input. Returns { errors, values }. */
export function validateCarInput(input) {
  const errors = {};
  const year = Number(input.year);
  const seats = Number(input.seats);
  const price = Number(input.pricePerDay);
  const lat = Number(input.latitude);
  const lng = Number(input.longitude);
  const thisYear = new Date().getFullYear();
  const make = String(input.make || '').trim();
  const model = String(input.model || '').trim();
  const description = String(input.description || '').trim();
  const photos = Array.isArray(input.photos) ? input.photos.filter((p) => typeof p === 'string') : [];

  if (make.length < 2) errors.make = 'Enter the make, e.g. Toyota.';
  if (model.length < 1) errors.model = 'Enter the model, e.g. Corolla.';
  if (!Number.isInteger(year) || year < 1995 || year > thisYear + 1) errors.year = `Enter a year between 1995 and ${thisYear + 1}.`;
  if (!TRANSMISSIONS.includes(input.transmission)) errors.transmission = 'Choose Automatic or Manual.';
  if (!Number.isInteger(seats) || seats < 2 || seats > 16) errors.seats = 'Seats must be a whole number from 2 to 16.';
  if (!findNeighbourhood(input.neighbourhood)) errors.neighbourhood = 'Choose a neighbourhood.';
  if (!Number.isFinite(price) || !Number.isInteger(price) || price < 500 || price > 50000) {
    errors.pricePerDay = 'Daily price must be a whole number of ETB between 500 and 50,000.';
  }
  if (
    !Number.isFinite(lat) || !Number.isFinite(lng) ||
    lat < ADDIS_BOUNDS.minLat || lat > ADDIS_BOUNDS.maxLat ||
    lng < ADDIS_BOUNDS.minLng || lng > ADDIS_BOUNDS.maxLng
  ) {
    errors.latitude = 'Coordinates must be inside the Addis Ababa area.';
  }
  if (description.length < 20) errors.description = 'Describe the car in at least 20 characters.';
  if (description.length > 600) errors.description = 'Keep the description under 600 characters.';
  if (photos.length < 1) errors.photos = 'Select at least one demo photo.';

  return {
    errors,
    values: {
      make,
      model,
      year,
      transmission: input.transmission,
      seats,
      city: CITY,
      neighbourhood: input.neighbourhood,
      latitude: lat,
      longitude: lng,
      pricePerDay: price,
      photos: photos.slice(0, 6),
      description,
    },
  };
}

function ownerGuard(carId) {
  const auth = requireRole('owner');
  if (!auth.ok) return { error: auth };
  const car = getCarById(carId);
  if (!car) return { error: fail('Car not found.', 'not_found') };
  if (car.ownerId !== auth.user.id) return { error: fail('Not yours', 'forbidden') };
  return { auth, car };
}

/** intent: 'draft' | 'submit' */
export function createCar(input, intent = 'submit') {
  const auth = requireRole('owner');
  if (!auth.ok) return auth;
  const { errors, values } = validateCarInput(input);
  if (Object.keys(errors).length) return { ok: false, error: 'Please fix the highlighted fields.', code: 'invalid', errors };
  const car = {
    id: `car-${globalThis.crypto && globalThis.crypto.randomUUID ? globalThis.crypto.randomUUID() : Date.now().toString(36)}`,
    ownerId: auth.user.id,
    ...values,
    status: intent === 'draft' ? 'draft' : 'pending',
    unavailableDates: [],
    createdAt: new Date().toISOString(),
    approvedAt: null,
  };
  const saved = saveCar(car);
  if (!saved.ok) return fail(saved.error, 'storage');
  return { ok: true, car };
}

export function updateCar(carId, input, intent = 'save') {
  const { error, car } = ownerGuard(carId);
  if (error) return error;
  const { errors, values } = validateCarInput(input);
  if (Object.keys(errors).length) return { ok: false, error: 'Please fix the highlighted fields.', code: 'invalid', errors };

  let status = car.status;
  if (car.status === 'draft' || car.status === 'rejected') {
    status = intent === 'draft' && car.status === 'draft' ? 'draft' : 'pending';
  }
  const updated = { ...car, ...values, status };
  const saved = saveCar(updated);
  if (!saved.ok) return fail(saved.error, 'storage');
  return { ok: true, car: updated };
}

export function setCarActive(carId, active) {
  const { error, car } = ownerGuard(carId);
  if (error) return error;
  if (active) {
    if (car.status !== 'inactive') return fail('Only inactive listings can be reactivated.', 'invalid_transition');
    if (!car.approvedAt) return fail('This listing was never approved.', 'invalid_transition');
    const updated = { ...car, status: 'approved' };
    const saved = saveCar(updated);
    return saved.ok ? { ok: true, car: updated } : fail(saved.error, 'storage');
  }
  if (car.status !== 'approved') return fail('Only approved listings can be deactivated.', 'invalid_transition');
  const busy = getBookings().some((b) => b.carId === car.id && ACTIVE_STATUSES.includes(b.status));
  if (busy) return fail('This car has confirmed or ongoing bookings. Finish them before deactivating.', 'conflict');
  const updated = { ...car, status: 'inactive' };
  const saved = saveCar(updated);
  return saved.ok ? { ok: true, car: updated } : fail(saved.error, 'storage');
}

/** Replace the owner's blocked-date list for one car. */
export function setUnavailableDates(carId, dates) {
  const { error, car } = ownerGuard(carId);
  if (error) return error;
  const today = todayISO();
  const clean = [...new Set((Array.isArray(dates) ? dates : []).filter((d) => isValidISODate(d)))].sort();
  if (clean.some((d) => d < today)) {
    // Past dates are harmless but meaningless - drop them quietly.
  }
  const future = clean.filter((d) => d >= today);
  const active = getBookings().filter((b) => b.carId === car.id && ACTIVE_STATUSES.includes(b.status));
  const clash = future.find((d) => active.some((b) => rangesOverlap(d, d, b.startDate, b.endDate)));
  if (clash) return fail(`${clash} falls inside a confirmed or ongoing booking and cannot be blocked.`, 'conflict');
  const updated = { ...car, unavailableDates: future };
  const saved = saveCar(updated);
  return saved.ok ? { ok: true, car: updated } : fail(saved.error, 'storage');
}

/** Block every day in a range (helper for the availability manager UI). */
export function expandRange(start, end) {
  if (!isValidISODate(start) || !isValidISODate(end) || end < start) return [];
  return eachDay(start, end);
}

/** Admin moderation of a pending listing. */
export function moderateCar(carId, decision) {
  const auth = requireRole('admin');
  if (!auth.ok) return auth;
  if (!hasRole(auth.user, 'admin')) return fail('Wrong role', 'forbidden');
  const car = getCarById(carId);
  if (!car) return fail('Car not found.', 'not_found');
  if (car.status !== 'pending') return fail('Only pending listings can be moderated.', 'invalid_transition');
  if (decision !== 'approve' && decision !== 'reject') return fail('Unknown decision.');
  const updated =
    decision === 'approve'
      ? { ...car, status: 'approved', approvedAt: new Date().toISOString() }
      : { ...car, status: 'rejected' };
  const saved = saveCar(updated);
  return saved.ok ? { ok: true, car: updated } : fail(saved.error, 'storage');
}

export { NEIGHBOURHOODS };
