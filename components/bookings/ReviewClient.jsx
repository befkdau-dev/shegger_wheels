'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import Field from '@/components/ui/Field';
import { Alert, ErrorState, LoadingBlock } from '@/components/ui/States';
import { RatingInput } from '@/components/ui/Stars';
import { useToast } from '@/components/ui/Toast';
import { getMyBooking } from '@/lib/bookings';
import { formatDateRange } from '@/lib/format';
import { useAppData, useSession } from '@/lib/hooks';
import { createReview } from '@/lib/reviews';
import { carTitle } from '@/lib/selectors';

export default function ReviewClient({ id }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useSession();
  const { cars, bookings, reviews, isLoading } = useAppData();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const access = useMemo(() => (isLoading || !user ? null : getMyBooking(id)), [isLoading, user, id, bookings]);

  if (isLoading || !user) return <LoadingBlock label="Loading review form" rows={2} height={120} />;
  if (!access || !access.ok) {
    return <ErrorState title={access?.code === 'forbidden' ? 'This booking is not yours' : 'Booking not found'} actionHref="/bookings" actionLabel="My bookings">Only the renter of a completed trip can review it.</ErrorState>;
  }
  const booking = access.booking;
  const car = cars.find((c) => c.id === booking.carId);
  const already = reviews.some((r) => r.bookingId === booking.id);

  if (booking.status !== 'completed' || already) {
    return (
      <ErrorState title={already || booking.status === 'reviewed' ? 'You already reviewed this trip' : 'This trip cannot be reviewed yet'} actionHref={`/bookings/${booking.id}`} actionLabel="Back to booking">
        {already || booking.status === 'reviewed'
          ? 'Each booking can have one review.'
          : 'Reviews open after a rental is completed. This booking is currently ' + booking.status.replace('_', ' ') + '.'}
      </ErrorState>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    const res = createReview({ bookingId: booking.id, rating, comment });
    if (!res.ok) {
      setErrors(res.errors || {});
      setFormError(res.error);
      return;
    }
    toast('Thanks! Your review was published.');
    router.replace(`/cars/${booking.carId}`);
  };

  return (
    <div className="container-narrow stack-lg" style={{ margin: '0 auto', paddingTop: 8 }}>
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/bookings">My bookings</Link> / <Link href={`/bookings/${booking.id}`}>Booking</Link> / <span aria-current="page">Review</span></nav>
      <div>
        <h1 style={{ fontSize: '1.8rem' }}>Review your trip</h1>
        <p className="muted mb-0">{carTitle(car)} · {formatDateRange(booking.startDate, booking.endDate)}</p>
      </div>
      <form className="card stack" onSubmit={submit} noValidate>
        {formError ? <Alert type="error" title="Please check your review"><p className="mb-0">{formError}</p></Alert> : null}
        <RatingInput value={rating} onChange={(n) => { setRating(n); setErrors((x) => ({ ...x, rating: undefined })); }} error={errors.rating} />
        <Field label="Your review" required error={errors.comment} hint="Share what went well and anything the owner could improve.">
          {(p) => <textarea {...p} className="textarea" value={comment} onChange={(e) => setComment(e.target.value)} />}
        </Field>
        <div className="row"><button type="submit" className="btn btn-accent btn-lg">Publish review</button><Link className="btn btn-outline btn-lg" href={`/bookings/${booking.id}`}>Cancel</Link></div>
      </form>
    </div>
  );
}
