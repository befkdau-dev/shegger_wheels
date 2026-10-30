'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import { EmptyState, LoadingBlock } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { IconDownload } from '@/components/ui/Icons';
import { downloadCSV } from '@/lib/csv';
import { exportMyBookings } from '@/lib/exports';
import { formatDateRange, formatETB } from '@/lib/format';
import { useAppData, useSession } from '@/lib/hooks';
import { paginate } from '@/lib/search';
import { BOOKING_STATUSES } from '@/lib/bookings';
import { carTitle } from '@/lib/selectors';

const PAGE = 8;

export default function BookingsListClient() {
  const { user } = useSession();
  const { cars, bookings, isLoading } = useAppData();
  const { toast } = useToast();
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const mine = useMemo(
    () => (user ? bookings.filter((b) => b.renterId === user.id).sort((a, b) => b.startDate.localeCompare(a.startDate)) : []),
    [bookings, user],
  );
  const filtered = useMemo(() => (status === 'all' ? mine : mine.filter((b) => b.status === status)), [mine, status]);
  const data = paginate(filtered, page, PAGE);

  const exportCsv = () => {
    const res = exportMyBookings();
    if (!res.ok) return toast(res.error, 'error');
    downloadCSV(res.filename, res.csv);
    toast(`Exported ${res.count} booking${res.count === 1 ? '' : 's'}.`);
  };

  if (isLoading) return <LoadingBlock label="Loading bookings" rows={4} height={56} />;

  return (
    <div className="stack-lg">
      <div className="row-between">
        <div><h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>My bookings</h1><p className="muted mb-0">Your complete trip history.</p></div>
        <button type="button" className="btn btn-outline" onClick={exportCsv} disabled={mine.length === 0}><IconDownload width={18} height={18} /> Export CSV</button>
      </div>

      {mine.length === 0 ? (
        <EmptyState title="You have no bookings yet" actionHref="/cars" actionLabel="Browse cars">Once you request a car, it will appear here.</EmptyState>
      ) : (
        <>
          <div className="row">
            <label htmlFor="b-status" className="bold small">Filter by status</label>
            <select id="b-status" className="select" style={{ width: 'auto' }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="all">All statuses</option>
              {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <span className="muted small" role="status" aria-live="polite">{filtered.length} booking{filtered.length === 1 ? '' : 's'}</span>
          </div>
          {filtered.length === 0 ? (
            <EmptyState title="No bookings with that status" actionLabel="Show all" onAction={() => setStatus('all')} />
          ) : (
            <>
              <div className="table-wrap">
                <table className="data">
                  <caption className="sr-only">Your bookings</caption>
                  <thead>
                    <tr><th scope="col">Car</th><th scope="col">Dates</th><th scope="col">Status</th><th scope="col" className="num">Total</th><th scope="col"><span className="sr-only">Actions</span></th></tr>
                  </thead>
                  <tbody>
                    {data.items.map((b) => (
                      <tr key={b.id}>
                        <th scope="row">{carTitle(cars.find((c) => c.id === b.carId))}</th>
                        <td>{formatDateRange(b.startDate, b.endDate)}</td>
                        <td><StatusBadge status={b.status} /></td>
                        <td className="num">{formatETB(b.total)}</td>
                        <td className="actions">
                          <Link className="btn btn-outline btn-sm" href={`/bookings/${b.id}`}>View<span className="sr-only"> booking for {carTitle(cars.find((c) => c.id === b.carId))}</span></Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={data.page} totalPages={data.totalPages} onPage={setPage} label="Booking history pages" />
            </>
          )}
        </>
      )}
    </div>
  );
}
