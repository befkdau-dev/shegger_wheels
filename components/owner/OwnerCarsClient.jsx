'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { EmptyState, LoadingBlock } from '@/components/ui/States';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { setCarActive } from '@/lib/cars';
import { formatETB } from '@/lib/format';
import { useAppData, useSession } from '@/lib/hooks';
import { carTitle } from '@/lib/selectors';

export default function OwnerCarsClient() {
  const { user } = useSession();
  const { cars, isLoading } = useAppData();
  const { toast } = useToast();
  const [target, setTarget] = useState(null);
  const mine = useMemo(() => cars.filter((c) => c.ownerId === user?.id), [cars, user]);

  if (isLoading || !user) return <LoadingBlock label="Loading your cars" rows={3} height={64} />;

  const toggle = () => {
    const res = setCarActive(target.id, target.status === 'inactive');
    setTarget(null);
    toast(res.ok ? (target.status === 'inactive' ? 'Listing reactivated.' : 'Listing deactivated.') : res.error, res.ok ? 'success' : 'error');
  };

  return (
    <div className="stack-lg">
      <div className="row-between">
        <div><h1>My cars</h1><p className="muted mb-0">Create, edit and deactivate your own listings.</p></div>
        <Link className="btn btn-accent" href="/owner/cars/new">+ List a car</Link>
      </div>
      {mine.length === 0 ? (
        <EmptyState title="You have not listed any cars yet" actionHref="/owner/cars/new" actionLabel="List your first car">Listings are reviewed by an admin before they go live.</EmptyState>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <caption className="sr-only">Your car listings</caption>
            <thead><tr><th scope="col">Car</th><th scope="col">Area</th><th scope="col" className="num">Price / day</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {mine.map((car) => (
                <tr key={car.id}>
                  <th scope="row">{carTitle(car)}</th>
                  <td>{car.neighbourhood}</td>
                  <td className="num">{formatETB(car.pricePerDay)}</td>
                  <td><StatusBadge status={car.status} /></td>
                  <td className="actions">
                    <Link className="btn btn-outline btn-sm" href={`/owner/cars/${car.id}/edit`}>Edit<span className="sr-only"> {carTitle(car)}</span></Link>
                    <Link className="btn btn-outline btn-sm" href={`/owner/cars/${car.id}/availability`}>Availability</Link>
                    <Link className="btn btn-outline btn-sm" href={`/owner/cars/${car.id}/bookings`}>Bookings</Link>
                    {car.status === 'approved' || car.status === 'inactive' ? (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTarget(car)}>{car.status === 'inactive' ? 'Reactivate' : 'Deactivate'}</button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog
        open={!!target}
        title={target?.status === 'inactive' ? 'Reactivate this listing?' : 'Deactivate this listing?'}
        confirmLabel={target?.status === 'inactive' ? 'Reactivate' : 'Deactivate'}
        tone={target?.status === 'inactive' ? 'primary' : 'danger'}
        onConfirm={toggle}
        onCancel={() => setTarget(null)}
      >
        <p>{target?.status === 'inactive' ? 'Renters will be able to find and book it again.' : 'It will disappear from public search. Cars with confirmed or ongoing bookings cannot be deactivated.'}</p>
      </ConfirmDialog>
    </div>
  );
}
