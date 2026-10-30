'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { EmptyState, LoadingBlock } from '@/components/ui/States';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/format';
import { useAppData } from '@/lib/hooks';
import { carTitle, userName } from '@/lib/selectors';

export default function AdminDisputesClient() {
  const { cars, users, bookings, disputes, isLoading } = useAppData();
  const [status, setStatus] = useState('open');
  const list = useMemo(
    () => disputes.filter((d) => status === 'all' || d.status === status).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
    [disputes, status],
  );
  if (isLoading) return <LoadingBlock label="Loading disputes" rows={3} height={64} />;

  return (
    <div className="stack-lg">
      <div className="row-between">
        <div><h1>Disputes</h1><p className="muted mb-0">Review issues raised by renters and owners.</p></div>
        <div className="row">
          <label htmlFor="d-status" className="bold small">Show</label>
          <select id="d-status" className="select" style={{ width: 'auto' }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="open">Open</option><option value="resolved">Resolved</option><option value="all">All</option>
          </select>
        </div>
      </div>
      {list.length === 0 ? (
        <EmptyState title="No disputes to review">{status === 'open' ? 'There are no open disputes right now.' : 'No disputes match that filter.'}</EmptyState>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <caption className="sr-only">Disputes</caption>
            <thead><tr><th scope="col">Car</th><th scope="col">Reason</th><th scope="col">Opened by</th><th scope="col">Opened</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {list.map((d) => {
                const b = bookings.find((x) => x.id === d.bookingId);
                return (
                  <tr key={d.id}>
                    <th scope="row">{carTitle(cars.find((c) => c.id === b?.carId))}</th>
                    <td>{d.reason}</td>
                    <td>{userName(users, d.openedBy)}</td>
                    <td>{formatDate(d.createdAt)}</td>
                    <td><StatusBadge status={d.status} /></td>
                    <td className="actions"><Link className="btn btn-primary btn-sm" href={`/admin/disputes/${d.id}`}>{d.status === 'open' ? 'Review' : 'View'}<span className="sr-only"> dispute about {d.reason}</span></Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
