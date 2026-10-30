import TrackClient from '@/components/bookings/TrackClient';

export const metadata = { title: 'Trip tracker (simulation)', robots: { index: false, follow: false } };

export default async function TrackPage({ params }) {
  const { id } = await params;
  return <TrackClient id={id} />;
}
