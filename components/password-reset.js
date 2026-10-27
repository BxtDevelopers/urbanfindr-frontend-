'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, useApp } from './providers';
import { Field, Image, Submit } from './ui';
import { KeyRound, Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export function ForgotPasswordPage() {
  const { toast } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState('');
  const [demoToken, setDemoToken] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const email = form.get('email')?.toString().trim();
    setEmailSubmitted(email);

    try {
      const res = await api('auth/forgot-password', {
        method: 'POST',
        body: { email },
      });
      setSent(true);
      // In dev or demo mode, backend might return preview token
      if (res.token) {
        setDemoToken(res.token);
      }
      toast('Instructions to reset your password have been generated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-art">
        <div>
          <p className="eyebrow">ACCOUNT RECOVERY</p>
          <h2>Regain access to your account.</h2>
          <p className="muted mt-5 leading-7">
            Forgot your password? No problem. Enter the email address associated with your UrbanFinder account, and we will help you reset it securely.
          </p>
        </div>
        <Image src="/photos/living-1.jpg" alt="Calm home living room" />
      </div>

      <div className="auth-form">
        <div className="max-w-md w-full">
          <div className="flex items-center gap-2 mb-2 text-forest">
            <KeyRound size={24} />
            <span className="text-sm font-bold uppercase tracking-wider">Password Assistance</span>
          </div>

          <h1 className="!text-3xl font-semibold mb-2">Reset your password</h1>
          <p className="muted mb-6">
            Enter your email to receive recovery instructions.
          </p>

          {error && (
            <div role="alert" className="error mb-5 whitespace-pre-line">
              {error}
            </div>
          )}

          {sent ? (
            <div className="panel space-y-4 border border-forest/20 bg-lime/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-forest mt-0.5" size={22} />
                <div>
                  <h3 className="text-forest text-lg">Check your email</h3>
                  <p className="text-sm muted mt-1">
                    If an account exists for <strong>{emailSubmitted}</strong>, we have sent instructions to reset your password.
                  </p>
                </div>
              </div>

              {demoToken && (
                <div className="p-3 bg-white rounded border border-line text-xs font-mono break-all mt-2">
                  <p className="text-forest font-bold mb-1">Development Demo Token:</p>
                  <code>{demoToken}</code>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/reset-password${demoToken ? `?token=${encodeURIComponent(demoToken)}` : ''}`}
                  className="btn text-sm w-full sm:w-auto"
                >
                  Enter reset token <ArrowRight size={14} />
                </Link>
                <Link href="/login" className="btn-outline text-sm w-full sm:w-auto">
                  Back to login
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={submit}>
              <Field label="Email address" hint="The email associated with your account">
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={200}
                    placeholder="e.g. name@example.com"
                  />
                </div>
              </Field>

              <Submit busy={busy}>Send reset instructions</Submit>

              <div className="pt-4 border-t border-line flex items-center justify-between text-sm">
                <Link href="/login" className="text-link">
                  ← Back to login
                </Link>
                <Link href="/reset-password" className="muted hover:text-forest">
                  Have a reset code?
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export function ResetPasswordPage() {
  const { toast } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenParam);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const tokenVal = form.get('token')?.toString().trim();
    const password = form.get('password')?.toString();
    const confirm = form.get('confirmPassword')?.toString();

    if (!tokenVal) {
      setError('Please provide a valid reset token or code.');
      setBusy(false);
      return;
    }

    if (password.length < 10) {
      setError('Password must be at least 10 characters long.');
      setBusy(false);
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match. Please re-enter.');
      setBusy(false);
      return;
    }

    try {
      await api('auth/reset-password', {
        method: 'POST',
        body: { token: tokenVal, password },
      });
      setSuccess(true);
      toast('Your password has been reset successfully. Please log in with your new password.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-art">
        <div>
          <p className="eyebrow">CHOOSE NEW PASSWORD</p>
          <h2>Secure your account.</h2>
          <p className="muted mt-5 leading-7">
            Create a strong, unique password with at least 10 characters to protect your listings, saved searches, and inquiries.
          </p>
        </div>
        <Image src="/photos/bedroom-1.jpg" alt="Secure and peaceful home bedroom" />
      </div>

      <div className="auth-form">
        <div className="max-w-md w-full">
          <h1 className="!text-3xl font-semibold mb-2">Create new password</h1>
          <p className="muted mb-6">Enter your security token and choose a new password.</p>

          {error && (
            <div role="alert" className="error mb-5 whitespace-pre-line">
              {error}
            </div>
          )}

          {success ? (
            <div className="panel space-y-4 border border-forest/20 bg-lime/20 text-center py-8">
              <CheckCircle2 className="text-forest mx-auto" size={40} />
              <h3 className="text-forest text-xl">Password updated!</h3>
              <p className="text-sm muted">
                Your password has been changed. You can now log into your account with your new credentials.
              </p>
              <div className="pt-2">
                <Link href="/login" className="btn inline-flex">
                  Log in now <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={submit}>
              <Field label="Reset token / code" hint="Sent to your registered email address">
                <input
                  name="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  placeholder="Paste your reset token here"
                />
              </Field>

              <Field label="New password" hint="Minimum 10 characters">
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={10}
                  maxLength={100}
                  placeholder="Enter at least 10 characters"
                />
              </Field>

              <Field label="Confirm new password">
                <input
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={10}
                  maxLength={100}
                  placeholder="Repeat your new password"
                />
              </Field>

              <Submit busy={busy}>Update password</Submit>

              <p className="text-sm muted mt-6 text-center">
                Remember your password?{' '}
                <Link href="/login" className="text-link">
                  Log in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

