'use client';
import DashboardShell from '@/components/layout/DashboardShell';
import { IconAlert, IconCalendar, IconCar, IconChart, IconFile, IconHome, IconMegaphone, IconUsers } from '@/components/ui/Icons';

const NAV = [
  { href: '/admin', label: 'Overview', icon: <IconHome /> },
  { href: '/admin/listings', label: 'Listings', icon: <IconCar /> },
  { href: '/admin/users', label: 'Users', icon: <IconUsers /> },
  { href: '/admin/bookings', label: 'Bookings', icon: <IconCalendar /> },
  { href: '/admin/disputes', label: 'Disputes', icon: <IconAlert /> },
  { href: '/admin/reports', label: 'Reports', icon: <IconChart /> },
  { href: '/admin/announcements', label: 'Announcements', icon: <IconMegaphone /> },
];

export default function AdminShell({ children }) {
  return (
    <DashboardShell title="Admin dashboard" nav={NAV} homeHref="/admin">
      {children}
    </DashboardShell>
  );
}
