import Link from 'next/link';
import { LogoMark } from '@/components/ui/Icons';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="logo" style={{ color: '#fff' }}>
              <LogoMark />
              <span>Sheggar <em>Wheels</em></span>
            </div>
            <p className="small" style={{ marginTop: 12, maxWidth: '38ch' }}>
              A peer-to-peer car rental marketplace for Addis Ababa. Rent a car from a neighbour, or earn from yours when it sits idle.
            </p>
          </div>
          <div>
            <h3>Renters</h3>
            <ul>
              <li><Link href="/cars">Browse cars</Link></li>
              <li><Link href="/signup">Create an account</Link></li>
              <li><Link href="/bookings">My trips</Link></li>
            </ul>
          </div>
          <div>
            <h3>Owners</h3>
            <ul>
              <li><Link href="/owner/cars/new">List your car</Link></li>
              <li><Link href="/owner/earnings">Earnings</Link></li>
              <li><Link href="/owner/reviews">Reviews</Link></li>
            </ul>
          </div>
          <div>
            <h3>Demo</h3>
            <ul>
              <li><Link href="/signin">Demo accounts</Link></li>
              <li><Link href="/admin">Admin demo</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            <strong style={{ color: 'var(--amber-400)' }}>DEMO DATA</strong> · Cars, people, payments and trip tracking are simulated. No real money or GPS.
          </span>
          <span>© Sheggar Wheels capstone project · IBT–QIYAS Full-Stack Program</span>
        </div>
      </div>
    </footer>
  );
}
