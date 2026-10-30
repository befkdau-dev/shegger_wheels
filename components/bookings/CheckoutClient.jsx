'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import CarImage from '@/components/ui/CarImage';
import { Alert, EmptyState, LoadingBlock } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { clearCheckoutDraft, createBooking, getAvailabilityConflict, readCheckoutDraft, validateDates } from '@/lib/bookings';
import { formatDateRange, formatETB } from '@/lib/format';
import { useAppData, useSession } from '@/lib/hooks';
import { quote } from '@/lib/pricing';
import { carTitle } from '@/lib/selectors';

/** Mock TeleBirr checkout. Never collects credentials and never charges anything. */
export default function CheckoutClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useSession();
  const { cars, bookings, isLoading } = useAppData();
  const [draft, setDraft] = useState(undefined);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDraft(readCheckoutDraft());
  }, []);

  const car = draft ? cars.find((c) => c.id === draft.carId) : null;

  const problem = useMemo(() => {
    if (!draft || !car) return null;
    const dateError = validateDates(draft.startDate, draft.endDate);
    if (dateError) return dateError;
    if (car.status !== 'approved') return 'This car is no longer open for booking.';
    return getAvailabilityConflict(car, bookings, draft.startDate, draft.endDate);
  }, [draft, car, bookings]);

  if (isLoading || draft === undefined) return <LoadingBlock label="Loading checkout" rows={2} height={160} />;

  if (!draft || !car) {
    return (
      <EmptyState title="Nothing to check out" actionHref="/cars" actionLabel="Browse cars">
        {draft && !car
          ? 'The car in your checkout draft no longer exists.'
          : 'Choose a car and dates first. Your draft lives only in this browser tab.'}
      </EmptyState>
    );
  }

  const price = quote(car.pricePerDay, draft.startDate, draft.endDate);

  const pay = () => {
    setBusy(true);
    setError('');
    const res = createBooking({ carId: draft.carId, startDate: draft.startDate, endDate: draft.endDate });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    clearCheckoutDraft();
    toast('Demo payment authorised and booking requested.');
    router.replace(`/bookings/${res.booking.id}?new=1`);
  };

  return (
    <div className="container-narrow" style={{ margin: '0 auto', paddingTop: 8 }}>
      <div className="page-head"><h1>Review and pay</h1><p>Check the details, then complete the simulated TeleBirr payment.</p></div>
      <div className="stack-lg" style={{ marginTop: 16 }}>
        <section className="card" aria-labelledby="co-trip">
          <h2 id="co-trip" style={{ fontSize: '1.1rem' }}>Your trip</h2>
          <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
            <div className="car-card-media" style={{ width: 150, flex: 'none', borderRadius: 10, overflow: 'hidden' }}>
              <CarImage src={car.photos?.[0]} alt="" sizes="150px" />
            </div>
            <div>
              <h3 style={{ marginBottom: 4 }}><Link href={`/cars/${car.id}`}>{carTitle(car)}</Link></h3>
              <p className="small muted mb-0">{car.neighbourhood}, {car.city}</p>
              <p className="mb-0" style={{ marginTop: 6 }}><strong>{formatDateRange(draft.startDate, draft.endDate)}</strong></p>
            </div>
          </div>
          <dl className="price-lines">
            <div><dt>{formatETB(price.pricePerDay)} × {price.days} day{price.days === 1 ? '' : 's'}</dt><dd>{formatETB(price.subtotal)}</dd></div>
            <div><dt>Service fee (10%)</dt><dd>{formatETB(price.fee)}</dd></div>
            <div className="total"><dt>Total</dt><dd>{formatETB(price.total)}</dd></div>
          </dl>
        </section>

        {problem ? (
          <Alert type="error" title="This booking cannot go ahead">
            <p>{problem}</p>
            <Link className="btn btn-outline btn-sm" href={`/cars/${car.id}`}>Choose different dates</Link>
          </Alert>
        ) : null}
        {error ? <Alert type="error" title="Booking failed"><p className="mb-0">{error}</p></Alert> : null}

        <section className="mock-pay" aria-labelledby="co-pay">
          <div className="row-between">
            <h2 id="co-pay" style={{ fontSize: '1.1rem', margin: 0 }}>TeleBirr payment</h2>
            <span className="badge badge-amber badge-plain">SIMULATION</span>
          </div>
          <p className="small" style={{ marginTop: 8 }}>
            This is a mock checkout. <strong>No real payment is made and no phone number, PIN or card details are collected.</strong> Completing it only
            authorises a fake transaction so you can try the booking flow.
          </p>
          <p className="small mb-0">Paying as <strong>{user?.name}</strong>. A fake reference is generated when you confirm.</p>
          <div className="row" style={{ marginTop: 16 }}>
            <button type="button" className="btn btn-accent btn-lg" onClick={pay} disabled={busy || !!problem}>
              {busy ? 'Processing…' : `Complete demo payment · ${formatETB(price.total)}`}
            </button>
            <Link className="btn btn-outline btn-lg" href={`/cars/${car.id}`}>Back to car</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
