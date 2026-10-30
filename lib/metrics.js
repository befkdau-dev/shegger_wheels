// Pure dashboard calculations. Inputs are plain arrays read from the data layer.
import { EARNED_STATUSES, ACTIVE_STATUSES } from './bookings.js';
import { addDays, monthKey, monthLabel, todayISO, rangesOverlap } from './format.js';

function lastMonthKeys(count, today = todayISO()) {
  const [y, m] = today.split('-').map(Number);
  const keys = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    keys.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

export function renterMetrics(bookings, today = todayISO()) {
  const upcoming = bookings
    .filter((b) => ['requested', 'confirmed'].includes(b.status) && b.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const live = bookings.filter((b) => b.status === 'in_progress');
  const completed = bookings.filter((b) => ['completed', 'reviewed', 'resolved'].includes(b.status));
  const cancelled = bookings.filter((b) => ['cancelled', 'declined'].includes(b.status));
  const spend = bookings
    .filter((b) => ['confirmed', 'in_progress', 'completed', 'reviewed', 'disputed', 'resolved'].includes(b.status))
    .reduce((s, b) => s + b.total, 0);
  return {
    upcoming,
    live,
    completedCount: completed.length,
    cancelledCount: cancelled.length,
    nextBooking: live[0] || upcoming[0] || null,
    totalSpend: spend,
  };
}

export function monthlyEarnings(bookings, months = 6, today = todayISO()) {
  const keys = lastMonthKeys(months, today);
  const totals = Object.fromEntries(keys.map((k) => [k, { earned: 0, projected: 0 }]));
  for (const b of bookings) {
    const key = monthKey(b.startDate);
    if (!totals[key]) continue;
    if (EARNED_STATUSES.includes(b.status)) totals[key].earned += b.subtotal;
    else if (['confirmed', 'in_progress', 'disputed'].includes(b.status)) totals[key].projected += b.subtotal;
  }
  return keys.map((k) => ({ month: k, label: monthLabel(k), earned: totals[k].earned, projected: totals[k].projected }));
}

/** Share of the last `windowDays` days a car was reserved (inclusive ranges, clipped to the window). */
export function utilization(carId, bookings, windowDays = 30, today = todayISO()) {
  const winStart = addDays(today, -(windowDays - 1));
  let booked = 0;
  for (let i = 0; i < windowDays; i++) {
    const day = addDays(winStart, i);
    const hit = bookings.some(
      (b) =>
        b.carId === carId &&
        (EARNED_STATUSES.includes(b.status) || ACTIVE_STATUSES.includes(b.status)) &&
        rangesOverlap(day, day, b.startDate, b.endDate),
    );
    if (hit) booked += 1;
  }
  return Math.round((booked / windowDays) * 100);
}

export function ownerMetrics(cars, bookings, today = todayISO()) {
  const earned = bookings.filter((b) => EARNED_STATUSES.includes(b.status));
  return {
    approvedCars: cars.filter((c) => c.status === 'approved').length,
    pendingCars: cars.filter((c) => c.status === 'pending').length,
    pendingRequests: bookings.filter((b) => b.status === 'requested').length,
    confirmedRentals: bookings.filter((b) => ['confirmed', 'in_progress'].includes(b.status)).length,
    totalEarnings: earned.reduce((s, b) => s + b.subtotal, 0),
    projected: bookings
      .filter((b) => ['confirmed', 'in_progress', 'disputed'].includes(b.status))
      .reduce((s, b) => s + b.subtotal, 0),
    perCar: cars.map((car) => {
      const mine = bookings.filter((b) => b.carId === car.id);
      return {
        car,
        trips: mine.filter((b) => EARNED_STATUSES.includes(b.status)).length,
        earned: mine.filter((b) => EARNED_STATUSES.includes(b.status)).reduce((s, b) => s + b.subtotal, 0),
        utilization: utilization(car.id, bookings, 30, today),
      };
    }),
  };
}

export function adminMetrics(users, cars, bookings, today = todayISO()) {
  const byStatus = {};
  for (const b of bookings) byStatus[b.status] = (byStatus[b.status] || 0) + 1;
  const keys = lastMonthKeys(6, today);
  const volume = keys.map((k) => ({
    month: k,
    label: monthLabel(k),
    bookings: bookings.filter((b) => monthKey(b.createdAt) === k).length,
  }));
  const feeStatuses = ['confirmed', 'in_progress', 'completed', 'reviewed', 'disputed', 'resolved'];
  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === 'active').length,
    approvedCars: cars.filter((c) => c.status === 'approved').length,
    pendingCars: cars.filter((c) => c.status === 'pending').length,
    totalBookings: bookings.length,
    byStatus,
    statusSeries: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
    volume,
    commission: bookings.filter((b) => feeStatuses.includes(b.status)).reduce((s, b) => s + b.fee, 0),
    gross: bookings.filter((b) => feeStatuses.includes(b.status)).reduce((s, b) => s + b.total, 0),
  };
}
