import { EditCarView } from '@/components/owner/OwnedCarViews';

export const metadata = { title: 'Edit listing' };

export default async function EditCarPage({ params }) {
  const { id } = await params;
  return <EditCarView carId={id} />;
}
