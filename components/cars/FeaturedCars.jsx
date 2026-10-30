'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import CarCard from './CarCard';
import { LoadingBlock, EmptyState } from '@/components/ui/States';
import { useAppData } from '@/lib/hooks';
import { popularityScore } from '@/lib/search';
import { publicCarsFrom, ratingMap } from '@/lib/selectors';

export function HomeStats() {
  const { cars, users, reviews, isLoading } = useAppData();
  const stats = useMemo(() => {
    const pub = publicCarsFrom(cars, users);
    const hoods = new Set(pub.map((c) => c.neighbourhood));
    const owners = new Set(pub.map((c) => c.ownerId));
    const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';
    return [
      { label: 'Cars available', value: pub.length },
      { label: 'Neighbourhoods', value: hoods.size },
      { label: 'Local owners', value: owners.size },
      { label: 'Average review', value: avg },
    ];
  }, [cars, users, reviews]);

  return (
    <div className="container">
      <div className="stats-strip" aria-label="Platform at a glance">
        {stats.map((s) => (
          <div key={s.label} className="stat-pill">
            <strong>{isLoading ? '–' : s.value}</strong>
            <span className="muted small">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FeaturedCars() {
  const { cars, users, bookings, reviews, isLoading } = useAppData();
  const featured = useMemo(() => {
    const pub = publicCarsFrom(cars, users);
    return [...pub]
      .sort((a, b) => popularityScore(b.id, bookings, reviews) - popularityScore(a.id, bookings, reviews))
      .slice(0, 3);
  }, [cars, users, bookings, reviews]);
  const ratings = useMemo(() => ratingMap(reviews), [reviews]);

  if (isLoading) return <LoadingBlock label="Loading featured cars" rows={1} height={300} />;
  if (!featured.length) {
    return (
      <EmptyState title="No cars are listed yet" actionHref="/signup" actionLabel="List the first car">
        Owners can add a car in a couple of minutes.
      </EmptyState>
    );
  }
  return (
    <>
      <div className="car-grid">
        {featured.map((car, i) => (
          <CarCard key={car.id} car={car} rating={ratings.get(car.id)} priority={i === 0} />
        ))}
      </div>
      <p className="center" style={{ marginTop: 24 }}>
        <Link className="btn btn-outline" href="/cars">See all cars</Link>
      </p>
    </>
  );
}
