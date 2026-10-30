'use client';
import { useMemo, useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Alert, EmptyState } from '@/components/ui/States';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { RaiseDisputeForm } from '@/components/bookings/DisputePanel';
import { completeRental, ownerAllowedActions, respondToRequest, startRental } from '@/lib/bookings';
import { formatDateRange, formatETB } from '@/lib/format';
import { useAppData } from '@/lib/hooks';
import { userName } from '@/lib/selectors';

const COPY = {
  approve: { title: 'Approve this request?', label: 'Approve', tone: 'primary', body: 'The renter is notified and the demo payment is held.', ok: 'Request approved. Booking confirmed.' },
  decline: { title: 'Decline this request?', label: 'Decline', tone: 'danger', body: 'The demo payment is refunded and the request is closed.', ok: 'Request declined.' },
  start: { title: 'Start the rental?', label: 'Start rental', tone: 'primary', body: 'Simulation: marks the keys as handed over.', ok: 'Rental started (simulation).' },
  complete: { title: 'Mark as returned?', label: 'Complete rental', tone: 'primary', body: 'Simulation: ends the rental and releases the held demo payment to you.', ok: 'Rental completed.' },
};

export default function CarBookingsClient({ car }) {
  const { bookings, users } = useAppData();
  const { toast } = useToast();
  const [pending, setPending] = useState(null); // { id, action }
  const [issue, setIssue] = useState(null); // booking id
  const [error, setError] = useState('');

  const list = useMemo(
    () => bookings.filter((b) => b.carId === car.id).sort((a, b) => b.startDate.localeCompare(a.startDate)),
    [bookings, car.id],
  );

  const run = () => {
    const { id, action } = pending;
    const res =
      action === 'approve' ? respondToRequest(id, 'approve')
      : action === 'decline' ? respondToRequest(id, 'decline')
      : action === 'start' ? startRental(id)
      : completeRental(id);
    setPending(null);
    if (!res.ok) {
      setError(res.error);
      toast(res.error, 'error');
      return;
    }
    setError('');
    toast(COPY[action].ok);
  };

  const active = pending ? COPY[pending.action] : null;

  return (
    <div className="stack-lg">
      {error ? <Alert type="error" title="Action not allowed"><p className="mb-0">{error}</p></Alert> : null}
      {list.length === 0 ? (
        <EmptyState title="No bookings for this car yet">Requests will appear here as renters book your car.</EmptyState>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <caption className="sr-only">Bookings for this car</caption>
            <thead><tr><th scope="col">Renter</th><th scope="col">Dates</th><th scope="col">Status</th><th scope="col" className="num">You earn</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {list.map((b) => {
                const actions = ownerAllowedActions(b);
                return (
                  <tr key={b.id}>
                    <th scope="row">{userName(users, b.renterId)}</th>
                    <td>{formatDateRange(b.startDate, b.endDate)}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td className="num">{formatETB(b.subtotal)}</td>
                    <td className="actions">
                      {actions.includes('approve') ? <button type="button" className="btn btn-success btn-sm" onClick={() => setPending({ id: b.id, action: 'approve' })}>Approve</button> : null}
                      {actions.includes('decline') ? <button type="button" className="btn btn-outline btn-sm" onClick={() => setPending({ id: b.id, action: 'decline' })}>Decline</button> : null}
                      {actions.includes('start') ? <button type="button" className="btn btn-primary btn-sm" onClick={() => setPending({ id: b.id, action: 'start' })}>Start rental</button> : null}
                      {actions.includes('complete') ? <button type="button" className="btn btn-primary btn-sm" onClick={() => setPending({ id: b.id, action: 'complete' })}>Mark returned</button> : null}
                      {actions.includes('dispute') ? <button type="button" className="btn btn-outline btn-sm" onClick={() => setIssue(issue === b.id ? null : b.id)} aria-expanded={issue === b.id}>Raise issue</button> : null}
                      {actions.length === 0 ? <span className="muted small">No actions</span> : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {issue ? <RaiseDisputeForm bookingId={issue} onDone={() => setIssue(null)} /> : null}
      <ConfirmDialog open={!!pending} title={active?.title || ''} confirmLabel={active?.label} tone={active?.tone} onConfirm={run} onCancel={() => setPending(null)}>
        <p>{active?.body}</p>
      </ConfirmDialog>
    </div>
  );
}
