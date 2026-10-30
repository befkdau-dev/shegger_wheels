'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import Field from '@/components/ui/Field';
import { Alert } from '@/components/ui/States';
import { hasRole } from '@/lib/auth';
import { getAvailabilityConflict, saveCheckoutDraft, validateDates } from '@/lib/bookings';
import { formatETB, todayISO } from '@/lib/format';
import { useAppData, useSession } from '@/lib/hooks';
import { MAX_RENTAL_DAYS, quote } from '@/lib/pricing';

/** Date picker + live price + availability check. Proceeds to /checkout via a sessionStorage draft. */
export default function BookingWidget({ car, initialStart = '', initialEnd = '' }) {
  const router = useRouter();
  const { user } = useSession();
  const { bookings, users } = useAppData();
  const today = todayISO();
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [touched, setTouched] = useState(false);

  const owner = users.find((u) => u.id === car.ownerId);
  const unavailable = car.status !== 'approved' || (owner && owner.status !== 'active');
  const isOwnCar = user && user.id === car.ownerId;
  const canRent = !user || hasRole(user, 'renter');

  const { error, conflict, price } = useMemo(() => {
    if (!start || !end) return { error: null, conflict: null, price: null };
    const err = validateDates(start, end, today);
    if (err) return { error: err, conflict: null, price: null };
    return {
      error: null,
      conflict: getAvailabilityConflict(car, bookings, start, end),
      price: quote(car.pricePerDay, start, end),
    };
  }, [start, end, car, bookings, today]);

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!start || !end || error || conflict || unavailable || isOwnCar) return;
    saveCheckoutDraft({ carId: car.id, startDate: start, endDate: end });
    router.push('/checkout');
  };

  const showErr = touched && (!start || !end) ? 'Choose both a start and end date.' : error;

  return (
    <form className="card booking-widget" onSubmit={submit} noValidate aria-labelledby="bw-title">
      <h2 id="bw-title" style={{ fontSize: '1.1rem' }}>Book this car</h2>
      <p className="mb-0" style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--navy-900)' }}>
        {formatETB(car.pricePerDay)} <span className="small muted" style={{ fontWeight: 500 }}>/ day</span>
      </p>

      {unavailable ? (
        <Alert type="warning" title="Not available" className="mt-0">
          <p className="mb-0">This listing is not open for new bookings right now.</p>
        </Alert>
      ) : isOwnCar ? (
        <Alert type="info" title="This is your car">
          <p className="mb-0">You cannot book your own listing. <Link href={`/owner/cars/${car.id}/edit`}>Manage listing</Link></p>
        </Alert>
      ) : !canRent ? (
        <Alert type="info" title="Renter account needed">
          <p className="mb-0">Admin accounts manage the platform and cannot book cars.</p>
        </Alert>
      ) : (
        <>
          <div className="form-grid" style={{ marginTop: 16 }}>
            <Field label="Start date" required>
              {(p) => <input {...p} type="date" className="input" min={today} value={start} onChange={(e) => setStart(e.target.value)} />}
            </Field>
            <Field label="End date" required>
              {(p) => <input {...p} type="date" className="input" min={start || today} value={end} onChange={(e) => setEnd(e.target.value)} />}
            </Field>
          </div>
          <p className="xsmall muted" style={{ marginTop: -6 }}>Both dates are included. Rentals are limited to {MAX_RENTAL_DAYS} days.</p>

          {showErr ? <p className="field-error" role="alert">{showErr}</p> : null}
          {conflict ? <Alert type="error" title="Dates not available"><p className="mb-0">{conflict} Pick different dates.</p></Alert> : null}

          {price && !conflict ? (
            <dl className="price-lines" aria-live="polite">
              <div><dt>{formatETB(price.pricePerDay)} × {price.days} day{price.days === 1 ? '' : 's'}</dt><dd>{formatETB(price.subtotal)}</dd></div>
              <div><dt>Service fee (10%)</dt><dd>{formatETB(price.fee)}</dd></div>
              <div className="total"><dt>Total</dt><dd>{formatETB(price.total)}</dd></div>
            </dl>
          ) : null}

          <button type="submit" className="btn btn-accent btn-block btn-lg" style={{ marginTop: 16 }} disabled={!!conflict}>
            {user ? 'Continue to checkout' : 'Sign in to book'}
          </button>
          <p className="xsmall muted center" style={{ marginTop: 10, marginBottom: 0 }}>
            You will not be charged yet. Payment is a simulated TeleBirr demo.
          </p>
        </>
      )}
    </form>
  );
}
