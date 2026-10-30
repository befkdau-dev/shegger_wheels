import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import CarDetailClient from '@/components/cars/CarDetailClient';
import { LoadingBlock } from '@/components/ui/States';
import { formatETB } from '@/lib/format';
import { getSeedCar, publicSeedCars } from '@/lib/seed';
import { SITE_NAME, SITE_URL } from '@/lib/site';

// Pre-render the seeded public cars at build time (static generation).
export function generateStaticParams() {
  return publicSeedCars().map((car) => ({ id: car.id }));
}

// IDs created in a visitor's browser are not known at build time: render those on demand
// as client-only pages instead of 404ing at the server.
export const dynamicParams = true;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const car = getSeedCar(id);
  if (!car || car.status !== 'approved') {
    return { title: 'Car details', robots: { index: false, follow: true } };
  }
  const title = `${car.year} ${car.make} ${car.model} for rent in ${car.neighbourhood}`;
  const description = `Rent a ${car.year} ${car.make} ${car.model} (${car.transmission}, ${car.seats} seats) in ${car.neighbourhood}, Addis Ababa from ${formatETB(car.pricePerDay)} per day.`;
  return {
    title,
    description,
    alternates: { canonical: `/cars/${car.id}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/cars/${car.id}`,
      images: [{ url: car.photos[0], width: 800, height: 500, alt: `${car.make} ${car.model}` }],
    },
  };
}

export default async function CarPage({ params }) {
  const { id } = await params;
  if (typeof id !== 'string' || id.length > 80 || !/^[A-Za-z0-9_-]+$/.test(id)) notFound();
  const seeded = getSeedCar(id);

  // Structured data for search engines. Only seeded, approved cars are described server-side.
  const jsonLd =
    seeded && seeded.status === 'approved'
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: `${seeded.year} ${seeded.make} ${seeded.model}`,
          description: seeded.description,
          image: `${SITE_URL}${seeded.photos[0]}`,
          brand: { '@type': 'Brand', name: seeded.make },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'ETB',
            price: seeded.pricePerDay,
            url: `${SITE_URL}/cars/${seeded.id}`,
            availability: 'https://schema.org/InStock',
            seller: { '@type': 'Organization', name: SITE_NAME },
          },
        }
      : null;

  return (
    <>
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      ) : null}
      <Suspense fallback={<div className="container" style={{ paddingTop: 32 }}><LoadingBlock label="Loading car" rows={2} height={300} /></div>}>
        <CarDetailClient carId={id} serverFound={!!seeded} />
      </Suspense>
    </>
  );
}
