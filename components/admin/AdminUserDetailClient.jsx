'use client';
import Link from 'next/link';
import { SuspendButton } from './AdminUsersClient';
import { ErrorState, LoadingBlock } from '@/components/ui/States';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate, formatDateRange, formatETB } from '@/lib/format';
import { useAppData } from '@/lib/hooks';
import { carTitle } from '@/lib/selectors';

export default function AdminUserDetailClient({ id }) {
  const { users, cars, bookings, isLoading } = useAppData();
  if (isLoading) return <LoadingBlock label="Loading user" rows={2} height={100} />;
  const user = users.find((u) => u.id === id);
  if (!user) return <ErrorState title="User not found" actionHref="/admin/users" actionLabel="Back to users">There is no demo account with that ID.</ErrorState>;
  const theirCars = cars.filter((c) => c.ownerId === user.id);
  const theirBookings = bookings.filter((b) => b.renterId === user.id || b.ownerId === user.id);

  return (
    <div className="stack-lg">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/admin/users">Users</Link> / <span aria-current="page">{user.name}</span></nav>
      <div className="row-between"><h1 style={{ margin: 0 }}>{user.name}</h1><div className="row"><StatusBadge status={user.status} /><SuspendButton user={user} size="" /></div></div>
      <section className="card" aria-labelledby="ud-h">
        <h2 id="ud-h" style={{ fontSize: '1.1rem' }}>Account</h2>
        <dl className="kv">
          <dt>User ID</dt><dd className="mono">{user.id}</dd>
          <dt>Email</dt><dd>{user.email}</dd>
          <dt>Phone</dt><dd>{user.phone}</dd>
          <dt>Roles</dt><dd>{user.roles.join(', ')}</dd>
          <dt>Joined</dt><dd>{formatDate(user.createdAt)}</dd>
        </dl>
      </section>
      <section aria-labelledby="uc-h">
        <h2 id="uc-h">Listings ({theirCars.length})</h2>
        {theirCars.length === 0 ? <p className="muted">This user has no listings.</p> : (
          <div className="table-wrap"><table className="data"><caption className="sr-only">Listings owned by this user</caption>
            <thead><tr><th scope="col">Car</th><th scope="col">Status</th><th scope="col" className="num">Price / day</th></tr></thead>
            <tbody>{theirCars.map((c) => <tr key={c.id}><th scope="row">{carTitle(c)}</th><td><StatusBadge status={c.status} /></td><td className="num">{formatETB(c.pricePerDay)}</td></tr>)}</tbody></table></div>
        )}
      </section>
      <section aria-labelledby="ub-h">
        <h2 id="ub-h">Bookings ({theirBookings.length})</h2>
        {theirBookings.length === 0 ? <p className="muted">No bookings involve this user.</p> : (
          <div className="table-wrap"><table className="data"><caption className="sr-only">Bookings involving this user</caption>
            <thead><tr><th scope="col">Car</th><th scope="col">Role</th><th scope="col">Dates</th><th scope="col">Status</th><th scope="col" className="num">Total</th></tr></thead>
            <tbody>{theirBookings.map((b) => <tr key={b.id}><th scope="row">{carTitle(cars.find((c) => c.id === b.carId))}</th><td>{b.renterId === user.id ? 'Renter' : 'Owner'}</td><td>{formatDateRange(b.startDate, b.endDate)}</td><td><StatusBadge status={b.status} /></td><td className="num">{formatETB(b.total)}</td></tr>)}</tbody></table></div>
        )}
      </section>
    </div>
  );
}
