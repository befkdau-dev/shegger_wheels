import Image from 'next/image';
import Link from 'next/link';
import FeaturedCars, { HomeStats } from '@/components/cars/FeaturedCars';
import HeroSearch from '@/components/cars/HeroSearch';
import { IconCalendar, IconCar, IconShield } from '@/components/ui/Icons';

export const metadata = {
  title: { absolute: 'Sheggar Wheels | Peer-to-peer car rental in Addis Ababa' },
  description:
    'Rent a car from a local owner in Addis Ababa, or earn from your own. Search by neighbourhood, compare prices and book with a simulated TeleBirr checkout.',
  alternates: { canonical: '/' },
};

// Static (prerendered) Server Component. Anything that depends on browser storage
// (stats, featured cars) lives in client islands below.
export default function HomePage() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero-grid">
          <div>
            <p className="badge badge-plain" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}>Addis Ababa · peer-to-peer</p>
            <h1 id="hero-title">
              Rent the car you need from <em>someone nearby</em>
            </h1>
            <p className="lead">
              Sheggar Wheels connects renters with local car owners. Compare prices, check availability and book in minutes, or put your own idle car to work.
            </p>
            <HeroSearch />
          </div>
          <div className="hero-art" aria-hidden="true">
            <Image src="/cars/car-001.svg" alt="" width={800} height={500} priority sizes="(max-width: 1024px) 0px, 520px" />
            <div className="hero-chip" style={{ left: -14, bottom: 28 }}>
              ETB 2,800<small>per day · Corolla</small>
            </div>
            <div className="hero-chip" style={{ right: -10, top: 22 }}>
              Bole pick-up<small>sample location</small>
            </div>
          </div>
        </div>
      </section>

      <HomeStats />

      <section className="section container" aria-labelledby="featured-title">
        <div className="section-head">
          <div>
            <h2 id="featured-title">Popular right now</h2>
            <p className="muted mb-0">Most-booked cars from our demo owners.</p>
          </div>
          <Link href="/cars" className="btn btn-ghost">Browse all cars →</Link>
        </div>
        <FeaturedCars />
      </section>

      <section className="section container" id="how-it-works" aria-labelledby="how-title">
        <div className="section-head">
          <h2 id="how-title">How Sheggar Wheels works</h2>
        </div>
        <ol className="steps" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li className="step">
            <IconCar width={28} height={28} style={{ color: 'var(--blue-600)' }} />
            <h3>Find a car</h3>
            <p className="muted mb-0">Filter by neighbourhood, price, seats and transmission, and see only cars free on your dates.</p>
          </li>
          <li className="step">
            <IconCalendar width={28} height={28} style={{ color: 'var(--blue-600)' }} />
            <h3>Request your dates</h3>
            <p className="muted mb-0">See the full price before you confirm, then authorise a demo TeleBirr payment. The owner approves or declines.</p>
          </li>
          <li className="step">
            <IconShield width={28} height={28} style={{ color: 'var(--blue-600)' }} />
            <h3>Drive and review</h3>
            <p className="muted mb-0">Pick up, enjoy the trip and leave an honest review. Issues go to our admin team for resolution.</p>
          </li>
        </ol>
      </section>

      <section className="section container" aria-labelledby="owner-cta">
        <div className="cta-band">
          <div>
            <h2 id="owner-cta">Own a car that sits idle?</h2>
            <p>Set your price and availability, approve the renters you trust and follow your earnings from one dashboard.</p>
          </div>
          <Link className="btn btn-accent btn-lg" href="/owner/cars/new">List your car</Link>
        </div>
      </section>
    </>
  );
}
