'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Check,
  Sparkles
} from 'lucide-react';
import { api, useApp } from '@/components/providers';

const CITIES = [
  'Bengaluru',
  'Hyderabad',
  'Mumbai',
  'Pune',
  'Chennai',
  'Delhi NCR',
  'Gurugram',
  'Kolkata'
];

export default function ServiceRequestForm({
  category,
  initialCity = '',
  selectedServicePreload = '',
  onResetPreload
}) {
  const { user } = useApp();

  const serviceOptions = useMemo(() => {
    return category?.serviceOptions && category.serviceOptions.length > 0
      ? category.serviceOptions
      : ['General Consultation / Inspection', 'Standard Repair', 'Maintenance Service'];
  }, [category]);

  // Form Fields: Service Type, Address, City, First Name, Last Name, Mobile Number
  const [serviceType, setServiceType] = useState(
    selectedServicePreload && serviceOptions.includes(selectedServicePreload)
      ? selectedServicePreload
      : serviceOptions[0] || ''
  );
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(initialCity || 'Bengaluru');
  const [firstName, setFirstName] = useState(user?.name ? user.name.split(' ')[0] : '');
  const [lastName, setLastName] = useState(user?.name ? user.name.split(' ').slice(1).join(' ') : '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedData, setSubmittedData] = useState(null);

  useEffect(() => {
    if (selectedServicePreload && serviceOptions.includes(selectedServicePreload)) {
      setServiceType(selectedServicePreload);
    }
  }, [selectedServicePreload, serviceOptions]);

  useEffect(() => {
    if (initialCity) {
      setCity(initialCity);
    }
  }, [initialCity]);

  // Handle Single Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!serviceType) {
      setErrorMessage('Please select a service type.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Please enter your house/flat or street address.');
      return;
    }
    if (!city) {
      setErrorMessage('Please select your city.');
      return;
    }
    if (!firstName.trim()) {
      setErrorMessage('Please enter your first name.');
      return;
    }
    if (!lastName.trim()) {
      setErrorMessage('Please enter your last name.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const payload = {
        category: category?.label || 'General Service',
        categorySlug: category?.slug || 'general',
        serviceType,
        description: `Doorstep service booking for ${serviceType} in ${city}.`,
        address: address.trim(),
        city,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: fullName,
        phone: cleanPhone,
        email: user?.email || undefined
      };

      const res = await api('service-requests', {
        method: 'POST',
        body: payload
      });

      const quote = res.item?.quotation || {
        amount: 599,
        inspectionFee: 199,
        laborCost: 400,
        tax: 108,
        notes: 'Doorstep diagnostic inspection and expert service labor.'
      };

      setSubmittedData({
        requestId: res.requestId || res.item?.requestId || 'SR-' + Date.now().toString().slice(-6),
        serviceType,
        city,
        address: address.trim(),
        name: fullName,
        phone: cleanPhone,
        quotation: quote,
        status: res.item?.status || 'quotation'
      });
    } catch (err) {
      setErrorMessage(err.message || 'Unable to submit your service request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const [acceptingQuote, setAcceptingQuote] = useState(false);

  const handleAcceptQuotation = async () => {
    if (!submittedData?.requestId) return;
    setAcceptingQuote(true);
    setErrorMessage('');
    try {
      await api(`service-requests/${submittedData.requestId}`, {
        method: 'PATCH',
        body: {
          action: 'accept',
          quotationId: submittedData.quotation?.id,
          acceptedQuotation: submittedData.quotation
        }
      });
      setSubmittedData(prev => ({
        ...prev,
        status: 'accepted'
      }));
    } catch (err) {
      setErrorMessage(err.message || 'Unable to accept quotation.');
    } finally {
      setAcceptingQuote(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setAddress('');
    setErrorMessage('');
    if (onResetPreload) onResetPreload();
  };

  // SUCCESS STATE: Instant Quotation & One-Click Acceptance
  if (submittedData) {
    const isAccepted = submittedData.status === 'accepted';
    const activeQuotation = submittedData.quotation;

    return (
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xl p-5 sm:p-6 text-center animate-fadeIn w-full max-w-[420px] ml-auto">
        {isAccepted ? (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 size={26} />
            </div>
            <span className="inline-block px-3 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider mb-1 border border-emerald-300">
              ✓ Service Accepted
            </span>
            <h3 className="text-lg font-bold text-stone-900 tracking-tight">
              Quotation Accepted &amp; Service Confirmed!
            </h3>
            <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto">
              Your service quotation is confirmed. A certified technician will be assigned to visit your address in <strong>{submittedData.city}</strong>.
            </p>

            <div className="mt-4 bg-emerald-50/50 rounded-xl p-3.5 text-left border border-emerald-200 text-xs space-y-2">
              <div className="flex justify-between items-center pb-1.5 border-b border-emerald-100">
                <span className="text-stone-500 text-[11px]">Booking Reference</span>
                <span className="font-mono font-bold text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                  {submittedData.requestId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500 text-[11px]">Service</span>
                <span className="font-semibold text-stone-900 truncate max-w-[190px]">{submittedData.serviceType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500 text-[11px]">Address</span>
                <span className="font-medium text-stone-800 truncate max-w-[190px]">{submittedData.address}, {submittedData.city}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500 text-[11px]">Final Quotation Amount</span>
                <span className="font-bold text-emerald-800 text-[12px] font-mono">
                  ₹{Number(activeQuotation?.amount || 599).toLocaleString('en-IN')}
                </span>
              </div>
              {activeQuotation?.warranty && (
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 text-[11px]">Coverage Guarantee</span>
                  <span className="font-medium text-emerald-700 text-[11px]">{activeQuotation.warranty}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1 border-t border-emerald-100">
                <span className="text-stone-500 text-[11px]">Status</span>
                <span className="font-bold text-emerald-700 text-[11px]">Service Accepted</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500 text-[11px]">Payment</span>
                <span className="font-medium text-stone-700 text-[11px]">Pay After Service (Cash / UPI)</span>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <Link
                href="/dashboard/bookings"
                className="w-full py-2.5 px-4 bg-[#163e35] hover:bg-[#204e43] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                Track in My Bookings <ArrowRight size={13} />
              </Link>
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2 px-3 text-stone-600 hover:text-stone-900 text-xs font-medium cursor-pointer"
              >
                Book Another Service
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mx-auto mb-2">
              <Sparkles size={24} />
            </div>
            <span className="inline-block px-2.5 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold rounded-full uppercase tracking-wider mb-1">
              Service Requested · Quotation Ready
            </span>
            <h3 className="text-lg font-bold text-stone-900 tracking-tight">
              Official Service Quotation
            </h3>
            <p className="text-xs text-stone-600 mt-0.5 max-w-xs mx-auto">
              Review your service quotation below and accept to confirm service.
            </p>

            {/* Quotation Card */}
            <div className="mt-3.5 bg-gradient-to-br from-emerald-50/50 via-white to-sky-50/30 rounded-xl p-3.5 text-left border border-emerald-200/90 shadow-xs space-y-2.5">
              <div className="flex justify-between items-baseline pb-2 border-b border-stone-200">
                <div>
                  <span className="text-xs font-bold text-stone-800 block">Total Service Quotation</span>
                  <span className="text-[10px] text-stone-500">Includes all taxes &amp; inspection</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-emerald-800 font-mono">
                    ₹{Number(activeQuotation?.amount || 599).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-stone-400 block font-normal">(incl. GST)</span>
                </div>
              </div>

              <div className="text-[11px] space-y-1 text-stone-600">
                <div className="flex justify-between">
                  <span>Doorstep Diagnostic &amp; Visit Fee:</span>
                  <span className="font-semibold text-stone-800">
                    ₹{activeQuotation?.inspectionFee || 199}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Service Labor Charge:</span>
                  <span className="font-semibold text-stone-800">
                    ₹{activeQuotation?.laborCost || 400}
                  </span>
                </div>
              </div>

              {activeQuotation?.warranty && (
                <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50/70 px-2 py-1 rounded-lg border border-emerald-100">
                  <span>🛡️</span>
                  <span>{activeQuotation.warranty}</span>
                </div>
              )}

              {activeQuotation?.notes && (
                <div className="pt-2 border-t border-stone-100 text-[10px] text-stone-500 leading-relaxed bg-white/70 p-2 rounded-lg border border-stone-100">
                  <strong className="text-stone-700 block mb-0.5">Scope &amp; Inclusions:</strong>
                  {activeQuotation.notes}
                </div>
              )}

              <div className="pt-1.5 flex justify-between items-center text-[10px] text-stone-500">
                <span>Ref ID: <strong className="font-mono text-stone-700">{submittedData.requestId}</strong></span>
                <span>City: <strong className="text-stone-700">{submittedData.city}</strong></span>
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded-lg border border-red-200 text-left">
                {errorMessage}
              </p>
            )}

            {/* Accept Quotation Button */}
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={handleAcceptQuotation}
                disabled={acceptingQuote}
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {acceptingQuote ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Accepting Quotation...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Accept Quotation &amp; Confirm Service</span>
                  </>
                )}
              </button>

              <Link
                href="/dashboard/bookings"
                className="w-full py-2 px-3 text-stone-600 hover:text-stone-900 text-xs font-medium flex items-center justify-center gap-1 cursor-pointer"
              >
                View in My Bookings <ArrowRight size={12} />
              </Link>
            </div>
          </>
        )}
      </div>
    );
  }

  // SINGLE FORM (NO STEP 1 / STEP 2)
  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xl overflow-hidden w-full max-w-[420px] ml-auto">
      {/* Header */}
      <div className="p-4 sm:p-5 pb-3 border-b border-stone-100">
        <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
          Book {category?.label || 'Service'}
        </h3>
        <p className="text-xs text-stone-500 mt-0.5">
          Fill in your details below for an instant service quotation.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mx-4 mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Single Form with exact requested fields */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-5 pt-3 space-y-3">
        {/* 1. Select Service Type */}
        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1">
            Select Service Type *
          </label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#163e35]"
          >
            {serviceOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Address */}
        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1">
            Address *
          </label>
          <input
            type="text"
            required
            placeholder="House / Flat / Street Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#163e35]"
          />
        </div>

        {/* 3. City */}
        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1">
            City *
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-2.5 py-2 border border-stone-300 rounded-lg text-xs bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#163e35]"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* 4 & 5. First Name & Last Name */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100">
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              First Name *
            </label>
            <input
              type="text"
              required
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#163e35]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              required
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#163e35]"
            />
          </div>
        </div>

        {/* 6. Mobile Number */}
        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1">
            Mobile Number *
          </label>
          <input
            type="tel"
            required
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#163e35]"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 py-2.5 px-4 bg-[#163e35] hover:bg-[#204e43] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Submitting Request...
            </>
          ) : (
            <>
              <Check size={14} /> Confirm Service Booking
            </>
          )}
        </button>
      </form>
    </div>
  );
}
