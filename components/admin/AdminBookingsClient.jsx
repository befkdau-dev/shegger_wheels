'use client';
import { useMemo, useState } from 'react';
import { EmptyState, LoadingBlock } from '@/components/ui/States';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import { BOOKING_STATUSES } from '@/lib/bookings';
import { formatDateRange, formatETB } from '@/lib/format';
import { useAppData } from '@/lib/hooks';
import { paginate } from '@/lib/search';
import { carTitle, userName } from '@/lib/selectors';

export default function AdminBookingsClient() {
  const { cars, users, bookings, isLoading } = useAppData();
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const filtered = useMemo(
    () => bookings.filter((b) => status === 'all' || b.status === status).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
    [bookings, status],
  );
  const data = paginate(filtered, page, 10);
  if (isLoading) return <LoadingBlock label="Loading bookings" rows={4} height={56} />;

  return (
    <div className="stack-lg">
      <div className="row-between">
        <div><h1>All bookings</h1><p className="muted mb-0">Every booking on the platform (read-only).</p></div>
        <div className="row">
          <label htmlFor="ab-status" className="bold small">Status</label>
          <select id="ab-status" className="select" style={{ width: 'auto' }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="all">All statuses</option>
            {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>
      {filtered.length === 0 ? <EmptyState title="No bookings found">Nothing matches that status.</EmptyState> : (
        <>
          <div className="table-wrap">
            <table className="data">
              <caption className="sr-only">All platform bookings</caption>
              <thead><tr><th scope="col">Car</th><th scope="col">Renter</th><th scope="col">Owner</th><th scope="col">Dates</th><th scope="col">Status</th><th scope="col" className="num">Total</th><th scope="col" className="num">Fee</th></tr></thead>
              <tbody>
                {data.items.map((b) => (
                  <tr key={b.id}>
                    <th scope="row">{carTitle(cars.find((c) => c.id === b.carId))}</th>
                    <td>{userName(users, b.renterId)}</td>
                    <td>{userName(users, b.ownerId)}</td>
                    <td>{formatDateRange(b.startDate, b.endDate)}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td className="num">{formatETB(b.total)}</td>
                    <td className="num">{formatETB(b.fee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPage={setPage} label="Booking pages" />
        </>
      )}
    </div>
  );
}
