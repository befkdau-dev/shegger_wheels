import { publicSeedCars } from '@/lib/seed';
import { SITE_URL } from '@/lib/site';

// Generated at build time: public routes + seeded approved car URLs.
// Cars created in a visitor's browser are not (and cannot be) listed here.
export default function sitemap() {
  const now = new Date();
  const staticRoutes = ['', '/cars', '/signin', '/signup'].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: p === '' || p === '/cars' ? 'daily' : 'monthly',
    priority: p === '' ? 1 : p === '/cars' ? 0.9 : 0.3,
  }));
  const cars = publicSeedCars().map((car) => ({
    url: `${SITE_URL}/cars/${car.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));
  return [...staticRoutes, ...cars];
}
