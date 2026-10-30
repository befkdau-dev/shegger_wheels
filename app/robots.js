import { SITE_URL } from '@/lib/site';

// Crawler guidance only. It is NOT access control: these pages are guarded by the demo role checks.
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/cars'],
        disallow: ['/dashboard', '/bookings', '/checkout', '/owner', '/admin', '/signin', '/signup'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
