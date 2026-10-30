'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IconClose, IconMenu } from '@/components/ui/Icons';
import NotificationBell from './NotificationBell';
import StorageNotice from './StorageNotice';
import AnnouncementBar from './AnnouncementBar';
import UserMenu from './UserMenu';
import { Logo } from './SiteHeader';

/** Sidebar layout shared by the owner and admin areas. */
export default function DashboardShell({ title, nav, homeHref, children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const isCurrent = (href) => (href === homeHref ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <div className="dash">
      {open ? <div className="scrim" onClick={() => setOpen(false)} aria-hidden="true" /> : null}
      <aside className="dash-side" data-open={open} aria-label={`${title} navigation`}>
        <div className="row-between">
          <Logo />
          <button type="button" className="icon-btn side-toggle" style={{ color: '#fff' }} aria-label="Close navigation" onClick={() => setOpen(false)}>
            <IconClose />
          </button>
        </div>
        <div className="side-label">{title}</div>
        <nav aria-label={`${title} sections`}>
          {nav.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}>
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="side-label">Site</div>
        <nav aria-label="Site links">
          <Link href="/cars">Browse cars</Link>
          <Link href="/">Home</Link>
        </nav>
      </aside>
      <div className="dash-main">
        <div className="dash-top">
          <button type="button" className="icon-btn side-toggle" aria-expanded={open} aria-label="Open navigation" onClick={() => setOpen(true)}>
            <IconMenu />
          </button>
          <strong className="grow">{title}</strong>
          <NotificationBell />
          <UserMenu />
        </div>
        <AnnouncementBar />
        <StorageNotice />
        <main id="main" className="dash-body">{children}</main>
      </div>
    </div>
  );
}
