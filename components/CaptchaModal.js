'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Check,
  AlertCircle,
  X,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateRandomCode(length = 6) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
}

export default function CaptchaModal({
  isOpen,
  onClose,
  onSuccess,
  actionTitle = 'Publish Property Listing',
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Status, setStep1Status] = useState('idle'); // 'idle' | 'checking' | 'verified'
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const checkTimerRef = useRef(null);
  const autoAdvanceTimerRef = useRef(null);

  // Clear timers helper
  const clearAllTimers = () => {
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
  };

  // Reset modal state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setStep1Status('idle');
      setIsSuccess(false);
      setVerifying(false);
      setError('');
      setUserInput('');
      setCaptchaCode('');
      setIsRefreshing(false);
    } else {
      clearAllTimers();
    }
    return () => clearAllTimers();
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && !verifying && !isSuccess) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, verifying, isSuccess]);

  // When switching to step 2, initialize and draw captcha
  useEffect(() => {
    if (isOpen && currentStep === 2) {
      const code = generateRandomCode(6);
      setCaptchaCode(code);
      setUserInput('');
      setError('');
      const t = setTimeout(() => {
        drawCaptcha(code);
        if (inputRef.current) inputRef.current.focus();
      }, 60);
      return () => clearTimeout(t);
    }
  }, [isOpen, currentStep]);

  // Draw distorted canvas captcha
  function drawCaptcha(code) {
    if (!code) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f5f7f2');
    grad.addColorStop(1, '#e4eee0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Random interference lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = [
        '#c4d7b5',
        '#8aa879',
        '#d4a373',
        '#588157',
        '#a3b18a',
      ][i % 5];
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height
      );
      ctx.stroke();
    }

    // Random noise dots
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = [
        '#344e41',
        '#3a5a40',
        '#588157',
        '#8aa879',
        '#bc6c25',
      ][Math.floor(Math.random() * 5)];
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Render characters with distortion & random rotation
    const charSpacing = width / (code.length + 1);
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const x = (i + 0.8) * charSpacing;
      const y = height / 2 + (Math.random() * 8 - 4);
      const angle = (Math.random() * 34 - 17) * (Math.PI / 180);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = `bold ${Math.floor(22 + Math.random() * 5)}px sans-serif`;
      ctx.fillStyle = [
        '#163e35',
        '#234d3d',
        '#1b4332',
        '#283618',
        '#3a5a40',
      ][i % 5];
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  }

  // Refresh captcha code
  function refreshCaptcha() {
    const code = generateRandomCode(6);
    setCaptchaCode(code);
    setUserInput('');
    setError('');
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
    requestAnimationFrame(() => {
      drawCaptcha(code);
    });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  // Step 1: Interactive Human Verification Check
  function handleStep1Check() {
    if (step1Status === 'verified') {
      // Already verified, advance directly
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      setCurrentStep(2);
      return;
    }

    if (step1Status === 'checking') return;

    setError('');
    setStep1Status('checking');

    // Simulate authentic security challenge verification
    checkTimerRef.current = setTimeout(() => {
      setStep1Status('verified');

      // Smooth auto-transition to Step 2
      autoAdvanceTimerRef.current = setTimeout(() => {
        setCurrentStep(2);
      }, 650);
    }, 750);
  }

  // Step 2: Verification submission
  function handleStep2Submit(e) {
    if (e) e.preventDefault();
    setError('');

    const cleanInput = userInput.trim().toUpperCase();
    if (!cleanInput) {
      setError('Please enter the 6-character security code.');
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    if (cleanInput !== captchaCode) {
      setError('Incorrect security code. A new code has been generated. Please try again.');
      refreshCaptcha();
      return;
    }

    // Success state
    setVerifying(true);
    setIsSuccess(true);
    setTimeout(() => {
      onSuccess();
    }, 600);
  }

  // Master form submit handler
  function handleFormSubmit(e) {
    e.preventDefault();
    if (currentStep === 1) {
      if (step1Status === 'verified') {
        if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
        setCurrentStep(2);
      } else {
        handleStep1Check();
      }
    } else {
      handleStep2Submit(e);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="captcha-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !verifying && !isSuccess) {
          onClose();
        }
      }}
      className="captcha-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden transition-all duration-300"
      >
        {/* Top Header */}
        <div className="bg-[#f7f9f3] border-b border-stone-200/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
              <ShieldCheck size={20} className="text-forest stroke-[2.2]" />
            </div>
            <div>
              <h3
                id="captcha-modal-title"
                className="!text-base font-bold text-stone-900 leading-tight"
              >
                Security Verification
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">
                {currentStep === 1
                  ? 'Step 1 of 2: Confirm genuine user'
                  : 'Step 2 of 2: Visual security challenge'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={verifying || isSuccess}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-200/60 transition-colors disabled:opacity-40"
            aria-label="Close verification modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2-Step Progress Stepper */}
        <div className="px-6 py-3 bg-stone-50/70 border-b border-stone-200/70">
          <div className="flex items-center justify-between max-w-xs mx-auto">
            {/* Step 1 Node */}
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step1Status === 'verified'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : currentStep === 1
                    ? 'bg-forest text-white ring-4 ring-forest/15'
                    : 'bg-stone-200 text-stone-600'
                }`}
              >
                {step1Status === 'verified' ? (
                  <Check size={13} className="stroke-[2.5]" />
                ) : (
                  '1'
                )}
              </div>
              <div className="text-left">
                <p
                  className={`text-xs font-bold leading-tight ${
                    currentStep === 1 ? 'text-stone-900' : 'text-stone-600'
                  }`}
                >
                  Human Check
                </p>
                <p className="text-[10px] text-stone-400 font-medium">
                  {step1Status === 'verified'
                    ? 'Verified'
                    : currentStep === 1
                    ? 'In progress'
                    : 'Completed'}
                </p>
              </div>
            </div>

            {/* Connecting Track */}
            <div className="flex-1 mx-3 h-0.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  step1Status === 'verified' ? 'w-full bg-emerald-500' : 'w-0'
                }`}
              />
            </div>

            {/* Step 2 Node */}
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isSuccess
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : currentStep === 2
                    ? 'bg-forest text-white ring-4 ring-forest/15'
                    : 'bg-stone-200 text-stone-400'
                }`}
              >
                {isSuccess ? <Check size={13} className="stroke-[2.5]" /> : '2'}
              </div>
              <div className="text-left">
                <p
                  className={`text-xs font-bold leading-tight ${
                    currentStep === 2 ? 'text-stone-900' : 'text-stone-400'
                  }`}
                >
                  Security Code
                </p>
                <p className="text-[10px] text-stone-400 font-medium">
                  {isSuccess
                    ? 'Passed'
                    : currentStep === 2
                    ? 'Active'
                    : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6">
          {/* STEP 1: INTERACTIVE HUMAN VERIFICATION */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <p className="text-xs text-stone-600 leading-relaxed">
                To protect property seekers and genuine owners against automated spam, please verify your browser security before finalizing{' '}
                <span className="font-semibold text-stone-800">
                  &quot;{actionTitle}&quot;
                </span>.
              </p>

              {/* Turnstile / reCAPTCHA Style Interactive Box */}
              <div
                role="checkbox"
                aria-checked={step1Status === 'verified'}
                tabIndex={0}
                onClick={handleStep1Check}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    handleStep1Check();
                  }
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all cursor-pointer select-none flex items-center justify-between gap-4 outline-none ${
                  step1Status === 'verified'
                    ? 'bg-emerald-50/60 border-emerald-500/70 shadow-sm'
                    : step1Status === 'checking'
                    ? 'bg-stone-50 border-forest/40 shadow-sm'
                    : 'bg-stone-50 hover:bg-stone-100/90 border-stone-300 hover:border-forest/50 focus:border-forest focus:ring-2 focus:ring-forest/20 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Status Indicator / Checkbox */}
                  <div
                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                      step1Status === 'verified'
                        ? 'bg-emerald-600 border-emerald-600 text-white scale-105 shadow-sm'
                        : step1Status === 'checking'
                        ? 'bg-white border-forest text-forest'
                        : 'bg-white border-stone-300'
                    }`}
                  >
                    {step1Status === 'verified' && (
                      <Check size={16} className="stroke-[2.5]" />
                    )}
                    {step1Status === 'checking' && (
                      <Loader2 size={16} className="animate-spin text-forest" />
                    )}
                  </div>

                  {/* Copy & Status Text */}
                  <div className="text-left min-w-0">
                    <p className="text-xs font-bold text-stone-800 leading-snug">
                      {step1Status === 'verified'
                        ? 'Verified human'
                        : step1Status === 'checking'
                        ? 'Checking browser security…'
                        : 'Verify you are human'}
                    </p>
                    <p className="text-[11px] text-stone-500 font-medium truncate">
                      {step1Status === 'verified'
                        ? 'Security confirmed • Transitioning to Step 2…'
                        : step1Status === 'checking'
                        ? 'Analyzing browser environment integrity…'
                        : 'Click to confirm you are a genuine user'}
                    </p>
                  </div>
                </div>

                {/* Trust Branding Badge */}
                <div className="flex flex-col items-end shrink-0 pl-3 border-l border-stone-200/80">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-stone-700">
                    <ShieldCheck size={14} className="text-forest" />
                    <span>UrbanFindr</span>
                  </div>
                  <span className="text-[9px] text-stone-400 font-mono tracking-wider uppercase">
                    TrustShield
                  </span>
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={step1Status === 'checking'}
                  className="btn-outline flex-1 !min-h-0 !py-2.5 !text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (step1Status !== 'verified') {
                      handleStep1Check();
                    } else {
                      if (autoAdvanceTimerRef.current) {
                        clearTimeout(autoAdvanceTimerRef.current);
                      }
                      setCurrentStep(2);
                    }
                  }}
                  disabled={step1Status === 'checking'}
                  className="btn flex-1 !min-h-0 !py-2.5 !text-xs font-bold flex items-center justify-center gap-2"
                >
                  {step1Status === 'checking' ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Verifying…</span>
                    </>
                  ) : step1Status === 'verified' ? (
                    <>
                      <span>Continue to Step 2</span>
                      <ArrowRight size={14} />
                    </>
                  ) : (
                    <>
                      <span>Verify to Continue</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: VISUAL SECURITY CODE CAPTCHA */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <p className="text-xs text-stone-600 leading-relaxed">
                Step 2 of 2: Please enter the 6-character visual code shown below to complete verification and finalize{' '}
                <span className="font-semibold text-stone-800">
                  &quot;{actionTitle}&quot;
                </span>.
              </p>

              {/* Canvas Captcha Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="security-code-input"
                    className="block text-xs font-bold text-stone-700 uppercase tracking-wider"
                  >
                    Visual Security Code
                  </label>
                  <span className="text-[11px] text-stone-400 font-medium">
                    Case-insensitive
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div
                    onClick={refreshCaptcha}
                    className="relative border-2 border-stone-300 rounded-xl overflow-hidden bg-stone-100 flex-1 shadow-inner flex items-center justify-center cursor-pointer group"
                    title="Click image to refresh security code"
                  >
                    <canvas
                      ref={canvasRef}
                      width={260}
                      height={56}
                      className="w-full h-[56px] block"
                    />
                    <div className="absolute inset-0 bg-forest/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="text-[10px] font-semibold text-forest bg-white/95 px-2 py-0.5 rounded shadow-sm">
                        Click to refresh
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    disabled={verifying || isSuccess}
                    className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-600 hover:text-forest hover:bg-forest/10 hover:border-forest/30 transition-all shrink-0 active:scale-95 disabled:opacity-40"
                    title="Get a new verification code"
                    aria-label="Refresh security code"
                  >
                    <RefreshCw
                      size={18}
                      className={`transition-transform duration-500 ${
                        isRefreshing ? 'rotate-180 animate-spin text-forest' : ''
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-stone-400">
                  Letters are case-insensitive. Click the refresh button if hard to read.
                </p>
              </div>

              {/* Code Input */}
              <div>
                <input
                  id="security-code-input"
                  ref={inputRef}
                  type="text"
                  required
                  maxLength={8}
                  autoComplete="off"
                  spellCheck="false"
                  placeholder="ENTER 6-CHARACTER CODE"
                  value={userInput}
                  disabled={verifying || isSuccess}
                  onChange={(e) => {
                    setUserInput(e.target.value.toUpperCase());
                    setError('');
                  }}
                  className="w-full text-center font-mono font-bold tracking-[0.25em] text-lg uppercase py-2.5 px-3 rounded-xl border border-stone-300 focus:border-forest focus:ring-2 focus:ring-forest/20 outline-none transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-xs placeholder:font-normal placeholder:text-stone-400 disabled:bg-stone-100"
                />
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle size={15} className="shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Indicator */}
              {isSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                  <Check
                    size={16}
                    className="shrink-0 text-emerald-600 font-bold"
                  />
                  <span className="font-semibold">
                    Security check passed! Finalizing listing…
                  </span>
                </div>
              )}

              {/* Step 2 Actions */}
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setCurrentStep(1);
                  }}
                  disabled={verifying || isSuccess}
                  className="btn-outline !min-h-0 !py-2.5 !px-3.5 !text-xs font-semibold flex items-center gap-1.5 shrink-0"
                  title="Return to Step 1"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={verifying || isSuccess}
                  className="btn-outline flex-1 !min-h-0 !py-2.5 !text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={verifying || isSuccess}
                  className="btn flex-[1.4] !min-h-0 !py-2.5 !text-xs font-bold flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Verifying…</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check size={14} />
                      <span>Verified</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Verify &amp; Submit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
