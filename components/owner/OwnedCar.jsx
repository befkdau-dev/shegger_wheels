'use client';
import Link from 'next/link';
import { ErrorState, LoadingBlock } from '@/components/ui/States';
import { useAppData, useSession } from '@/lib/hooks';
import { carTitle } from '@/lib/selectors';

/**
 * Loads a car by ID and renders children only when the signed-in user owns it.
 * Changing the ID in the URL to someone else's car shows a clear "not yours" state.
 * (The write helpers repeat this check - this component is UI only.)
 */
export default function OwnedCar({ carId, section, children }) {
  const { user } = useSession();
  const { cars, isLoading } = useAppData();
  if (isLoading || !user) return <LoadingBlock label="Loading car" rows={2} height={110} />;
  const car = cars.find((c) => c.id === carId);
  if (!car) {
    return <ErrorState title="Car not found" actionHref="/owner/cars" actionLabel="Back to my cars">There is no listing with that ID.</ErrorState>;
  }
  if (car.ownerId !== user.id) {
    return <ErrorState title="This listing is not yours" actionHref="/owner/cars" actionLabel="Back to my cars">You can only manage cars that belong to your account.</ErrorState>;
  }
  const tabs = [
    { href: `/owner/cars/${car.id}/edit`, label: 'Details', key: 'edit' },
    { href: `/owner/cars/${car.id}/availability`, label: 'Availability', key: 'availability' },
    { href: `/owner/cars/${car.id}/bookings`, label: 'Bookings', key: 'bookings' },
  ];
  return (
    <div className="stack-lg">
      <div>
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/owner/cars">My cars</Link> / <span aria-current="page">{carTitle(car)}</span></nav>
        <h1 style={{ fontSize: '1.8rem', marginBottom: 12 }}>{carTitle(car)}</h1>
        <nav className="tabs" aria-label="Car management">
          {tabs.map((t) => <Link key={t.key} href={t.href} aria-current={section === t.key ? 'page' : undefined}>{t.label}</Link>)}
        </nav>
      </div>
      {children(car)}
    </div>
  );
}
