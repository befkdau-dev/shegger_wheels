import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';

export const metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="main-content">
        <div className="container container-narrow" style={{ paddingTop: 64 }}>
          <div className="card center stack">
            <p className="badge badge-grey badge-plain" style={{ margin: '0 auto' }}>Error 404</p>
            <h1>We could not find that page</h1>
            <p className="muted">The address may be mistyped or the page may have moved.</p>
            <div className="row" style={{ justifyContent: 'center' }}>
              <Link className="btn btn-primary" href="/">Go home</Link>
              <Link className="btn btn-outline" href="/cars">Browse cars</Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
