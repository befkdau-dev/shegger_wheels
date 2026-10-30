// Runs the brief's required negative tests (and more) against the real domain
// modules, using an in-memory stand-in for localStorage/sessionStorage.
//
//   npm run test:negative
//
// These prove that ordinary misuse is refused by the action helpers - they do
// NOT prove the system is secure against a determined user editing storage.
import assert from 'node:assert/strict';

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
  removeItem(k) { this.map.delete(k); }
  clear() { this.map.clear(); }
}
globalThis.window = {
  localStorage: new MemoryStorage(),
  sessionStorage: new MemoryStorage(),
  dispatchEvent() {},
};

const { getPublicCars, resetDemoData, getBookings, getCars, getBookingById, getCarById, getUsers, saveUser } = await import('../lib/data.js');
const auth = await import('../lib/auth.js');
const bookings = await import('../lib/bookings.js');
const cars = await import('../lib/cars.js');
const reviews = await import('../lib/reviews.js');
const disputes = await import('../lib/disputes.js');
const admin = await import('../lib/admin.js');
const { toCSV, escapeCell } = await import('../lib/csv.js');
const { readCollection, KEYS } = await import('../lib/storage.js');
const { addDays, todayISO } = await import('../lib/format.js');

let passed = 0;
let failed = 0;
function test(name, fn) {
  try {
    resetDemoData();
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed += 1;
    console.log(`  ✗ ${name}\n      ${e.message}`);
  }
}

const today = todayISO();
const t = (n) => addDays(today, n);
console.log('\nRequired negative tests');

test('1. Signed-out write attempt -> "Not signed in", nothing created', () => {
  const before = getBookings().length;
  const res = bookings.createBooking({ carId: 'car-001', startDate: t(20), endDate: t(21) });
  assert.equal(res.ok, false);
  assert.equal(res.error, 'Not signed in');
  assert.equal(getBookings().length, before);
});

test('2. Cross-user ownership attempt -> "Not yours", no data change', () => {
  auth.signInAsDemo('user-yonas'); // book-003 belongs to Meron
  const before = JSON.stringify(getBookingById('book-003'));
  const res = bookings.cancelBooking('book-003');
  assert.equal(res.ok, false);
  assert.equal(res.error, 'Not yours');
  assert.equal(JSON.stringify(getBookingById('book-003')), before);
});

test('3. Unsafe return URL -> falls back to a safe internal path', () => {
  for (const bad of [
    'https://example.com', 'http://example.com/x', '//example.com', '/\\example.com',
    'javascript:alert(1)', '/\t/example.com', '\\\\example.com', 'example.com', '', null, undefined, 42,
  ]) {
    assert.equal(auth.safeReturnPath(bad), '/', `should reject ${JSON.stringify(bad)}`);
  }
  assert.equal(auth.safeReturnPath('/checkout'), '/checkout');
  assert.equal(auth.safeReturnPath('/cars?neighbourhood=Bole&sort=price-asc'), '/cars?neighbourhood=Bole&sort=price-asc');
  assert.equal(auth.safeReturnPath('/signin?next=/x'), '/');
});

console.log('\nAdditional ownership and role checks');

test('Owner cannot edit another owner\'s car by changing the ID', () => {
  auth.signInAsDemo('user-hanna'); // car-001 is Dawit's
  const car = getCarById('car-001');
  const res = cars.updateCar('car-001', { ...car, pricePerDay: 100000 });
  assert.equal(res.ok, false);
  assert.equal(res.error, 'Not yours');
  assert.equal(getCarById('car-001').pricePerDay, 2800);
});

test('Renter cannot read another renter\'s booking', () => {
  auth.signInAsDemo('user-yonas');
  const res = bookings.getMyBooking('book-001');
  assert.equal(res.ok, false);
  assert.equal(res.error, 'Not yours');
});

test('Renter-only account cannot approve requests or list cars', () => {
  auth.signInAsDemo('user-meron');
  assert.equal(bookings.respondToRequest('book-004', 'approve').ok, false);
  const res = cars.createCar({ make: 'Toyota', model: 'Vitz', year: 2018, transmission: 'Manual', seats: 5, neighbourhood: 'Bole', latitude: 8.99, longitude: 38.78, pricePerDay: 2000, photos: ['/cars/demo-1.svg'], description: 'A tidy little city car for rent.' });
  assert.equal(res.ok, false);
  assert.match(res.error, /owner access/);
});

test('Owner cannot approve a request for someone else\'s car', () => {
  auth.signInAsDemo('user-dawit'); // book-004 is for Hanna's car-004
  const res = bookings.respondToRequest('book-004', 'approve');
  assert.equal(res.error, 'Not yours');
  assert.equal(getBookingById('book-004').status, 'requested');
});

test('Public sign-up can never create an admin account', () => {
  const res = auth.signUp({ name: 'Mallory Evil', email: 'mallory@example.com', phone: '+251911999999', alsoOwner: true, roles: ['admin'] });
  assert.equal(res.ok, true);
  assert.deepEqual(res.user.roles, ['renter', 'owner']);
  assert.equal(admin.setUserStatus('user-meron', 'suspended').ok, false);
});

