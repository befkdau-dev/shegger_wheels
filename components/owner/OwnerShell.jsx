'use client';
import DashboardShell from '@/components/layout/DashboardShell';
import { IconCar, IconChart, IconHome, IconMessage, IconAlert } from '@/components/ui/Icons';

const NAV = [
  { href: '/owner', label: 'Overview', icon: <IconHome /> },
  { href: '/owner/cars', label: 'My cars', icon: <IconCar /> },
  { href: '/owner/earnings', label: 'Earnings', icon: <IconChart /> },
  { href: '/owner/reviews', label: 'Reviews', icon: <IconMessage /> },
  { href: '/owner/disputes', label: 'Disputes', icon: <IconAlert /> },
];

export default function OwnerShell({ children }) {
  return (
    <DashboardShell title="Owner dashboard" nav={NAV} homeHref="/owner">
      {children}
    </DashboardShell>
  );
}
