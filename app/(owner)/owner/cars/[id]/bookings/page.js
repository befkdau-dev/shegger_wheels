import { CarBookingsView } from '@/components/owner/OwnedCarViews';

export const metadata = { title: 'Car bookings' };

export default async function CarBookingsPage({ params }) {
  const { id } = await params;
  return <CarBookingsView carId={id} />;
}
