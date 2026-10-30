// Permission-scoped CSV exports. Each function re-checks the session and
// only ever exports the signed-in user's own permitted demo data.
import { fail, requireRole } from './auth.js';
import { getBookings, getCars, getDisputes, getUsers } from './data.js';
import { toCSV } from './csv.js';
import { EARNED_STATUSES } from './bookings.js';
import { todayISO } from './format.js';

const bookingColumns = (carName, userName) => [
  { header: 'Booking ID', value: (b) => b.id },
  { header: 'Car', value: (b) => carName(b.carId) },
  { header: 'Renter', value: (b) => userName(b.renterId) },
  { header: 'Owner', value: (b) => userName(b.ownerId) },
  { header: 'Start date', value: (b) => b.startDate },
  { header: 'End date', value: (b) => b.endDate },
  { header: 'Days', value: (b) => b.days },
  { header: 'Price per day (ETB)', value: (b) => b.pricePerDay },
  { header: 'Subtotal (ETB)', value: (b) => b.subtotal },
  { header: 'Service fee (ETB)', value: (b) => b.fee },
  { header: 'Total (ETB)', value: (b) => b.total },
  { header: 'Status', value: (b) => b.status },
  { header: 'Payment (demo)', value: (b) => b.paymentStatus },
  { header: 'Created', value: (b) => b.createdAt },
];

function lookups() {
  const cars = getCars();
  const users = getUsers();
  return {
    carName: (id) => {
      const c = cars.find((x) => x.id === id);
      return c ? `${c.year} ${c.make} ${c.model}` : 'Unknown car';
    },
    userName: (id) => users.find((u) => u.id === id)?.name || 'Unknown user',
  };
}

export function exportMyBookings() {
  const auth = requireRole('renter');
  if (!auth.ok) return auth;
  const { carName, userName } = lookups();
  const rows = getBookings().filter((b) => b.renterId === auth.user.id);
  return { ok: true, csv: toCSV(rows, bookingColumns(carName, userName)), filename: `my-bookings-${todayISO()}.csv`, count: rows.length };
}

export function exportOwnerBookings() {
  const auth = requireRole('owner');
  if (!auth.ok) return auth;
  const { carName, userName } = lookups();
  const rows = getBookings().filter((b) => b.ownerId === auth.user.id);
  return { ok: true, csv: toCSV(rows, bookingColumns(carName, userName)), filename: `owner-bookings-${todayISO()}.csv`, count: rows.length };
}

export function exportOwnerEarnings() {
  const auth = requireRole('owner');
  if (!auth.ok) return auth;
  const { carName } = lookups();
  const rows = getBookings().filter((b) => b.ownerId === auth.user.id && EARNED_STATUSES.includes(b.status));
  const columns = [
    { header: 'Booking ID', value: (b) => b.id },
    { header: 'Car', value: (b) => carName(b.carId) },
    { header: 'Month', value: (b) => b.startDate.slice(0, 7) },
    { header: 'Start date', value: (b) => b.startDate },
    { header: 'End date', value: (b) => b.endDate },
    { header: 'Days', value: (b) => b.days },
    { header: 'Earned (ETB)', value: (b) => b.subtotal },
    { header: 'Status', value: (b) => b.status },
  ];
  return { ok: true, csv: toCSV(rows, columns), filename: `owner-earnings-${todayISO()}.csv`, count: rows.length };
}

export function exportPlatformReport(kind = 'bookings') {
  const auth = requireRole('admin');
  if (!auth.ok) return auth;
  const { carName, userName } = lookups();
  if (kind === 'bookings') {
    const rows = getBookings();
    return { ok: true, csv: toCSV(rows, bookingColumns(carName, userName)), filename: `platform-bookings-${todayISO()}.csv`, count: rows.length };
  }
  if (kind === 'users') {
    const rows = getUsers();
    const columns = [
      { header: 'User ID', value: (u) => u.id },
      { header: 'Name', value: (u) => u.name },
      { header: 'Email', value: (u) => u.email },
      { header: 'Phone', value: (u) => u.phone },
      { header: 'Roles', value: (u) => u.roles.join(' ') },
      { header: 'Status', value: (u) => u.status },
      { header: 'Created', value: (u) => u.createdAt },
    ];
    return { ok: true, csv: toCSV(rows, columns), filename: `platform-users-${todayISO()}.csv`, count: rows.length };
  }
  if (kind === 'disputes') {
    const rows = getDisputes();
    const columns = [
      { header: 'Dispute ID', value: (d) => d.id },
      { header: 'Booking ID', value: (d) => d.bookingId },
      { header: 'Opened by', value: (d) => userName(d.openedBy) },
      { header: 'Reason', value: (d) => d.reason },
      { header: 'Description', value: (d) => d.description },
      { header: 'Status', value: (d) => d.status },
      { header: 'Resolution notes', value: (d) => d.resolutionNotes },
      { header: 'Created', value: (d) => d.createdAt },
      { header: 'Resolved', value: (d) => d.resolvedAt },
    ];
    return { ok: true, csv: toCSV(rows, columns), filename: `platform-disputes-${todayISO()}.csv`, count: rows.length };
  }
  return fail('Unknown report.');
}
