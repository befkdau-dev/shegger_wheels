'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, hasRole } from '@/lib/auth';
import { beginSignOut } from '@/lib/navState';
import { initials } from '@/lib/format';
import { useSession } from '@/lib/hooks';
import Popover from './Popover';
import { useToast } from '@/components/ui/Toast';

export default function UserMenu() {
  const { user } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  if (!user) return null;

  const onSignOut = () => {
    beginSignOut(); // tell RoleGate this is intentional so it does not redirect to /signin
    router.push('/');
    signOut();
    toast('You have been signed out.');
  };

  return (
    <Popover
      triggerClassName="user-button"
      triggerLabel={`Account menu for ${user.name}`}
      trigger={
        <>
          <span className="avatar" aria-hidden="true">{initials(user.name)}</span>
          <span className="hide-sm">{user.name.split(' ')[0]}</span>
        </>
      }
    >
      <div className="menu-head">
        <strong>{user.name}</strong>
        <div className="xsmall muted">{user.email}</div>
        <div className="xsmall muted">Roles: {user.roles.join(', ')}</div>
      </div>
      {hasRole(user, 'renter') ? (
        <>
          <Link href="/dashboard">Renter dashboard</Link>
          <Link href="/bookings">My bookings</Link>
        </>
      ) : null}
      {hasRole(user, 'owner') ? <Link href="/owner">Owner dashboard</Link> : null}
      {hasRole(user, 'admin') ? <Link href="/admin">Admin dashboard</Link> : null}
      <button type="button" className="menu-item" data-close onClick={onSignOut}>
        Sign out
      </button>
    </Popover>
  );
}
