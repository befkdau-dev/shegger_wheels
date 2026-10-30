import { Suspense } from 'react';
import SignInClient from '@/components/auth/SignInClient';

export const metadata = {
  title: 'Sign in',
  description: 'Sign in to the Sheggar Wheels demo with a seeded renter, owner or admin account.',
  robots: { index: false, follow: true },
};

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInClient />
    </Suspense>
  );
}
