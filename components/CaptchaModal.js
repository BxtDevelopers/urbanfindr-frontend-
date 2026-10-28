'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Check,
  AlertCircle,
  X,
  Lock,
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
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isHumanChecked, setIsHumanChecked] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);

  // Generate & render captcha on canvas
  function refreshCaptcha() {
    const code = generateRandomCode(6);
    setCaptchaCode(code);
    setUserInput('');
    setError('');
    drawCaptcha(code);
  }

  function drawCaptcha(code) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f4f6f0');
    grad.addColorStop(1, '#e5ede0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Random interference lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = [
        '#c4d7b5',
        '#8aa879',
        '#e0a96d',
        '#718355',
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
      const angle = (Math.random() * 36 - 18) * (Math.PI / 180);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = `bold ${Math.floor(22 + Math.random() * 6)}px sans-serif`;
      ctx.fillStyle = [
        '#1f3322',
        '#2d5032',
        '#1b4332',
        '#283618',
        '#606c38',
      ][i % 5];
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  }

  // Initialize on open
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsHumanChecked(false);
      setVerifying(false);
      setError('');
      // Small delay to ensure canvas is mounted
      const t = setTimeout(() => {
        refreshCaptcha();
        if (inputRef.current) inputRef.current.focus();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleVerify(e) {
    e.preventDefault();
    setError('');

    if (!isHumanChecked) {
      setError('Please check the verification box to confirm you are human.');
      return;
    }

    const cleanInput = userInput.trim().toUpperCase();
    if (!cleanInput) {
      setError('Please enter the 6-character security code.');
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    if (cleanInput !== captchaCode) {
      setError('Incorrect security code. A new code has been generated.');
      refreshCaptcha();
      return;
    }

    // Success!
    setVerifying(true);
    setIsSuccess(true);
    setTimeout(() => {
      onSuccess();
    }, 600);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="captcha-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#f7f9f3] border-b border-stone-200/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center">
              <ShieldCheck size={20} className="text-forest stroke-[2.2]" />
            </div>
            <div>
              <h3 id="captcha-title" className="!text-base font-bold text-stone-900 leading-tight">
                Security Verification
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">
                Anti-bot security check before listing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-200/60 transition-colors"
            aria-label="Close verification modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleVerify} className="p-6 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed">
            To maintain listing authenticity and protect against automated spam, please complete this quick verification to finalize <span className="font-semibold text-stone-800">&quot;{actionTitle}&quot;</span>.
          </p>

          {/* Interactive Checkbox */}
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isHumanChecked}
                onChange={(e) => {
                  setIsHumanChecked(e.target.checked);
                  setError('');
                }}
                className="w-5 h-5 rounded border-stone-300 text-forest focus:ring-forest accent-forest cursor-pointer"
              />
              <span className="text-xs font-semibold text-stone-800">
                I am not a robot (genuine user)
              </span>
            </label>
            <Lock size={15} className="text-stone-400" />
          </div>

          {/* Canvas Captcha Box */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Verification Code
            </label>
            <div className="flex items-center gap-2">
              <div className="relative border-2 border-stone-300 rounded-xl overflow-hidden bg-stone-100 flex-1 shadow-inner flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={220}
                  height={54}
                  className="w-full h-[54px] block cursor-pointer"
                  onClick={refreshCaptcha}
                  title="Click to refresh image"
                />
              </div>

              <button
                type="button"
                onClick={refreshCaptcha}
                className="p-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-600 hover:text-forest hover:bg-forest/10 hover:border-forest/30 transition-all shrink-0"
                title="Get a new verification code"
                aria-label="Refresh security code"
              >
                <RefreshCw size={17} />
              </button>
            </div>
            <p className="text-[11px] text-stone-400">
              Letters are case-insensitive. Click the refresh button if hard to read.
            </p>
          </div>

          {/* Code Input */}
          <div>
            <input
              ref={inputRef}
              type="text"
              required
              maxLength={8}
              autoComplete="off"
              spellCheck="false"
              placeholder="Enter the 6-character code"
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value.toUpperCase());
                setError('');
              }}
              className="w-full text-center font-mono font-bold tracking-[0.25em] text-lg uppercase py-2.5 px-3 rounded-xl border border-stone-300 focus:border-forest focus:ring-2 focus:ring-forest/20 outline-none transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-xs placeholder:font-normal"
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
              <Check size={16} className="shrink-0 text-emerald-600 font-bold" />
              <span className="font-semibold">Security check passed! Publishing listing…</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={verifying}
              className="btn-outline flex-1 !min-h-0 !py-2.5 !text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={verifying || isSuccess}
              className="btn flex-1 !min-h-0 !py-2.5 !text-xs font-bold flex items-center justify-center gap-2"
            >
              {verifying ? (
                <span>Submitting…</span>
              ) : (
                <>
                  <Check size={14} />
                  <span>Verify &amp; Publish</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

