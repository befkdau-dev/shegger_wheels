'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Field from '@/components/ui/Field';
import { Alert, LoadingBlock } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { homePathFor, safeReturnPath, signInAsDemo, signInWithEmail } from '@/lib/auth';
import { initials } from '@/lib/format';
import { useAppData, useSession } from '@/lib/hooks';

export default function SignInClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const { user, isLoading } = useSession();
  const { users, isLoading: dataLoading } = useAppData();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  // next is validated before use, so ?next=https://evil.example or //evil.example can never redirect off-site.
  const rawNext = params.get('next');
  const next = safeReturnPath(rawNext, '');
  const target = (u) => next || homePathFor(u);

  useEffect(() => {
    if (!isLoading && user) router.replace(target(user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user]);

  const finish = (res) => {
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError('');
    toast(`Signed in as ${res.user.name}.`);
    router.push(target(res.user));
  };

  if (isLoading || dataLoading) {
    return (
      <div className="container container-narrow" style={{ paddingTop: 32 }}>
        <LoadingBlock label="Loading sign-in" rows={3} />
      </div>
    );
  }

  const roleLabel = (u) => (u.roles.includes('admin') ? 'Admin' : u.roles.includes('owner') ? 'Renter + owner' : 'Renter');

  return (
    <div className="container">
      <div className="auth-wrap">
        <div className="card stack">
          <div>
            <h1 style={{ fontSize: '1.9rem' }}>Sign in</h1>
            <p className="muted mb-0">Demo sign-in: there are no passwords. Enter the email of a demo account, or pick one on the right.</p>
          </div>
          {next ? (
            <Alert type="info" title="Sign in to continue">
              <p className="mb-0">You will go back to <code>{next}</code> afterwards.</p>
            </Alert>
          ) : null}
          {error ? <Alert type="error" title="Could not sign in"><p className="mb-0">{error}</p></Alert> : null}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              finish(signInWithEmail(email));
            }}
            noValidate
          >
            <Field label="Demo account email" required>
              {(p) => <input {...p} className="input" type="email" autoComplete="email" placeholder="meron@sheggar.demo" value={email} onChange={(e) => setEmail(e.target.value)} />}
            </Field>
            <button type="submit" className="btn btn-primary btn-block btn-lg">Sign in</button>
          </form>
          <p className="small mb-0">New here? <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : '/signup'}>Create a demo account</Link></p>
        </div>

        <div className="card stack">
          <div>
            <h2 style={{ fontSize: '1.2rem' }}>Quick demo accounts</h2>
            <p className="muted small mb-0">Each account has realistic seeded bookings, listings and reviews.</p>
          </div>
          <div className="demo-accounts">
            {users.map((u) => (
              <button key={u.id} type="button" className="demo-account" onClick={() => finish(signInAsDemo(u.id))}>
                <span className="avatar" aria-hidden="true">{initials(u.name)}</span>
                <span className="grow">
                  <strong>{u.name}</strong>
                  <small>{roleLabel(u)} · {u.email}</small>
                </span>
                {u.status === 'suspended' ? <span className="badge badge-red">Suspended</span> : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
