import { Suspense } from 'react';
import CatalogueClient from '@/components/cars/CatalogueClient';
import { LoadingBlock } from '@/components/ui/States';

export const metadata = {
  title: 'Browse cars for rent in Addis Ababa',
  description:
    'Search and filter peer-to-peer rental cars in Addis Ababa by neighbourhood, daily price, transmission, seats and availability dates.',
  alternates: { canonical: '/cars' },
};

// The page shell is static. Filters live in the URL (?neighbourhood=Bole&sort=price-asc) and the
// catalogue itself is a Client Component because the car data lives in browser storage.
export default function CarsPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ paddingTop: 32 }}>
          <h1>Find your car</h1>
          <LoadingBlock label="Loading cars" rows={2} height={260} />
        </div>
      }
    >
      <CatalogueClient />
    </Suspense>
  );
}
