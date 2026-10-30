'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/bookings', label: 'Booking history' },
  { href: '/cars', label: 'Browse cars' },
];

export default function RenterTabs() {
  const pathname = usePathname();
  const current = (href) => (href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
  return (
    <nav className="tabs" aria-label="Renter sections" style={{ marginTop: 24 }}>
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} aria-current={current(t.href) ? 'page' : undefined}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
