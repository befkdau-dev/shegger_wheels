'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DisputeThread, RaiseDisputeForm } from './DisputePanel';
import CarImage from '@/components/ui/CarImage';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Alert, ErrorState, LoadingBlock } from '@/components/ui/States';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { cancelBooking, completeRental, getMyBooking, renterAllowedActions, startRental } from '@/lib/bookings';
import { formatDate, formatDateRange, formatDateTime, formatETB, statusLabel } from '@/lib/format';
import { useAppData, useSession } from '@/lib/hooks';
import { carTitle } from '@/lib/selectors';

const STEPS = ['requested', 'confirmed', 'in_progress', 'completed', 'reviewed'];

function Timeline({ status }) {
  const off = ['declined', 'cancelled', 'disputed', 'resolved'].includes(status);
  const index = STEPS.indexOf(status);
  if (off) {
    return (
      <ol className="timeline" aria-label="Booking progress">
        <li className="done">Requested</li>
        <li className="current">{statusLabel(status)}</li>
      </ol>
    );
  }
  return (
    <ol className="timeline" aria-label="Booking progress">
      {STEPS.map((s, i) => (
        <li key={s} className={i < index ? 'done' : i === index ? 'current' : ''} aria-current={i === index ? 'step' : undefined}>
          {statusLabel(s)}
        </li>
      ))}
    </ol>
  );
}

