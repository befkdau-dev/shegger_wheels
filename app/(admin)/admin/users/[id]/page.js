import AdminUserDetailClient from '@/components/admin/AdminUserDetailClient';

export const metadata = { title: 'Admin: user details' };

export default async function AdminUserPage({ params }) {
  const { id } = await params;
  return <AdminUserDetailClient id={id} />;
}
