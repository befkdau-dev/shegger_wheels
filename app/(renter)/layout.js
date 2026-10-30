import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import StorageNotice from '@/components/layout/StorageNotice';
import RoleGate from '@/components/layout/RoleGate';
import RenterTabs from '@/components/bookings/RenterTabs';

export const metadata = {
  robots: { index: false, follow: false }, // crawler guidance only - not access control
};

// Renter layout: site header + role gate + renter sub-navigation.
export default function RenterLayout({ children }) {
  return (
    <>
      <SiteHeader />
      <AnnouncementBar />
      <StorageNotice />
      <main id="main" className="main-content">
        <RoleGate role="renter">
          <div className="container">
            <RenterTabs />
            {children}
          </div>
        </RoleGate>
      </main>
      <SiteFooter />
    </>
  );
}
