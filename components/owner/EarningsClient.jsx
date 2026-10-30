'use client';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { EmptyState, LoadingBlock } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { IconDownload } from '@/components/ui/Icons';
import { downloadCSV } from '@/lib/csv';
import { exportOwnerEarnings } from '@/lib/exports';
import { formatETB } from '@/lib/format';
import { useAppData, useSession } from '@/lib/hooks';
import { monthlyEarnings, ownerMetrics } from '@/lib/metrics';
import { carTitle } from '@/lib/selectors';

// Recharts is browser-only and fairly heavy: load it lazily, only on this page.
const EarningsChart = dynamic(() => import('./EarningsChart'), {
  ssr: false,
  loading: () => <div className="skeleton" style={{ height: 280 }} role="status" aria-label="Loading chart" />,
});

export default function EarningsClient() {
  const { user } = useSession();
  const { cars, bookings, isLoading } = useAppData();
  const { toast } = useToast();
  const myCars = useMemo(() => cars.filter((c) => c.ownerId === user?.id), [cars, user]);
  const mine = useMemo(() => bookings.filter((b) => b.ownerId === user?.id), [bookings, user]);
  const monthly = useMemo(() => monthlyEarnings(mine, 6), [mine]);
  const m = useMemo(() => ownerMetrics(myCars, mine), [myCars, mine]);

  if (isLoading || !user) return <LoadingBlock label="Loading earnings" rows={3} height={90} />;

  const exportCsv = () => {
    const res = exportOwnerEarnings();
    if (!res.ok) return toast(res.error, 'error');
    downloadCSV(res.filename, res.csv);
    toast(`Exported ${res.count} earning record${res.count === 1 ? '' : 's'}.`);
  };

  const hasData = monthly.some((x) => x.earned || x.projected);

  return (
    <div className="stack-lg">
      <div className="row-between">
        <div><h1>Earnings</h1><p className="muted mb-0">Simulated earnings from completed rentals (service fee excluded).</p></div>
        <button type="button" className="btn btn-outline" onClick={exportCsv}><IconDownload width={18} height={18} /> Export CSV</button>
      </div>
      <div className="stat-grid">
        <div className="stat"><div className="label">Total earned</div><div className="value">{formatETB(m.totalEarnings)}</div></div>
        <div className="stat"><div className="label">Projected</div><div className="value">{formatETB(m.projected)}</div><div className="sub">confirmed / in progress</div></div>
      </div>

      <section className="card" aria-labelledby="chart-h">
        <h2 id="chart-h">Earnings by month</h2>
        {hasData ? (
          <>
            <div className="chart-box" role="img" aria-label={`Bar chart of earnings by month. ${monthly.map((x) => `${x.label}: ${formatETB(x.earned)} earned, ${formatETB(x.projected)} projected`).join('; ')}.`}>
              <EarningsChart data={monthly} />
            </div>
            <p className="xsmall muted" style={{ marginTop: 8, marginBottom: 0 }}>The table below shows the same figures.</p>
          </>
        ) : (
          <EmptyState title="No earnings yet">Completed rentals will appear here.</EmptyState>
        )}
      </section>

      <div className="table-wrap">
        <table className="data">
          <caption>Earnings by month (accessible table)</caption>
          <thead><tr><th scope="col">Month</th><th scope="col" className="num">Earned</th><th scope="col" className="num">Projected</th></tr></thead>
          <tbody>{monthly.map((x) => <tr key={x.month}><th scope="row">{x.label}</th><td className="num">{formatETB(x.earned)}</td><td className="num">{formatETB(x.projected)}</td></tr>)}</tbody>
        </table>
      </div>

      <div className="table-wrap">
        <table className="data">
          <caption>Per-car summary</caption>
          <thead><tr><th scope="col">Car</th><th scope="col" className="num">Trips</th><th scope="col" className="num">Earned</th><th scope="col" className="num">Utilization (30 days)</th></tr></thead>
          <tbody>
            {m.perCar.length === 0 ? <tr><td colSpan={4} className="muted">No cars yet.</td></tr> : m.perCar.map(({ car, trips, earned, utilization }) => (
              <tr key={car.id}><th scope="row">{carTitle(car)}</th><td className="num">{trips}</td><td className="num">{formatETB(earned)}</td><td className="num">{utilization}%</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
