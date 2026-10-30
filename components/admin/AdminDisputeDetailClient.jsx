'use client';
import Link from 'next/link';
import { useState } from 'react';
import { DisputeThread } from '@/components/bookings/DisputePanel';
import Field from '@/components/ui/Field';
import { Alert, ErrorState, LoadingBlock } from '@/components/ui/States';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { resolveDispute } from '@/lib/disputes';
import { formatDateRange, formatETB } from '@/lib/format';
import { useAppData } from '@/lib/hooks';
import { carTitle, userName } from '@/lib/selectors';

export default function AdminDisputeDetailClient({ id }) {
  const { cars, users, bookings, disputes, isLoading } = useAppData();
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (isLoading) return <LoadingBlock label="Loading dispute" rows={2} height={110} />;
  const dispute = disputes.find((d) => d.id === id);
  if (!dispute) return <ErrorState title="Dispute not found" actionHref="/admin/disputes" actionLabel="Back to disputes">There is no dispute with that ID.</ErrorState>;
  const booking = bookings.find((b) => b.id === dispute.bookingId);
  const car = cars.find((c) => c.id === booking?.carId);

  const submit = (e) => {
    e.preventDefault();
    const res = resolveDispute(dispute.id, notes);
    if (!res.ok) return setError(res.error);
    setError('');
    toast('Dispute resolved and recorded.');
  };

  return (
    <div className="stack-lg">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/admin/disputes">Disputes</Link> / <span aria-current="page">{dispute.reason}</span></nav>
      <div className="row-between"><h1 style={{ margin: 0 }}>Dispute: {dispute.reason}</h1><StatusBadge status={dispute.status} /></div>

      {booking ? (
        <section className="card" aria-labelledby="bk-h">
          <h2 id="bk-h" style={{ fontSize: '1.1rem' }}>Booking</h2>
          <dl className="kv">
            <dt>Car</dt><dd>{carTitle(car)}</dd>
            <dt>Renter</dt><dd>{userName(users, booking.renterId)}</dd>
            <dt>Owner</dt><dd>{userName(users, booking.ownerId)}</dd>
            <dt>Dates</dt><dd>{formatDateRange(booking.startDate, booking.endDate)}</dd>
            <dt>Total</dt><dd>{formatETB(booking.total)}</dd>
            <dt>Booking status</dt><dd><StatusBadge status={booking.status} /></dd>
          </dl>
        </section>
      ) : null}

      <DisputeThread dispute={dispute} users={users} canReply={false} />

      {dispute.status === 'open' ? (
        <form className="card stack" onSubmit={submit} noValidate aria-labelledby="res-h">
          <h2 id="res-h" style={{ fontSize: '1.1rem' }}>Resolve this dispute</h2>
          {error ? <Alert type="error"><p className="mb-0">{error}</p></Alert> : null}
          <Field label="Resolution notes" required hint="Explain the decision. This is shown to the renter and owner. Minimum 10 characters.">
            {(p) => <textarea {...p} className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />}
          </Field>
          <div className="row"><button type="submit" className="btn btn-success btn-lg">Resolve dispute</button></div>
        </form>
      ) : null}
    </div>
  );
}
