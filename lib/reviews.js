import { fail, requireRole } from './auth.js';
import { getBookingById, getReviews, saveBooking, saveReview } from './data.js';
import { canTransition } from './bookings.js';

export function createReview({ bookingId, rating, comment }) {
  const auth = requireRole('renter');
  if (!auth.ok) return auth;
  const booking = getBookingById(bookingId);
  if (!booking) return fail('Booking not found.', 'not_found');
  if (booking.renterId !== auth.user.id) return fail('Not yours', 'forbidden');
  if (booking.status !== 'completed') {
    return fail('Reviews can only be left for completed trips that have not been reviewed yet.', 'not_eligible');
  }
  if (getReviews().some((r) => r.bookingId === booking.id)) return fail('This trip already has a review.', 'conflict');
  const stars = Number(rating);
  const text = String(comment || '').trim();
  const errors = {};
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) errors.rating = 'Choose a rating from 1 to 5 stars.';
  if (text.length < 10) errors.comment = 'Write at least 10 characters about your trip.';
  if (text.length > 800) errors.comment = 'Keep your review under 800 characters.';
  if (Object.keys(errors).length) return { ok: false, error: 'Please fix the highlighted fields.', code: 'invalid', errors };
  if (!canTransition(booking.status, 'reviewed')) return fail('Invalid status change.', 'invalid_transition');

  const review = {
    id: `rev-${globalThis.crypto && globalThis.crypto.randomUUID ? globalThis.crypto.randomUUID() : Date.now().toString(36)}`,
    bookingId: booking.id,
    carId: booking.carId,
    renterId: booking.renterId,
    ownerId: booking.ownerId,
    rating: stars,
    comment: text,
    ownerReply: null,
    createdAt: new Date().toISOString(),
  };
  const saved = saveReview(review);
  if (!saved.ok) return fail(saved.error, 'storage');
  const moved = saveBooking({ ...booking, status: 'reviewed', updatedAt: new Date().toISOString() });
  if (!moved.ok) return fail(moved.error, 'storage');
  return { ok: true, review };
}

/** Owner replies to a review of one of THEIR cars. */
export function replyToReview(reviewId, reply) {
  const auth = requireRole('owner');
  if (!auth.ok) return auth;
  const review = getReviews().find((r) => r.id === reviewId);
  if (!review) return fail('Review not found.', 'not_found');
  if (review.ownerId !== auth.user.id) return fail('Not yours', 'forbidden');
  const text = String(reply || '').trim();
  if (text.length < 2) return fail('Write a short reply first.');
  if (text.length > 500) return fail('Keep replies under 500 characters.');
  const updated = { ...review, ownerReply: text };
  const saved = saveReview(updated);
  return saved.ok ? { ok: true, review: updated } : fail(saved.error, 'storage');
}

export function averageRating(reviews) {
  if (!reviews.length) return null;
  return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
}
