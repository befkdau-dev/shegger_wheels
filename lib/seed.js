import { addDays, todayISO } from './format.js';
import { findNeighbourhood, CITY } from './places.js';
import { quote } from './pricing.js';

// Realistic but fictional demo data. IDs are stable so seeded car URLs
// (/cars/car-001 ...) can be pre-rendered, linked from the sitemap and shared.
// All dates are generated relative to "today" so upcoming trips stay upcoming.

export const DEMO_PASSWORD_NOTE = 'No passwords exist in this demo. Pick an account to sign in.';

function stamp(today, offset, time = '09:00') {
  return `${addDays(today, offset)}T${time}:00.000Z`;
}

export function buildSeed(today = todayISO()) {
  const t = (n) => addDays(today, n);

  const users = [
    { id: 'user-admin', name: 'Selam Mekonnen', email: 'admin@sheggar.demo', phone: '+251911000001', roles: ['admin'], status: 'active', createdAt: stamp(today, -200) },
    { id: 'user-dawit', name: 'Dawit Bekele', email: 'dawit@sheggar.demo', phone: '+251911000002', roles: ['renter', 'owner'], status: 'active', createdAt: stamp(today, -180) },
    { id: 'user-hanna', name: 'Hanna Tesfaye', email: 'hanna@sheggar.demo', phone: '+251911000003', roles: ['renter', 'owner'], status: 'active', createdAt: stamp(today, -170) },
    { id: 'user-abel', name: 'Abel Girma', email: 'abel@sheggar.demo', phone: '+251911000004', roles: ['renter', 'owner'], status: 'active', createdAt: stamp(today, -60) },
    { id: 'user-meron', name: 'Meron Alemu', email: 'meron@sheggar.demo', phone: '+251911000005', roles: ['renter'], status: 'active', createdAt: stamp(today, -150) },
    { id: 'user-yonas', name: 'Yonas Haile', email: 'yonas@sheggar.demo', phone: '+251911000006', roles: ['renter'], status: 'active', createdAt: stamp(today, -140) },
    { id: 'user-kebede', name: 'Kebede Tadesse', email: 'kebede@sheggar.demo', phone: '+251911000007', roles: ['renter'], status: 'suspended', createdAt: stamp(today, -90) },
  ];

  const car = (id, ownerId, make, model, year, transmission, seats, neighbourhood, pricePerDay, status, description, extra = {}) => {
    const hood = findNeighbourhood(neighbourhood);
    return {
      id,
      ownerId,
      make,
      model,
      year,
      transmission,
      seats,
      city: CITY,
      neighbourhood,
      latitude: hood.lat,
      longitude: hood.lng,
      pricePerDay,
      photos: [`/cars/${id}.svg`, '/cars/interior.svg', '/cars/street.svg'],
      description,
      status,
      unavailableDates: [],
      createdAt: stamp(today, -120),
      approvedAt: status === 'approved' || status === 'inactive' ? stamp(today, -110) : null,
      ...extra,
    };
  };

  const cars = [
    car('car-001', 'user-dawit', 'Toyota', 'Corolla', 2019, 'Automatic', 5, 'Bole', 2800, 'approved',
      'Reliable, fuel-efficient sedan that is ideal for business trips around Bole and the airport. Air conditioning, Bluetooth audio and a clean, non-smoking interior.',
      { unavailableDates: [t(14), t(15)], createdAt: stamp(today, -130) }),
    car('car-002', 'user-dawit', 'Toyota', 'Land Cruiser Prado', 2017, 'Automatic', 7, 'Summit', 7500, 'approved',
      'Seven-seat 4x4 for family trips and weekends outside the city. Roomy luggage space, leather seats and strong highway comfort.',
      { createdAt: stamp(today, -125) }),
    car('car-003', 'user-hanna', 'Hyundai', 'i10', 2020, 'Manual', 4, 'Kazanchis', 1800, 'approved',
      'Compact and easy to park, perfect for narrow streets and city errands. Low fuel use and simple to drive.',
      { createdAt: stamp(today, -100) }),
    car('car-004', 'user-hanna', 'Suzuki', 'Dzire', 2021, 'Manual', 5, 'Megenagna', 2000, 'approved',
      'Practical compact sedan with a generous boot. Great value for daily rentals and short intercity drives.',
      { createdAt: stamp(today, -95) }),
    car('car-005', 'user-dawit', 'Toyota', 'Hiace', 2016, 'Manual', 14, 'Piassa', 6500, 'approved',
      'Fourteen-seat minibus for group transfers, weddings and tours. Air conditioned with roof luggage rack.',
      { createdAt: stamp(today, -90) }),
    car('car-006', 'user-hanna', 'Volkswagen', 'Jetta', 2018, 'Automatic', 5, 'CMC', 3200, 'approved',
      'Comfortable German sedan with smooth automatic transmission, cruise control and a quiet cabin for long drives.',
      { createdAt: stamp(today, -80) }),
    car('car-007', 'user-dawit', 'Nissan', 'X-Trail', 2016, 'Automatic', 5, 'Sarbet', 4800, 'approved',
      'Versatile SUV with high ground clearance - handles rainy-season roads and trips to Debre Zeit with ease.',
      { unavailableDates: [t(1), t(2), t(3)], createdAt: stamp(today, -70) }),
    car('car-008', 'user-abel', 'Honda', 'Fit', 2015, 'Automatic', 5, 'Ayat', 2200, 'pending',
      'Small, clever hatchback with flexible seating and excellent fuel economy. Awaiting admin approval.',
      { createdAt: stamp(today, -3), approvedAt: null }),
    car('car-009', 'user-abel', 'Ford', 'Ranger', 2014, 'Manual', 5, 'Gerji', 5200, 'rejected',
      'Double-cab pickup for heavy loads. Rejected: photos do not clearly show the vehicle - please upload better images.',
      { createdAt: stamp(today, -20), approvedAt: null }),
    car('car-010', 'user-hanna', 'Kia', 'Picanto', 2019, 'Manual', 4, 'Lideta', 1700, 'inactive',
      'Tiny city car, temporarily deactivated by its owner while it is in the workshop.',
      { createdAt: stamp(today, -110) }),
  ];

  const carById = Object.fromEntries(cars.map((c) => [c.id, c]));

  let txCounter = 4100;
  const booking = (id, carId, renterId, startOff, endOff, status, paymentStatus, createdOff) => {
    const c = carById[carId];
    const q = quote(c.pricePerDay, t(startOff), t(endOff));
    txCounter += 17;
    return {
      id,
      carId,
      renterId,
      ownerId: c.ownerId,
      startDate: t(startOff),
      endDate: t(endOff),
      days: q.days,
      pricePerDay: q.pricePerDay,
      subtotal: q.subtotal,
      fee: q.fee,
      total: q.total,
      paymentStatus,
      paymentRef: `TB-DEMO-${txCounter}X`,
      status,
      createdAt: stamp(today, createdOff, '10:15'),
      updatedAt: stamp(today, Math.min(createdOff + 1, 0), '11:30'),
    };
  };

  const bookings = [
    booking('book-001', 'car-001', 'user-meron', -34, -31, 'reviewed', 'released', -40),
    booking('book-002', 'car-003', 'user-meron', -12, -10, 'completed', 'released', -18),
    booking('book-003', 'car-006', 'user-meron', 5, 7, 'confirmed', 'held', -2),
    booking('book-004', 'car-004', 'user-meron', 10, 12, 'requested', 'authorized', -1),
    booking('book-005', 'car-002', 'user-yonas', -1, 2, 'in_progress', 'held', -6),
    booking('book-006', 'car-001', 'user-yonas', 3, 4, 'cancelled', 'refunded', -5),
    booking('book-007', 'car-005', 'user-yonas', 8, 9, 'declined', 'refunded', -4),
    booking('book-008', 'car-007', 'user-yonas', -48, -45, 'reviewed', 'released', -55),
    booking('book-009', 'car-002', 'user-meron', -7, -5, 'disputed', 'held', -14),
    booking('book-010', 'car-006', 'user-yonas', -62, -60, 'resolved', 'released', -70),
    booking('book-011', 'car-001', 'user-meron', -22, -19, 'reviewed', 'released', -28),
    booking('book-012', 'car-007', 'user-yonas', -78, -75, 'reviewed', 'released', -85),
    booking('book-013', 'car-005', 'user-meron', -104, -101, 'reviewed', 'released', -110),
    booking('book-014', 'car-004', 'user-yonas', -18, -16, 'reviewed', 'released', -24),
  ];

  const review = (id, bookingId, rating, comment, ownerReply, ago) => {
    const b = bookings.find((x) => x.id === bookingId);
    return {
      id,
      bookingId,
      carId: b.carId,
      renterId: b.renterId,
      ownerId: b.ownerId,
      rating,
      comment,
      ownerReply,
      createdAt: stamp(today, ago, '16:40'),
    };
  };

  const reviews = [
    review('rev-001', 'book-001', 5, 'Spotless car and a very smooth handover in Bole. Dawit was quick to reply and flexible with pickup time.', 'Thank you Meron - you were a pleasure to host!', -30),
    review('rev-002', 'book-008', 4, 'Great SUV for the Debre Zeit road. Slightly dusty inside but ran perfectly.', null, -44),
    review('rev-003', 'book-011', 5, 'Second time renting the Corolla and it was just as good. Fuel tank was full as promised.', null, -18),
    review('rev-004', 'book-012', 4, 'Comfortable and spacious. Pickup was ten minutes late but communication was clear.', 'Sorry about the delay, we will be more punctual next time.', -74),
    review('rev-005', 'book-013', 3, 'The minibus did the job for our family trip, though the air conditioning was weak.', 'Thanks for the honest feedback - we have serviced the AC since.', -100),
    review('rev-006', 'book-014', 5, 'Perfect little sedan for a weekend. Hanna was very helpful.', null, -15),
  ];

  const disputes = [
    {
      id: 'disp-001',
      bookingId: 'book-009',
      openedBy: 'user-meron',
      reason: 'Vehicle condition',
      description: 'The warning light for tyre pressure came on during the trip and the spare tyre was missing from the boot.',
      status: 'open',
      resolutionNotes: '',
      resolvedBy: null,
      createdAt: stamp(today, -6, '13:00'),
      resolvedAt: null,
      responses: [
        { id: 'resp-001', by: 'user-dawit', message: 'The spare is being replaced this week. I can offer a partial refund for the inconvenience.', createdAt: stamp(today, -5, '09:30') },
      ],
    },
    {
      id: 'disp-002',
      bookingId: 'book-010',
      openedBy: 'user-hanna',
      reason: 'Late return',
      description: 'The car was returned four hours after the agreed time, causing a missed next-day pickup.',
      status: 'resolved',
      resolutionNotes: 'Renter acknowledged the delay. A mock late fee of ETB 600 was recorded and shared with the owner.',
      resolvedBy: 'user-admin',
      createdAt: stamp(today, -58, '10:00'),
      resolvedAt: stamp(today, -56, '15:00'),
      responses: [],
    },
  ];

  const announcements = [
    {
      id: 'ann-001',
      title: 'Welcome to the Sheggar Wheels demo',
      message: 'All cars, users, payments and trip tracking here are simulated for a portfolio project. Explore as a renter, an owner or the demo admin.',
      active: true,
      createdAt: stamp(today, -30),
      createdBy: 'user-admin',
    },
    {
      id: 'ann-002',
      title: 'Holiday schedule reminder',
      message: 'Owners: please block your unavailable dates early for the upcoming holiday weekend.',
      active: false,
      createdAt: stamp(today, -75),
      createdBy: 'user-admin',
    },
  ];

  return { users, cars, bookings, reviews, disputes, announcements };
}

/** Seed cars used by server code (metadata, sitemap, JSON-LD). Browser edits are not visible here. */
export function getSeedCars() {
  return buildSeed().cars;
}

export function getSeedCar(id) {
  return getSeedCars().find((c) => c.id === id) || null;
}

export function publicSeedCars() {
  return getSeedCars().filter((c) => c.status === 'approved');
}
