'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import BookingCard from './BookingRow';
import { EmptyState, LoadingBlock } from '@/components/ui/States';
import { formatDateRange, formatETB } from '@/lib/format';
import { useAppData, useSession } from '@/lib/hooks';
import { renterMetrics } from '@/lib/metrics';
import { carTitle } from '@/lib/selectors';

export default function RenterDashboardClient() {
  const { user } = useSession();
  const { cars, bookings, isLoading } = useAppData();
  const mine = useMemo(() => (user ? bookings.filter((b) => b.renterId === user.id) : []), [bookings, user]);
  const m = useMemo(() => renterMetrics(mine), [mine]);
  const car = (id) => cars.find((c) => c.id === id);

  if (isLoading) return <LoadingBlock label="Loading dashboard" rows={3} height={90} />;

  const past = mine
    .filter((b) => ['completed', 'reviewed', 'resolved', 'disputed', 'cancelled', 'declined'].includes(b.status))
    .sort((a, b) => b.endDate.localeCompare(a.endDate))
    .slice(0, 5);

  return (
    <div className="stack-lg">
      <div className="row-between">
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Welcome back, {user?.name.split(' ')[0]}</h1>
          <p className="muted mb-0">Your trips and spending at a glance.</p>
        </div>
        <Link className="btn btn-accent" href="/cars">Find a car</Link>
      </div>

      <div className="stat-grid" role="list" aria-label="Trip summary">
        <div className="stat" role="listitem"><div className="label">Upcoming trips</div><div className="value">{m.upcoming.length}</div><div className="sub">requested or confirmed</div></div>
        <div className="stat" role="listitem"><div className="label">Completed trips</div><div className="value">{m.completedCount}</div><div className="sub">finished rentals</div></div>
        <div className="stat" role="listitem"><div className="label">Cancelled / declined</div><div className="value">{m.cancelledCount}</div><div className="sub">not going ahead</div></div>
        <div className="stat" role="listitem"><div className="label">Total demo spend</div><div className="value">{formatETB(m.totalSpend)}</div><div className="sub">simulated payments</div></div>
      </div>

      <section aria-labelledby="next-h">
        <h2 id="next-h">Next booking</h2>
        {m.nextBooking ? (
          <div className="card">
            <div className="row-between">
              <div>
                <h3 style={{ marginBottom: 2 }}>{carTitle(car(m.nextBooking.carId))}</h3>
                <p className="muted mb-0">{formatDateRange(m.nextBooking.startDate, m.nextBooking.endDate)} · {formatETB(m.nextBooking.total)}</p>
              </div>
              <div className="row">
                <Link className="btn btn-primary" href={`/bookings/${m.nextBooking.id}`}>View booking</Link>
                {['confirmed', 'in_progress'].includes(m.nextBooking.status) ? (
                  <Link className="btn btn-outline" href={`/bookings/${m.nextBooking.id}/track`}>Track trip (simulation)</Link>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState title="You have no upcoming bookings" actionHref="/cars" actionLabel="Browse cars">Find a car for your next trip.</EmptyState>
        )}
      </section>

      <section aria-labelledby="up-h">
        <h2 id="up-h">Upcoming and active</h2>
        {m.upcoming.length + m.live.length === 0 ? (
          <p className="muted">Nothing scheduled right now.</p>
        ) : (
          <div className="car-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {[...m.live, ...m.upcoming].map((b) => <BookingCard key={b.id} booking={b} car={car(b.carId)} />)}
          </div>
        )}
      </section>

      <section aria-labelledby="past-h">
        <div className="row-between"><h2 id="past-h" className="mb-0">Past trips</h2><Link href="/bookings">Full history →</Link></div>
        {past.length === 0 ? (
          <p className="muted" style={{ marginTop: 12 }}>You have no past trips yet.</p>
        ) : (
          <div className="car-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', marginTop: 12 }}>
            {past.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                car={car(b.carId)}
                action={b.status === 'completed' ? <Link className="btn btn-accent btn-sm" href={`/bookings/${b.id}/review`}>Leave a review</Link> : null}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