test('Only admins can moderate listings and resolve disputes', () => {
  auth.signInAsDemo('user-dawit');
  assert.equal(cars.moderateCar('car-008', 'approve').ok, false);
  assert.equal(disputes.resolveDispute('disp-001', 'Resolved by me, the owner.').ok, false);
  auth.signInAsDemo('user-admin');
  assert.equal(cars.moderateCar('car-008', 'approve').ok, true);
  assert.equal(getCarById('car-008').status, 'approved');
});

console.log('\nBooking rules');

test('Valid booking is validated, priced and persisted', () => {
  auth.signInAsDemo('user-meron');
  const res = bookings.createBooking({ carId: 'car-001', startDate: t(20), endDate: t(22) });
  assert.equal(res.ok, true);
  assert.equal(res.booking.days, 3);
  assert.equal(res.booking.subtotal, 3 * 2800);
  assert.equal(res.booking.fee, Math.round(3 * 2800 * 0.1));
  assert.equal(res.booking.total, res.booking.subtotal + res.booking.fee);
  assert.equal(res.booking.status, 'requested');
  assert.ok(getBookingById(res.booking.id));
});

test('Invalid dates and own-car bookings are refused', () => {
  auth.signInAsDemo('user-meron');
  assert.equal(bookings.createBooking({ carId: 'car-001', startDate: t(-3), endDate: t(1) }).ok, false);
  assert.equal(bookings.createBooking({ carId: 'car-001', startDate: t(5), endDate: t(4) }).ok, false);
  assert.equal(bookings.createBooking({ carId: 'car-001', startDate: 'nope', endDate: 'nope' }).ok, false);
  auth.signInAsDemo('user-dawit');
  assert.equal(bookings.createBooking({ carId: 'car-001', startDate: t(5), endDate: t(6) }).error, 'You cannot book your own car.');
});

test('Owner-blocked dates cannot be booked', () => {
  auth.signInAsDemo('user-meron');
  assert.equal(bookings.createBooking({ carId: 'car-001', startDate: t(14), endDate: t(15) }).ok, false);
});

test('Two overlapping bookings cannot both be confirmed', () => {
  auth.signInAsDemo('user-meron');
  const a = bookings.createBooking({ carId: 'car-002', startDate: t(30), endDate: t(33) });
  auth.signInAsDemo('user-yonas');
  const b = bookings.createBooking({ carId: 'car-002', startDate: t(32), endDate: t(35) });
  assert.ok(a.ok && b.ok, 'overlapping REQUESTS are allowed');
  auth.signInAsDemo('user-dawit');
  assert.equal(bookings.respondToRequest(a.booking.id, 'approve').ok, true);
  const second = bookings.respondToRequest(b.booking.id, 'approve');
  assert.equal(second.ok, false);
  assert.match(second.error, /already booked/);
  assert.equal(getBookingById(b.booking.id).status, 'requested');
});

test('Invalid lifecycle transitions are refused without changing storage', () => {
  auth.signInAsDemo('user-dawit');
  const before = JSON.stringify(getBookings());
  // book-001 is already reviewed (terminal); book-006 is cancelled (terminal)
  assert.equal(bookings.startRental('book-001').ok, false);
  assert.equal(bookings.completeRental('book-003').ok, false); // confirmed -> completed is not allowed
  assert.equal(bookings.respondToRequest('book-006', 'approve').ok, false);
  assert.equal(JSON.stringify(getBookings()), before);
});

test('Renter cancel rules: requested ok, confirmed before start ok, in-progress refused', () => {
  auth.signInAsDemo('user-meron');
  assert.equal(bookings.cancelBooking('book-004').ok, true); // requested
  assert.equal(bookings.cancelBooking('book-003').ok, true); // confirmed, starts in 5 days
  assert.equal(getBookingById('book-003').paymentStatus, 'refunded');
  auth.signInAsDemo('user-yonas');
  assert.equal(bookings.cancelBooking('book-005').ok, false); // in progress
});

test('Full happy path: request -> confirm -> start -> complete -> review', () => {
  auth.signInAsDemo('user-meron');
  const b = bookings.createBooking({ carId: 'car-004', startDate: t(40), endDate: t(41) }).booking;
  auth.signInAsDemo('user-hanna');
  assert.equal(bookings.respondToRequest(b.id, 'approve').ok, true);
  assert.equal(getBookingById(b.id).paymentStatus, 'held');
  assert.equal(bookings.startRental(b.id).ok, true);
  assert.equal(bookings.completeRental(b.id).ok, true);
  auth.signInAsDemo('user-meron');
  assert.equal(reviews.createReview({ bookingId: b.id, rating: 9, comment: 'x' }).ok, false);
  const rev = reviews.createReview({ bookingId: b.id, rating: 5, comment: 'Excellent car and easy handover.' });
  assert.equal(rev.ok, true);
  assert.equal(getBookingById(b.id).status, 'reviewed');
  assert.equal(reviews.createReview({ bookingId: b.id, rating: 5, comment: 'Trying a second review.' }).ok, false);
  auth.signInAsDemo('user-hanna');
  assert.equal(reviews.replyToReview(rev.review.id, 'Thank you!').ok, true);
  auth.signInAsDemo('user-dawit');
  assert.equal(reviews.replyToReview(rev.review.id, 'Not my car').error, 'Not yours');
});