export default function BookingDetailClient({ id }) {
  const params = useSearchParams();
  const { toast } = useToast();
  const { user } = useSession();
  const { cars, users, bookings, disputes, isLoading } = useAppData();
  const [confirm, setConfirm] = useState(null); // 'cancel' | 'start' | 'complete'
  const [showDispute, setShowDispute] = useState(false);
  const [error, setError] = useState('');

  // The guard re-checks session + ownership. A renter can never load another renter's booking.
  const access = useMemo(() => (isLoading || !user ? null : getMyBooking(id)), [isLoading, user, id, bookings]);

  if (isLoading || !user) return <LoadingBlock label="Loading booking" rows={3} height={90} />;

  if (!access || !access.ok) {
    const forbidden = access && access.code === 'forbidden';
    return (
      <ErrorState title={forbidden ? 'This booking is not yours' : 'Booking not found'} actionHref="/bookings" actionLabel="Back to my bookings">
        {forbidden
          ? 'You can only view bookings made with your own account.'
          : 'We could not find that booking. It may have been removed if demo data was reset.'}
      </ErrorState>
    );
  }

  const booking = access.booking;
  const car = cars.find((c) => c.id === booking.carId);
  const owner = users.find((u) => u.id === booking.ownerId);
  const dispute = disputes.find((d) => d.bookingId === booking.id);
  const actions = renterAllowedActions(booking);
  const isNew = params.get('new') === '1';

  const run = (fn, okMessage) => {
    const res = fn(booking.id);
    setConfirm(null);
    if (!res.ok) {
      setError(res.error);
      toast(res.error, 'error');
      return;
    }
    setError('');
    toast(okMessage);
  };

  const confirmCopy = {
    cancel: { title: 'Cancel this booking?', label: 'Yes, cancel booking', tone: 'danger', body: 'The demo payment will be marked refunded. This cannot be undone.', fn: () => run(cancelBooking, 'Booking cancelled. Demo payment refunded.') },
    start: { title: 'Start the rental?', label: 'Start rental', tone: 'primary', body: 'Simulation: this pretends the keys were handed over.', fn: () => run(startRental, 'Rental started (simulation).') },
    complete: { title: 'Mark the car as returned?', label: 'Complete rental', tone: 'primary', body: 'Simulation: this ends the rental and releases the held demo payment.', fn: () => run(completeRental, 'Rental completed. You can now leave a review.') },
  };
  const active = confirm ? confirmCopy[confirm] : null;

  return (
    <div className="stack-lg" style={{ paddingTop: 8 }}>
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/bookings">My bookings</Link> / <span aria-current="page">Booking</span></nav>

      {isNew ? (
        <Alert type="success" title="Booking requested">
          <p className="mb-0">Your demo payment was authorised. The owner will approve or decline your request.</p>
        </Alert>
      ) : null}
      {error ? <Alert type="error" title="Action not allowed"><p className="mb-0">{error}</p></Alert> : null}

      <div className="row-between">
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>{carTitle(car)}</h1>
        <StatusBadge status={booking.status} />
      </div>
      <Timeline status={booking.status} />

      <div className="two-col" style={{ alignItems: 'start' }}>
        <section className="receipt" aria-labelledby="rc-h">
          <div className="row-between"><h2 id="rc-h" style={{ fontSize: '1.15rem', margin: 0 }}>Receipt</h2><span className="badge badge-amber badge-plain">DEMO</span></div>
          <dl className="kv" style={{ marginTop: 14 }}>
            <dt>Reference</dt><dd><span className="tx-ref">{booking.paymentRef}</span></dd>
            <dt>Dates</dt><dd>{formatDateRange(booking.startDate, booking.endDate)}</dd>
            <dt>Duration</dt><dd>{booking.days} day{booking.days === 1 ? '' : 's'}</dd>
            <dt>Daily price</dt><dd>{formatETB(booking.pricePerDay)}</dd>
            <dt>Subtotal</dt><dd>{formatETB(booking.subtotal)}</dd>
            <dt>Service fee</dt><dd>{formatETB(booking.fee)}</dd>
            <dt>Total</dt><dd style={{ fontSize: '1.15rem' }}>{formatETB(booking.total)}</dd>
            <dt>Payment (demo)</dt><dd><StatusBadge status={booking.paymentStatus} /></dd>
            <dt>Requested</dt><dd>{formatDateTime(booking.createdAt)}</dd>
          </dl>
          <p className="xsmall muted" style={{ marginTop: 14, marginBottom: 0 }}>The price was fixed when you booked. This is a simulated receipt; no money moved.</p>
        </section>

        <section className="card stack" aria-labelledby="car-h">
          <h2 id="car-h" style={{ fontSize: '1.15rem' }}>Car and host</h2>
          {car ? (
            <>
              <div className="car-card-media" style={{ borderRadius: 10, overflow: 'hidden' }}><CarImage src={car.photos?.[0]} alt={carTitle(car)} sizes="(max-width: 900px) 100vw, 420px" /></div>
              <p className="mb-0"><Link href={`/cars/${car.id}`}>{carTitle(car)}</Link> · {car.neighbourhood}</p>
            </>
          ) : (
            <p className="muted mb-0">This car is no longer in the demo data.</p>
          )}
          {owner ? <p className="mb-0 small">Hosted by <strong>{owner.name}</strong> · member since {formatDate(owner.createdAt)}</p> : null}
        </section>
      </div>

      <section className="card" aria-labelledby="act-h">
        <h2 id="act-h" style={{ fontSize: '1.15rem' }}>What you can do now</h2>
        {actions.length === 0 ? (
          <p className="muted mb-0">No further actions are available for a {statusLabel(booking.status).toLowerCase()} booking.</p>
        ) : (
          <div className="row">
            {actions.includes('cancel') ? <button type="button" className="btn btn-danger" onClick={() => setConfirm('cancel')}>Cancel booking</button> : null}
            {actions.includes('start') ? <button type="button" className="btn btn-primary" onClick={() => setConfirm('start')}>Start rental (simulation)</button> : null}
            {actions.includes('complete') ? <button type="button" className="btn btn-primary" onClick={() => setConfirm('complete')}>Mark returned (simulation)</button> : null}
            {actions.includes('track') ? <Link className="btn btn-outline" href={`/bookings/${booking.id}/track`}>Track trip (simulation)</Link> : null}
            {actions.includes('dispute') ? <button type="button" className="btn btn-outline" onClick={() => setShowDispute((s) => !s)} aria-expanded={showDispute}>Raise an issue</button> : null}
            {actions.includes('review') ? <Link className="btn btn-accent" href={`/bookings/${booking.id}/review`}>Leave a review</Link> : null}
          </div>
        )}
      </section>

      {showDispute && actions.includes('dispute') ? <RaiseDisputeForm bookingId={booking.id} onDone={() => setShowDispute(false)} /> : null}
      {dispute ? <DisputeThread dispute={dispute} users={users} /> : null}

      <ConfirmDialog open={!!active} title={active?.title || ''} confirmLabel={active?.label} tone={active?.tone} onConfirm={() => active && active.fn()} onCancel={() => setConfirm(null)}>
        <p>{active?.body}</p>
      </ConfirmDialog>
    </div>
  );
}
