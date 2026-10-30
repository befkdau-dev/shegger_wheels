import RoleGate from '@/components/layout/RoleGate';
import AdminShell from '@/components/admin/AdminShell';

export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

// Admin layout: sidebar dashboard guarded for the seeded demo admin.
export default function AdminLayout({ children }) {
  return (
    <RoleGate role="admin" withHeader>
      <AdminShell>{children}</AdminShell>
    </RoleGate>
  );
}
