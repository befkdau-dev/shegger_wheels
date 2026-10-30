import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import StorageNotice from '@/components/layout/StorageNotice';

// Public layout: marketing header + footer. Server Component that composes client islands.
export default function PublicLayout({ children }) {
  return (
    <>
      <SiteHeader />
      <AnnouncementBar />
      <StorageNotice />
      <main id="main" className="main-content">{children}</main>
      <SiteFooter />
    </>
  );
}
