import { fail, requireRole } from './auth.js';
import { getBookingById, getDisputeById, getDisputes, saveBooking, saveDispute } from './data.js';
import { canTransition } from './bookings.js';

export const DISPUTE_REASONS = [
  'Vehicle condition',
  'Damage claim',
  'Late return',
  'Payment issue',
  'Safety concern',
  'Other',
];

/** A dispute is visible only to the renter and owner of its booking, and to admins. */
export function canViewDispute(user, dispute, booking) {
  if (!user || !dispute || !booking) return false;
  if (user.roles?.includes('admin')) return true;
  return booking.renterId === user.id || booking.ownerId === user.id;
}

/** Renter or owner of an in-progress booking raises an issue. */
export function raiseDispute({ bookingId, reason, description }) {
  const auth = requireRole(null);
  if (!auth.ok) return auth;
  const booking = getBookingById(bookingId);
  if (!booking) return fail('Booking not found.', 'not_found');
  if (booking.renterId !== auth.user.id && booking.ownerId !== auth.user.id) return fail('Not yours', 'forbidden');
  if (!canTransition(booking.status, 'disputed')) {
    return fail('Issues can only be raised while a rental is in progress.', 'invalid_transition');
  }
  if (!DISPUTE_REASONS.includes(reason)) return fail('Choose a reason for the dispute.');
  const text = String(description || '').trim();
  if (text.length < 15) return fail('Describe the problem in at least 15 characters.');
  if (text.length > 800) return fail('Keep the description under 800 characters.');
  if (getDisputes().some((d) => d.bookingId === booking.id && d.status === 'open')) {
    return fail('There is already an open dispute for this booking.', 'conflict');
  }

  const dispute = {
    id: `disp-${globalThis.crypto && globalThis.crypto.randomUUID ? globalThis.crypto.randomUUID() : Date.now().toString(36)}`,
    bookingId: booking.id,
    openedBy: auth.user.id,
    reason,
    description: text,
    status: 'open',
    resolutionNotes: '',
    resolvedBy: null,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    responses: [],
  };
  const savedBooking = saveBooking({ ...booking, status: 'disputed', updatedAt: new Date().toISOString() });
  if (!savedBooking.ok) return fail(savedBooking.error, 'storage');
  const saved = saveDispute(dispute);
  if (!saved.ok) return fail(saved.error, 'storage');
  return { ok: true, dispute };
}

/** Renter or owner adds a reply to an open dispute they are part of. */
export function respondToDispute(disputeId, message) {
  const auth = requireRole(null);
  if (!auth.ok) return auth;
  const dispute = getDisputeById(disputeId);
  if (!dispute) return fail('Dispute not found.', 'not_found');
  const booking = getBookingById(dispute.bookingId);
  if (!booking || (booking.renterId !== auth.user.id && booking.ownerId !== auth.user.id)) {
    return fail('Not yours', 'forbidden');
  }
  if (dispute.status !== 'open') return fail('This dispute is already resolved.', 'invalid_transition');
  const text = String(message || '').trim();
  if (text.length < 5) return fail('Write a slightly longer reply.');
  if (text.length > 500) return fail('Keep replies under 500 characters.');
  const updated = {
    ...dispute,
    responses: [
      ...(dispute.responses || []),
      {
        id: `resp-${globalThis.crypto && globalThis.crypto.randomUUID ? globalThis.crypto.randomUUID() : Date.now().toString(36)}`,
        by: auth.user.id,
        message: text,
        createdAt: new Date().toISOString(),
      },
    ],
  };
  const saved = saveDispute(updated);
  return saved.ok ? { ok: true, dispute: updated } : fail(saved.error, 'storage');
}

/** Admin resolves a dispute with notes; the booking moves disputed -> resolved. */
export function resolveDispute(disputeId, notes) {
  const auth = requireRole('admin');
  if (!auth.ok) return auth;
  const dispute = getDisputeById(disputeId);
  if (!dispute) return fail('Dispute not found.', 'not_found');
  if (dispute.status !== 'open') return fail('This dispute is already resolved.', 'invalid_transition');
  const text = String(notes || '').trim();
  if (text.length < 10) return fail('Add resolution notes (at least 10 characters).');
  if (text.length > 800) return fail('Keep resolution notes under 800 characters.');
  const booking = getBookingById(dispute.bookingId);
  if (!booking) return fail('The booking for this dispute no longer exists.', 'not_found');
  if (!canTransition(booking.status, 'resolved')) return fail('Invalid status change.', 'invalid_transition');

  const moved = saveBooking({ ...booking, status: 'resolved', paymentStatus: 'released', updatedAt: new Date().toISOString() });
  if (!moved.ok) return fail(moved.error, 'storage');
  const updated = {
    ...dispute,
    status: 'resolved',
    resolutionNotes: text,
    resolvedBy: auth.user.id,
    resolvedAt: new Date().toISOString(),
  };
  const saved = saveDispute(updated);
  return saved.ok ? { ok: true, dispute: updated } : fail(saved.error, 'storage');
}
