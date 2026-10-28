'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { api, useApp } from './providers';
import { Field, Image, Submit } from './ui';
import { ShieldCheck } from 'lucide-react';

export default function AuthPage({ register = false, adminLogin = false }) {
  const { setUser, toast } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const next = params.get('next');
  const isAdminLogin = adminLogin || next?.startsWith('/admin') || params.get('role') === 'admin';

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const input = Object.fromEntries(new FormData(e.currentTarget));
      const data = await api(`auth/${register ? 'register' : 'login'}`, {
        method: 'POST',
        body: input,
      });
      setUser(data.user);
      toast(
        register
          ? 'Welcome to your next chapter.'
          : data.user.role === 'admin'
          ? 'Welcome back, Administrator.'
          : 'Welcome back.'
      );

      // Best Practice: Admins go straight to /admin unless a specific next is requested
      const defaultDest = data.user.role === 'admin' ? '/admin' : '/dashboard';
      const destination = next && next.startsWith('/') && !next.startsWith('//') ? next : defaultDest;
      router.push(destination);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-art">
        <div>
          <p className="eyebrow">{isAdminLogin ? 'URBANFINDER ADMINISTRATION' : 'A PLACE FOR YOUR NEXT CHAPTER'}</p>
          <h2>{isAdminLogin ? 'Command Center.\nPlatform Control.' : 'Good homes.\nReal connections.'}</h2>
          <p className="muted mt-5 leading-7">
            {isAdminLogin
              ? 'Review property listings, manage verified service providers, and monitor channel partner compliance.'
              : 'Save the places you love, talk to owners and make your next move with confidence.'}
          </p>
        </div>
        <Image src="/photos/kitchen-1.jpg" alt="A warm inviting home interior" />
      </div>

      <div className="auth-form">
        <div className="flex items-center gap-2 mb-2">
          {isAdminLogin && (
            <span className="pill !bg-forest !text-white text-xs font-semibold flex items-center gap-1">
              <ShieldCheck size={13} /> Administrator Portal
            </span>
          )}
        </div>
        <h1>
          {register
            ? 'Make yourself at home.'
            : isAdminLogin
            ? 'Administrator Sign In'
            : 'Welcome home.'}
        </h1>
        <p className="muted mb-7">
          {register
            ? 'Create your UrbanFinder account.'
            : isAdminLogin
            ? 'Sign in with your administrative credentials.'
            : 'Log in to pick up where you left off.'}
        </p>

        {error && (
          <div role="alert" className="error mb-5 whitespace-pre-line">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={submit}>
          {register && (
            <Field label="Full name">
              <input name="name" autoComplete="name" required minLength={2} maxLength={80} />
            </Field>
          )}

          <Field label="Email address">
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={200}
              placeholder={isAdminLogin ? 'admin@urbanfinder.demo' : 'name@example.com'}
            />
          </Field>

          {register && (
            <Field label="Phone number">
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                pattern="\\+?[0-9\\s-]{10,16}"
                placeholder="10-digit mobile number"
              />
            </Field>
          )}

          <Field label="Password" hint={register ? 'Use at least 10 characters.' : undefined}>
            <input
              name="password"
              type="password"
              autoComplete={register ? 'new-password' : 'current-password'}
              required
              minLength={register ? 10 : 1}
              maxLength={100}
            />
          </Field>

          {register && (
            <Field label="I’m here to…">
              <select name="role" defaultValue={params.get('role') === 'owner' ? 'owner' : 'user'}>
                <option value="user">Find a home / explore interiors</option>
                <option value="owner">List and manage my property</option>
              </select>
            </Field>
          )}

          <Submit busy={busy}>{register ? 'Create account' : isAdminLogin ? 'Sign In as Admin' : 'Log in'}</Submit>
        </form>

        {!isAdminLogin && (
          <p className="text-sm muted mt-6">
            {register ? 'Already at home here?' : 'New to UrbanFinder?'}{' '}
            <Link
              className="text-link"
              href={`${register ? '/login' : '/register'}${
                params.get('next') ? `?next=${encodeURIComponent(params.get('next'))}` : ''
              }`}
            >
              {register ? 'Log in' : 'Create an account'}
            </Link>
          </p>
        )}

        {isAdminLogin && (
          <p className="text-xs muted mt-6">
            Looking for consumer login?{' '}
            <Link className="text-link !text-xs font-semibold" href="/login">
              Standard User Login →
            </Link>
          </p>
        )}

        {register && (
          <p className="text-xs muted mt-6 leading-5">
            By registering, you accept the{' '}
            <Link href="/about" className="underline">
              platform and privacy terms
            </Link>
            .
          </p>
        )}
      </div>
    </section>
  );
}