test('Review needs a completed trip owned by the renter', () => {
  auth.signInAsDemo('user-yonas');
  assert.equal(reviews.createReview({ bookingId: 'book-002', rating: 5, comment: 'Not my booking at all.' }).error, 'Not yours');
  auth.signInAsDemo('user-meron');
  assert.equal(reviews.createReview({ bookingId: 'book-003', rating: 5, comment: 'Trip has not happened yet.' }).ok, false);
});

test('Dispute flow: raise while in progress, admin resolves with notes', () => {
  auth.signInAsDemo('user-yonas');
  assert.equal(disputes.raiseDispute({ bookingId: 'book-003', reason: 'Late return', description: 'This is not in progress.' }).ok, false);
  const raised = disputes.raiseDispute({ bookingId: 'book-005', reason: 'Vehicle condition', description: 'The brakes make a grinding noise.' });
  assert.equal(raised.ok, true);
  assert.equal(getBookingById('book-005').status, 'disputed');
  auth.signInAsDemo('user-meron'); // unrelated renter
  assert.equal(disputes.respondToDispute(raised.dispute.id, 'I should not be able to answer').error, 'Not yours');
  auth.signInAsDemo('user-admin');
  assert.equal(disputes.resolveDispute(raised.dispute.id, 'short').ok, false);
  assert.equal(disputes.resolveDispute(raised.dispute.id, 'Owner will service the brakes; partial refund agreed.').ok, true);
  assert.equal(getBookingById('book-005').status, 'resolved');
});

test('Suspended users cannot act, and suspension hides their cars publicly', () => {
  auth.signInAsDemo('user-admin');
  assert.equal(admin.setUserStatus('user-dawit', 'suspended').ok, true);
  assert.equal(getPublicCars().some((c) => c.ownerId === 'user-dawit'), false);
  auth.signInAsDemo('user-dawit');
  assert.equal(bookings.respondToRequest('book-004', 'approve').error, 'Account suspended');
  auth.signInAsDemo('user-kebede');
  assert.equal(bookings.createBooking({ carId: 'car-003', startDate: t(9), endDate: t(10) }).error, 'Account suspended');
});

test('Owner cannot deactivate a car with active bookings or block booked dates', () => {
  auth.signInAsDemo('user-dawit');
  assert.equal(cars.setCarActive('car-002', false).ok, false); // book-005 in progress
  assert.equal(cars.setUnavailableDates('car-002', [today]).ok, false); // inside in-progress booking
  assert.equal(cars.setUnavailableDates('car-001', [t(10), t(11)]).ok, true);
});

console.log('\nData layer');

test('Malformed JSON in storage does not crash and is reported', () => {
  window.localStorage.setItem(KEYS.cars, '{not json');
  assert.deepEqual(readCollection(KEYS.cars), []);
  window.localStorage.setItem(KEYS.bookings, JSON.stringify({ not: 'an array' }));
  assert.deepEqual(readCollection(KEYS.bookings), []);
  assert.equal(getCars().length, 0);
});

test('Seeding runs once and never overwrites user data', () => {
  auth.signUp({ name: 'New Person', email: 'new@example.com', phone: '+251911000099' });
  const count = getUsers().length;
  assert.equal(count, 8);
  window.localStorage.setItem(KEYS.users, JSON.stringify(getUsers()));
  assert.equal(getUsers().length, 8);
});

test('Sign-up validation: duplicate email and missing fields', () => {
  const dup = auth.signUp({ name: 'Dup', email: 'MERON@sheggar.demo', phone: '+251911000099' });
  assert.equal(dup.ok, false);
  assert.ok(dup.errors.email);
  const bad = auth.signUp({ name: '', email: 'nope', phone: '1' });
  assert.ok(bad.errors.name && bad.errors.email && bad.errors.phone);
});

test('CSV quoting handles commas, quotes and newlines', () => {
  assert.equal(escapeCell('plain'), 'plain');
  assert.equal(escapeCell('a,b'), '"a,b"');
  assert.equal(escapeCell('say "hi"'), '"say ""hi"""');
  assert.equal(escapeCell('line1\nline2'), '"line1\nline2"');
  assert.equal(escapeCell('=SUM(A1)'), "'=SUM(A1)");
  assert.equal(escapeCell(2800), '2800');
  assert.equal(escapeCell(-5), '-5');
  const csv = toCSV([{ n: 'A, "B"' }], [{ header: 'Name', value: (r) => r.n }]);
  assert.equal(csv, 'Name\r\n"A, ""B"""\r\n');
});

test('Sign-out clears the session', () => {
  auth.signInAsDemo('user-meron');
  assert.ok(auth.getCurrentSession());
  auth.signOut();
  assert.equal(auth.getCurrentSession(), null);
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
