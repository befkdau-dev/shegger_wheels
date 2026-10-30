// In-app notification cards derived from demo records (no server push needed).
import { formatDateRange } from './format.js';

function carName(cars, id) {
  const c = cars.find((x) => x.id === id);
  return c ? `${c.make} ${c.model}` : 'a car';
}

export function deriveNotifications(user, { cars, bookings, disputes, announcements }) {
  if (!user) return [];
  const items = [];
  const mine = bookings.filter((b) => b.renterId === user.id);
  const incoming = bookings.filter((b) => b.ownerId === user.id);

  for (const b of mine) {
    const name = carName(cars, b.carId);
    const range = formatDateRange(b.startDate, b.endDate);
    const href = `/bookings/${b.id}`;
    if (b.status === 'confirmed') items.push({ id: `n-${b.id}-c`, tone: 'success', title: 'Booking confirmed', text: `${name} · ${range}`, href, at: b.updatedAt });
    if (b.status === 'declined') items.push({ id: `n-${b.id}-d`, tone: 'danger', title: 'Request declined', text: `${name} · ${range}`, href, at: b.updatedAt });
    if (b.status === 'in_progress') items.push({ id: `n-${b.id}-p`, tone: 'info', title: 'Rental in progress (simulation)', text: `${name} · ends ${b.endDate}`, href, at: b.updatedAt });
    if (b.status === 'completed') items.push({ id: `n-${b.id}-r`, tone: 'info', title: 'How was your trip?', text: `Leave a review for ${name}`, href: `/bookings/${b.id}/review`, at: b.updatedAt });
  }
  if (user.roles?.includes('owner')) {
    for (const b of incoming.filter((x) => x.status === 'requested')) {
      items.push({ id: `n-${b.id}-q`, tone: 'warning', title: 'New booking request', text: `${carName(cars, b.carId)} · ${formatDateRange(b.startDate, b.endDate)}`, href: `/owner/cars/${b.carId}/bookings`, at: b.createdAt });
    }
  }
  for (const d of disputes) {
    const b = bookings.find((x) => x.id === d.bookingId);
    if (!b || d.status !== 'open') continue;
    if (b.renterId === user.id || b.ownerId === user.id) {
      items.push({ id: `n-${d.id}`, tone: 'warning', title: 'Open dispute', text: `${d.reason} · ${carName(cars, b.carId)}`, href: b.ownerId === user.id ? '/owner/disputes' : `/bookings/${b.id}`, at: d.createdAt });
    }
  }
  if (user.roles?.includes('admin')) {
    const pending = cars.filter((c) => c.status === 'pending').length;
    if (pending) items.push({ id: 'n-admin-pending', tone: 'warning', title: `${pending} listing${pending === 1 ? '' : 's'} awaiting review`, text: 'Approve or reject new cars', href: '/admin/listings', at: new Date().toISOString() });
    const open = disputes.filter((d) => d.status === 'open').length;
    if (open) items.push({ id: 'n-admin-disputes', tone: 'warning', title: `${open} open dispute${open === 1 ? '' : 's'}`, text: 'Review and resolve with notes', href: '/admin/disputes', at: new Date().toISOString() });
  }
  for (const a of announcements.filter((x) => x.active)) {
    items.push({ id: `n-${a.id}`, tone: 'info', title: a.title, text: a.message, href: null, at: a.createdAt });
  }
  return items.sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 12);
}
