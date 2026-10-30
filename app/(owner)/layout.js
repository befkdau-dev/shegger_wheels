import RoleGate from '@/components/layout/RoleGate';
import OwnerShell from '@/components/owner/OwnerShell';

export const metadata = {
  title: 'Owner area',
  robots: { index: false, follow: false },
};

// Owner layout: sidebar dashboard guarded for owner capability.
export default function OwnerLayout({ children }) {
  return (
    <RoleGate role="owner" withHeader>
      <OwnerShell>{children}</OwnerShell>
    </RoleGate>
  );
}
