import BookingsListClient from '@/components/bookings/BookingsListClient';

export const metadata = { title: 'My bookings', robots: { index: false, follow: false } };

export default function BookingsPage() {
  return <BookingsListClient />;
}
