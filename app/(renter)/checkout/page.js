import CheckoutClient from '@/components/bookings/CheckoutClient';

export const metadata = { title: 'Checkout', robots: { index: false, follow: false } };

// Client-driven: the checkout draft lives in sessionStorage, which the server cannot read.
export default function CheckoutPage() {
  return <CheckoutClient />;
}
