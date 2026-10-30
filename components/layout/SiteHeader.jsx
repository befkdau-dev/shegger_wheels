'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { hasRole } from '@/lib/auth';
import { useSession } from '@/lib/hooks';
import { IconClose, IconMenu, LogoMark } from '@/components/ui/Icons';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

export function Logo({ href = '/' }) {
  return (
    <Link href={href} className="logo" aria-label="Sheggar Wheels home">
      <LogoMark />
      <span>
        Sheggar <em>Wheels</em>
      </span>
    </Link>
  );
}

/** Role-aware public/renter navigation. */
export default function SiteHeader() {
  const { user, isLoading } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const links = [{ href: '/cars', label: 'Browse cars' }];
  if (user && hasRole(user, 'renter')) {
    links.push({ href: '/dashboard', label: 'Dashboard' }, { href: '/bookings', label: 'My trips' });
  }
  if (user && hasRole(user, 'owner')) links.push({ href: '/owner', label: 'Owner area' });
  else if (!user || hasRole(user, 'renter')) links.push({ href: user ? '/owner' : '/signup', label: 'List your car' });
  if (user && hasRole(user, 'admin')) links.push({ href: '/admin', label: 'Admin' });

  const isCurrent = (href) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Logo />
        <nav className="nav" id="primary-nav" aria-label="Primary" data-open={open}>
          {links.map((l) => (
            <Link key={l.label} href={l.href} aria-current={isCurrent(l.href) ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          {isLoading ? null : user ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <>
              <Link className="btn btn-ghost btn-sm hide-sm" href="/signin">Sign in</Link>
              <Link className="btn btn-accent btn-sm" href="/signup">Sign up</Link>
            </>
          )}
          <button
            type="button"
            className="icon-btn menu-toggle"
            aria-expanded={open}
            aria-controls="primary-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>
    </header>
  );
}
