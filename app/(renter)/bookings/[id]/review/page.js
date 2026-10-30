import ReviewClient from '@/components/bookings/ReviewClient';

export const metadata = { title: 'Review your trip', robots: { index: false, follow: false } };

export default async function ReviewPage({ params }) {
  const { id } = await params;
  return <ReviewClient id={id} />;
}
