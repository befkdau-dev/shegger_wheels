'use client';
import { useState } from 'react';
import Field from '@/components/ui/Field';
import { Alert } from '@/components/ui/States';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { DISPUTE_REASONS, raiseDispute, respondToDispute } from '@/lib/disputes';
import { formatDateTime } from '@/lib/format';
import { userName } from '@/lib/selectors';

/** Raise-an-issue form (in-progress bookings only). */
export function RaiseDisputeForm({ bookingId, onDone }) {
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const res = raiseDispute({ bookingId, reason, description });
    if (!res.ok) return setError(res.error);
    setError('');
    toast('Issue raised. An admin will review it.');
    onDone && onDone();
  };

  return (
    <form className="card stack" onSubmit={submit} noValidate aria-labelledby="rd-h">
      <h2 id="rd-h" style={{ fontSize: '1.1rem' }}>Raise an issue</h2>
      {error ? <Alert type="error"><p className="mb-0">{error}</p></Alert> : null}
      <Field label="Reason" required>
        {(p) => (
          <select {...p} className="select" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="">Choose a reason…</option>
            {DISPUTE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        )}
      </Field>
      <Field label="What happened?" required hint="At least 15 characters.">
        {(p) => <textarea {...p} className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />}
      </Field>
      <div className="row"><button type="submit" className="btn btn-danger">Submit issue</button></div>
    </form>
  );
}

/** Dispute details + reply thread, shown to the booking's renter/owner (and admin elsewhere). */
export function DisputeThread({ dispute, users, canReply = true }) {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const send = (e) => {
    e.preventDefault();
    const res = respondToDispute(dispute.id, message);
    if (!res.ok) return setError(res.error);
    setMessage('');
    setError('');
    toast('Reply sent.');
  };

  return (
    <section className="card stack" aria-labelledby={`dt-${dispute.id}`}>
      <div className="row-between">
        <h2 id={`dt-${dispute.id}`} style={{ fontSize: '1.1rem', margin: 0 }}>Dispute: {dispute.reason}</h2>
        <StatusBadge status={dispute.status} />
      </div>
      <p className="mb-0"><strong>{userName(users, dispute.openedBy)}</strong> <span className="muted small">· {formatDateTime(dispute.createdAt)}</span><br />{dispute.description}</p>
      {(dispute.responses || []).map((r) => (
        <div key={r.id} className="owner-reply">
          <strong>{userName(users, r.by)}</strong> <span className="muted xsmall">· {formatDateTime(r.createdAt)}</span>
          <div>{r.message}</div>
        </div>
      ))}
      {dispute.status === 'resolved' ? (
        <Alert type="success" title="Resolved by admin">
          <p className="mb-0">{dispute.resolutionNotes}</p>
        </Alert>
      ) : canReply ? (
        <form onSubmit={send} noValidate>
          {error ? <p className="field-error" role="alert">{error}</p> : null}
          <Field label="Add a reply" required>
            {(p) => <textarea {...p} className="textarea" style={{ minHeight: 80 }} value={message} onChange={(e) => setMessage(e.target.value)} />}
          </Field>
          <button type="submit" className="btn btn-outline btn-sm">Send reply</button>
        </form>
      ) : null}
    </section>
  );
}
