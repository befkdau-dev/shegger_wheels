import { Suspense } from 'react';
import SignUpClient from '@/components/auth/SignUpClient';

export const metadata = {
  title: 'Create an account',
  description: 'Create a free Sheggar Wheels demo account to rent cars or list your own.',
  robots: { index: false, follow: true },
};

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpClient />
    </Suspense>
  );
}
