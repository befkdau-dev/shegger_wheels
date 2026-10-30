'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Field from '@/components/ui/Field';
import { Alert } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { homePathFor, safeReturnPath, signUp } from '@/lib/auth';

export default function SignUpClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const next = safeReturnPath(params.get('next'), '');
  const [values, setValues] = useState({ name: '', email: '', phone: '', alsoOwner: false });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setBusy(true);
    const res = signUp(values); // role is chosen by the helper; the form can never request admin
    setBusy(false);
    if (!res.ok) {
      setErrors(res.errors || {});
      setFormError(res.error);
      return;
    }
    toast(`Welcome, ${res.user.name.split(' ')[0]}! Your demo account is ready.`);
    router.push(next || homePathFor(res.user));
  };

  return (
    <div className="container container-narrow" style={{ paddingTop: 32 }}>
      <div className="card stack">
        <div>
          <h1 style={{ fontSize: '1.9rem' }}>Create a demo account</h1>
          <p className="muted mb-0">Takes ten seconds. Data stays in this browser; nothing is sent anywhere.</p>
        </div>
        {formError ? <Alert type="error" title="Please check the form"><p className="mb-0">{formError}</p></Alert> : null}
        <form onSubmit={submit} noValidate>
          <Field label="Full name" error={errors.name} required>
            {(p) => <input {...p} className="input" autoComplete="name" value={values.name} onChange={set('name')} />}
          </Field>
          <Field label="Email" error={errors.email} required hint="Used only to identify your demo account.">
            {(p) => <input {...p} className="input" type="email" autoComplete="email" value={values.email} onChange={set('email')} />}
          </Field>
          <Field label="Phone number" error={errors.phone} required hint="Example: +251911234567">
            {(p) => <input {...p} className="input" type="tel" autoComplete="tel" inputMode="tel" value={values.phone} onChange={set('phone')} />}
          </Field>
          <label className="check">
            <input type="checkbox" checked={values.alsoOwner} onChange={set('alsoOwner')} />
            <span>
              <strong>I also want to list my own car</strong>
              <span className="small muted" style={{ display: 'block' }}>Adds owner features to the same account. You can enable this later too.</span>
            </span>
          </label>
          <button type="submit" className="btn btn-accent btn-block btn-lg" disabled={busy} style={{ marginTop: 12 }}>
            Create account
          </button>
        </form>
        <p className="small mb-0">Already have an account? <Link href={next ? `/signin?next=${encodeURIComponent(next)}` : '/signin'}>Sign in</Link></p>
      </div>
    </div>
  );
}
