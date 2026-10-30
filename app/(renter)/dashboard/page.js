import RenterDashboardClient from '@/components/bookings/RenterDashboardClient';

export const metadata = { title: 'Renter dashboard', robots: { index: false, follow: false } };

export default function DashboardPage() {
  return <RenterDashboardClient />;
}
