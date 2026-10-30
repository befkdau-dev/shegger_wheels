'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo } from 'react';
import { LoadingBlock } from '@/components/ui/States';
import { formatETB, statusLabel } from '@/lib/format';
import { useAppData } from '@/lib/hooks';
import { adminMetrics } from '@/lib/metrics';

const chartLoading = () => <div className="skeleton" style={{ height: '100%' }} role="status" aria-label="Loading chart" />;
const StatusChart = dynamic(() => import('./AdminCharts').then((m) => m.StatusChart), { ssr: false, loading: chartLoading });
const VolumeChart = dynamic(() => import('./AdminCharts').then((m) => m.VolumeChart), { ssr: false, loading: chartLoading });

export default function AdminOverviewClient() {
  const { users, cars, bookings, disputes, isLoading } = useAppData();
  const m = useMemo(() => adminMetrics(users, cars, bookings), [users, cars, bookings]);
  if (isLoading) return <LoadingBlock label="Loading overview" rows={3} height={90} />;
  const openDisputes = disputes.filter((d) => d.status === 'open').length;

  return (
    <div className="stack-lg">
      <div><h1>Platform overview</h1><p className="muted mb-0">Live figures computed from the demo data in this browser.</p></div>
      <div className="stat-grid" role="list" aria-label="Platform metrics">
        <div className="stat" role="listitem"><div className="label">Total users</div><div className="value">{m.totalUsers}</div><div className="sub">{m.activeUsers} active</div></div>
        <div className="stat" role="listitem"><div className="label">Approved cars</div><div className="value">{m.approvedCars}</div><div className="sub"><Link href="/admin/listings">{m.pendingCars} pending review</Link></div></div>
        <div className="stat" role="listitem"><div className="label">Bookings</div><div className="value">{m.totalBookings}</div><div className="sub">all statuses</div></div>
        <div className="stat" role="listitem"><div className="label">Mock platform fee</div><div className="value">{formatETB(m.commission)}</div><div className="sub">of {formatETB(m.gross)} gross (demo)</div></div>
        <div className="stat" role="listitem"><div className="label">Open disputes</div><div className="value">{openDisputes}</div><div className="sub"><Link href="/admin/disputes">Review now</Link></div></div>
      </div>

      <div className="two-col">
        <section className="card" aria-labelledby="st-h">
          <h2 id="st-h" style={{ fontSize: '1.1rem' }}>Bookings by status</h2>
          <div className="chart-box" role="img" aria-label={`Bar chart of bookings by status. ${m.statusSeries.map((s) => `${statusLabel(s.status)}: ${s.count}`).join(', ')}.`}>
            <StatusChart data={m.statusSeries} />
          </div>
        </section>
        <section className="card" aria-labelledby="vol-h">
          <h2 id="vol-h" style={{ fontSize: '1.1rem' }}>Monthly booking volume</h2>
          <div className="chart-box" role="img" aria-label={`Line chart of bookings created per month. ${m.volume.map((v) => `${v.label}: ${v.bookings}`).join(', ')}.`}>
            <VolumeChart data={m.volume} />
          </div>
        </section>
      </div>

      <div className="two-col">
        <div className="table-wrap">
          <table className="data" style={{ minWidth: 0 }}>
            <caption>Bookings by status (table view)</caption>
            <thead><tr><th scope="col">Status</th><th scope="col" className="num">Bookings</th></tr></thead>
            <tbody>{m.statusSeries.map((s) => <tr key={s.status}><th scope="row">{statusLabel(s.status)}</th><td className="num">{s.count}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="table-wrap">
          <table className="data" style={{ minWidth: 0 }}>
            <caption>Monthly volume (table view)</caption>
            <thead><tr><th scope="col">Month</th><th scope="col" className="num">Bookings created</th></tr></thead>
            <tbody>{m.volume.map((v) => <tr key={v.month}><th scope="row">{v.label}</th><td className="num">{v.bookings}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
