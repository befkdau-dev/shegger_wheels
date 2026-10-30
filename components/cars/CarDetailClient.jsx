'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import BookingWidget from './BookingWidget';
import CarMap from './CarMap';
import CarImage from '@/components/ui/CarImage';
import { ErrorState, LoadingBlock } from '@/components/ui/States';
import { Stars } from '@/components/ui/Stars';
import StatusBadge from '@/components/ui/StatusBadge';
import { IconGear, IconSeat, IconCalendar, IconPin } from '@/components/ui/Icons';
import { formatDate, initials, isValidISODate } from '@/lib/format';
import { useAppData, useSession } from '@/lib/hooks';
import { averageRating } from '@/lib/reviews';
import { carTitle } from '@/lib/selectors';

export default function CarDetailClient({ carId, serverFound }) {
  const { cars, users, reviews, isLoading } = useAppData();
  const { user } = useSession();
  const params = useSearchParams();
  const [photoIndex, setPhotoIndex] = useState(0);

  const car = cars.find((c) => c.id === carId);
  const owner = car ? users.find((u) => u.id === car.ownerId) : null;
  const carReviews = useMemo(
    () => reviews.filter((r) => r.carId === carId).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
    [reviews, carId],
  );
  const avg = averageRating(carReviews);

  const start = params.get('start');
  const end = params.get('end');

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: 32 }}>
        <LoadingBlock label="Loading car" rows={2} height={300} />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container container-narrow" style={{ paddingTop: 40 }}>
        <ErrorState title="Car not found" actionHref="/cars" actionLabel="Browse all cars">
          {serverFound
            ? 'This listing is not stored in this browser. If you reset the demo data it may have been removed.'
            : 'We could not find a car with that address. It may have been removed.'}
        </ErrorState>
      </div>
    );
  }

  // Non-public listings are visible only to their owner and admins (preview), never to the public.
  const isPublic = car.status === 'approved' && owner && owner.status === 'active';
  const isOwnerOrAdmin = user && (user.id === car.ownerId || user.roles.includes('admin'));
  if (!isPublic && !isOwnerOrAdmin) {
    return (
      <div className="container container-narrow" style={{ paddingTop: 40 }}>
        <ErrorState title="This listing is not available" actionHref="/cars" actionLabel="Browse available cars">
          It is not currently open for rental. Try another car.
        </ErrorState>
      </div>
    );
  }

  const photos = car.photos?.length ? car.photos : [null];
  const shown = photos[Math.min(photoIndex, photos.length - 1)];

  return (
    <div className="container">
      <div className="page-head">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> / <Link href="/cars">Cars</Link> / <span aria-current="page">{carTitle(car)}</span>
        </nav>
        <div className="row-between">
          <h1 style={{ marginBottom: 4 }}>{carTitle(car)}</h1>
          {!isPublic ? <StatusBadge status={car.status} /> : null}
        </div>
        <div className="row" style={{ gap: 14 }}>
          <span className="row" style={{ gap: 4 }}><IconPin width={18} height={18} /> {car.neighbourhood}, {car.city}</span>
          {avg ? (
            <span className="row" style={{ gap: 6 }}>
              <Stars value={avg} /> <strong>{avg}</strong> <span className="muted">({carReviews.length} review{carReviews.length === 1 ? '' : 's'})</span>
            </span>
          ) : (
            <span className="muted">No reviews yet</span>
          )}
        </div>
      </div>

      {!isPublic ? (
        <div className="alert alert-warning" role="status" style={{ marginBottom: 16 }}>
          <div><span className="alert-title">Preview only</span> This listing is {car.status} and is not visible to renters.</div>
        </div>
      ) : null}

      <div className="detail-layout" style={{ marginTop: 16 }}>
        <div className="stack-lg">
          <section aria-label="Photos">
            <div className="gallery-main">
              <CarImage src={shown} alt={`${carTitle(car)} - photo ${Math.min(photoIndex, photos.length - 1) + 1} of ${photos.length}`} sizes="(max-width: 1024px) 100vw, 760px" priority />
            </div>
            {photos.length > 1 ? (
              <div className="thumbs" role="group" aria-label="Choose a photo">
                {photos.map((p, i) => (
                  <button key={`${p}-${i}`} type="button" className="thumb" aria-label={`Show photo ${i + 1}`} aria-current={i === photoIndex ? 'true' : undefined} onClick={() => setPhotoIndex(i)}>
                    <CarImage src={p} alt="" sizes="92px" />
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section aria-labelledby="specs-h">
            <h2 id="specs-h">Specifications</h2>
            <div className="spec-grid">
              <div className="spec"><small>Transmission</small><strong><IconGear width={16} height={16} style={{ verticalAlign: '-3px' }} /> {car.transmission}</strong></div>
              <div className="spec"><small>Seats</small><strong><IconSeat width={16} height={16} style={{ verticalAlign: '-3px' }} /> {car.seats}</strong></div>
              <div className="spec"><small>Year</small><strong><IconCalendar width={16} height={16} style={{ verticalAlign: '-3px' }} /> {car.year}</strong></div>
              <div className="spec"><small>Area</small><strong><IconPin width={16} height={16} style={{ verticalAlign: '-3px' }} /> {car.neighbourhood}</strong></div>
            </div>
          </section>

          <section aria-labelledby="about-h">
            <h2 id="about-h">About this car</h2>
            <p>{car.description}</p>
            {owner ? (
              <div className="row" style={{ marginTop: 8 }}>
                <span className="avatar" aria-hidden="true">{initials(owner.name)}</span>
                <div>
                  <strong>Hosted by {owner.name}</strong>
                  <div className="small muted">Member since {formatDate(owner.createdAt)}</div>
                </div>
              </div>
            ) : null}
          </section>

          {(car.unavailableDates || []).length ? (
            <section aria-labelledby="unavail-h">
              <h2 id="unavail-h">Dates the owner has blocked</h2>
              <ul className="date-chip-list" aria-label="Blocked dates">
                {car.unavailableDates.slice(0, 20).map((d) => (
                  <li key={d} className="date-chip" style={{ paddingRight: 12 }}>{formatDate(d)}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="loc-h">
            <h2 id="loc-h">Pick-up area</h2>
            <CarMap car={car} />
          </section>

          <section aria-labelledby="rev-h">
            <h2 id="rev-h">Reviews {carReviews.length ? `(${carReviews.length})` : ''}</h2>
            {carReviews.length === 0 ? (
              <p className="muted">No one has reviewed this car yet. Reviews appear after completed trips.</p>
            ) : (
              <div className="card" style={{ padding: '4px 20px' }}>
                {carReviews.map((r) => {
                  const reviewer = users.find((u) => u.id === r.renterId);
                  return (
                    <article key={r.id} className="review-item">
                      <div className="row-between">
                        <div className="row"><strong>{reviewer ? reviewer.name : 'Renter'}</strong><Stars value={r.rating} /></div>
                        <span className="small muted">{formatDate(r.createdAt)}</span>
                      </div>
                      <p className="mb-0" style={{ marginTop: 6 }}>{r.comment}</p>
                      {r.ownerReply ? (
                        <div className="owner-reply"><strong>Owner reply:</strong> {r.ownerReply}</div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside aria-label="Booking">
          <BookingWidget
            car={car}
            initialStart={isValidISODate(start) ? start : ''}
            initialEnd={isValidISODate(end) ? end : ''}
          />
        </aside>
      </div>
    </div>
  );
}
