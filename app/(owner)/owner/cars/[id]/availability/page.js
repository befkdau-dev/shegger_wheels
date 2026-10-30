import { AvailabilityView } from '@/components/owner/OwnedCarViews';

export const metadata = { title: 'Manage availability' };

export default async function AvailabilityPage({ params }) {
  const { id } = await params;
  return <AvailabilityView carId={id} />;
}
