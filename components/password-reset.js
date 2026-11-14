'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api, useApp } from './providers';
import { KeyRound, CheckCircle2, ArrowRight, ArrowLeft, Eye, EyeOff, Mail, ShieldCheck, Lock } from 'lucide-react';

const STEPS = [
  { id: 'email', label: 'Email', num: 1 },
  { id: 'verify', label: 'Verify', num: 2 },
  { id: 'newPassword', label: 'New Password', num: 3 },
];

export function ForgotPasswordPage() {
  const { toast } = useApp();
  const [step, setStep] = useState('email'); // 'email' | 'verify' | 'newPassword' | 'done'
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function requestCode(targetEmail) {
    setBusy(true);
    setError('');
    try {
      await api('auth/forgot-password', {
        method: 'POST',
        body: { email: targetEmail },
      });
      setCode('');
      setCooldown(60);
      setStep('verify');
      toast('Verification code sent to your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    const cleaned = email.trim().toLowerCase();
    if (!cleaned) {
      setError('Please enter your email address.');
      return;
    }
    setEmail(cleaned);
    await requestCode(cleaned);
  }

  async function handleVerifySubmit(e) {
    e.preventDefault();
    setError('');
    const cleanedCode = code.trim();
    if (!/^\d{6}$/.test(cleanedCode)) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setBusy(true);
    try {
      await api('auth/verify-reset-code', {
        method: 'POST',
        body: { email, code: cleanedCode },
      });
      setStep('newPassword');
      toast('Code verified. Please set your new password.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 10) {
      setError('Password must be at least 10 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setBusy(true);
    try {
      await api('auth/reset-password', {
        method: 'POST',
        body: { email, code: code.trim(), password },
      });
      setStep('done');
      toast('Password updated successfully. You can now log in.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const currentStepIndex = step === 'done' ? 3 : STEPS.findIndex((s) => s.id === step);

  return (
    <section className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-stone-50 to-stone-100/80 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200/90 shadow-xl shadow-stone-200/50 p-7 sm:p-9">
        {/* Header Badge & Stepper */}
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#163e35]/10 text-[#163e35]">
            <KeyRound size={15} />
            <span className="text-xs font-bold uppercase tracking-wider">Password Recovery</span>
          </div>
          <span className="text-xs font-medium text-stone-400">
            {step === 'done' ? 'Completed' : `Step ${currentStepIndex + 1} of 3`}
          </span>
        </div>

        {step !== 'done' && (
          <div className="grid grid-cols-3 gap-2 mb-7">
            {STEPS.map((s, idx) => {
              const isDone = idx < currentStepIndex;
              const isActive = idx === currentStepIndex;
              return (
                <div key={s.id} className="flex flex-col gap-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-colors ${
                      isDone || isActive ? 'bg-[#163e35]' : 'bg-stone-200'
                    }`}
                  />
                  <span
                    className={`text-[11px] font-semibold ${
                      isActive ? 'text-[#163e35]' : isDone ? 'text-stone-600' : 'text-stone-400'
                    }`}
                  >
                    {s.num}. {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {step === 'email' && (
          <>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight mb-1.5">
              Forgot password
            </h1>
            <p className="text-sm text-stone-500 mb-6 leading-relaxed">
              Enter your registered email address and we will send a 6-digit verification code to your email.
            </p>

            {error && (
              <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 whitespace-pre-line">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleEmailSubmit}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={200}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@example.com"
                    className="w-full pl-11 pr-4 py-3 border border-stone-300 rounded-xl text-sm text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#163e35]/20 focus:border-[#163e35] transition-all"
                  />
                </div>
                <p className="mt-1.5 text-xs text-stone-400">
                  Use the email address associated with your account.
                </p>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[#163e35] hover:bg-[#204e43] text-white font-semibold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? 'Sending...' : (
                  <>
                    Send Verification Code <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-[#163e35] transition-colors"
                >
                  <ArrowLeft size={15} /> Back to login
                </Link>
              </div>
            </form>
          </>
        )}

        {step === 'verify' && (
          <>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight mb-1.5">
              Enter code
            </h1>
            <p className="text-sm text-stone-500 mb-5 leading-relaxed">
              We sent a 6-digit verification code to <strong className="text-stone-800">{email}</strong>. Check your inbox and enter it below.
            </p>

            {error && (
              <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 whitespace-pre-line">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleVerifySubmit}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Verification code
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input
                    name="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={6}
                    pattern="\d{6}"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter Code"
                    className="w-full pl-11 pr-4 py-3 border border-stone-300 rounded-xl text-base font-mono tracking-[0.25em] text-stone-900 bg-white placeholder-stone-400 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[#163e35]/20 focus:border-[#163e35] transition-all"
                  />
                </div>
                <p className="mt-1.5 text-xs text-stone-400">Valid for 10 minutes.</p>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[#163e35] hover:bg-[#204e43] text-white font-semibold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? 'Verifying...' : (
                  <>
                    Verify code <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs sm:text-sm gap-3">
                <button
                  type="button"
                  disabled={busy || cooldown > 0}
                  onClick={() => requestCode(email)}
                  className="font-semibold text-[#163e35] hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setError('');
                    setCode('');
                    setStep('email');
                  }}
                  className="text-stone-500 hover:text-stone-800 cursor-pointer"
                >
                  Change email
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'newPassword' && (
          <>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight mb-1.5">
              Set new password
            </h1>
            <p className="text-sm text-stone-500 mb-6 leading-relaxed">
              Code verified. Choose a new password for <strong className="text-stone-800">{email}</strong>.
            </p>

            {error && (
              <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 whitespace-pre-line">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={10}
                    maxLength={100}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter at least 10 characters"
                    className="w-full pl-11 pr-11 py-3 border border-stone-300 rounded-xl text-sm text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#163e35]/20 focus:border-[#163e35] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Confirm new password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={10}
                    maxLength={100}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    className="w-full pl-11 pr-11 py-3 border border-stone-300 rounded-xl text-sm text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#163e35]/20 focus:border-[#163e35] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full mt-2 bg-[#163e35] hover:bg-[#204e43] text-white font-semibold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? 'Updating...' : (
                  <>
                    Reset Password <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {step === 'done' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#163e35]/10 text-[#163e35] flex items-center justify-center mx-auto">
              <CheckCircle2 size={34} />
            </div>
            <h2 className="text-2xl font-bold text-stone-900">Password updated!</h2>
            <p className="text-sm text-stone-500 max-w-xs mx-auto leading-relaxed">
              Your password has been updated. You can now log in with your new password.
            </p>
            <div className="pt-3">
              <Link
                href="/login"
                className="w-full bg-[#163e35] hover:bg-[#204e43] text-white font-semibold py-3.5 px-6 rounded-xl transition-colors inline-flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                Log in now <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function ResetPasswordPage() {
  const { toast } = useApp();
  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code') || searchParams.get('token') || '';

  const [code, setCode] = useState(codeParam);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const codeVal = form.get('code')?.toString().trim();
    const password = form.get('password')?.toString();
    const confirm = form.get('confirmPassword')?.toString();

    if (!codeVal || !/^\d{6}$/.test(codeVal)) {
      setError('Please enter a valid verification code.');
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
        body: { code: codeVal, password },
      });
      setSuccess(true);
      toast('Your password has been updated successfully. Please log in with your new password.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-stone-50 to-stone-100/80 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200/90 shadow-xl shadow-stone-200/50 p-7 sm:p-9">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#163e35]/10 text-[#163e35] mb-5">
          <KeyRound size={15} />
          <span className="text-xs font-bold uppercase tracking-wider">Password Recovery</span>
        </div>

        <h1 className="text-2xl font-bold text-stone-900 tracking-tight mb-1.5">Create new password</h1>
        <p className="text-sm text-stone-500 mb-6">Enter your verification code and choose a new password.</p>

        {error && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 whitespace-pre-line">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#163e35]/10 text-[#163e35] flex items-center justify-center mx-auto">
              <CheckCircle2 size={34} />
            </div>
            <h3 className="text-xl font-bold text-stone-900">Password updated!</h3>
            <p className="text-sm text-stone-500">
              Your password has been changed. You can now log into your account with your new credentials.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="w-full bg-[#163e35] hover:bg-[#204e43] text-white font-semibold py-3.5 px-6 rounded-xl transition-colors inline-flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                Log in now <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Verification code
              </label>
              <input
                name="code"
                inputMode="numeric"
                maxLength={6}
                pattern="\d{6}"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                placeholder="Enter Code"
                className="w-full px-4 py-3 border border-stone-300 rounded-xl text-base font-mono tracking-[0.25em] text-stone-900 bg-white placeholder-stone-400 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[#163e35]/20 focus:border-[#163e35] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                New password
              </label>
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={10}
                maxLength={100}
                placeholder="Enter at least 10 characters"
                className="w-full px-4 py-3 border border-stone-300 rounded-xl text-sm text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#163e35]/20 focus:border-[#163e35] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Confirm new password
              </label>
              <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={10}
                maxLength={100}
                placeholder="Repeat your new password"
                className="w-full px-4 py-3 border border-stone-300 rounded-xl text-sm text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#163e35]/20 focus:border-[#163e35] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-[#163e35] hover:bg-[#204e43] text-white font-semibold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm text-sm cursor-pointer disabled:opacity-50"
            >
              {busy ? 'Updating...' : 'Update password'}
            </button>

            <p className="text-sm text-stone-500 mt-4 text-center">
              Remember your password?{' '}
              <Link href="/login" className="font-semibold text-[#163e35] hover:underline">
                Log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
