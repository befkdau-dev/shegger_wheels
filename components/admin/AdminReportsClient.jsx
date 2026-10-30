'use client';
import { useMemo } from 'react';
import { LoadingBlock } from '@/components/ui/States';
import { IconDownload } from '@/components/ui/Icons';
import { useToast } from '@/components/ui/Toast';
import { downloadCSV } from '@/lib/csv';
import { exportPlatformReport } from '@/lib/exports';
import { formatETB } from '@/lib/format';
import { useAppData } from '@/lib/hooks';
import { adminMetrics } from '@/lib/metrics';

const REPORTS = [
  { kind: 'bookings', title: 'Bookings report', text: 'Every booking with price breakdown, status and payment state.' },
  { kind: 'users', title: 'Users report', text: 'Demo accounts with roles and account status.' },
  { kind: 'disputes', title: 'Disputes report', text: 'Disputes with reasons, status and resolution notes.' },
];

export default function AdminReportsClient() {
  const { users, cars, bookings, isLoading } = useAppData();
  const { toast } = useToast();
  const m = useMemo(() => adminMetrics(users, cars, bookings), [users, cars, bookings]);
  if (isLoading) return <LoadingBlock label="Loading reports" rows={3} height={90} />;

  const run = (kind) => {
    const res = exportPlatformReport(kind);
    if (!res.ok) return toast(res.error, 'error');
    downloadCSV(res.filename, res.csv);
    toast(`Exported ${res.count} row${res.count === 1 ? '' : 's'}.`);
  };

  return (
    <div className="stack-lg">
      <div><h1>Reports</h1><p className="muted mb-0">Platform summary and CSV exports. Admin only.</p></div>
      <div className="stat-grid">
        <div className="stat"><div className="label">Gross booking value</div><div className="value">{formatETB(m.gross)}</div><div className="sub">confirmed and later (demo)</div></div>
        <div className="stat"><div className="label">Mock platform commission</div><div className="value">{formatETB(m.commission)}</div><div className="sub">10% service fee (simulated)</div></div>
        <div className="stat"><div className="label">Bookings</div><div className="value">{m.totalBookings}</div></div>
      </div>
      <div className="car-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {REPORTS.map((r) => (
          <section key={r.kind} className="card stack" aria-labelledby={`rp-${r.kind}`}>
            <h2 id={`rp-${r.kind}`} style={{ fontSize: '1.1rem', margin: 0 }}>{r.title}</h2>
            <p className="muted small mb-0">{r.text}</p>
            <div><button type="button" className="btn btn-outline" onClick={() => run(r.kind)}><IconDownload width={18} height={18} /> Download CSV</button></div>
          </section>
        ))}
      </div>
    </div>
  );
}
