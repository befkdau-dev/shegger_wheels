import { inclusiveDays } from './format.js';

// Demo business rules. The platform service fee is added on top of the rental
// subtotal and is what the admin dashboard reports as "mock platform commission".
// Owners are credited the subtotal.
export const FEE_RATE = 0.1;
export const MAX_RENTAL_DAYS = 30;

/** Pure price calculation - safe to call anywhere (server or client). */
export function quote(pricePerDay, startDate, endDate) {
  const days = Math.max(0, inclusiveDays(startDate, endDate));
  const subtotal = days * pricePerDay;
  const fee = Math.round(subtotal * FEE_RATE);
  return { days, pricePerDay, subtotal, fee, total: subtotal + fee };
}
