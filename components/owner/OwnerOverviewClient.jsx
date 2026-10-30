'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import { EmptyState, LoadingBlock } from '@/components/ui/States';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDateRange, formatETB } from '@/lib/format';
import { useAppData, useSession } from '@/lib/hooks';
import { ownerMetrics } from '@/lib/metrics';
import { carTitle, userName } from '@/lib/selectors';

export default function OwnerOverviewClient() {
  const { user } = useSession();
  const { cars, bookings, users, isLoading } = useAppData();
  const myCars = useMemo(() => cars.filter((c) => c.ownerId === user?.id), [cars, user]);
  const myBookings = useMemo(() => bookings.filter((b) => b.ownerId === user?.id), [bookings, user]);
  const m = useMemo(() => ownerMetrics(myCars, myBookings), [myCars, myBookings]);

  if (isLoading || !user) return <LoadingBlock label="Loading overview" rows={3} height={90} />;

  const requests = myBookings.filter((b) => b.status === 'requested').sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div className="stack-lg">
      <div className="row-between">
        <div><h1>Owner overview</h1><p className="muted mb-0">Your cars, requests and earnings.</p></div>
        <Link className="btn btn-accent" href="/owner/cars/new">+ List a car</Link>
      </div>
      <div className="stat-grid" role="list" aria-label="Owner summary">
        <div className="stat" role="listitem"><div className="label">Approved cars</div><div className="value">{m.approvedCars}</div><div className="sub">{m.pendingCars} pending review</div></div>
        <div className="stat" role="listitem"><div className="label">Pending requests</div><div className="value">{m.pendingRequests}</div><div className="sub">awaiting your decision</div></div>
        <div className="stat" role="listitem"><div className="label">Confirmed rentals</div><div className="value">{m.confirmedRentals}</div><div className="sub">upcoming or in progress</div></div>
        <div className="stat" role="listitem"><div className="label">Total earnings</div><div className="value">{formatETB(m.totalEarnings)}</div><div className="sub">+ {formatETB(m.projected)} projected</div></div>
      </div>

      <section aria-labelledby="req-h">
        <h2 id="req-h">Requests waiting for you</h2>
        {requests.length === 0 ? (
          <EmptyState title="No pending requests">New booking requests for your cars will appear here.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <caption className="sr-only">Pending booking requests</caption>
              <thead><tr><th scope="col">Car</th><th scope="col">Renter</th><th scope="col">Dates</th><th scope="col" className="num">Earn</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {requests.map((b) => (
                  <tr key={b.id}>
                    <th scope="row">{carTitle(cars.find((c) => c.id === b.carId))}</th>
                    <td>{userName(users, b.renterId)}</td>
                    <td>{formatDateRange(b.startDate, b.endDate)}</td>
                    <td className="num">{formatETB(b.subtotal)}</td>
                    <td className="actions"><Link className="btn btn-primary btn-sm" href={`/owner/cars/${b.carId}/bookings`}>Review</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="util-h">
        <h2 id="util-h">Utilization (last 30 days)</h2>
        {m.perCar.length === 0 ? (
          <EmptyState title="You have not listed any cars yet" actionHref="/owner/cars/new" actionLabel="List your first car">Add a car to start earning.</EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <caption className="sr-only">Utilization and earnings per car</caption>
              <thead><tr><th scope="col">Car</th><th scope="col">Status</th><th scope="col" className="num">Trips</th><th scope="col" className="num">Earned</th><th scope="col">Utilization</th></tr></thead>
              <tbody>
                {m.perCar.map(({ car, trips, earned, utilization }) => (
                  <tr key={car.id}>
                    <th scope="row"><Link href={`/owner/cars/${car.id}/edit`}>{carTitle(car)}</Link></th>
                    <td><StatusBadge status={car.status} /></td>
                    <td className="num">{trips}</td>
                    <td className="num">{formatETB(earned)}</td>
                    <td><div className="row" style={{ flexWrap: 'nowrap' }}><div className="bar" style={{ flex: 1 }} role="img" aria-label={`${utilization}% utilization`}><span style={{ width: `${utilization}%` }} /></div><span className="small">{utilization}%</span></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
