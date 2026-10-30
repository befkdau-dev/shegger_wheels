import { Suspense } from 'react';
import BookingDetailClient from '@/components/bookings/BookingDetailClient';
import { LoadingBlock } from '@/components/ui/States';

export const metadata = { title: 'Booking details', robots: { index: false, follow: false } };

// Dynamic route: any booking ID is accepted on the server (bookings exist only in the visitor's
// browser). The client component loads it through the ownership-checked getMyBooking() guard.
export default async function BookingPage({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<LoadingBlock label="Loading booking" rows={3} height={90} />}>
      <BookingDetailClient id={id} />
    </Suspense>
  );
}
