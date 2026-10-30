import Link from 'next/link';
import CarForm from '@/components/owner/CarForm';

export const metadata = { title: 'List a car' };

export default function NewCarPage() {
  return (
    <div className="stack-lg">
      <div>
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/owner/cars">My cars</Link> / <span aria-current="page">New listing</span></nav>
        <h1>List a car</h1>
        <p className="muted mb-0">Submitted listings are reviewed by an admin before renters can see them.</p>
      </div>
      <CarForm />
    </div>
  );
}
