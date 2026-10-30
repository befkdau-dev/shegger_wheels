'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { enableOwnerRole, hasRole } from '@/lib/auth';
import { useSession } from '@/lib/hooks';
import { isSigningOut } from '@/lib/navState';
import SiteHeader from './SiteHeader';
import { ErrorState, LoadingBlock } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';

/**
 * Client-side route guard (demo only - NOT security):
 *  signed out  -> redirect to /signin?next=<this path> and show a clear prompt
 *  suspended   -> access-blocked message
 *  wrong role  -> explanation with a sensible next step
 */
export default function RoleGate({ role, withHeader = false, children }) {
  const { user, isLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isLoading && !user && !isSigningOut()) {
      const next = pathname + (typeof window !== 'undefined' ? window.location.search : '');
      router.replace(`/signin?next=${encodeURIComponent(next)}`);
    }
  }, [isLoading, user, pathname, router]);

  const shell = (node) => (withHeader ? (<><SiteHeader /><main id="main">{node}</main></>) : node);

  if (isLoading || (!user && isSigningOut())) {
    return shell(
      <div className="container" style={{ paddingTop: 32 }}>
        <LoadingBlock label="Checking your session" rows={2} height={90} />
      </div>,
    );
  }

  if (!user) {
    return shell(
      <div className="container container-narrow" style={{ paddingTop: 40 }}>
        <div className="card center stack">
          <h1 style={{ fontSize: '1.6rem' }}>Please sign in to continue</h1>
          <p className="muted">This area is for signed-in {role === 'admin' ? 'administrators' : role === 'owner' ? 'car owners' : 'renters'}. Taking you to the sign-in page…</p>
          <Link className="btn btn-primary" href={`/signin?next=${encodeURIComponent(pathname)}`}>Sign in</Link>
        </div>
      </div>,
    );
  }

  if (user.status === 'suspended') {
    return shell(
      <div className="container container-narrow" style={{ paddingTop: 40 }}>
        <ErrorState title="Access blocked: your account is suspended">
          An administrator suspended <strong>{user.email}</strong>. Demo actions are disabled while an account is suspended.
          You can still browse public pages.
        </ErrorState>
        <p><Link className="btn btn-outline" href="/cars">Browse cars</Link></p>
      </div>,
    );
  }

  if (role && !hasRole(user, role)) {
    const becomeOwner = role === 'owner' && hasRole(user, 'renter');
    return shell(
      <div className="container container-narrow" style={{ paddingTop: 40 }}>
        <ErrorState title="You do not have access to this area">
          {role === 'admin'
            ? 'Only the seeded demo admin account can open the admin dashboard.'
            : role === 'owner'
              ? 'This area is for car owners. Your account can rent cars today and can add owner features without a second account.'
              : 'Admin accounts manage the platform and do not have renter features. Sign in with a renter account to book cars.'}
        </ErrorState>
        <div className="row" style={{ marginTop: 16 }}>
          {becomeOwner ? (
            <button
              type="button"
              className="btn btn-accent"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                const res = enableOwnerRole();
                setBusy(false);
                toast(res.ok ? 'Owner features enabled on your account.' : res.error, res.ok ? 'success' : 'error');
              }}
            >
              Enable owner features
            </button>
          ) : null}
          <Link className="btn btn-outline" href={hasRole(user, 'admin') ? '/admin' : '/dashboard'}>Go to my dashboard</Link>
        </div>
      </div>,
    );
  }

  return children;
}
