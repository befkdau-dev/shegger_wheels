import Link from 'next/link';
import CarImage from '@/components/ui/CarImage';
import StatusBadge from '@/components/ui/StatusBadge';
import { IconGear, IconPin, IconSeat, IconStar } from '@/components/ui/Icons';
import { formatETB } from '@/lib/format';
import { carTitle } from '@/lib/selectors';

export default function CarCard({ car, rating, query = '', priority = false, showStatus = false, headingLevel = 'h3' }) {
  const Heading = headingLevel;
  const href = `/cars/${car.id}${query ? `?${query}` : ''}`;
  return (
    <article className="car-card">
      <div className="car-card-media">
        {showStatus ? (
          <span className="car-tag"><StatusBadge status={car.status} /></span>
        ) : null}
        <CarImage src={car.photos?.[0]} alt={`${carTitle(car)} in ${car.neighbourhood}`} priority={priority} />
      </div>
      <div className="car-card-body">
        <div className="row-between" style={{ alignItems: 'flex-start' }}>
          <Heading>
            <Link href={href}>{carTitle(car)}</Link>
          </Heading>
          {rating ? (
            <span className="rating" aria-label={`Rated ${rating.average} out of 5 from ${rating.count} reviews`}>
              <IconStar width={15} height={15} style={{ color: 'var(--amber-500)' }} />
              {rating.average}
              <span className="muted xsmall">({rating.count})</span>
            </span>
          ) : (
            <span className="muted xsmall">New</span>
          )}
        </div>
        <ul className="car-specs" aria-label="Specifications">
          <li><IconPin /> {car.neighbourhood}</li>
          <li><IconSeat /> {car.seats} seats</li>
          <li><IconGear /> {car.transmission}</li>
        </ul>
        <div className="price" style={{ marginTop: 'auto' }}>
          {formatETB(car.pricePerDay)} <span>/ day</span>
        </div>
      </div>
    </article>
  );
}
