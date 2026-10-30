import AdminDisputeDetailClient from '@/components/admin/AdminDisputeDetailClient';

export const metadata = { title: 'Admin: resolve dispute' };

export default async function AdminDisputePage({ params }) {
  const { id } = await params;
  return <AdminDisputeDetailClient id={id} />;
}
