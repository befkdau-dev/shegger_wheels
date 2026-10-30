'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { EmptyState, LoadingBlock } from '@/components/ui/States';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { moderateCar } from '@/lib/cars';
import { formatDate, formatETB } from '@/lib/format';
import { useAppData } from '@/lib/hooks';
import { carTitle, userName } from '@/lib/selectors';

export default function AdminListingsClient() {
  const { cars, users, isLoading } = useAppData();
  const { toast } = useToast();
  const [filter, setFilter] = useState('pending');
  const [target, setTarget] = useState(null); // { car, decision }

  const list = useMemo(
    () => cars.filter((c) => filter === 'all' || c.status === filter).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
    [cars, filter],
  );
  if (isLoading) return <LoadingBlock label="Loading listings" rows={3} height={64} />;

  const decide = () => {
    const res = moderateCar(target.car.id, target.decision);
    toast(res.ok ? (target.decision === 'approve' ? 'Listing approved and now public.' : 'Listing rejected.') : res.error, res.ok ? 'success' : 'error');
    setTarget(null);
  };

  return (
    <div className="stack-lg">
      <div className="row-between">
        <div><h1>Listings</h1><p className="muted mb-0">Approve or reject cars submitted by owners.</p></div>
        <div className="row">
          <label htmlFor="l-filter" className="bold small">Show</label>
          <select id="l-filter" className="select" style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="pending">Pending review</option>
            <option value="all">All listings</option>
            {['approved', 'rejected', 'inactive', 'draft'].map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>
      {list.length === 0 ? (
        <EmptyState title={filter === 'pending' ? 'No listings waiting for review' : 'No listings with that status'}>{filter === 'pending' ? 'You are all caught up.' : 'Try another filter.'}</EmptyState>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <caption className="sr-only">Car listings</caption>
            <thead><tr><th scope="col">Car</th><th scope="col">Owner</th><th scope="col">Area</th><th scope="col" className="num">Price / day</th><th scope="col">Submitted</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <th scope="row"><Link href={`/cars/${c.id}`}>{carTitle(c)}</Link></th>
                  <td>{userName(users, c.ownerId)}</td>
                  <td>{c.neighbourhood}</td>
                  <td className="num">{formatETB(c.pricePerDay)}</td>
                  <td>{formatDate(c.createdAt)}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td className="actions">
                    {c.status === 'pending' ? (
                      <>
                        <button type="button" className="btn btn-success btn-sm" onClick={() => setTarget({ car: c, decision: 'approve' })}>Approve<span className="sr-only"> {carTitle(c)}</span></button>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setTarget({ car: c, decision: 'reject' })}>Reject<span className="sr-only"> {carTitle(c)}</span></button>
                      </>
                    ) : <span className="muted small">No action</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog
        open={!!target}
        title={target?.decision === 'approve' ? 'Approve this listing?' : 'Reject this listing?'}
        confirmLabel={target?.decision === 'approve' ? 'Approve' : 'Reject'}
        tone={target?.decision === 'approve' ? 'primary' : 'danger'}
        onConfirm={decide}
        onCancel={() => setTarget(null)}
      >
        <p>{target ? carTitle(target.car) : ''}: {target?.decision === 'approve' ? 'it becomes visible to renters immediately.' : 'the owner will see it as rejected and can edit and resubmit.'}</p>
      </ConfirmDialog>
    </div>
  );
}
