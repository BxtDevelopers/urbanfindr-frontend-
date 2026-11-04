'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Check,
  Phone,
  MessageCircle,
  FileSpreadsheet,
  Clock,
  MapPin,
  Calendar
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

  // Form Fields: Service Type, Contact Preference, Locality, City, First Name, Last Name, Mobile Number, Requirement
  const [serviceType, setServiceType] = useState(
    selectedServicePreload && serviceOptions.includes(selectedServicePreload)
      ? selectedServicePreload
      : serviceOptions[0] || ''
  );
  const [contactPreference, setContactPreference] = useState('call'); // 'call' | 'message' | 'quote'
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState(initialCity || 'Bengaluru');
  const [firstName, setFirstName] = useState(user?.name ? user.name.split(' ')[0] : '');
  const [lastName, setLastName] = useState(user?.name ? user.name.split(' ').slice(1).join(' ') : '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [customerMessage, setCustomerMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedData, setSubmittedData] = useState(null);

  // Helper for quotation acceptance workflow if direct quotation option is used
  const handleAcceptQuotation = async (quotationId) => {
    // Official Service Quotation: Accept Quotation &amp; Confirm Service -> Service Accepted
    try {
      if (submittedData?._id) {
        await api(`service-requests/${submittedData._id}`, {
          method: 'PATCH',
          body: { action: 'accept', quotationId }
        });
      }
    } catch (e) {}
  };

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

  // Handle Form Submission - Directly Sends Service Request to Specialists
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!serviceType) {
      setErrorMessage('Please select a service type.');
      return;
    }
    if (!locality.trim()) {
      setErrorMessage('Please enter your locality or area.');
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
        contactPreference,
        customerMessage: customerMessage.trim(),
        description: customerMessage.trim() || `Service request for ${serviceType} in ${locality.trim()}, ${city}.`,
        locality: locality.trim(),
        address: locality.trim(),
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

      setSubmittedData({
        requestId: res.requestId || res.item?.requestId || 'SR-' + Date.now().toString().slice(-6),
        serviceType,
        category: category?.label || 'Service',
        city,
        locality: locality.trim(),
        name: fullName,
        phone: cleanPhone,
        contactPreference,
        customerMessage: customerMessage.trim(),
        status: 'submitted'
      });
    } catch (err) {
      setErrorMessage(err.message || 'Unable to submit your service request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setLocality('');
    setCustomerMessage('');
    setErrorMessage('');
    if (onResetPreload) onResetPreload();
  };

  // SUCCESS STATE: Service Request Sent (Pending Specialist Contact/Offer)
  if (submittedData) {
    const isCall = submittedData.contactPreference === 'call';
    const isMessage = submittedData.contactPreference === 'message';
    const isQuote = submittedData.contactPreference === 'quote' || submittedData.contactPreference === 'direct_quotation';

    return (
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xl p-5 sm:p-6 text-center animate-fadeIn w-full max-w-[420px] ml-auto">
        <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 size={26} />
        </div>
        <span className="inline-block px-3 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider mb-1 border border-emerald-300">
          ✓ Request Sent Successfully
        </span>
        <h3 className="text-lg font-bold text-stone-900 tracking-tight">
          Your Request Has Been Sent!
        </h3>
        <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto">
          {isCall && `Thank you, ${submittedData.name.split(' ')[0]}! Our certified ${submittedData.category} specialist will receive your request and call you on ${submittedData.phone} with service details and an offer.`}
          {isMessage && `Thank you, ${submittedData.name.split(' ')[0]}! Our certified ${submittedData.category} specialist will receive your request and message you on WhatsApp at ${submittedData.phone} with details.`}
          {isQuote && `Thank you, ${submittedData.name.split(' ')[0]}! Our verified specialists will review your requirements and share an offer.`}
        </p>

        {/* Request Details Card */}
        <div className="mt-4 bg-emerald-50/50 rounded-xl p-3.5 text-left border border-emerald-200 text-xs space-y-2">
          <div className="flex justify-between items-center pb-1.5 border-b border-emerald-100">
            <span className="text-stone-500 text-[11px]">Request Reference</span>
            <span className="font-mono font-bold text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
              {submittedData.requestId}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500 text-[11px]">Service Requested</span>
            <span className="font-semibold text-stone-900 truncate max-w-[200px]">{submittedData.serviceType}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500 text-[11px]">Contact Preference</span>
            <span className="font-bold text-emerald-800 text-[11px] inline-flex items-center gap-1">
              {isCall && <Phone size={12} />}
              {isMessage && <MessageCircle size={12} />}
              {isQuote && <FileSpreadsheet size={12} />}
              {isCall ? 'Phone Call' : isMessage ? 'Message / Chat' : 'Direct Quotation'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500 text-[11px]">Service Locality</span>
            <span className="font-medium text-stone-800 truncate max-w-[200px]">{submittedData.locality}, {submittedData.city}</span>
          </div>
          {submittedData.customerMessage && (
            <div className="pt-1.5 border-t border-emerald-100 text-[11px]">
              <span className="text-stone-500 block mb-0.5">Your Note:</span>
              <p className="text-stone-800 bg-white/70 p-1.5 rounded border border-emerald-100 italic">
                &ldquo;{submittedData.customerMessage}&rdquo;
              </p>
            </div>
          )}
          <div className="flex justify-between items-center pt-1 border-t border-emerald-100">
            <span className="text-stone-500 text-[11px]">Request Status</span>
            <span className="font-bold text-emerald-700 text-[11px] bg-emerald-100 px-2 py-0.5 rounded-full">
              Request Sent • Pending Specialist Response
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <Link
            href="/dashboard/bookings"
            className="w-full py-2.5 px-4 bg-[#163e35] hover:bg-[#204e43] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            Track in My Requests <ArrowRight size={13} />
          </Link>
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-2 px-3 text-stone-600 hover:text-stone-900 text-xs font-medium cursor-pointer"
          >
            Send Another Request
          </button>
        </div>
      </div>
    );
  }

  // SERVICE REQUEST FORM
  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xl overflow-hidden w-full max-w-[420px] ml-auto">
      {/* Header */}
      <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-b border-stone-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-stone-900 leading-tight">
            Request {category?.label || 'Service'}
          </h3>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Verified doorstep specialist • Direct Connect
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
          Send Request
        </span>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mx-4 mt-2 p-2 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-1.5">
          <AlertCircle size={14} className="shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Request Form */}
      <form onSubmit={handleSubmit} className="p-3.5 sm:p-4 space-y-2.5">
        {/* 1. Select Service Type */}
        <div>
          <label className="block text-xs font-semibold text-stone-800 mb-1">
            Select Service Type *
          </label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#163e35]"
          >
            {serviceOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Customer Contact Preference: Call / Message / Direct Quotation */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-stone-700">
              How would you like to connect? *
            </label>
            <span className="text-[10px] text-stone-500">
              {contactPreference === 'call' ? 'Specialist calls you' : contactPreference === 'message' ? 'WhatsApp message' : 'Upfront price quote'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setContactPreference('call')}
              className={`py-1.5 px-1.5 rounded-lg border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                contactPreference === 'call'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-1 ring-emerald-500 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Phone size={12} className={contactPreference === 'call' ? 'text-emerald-700' : 'text-stone-500'} />
              <span className="text-xs">Phone Call</span>
            </button>

            <button
              type="button"
              onClick={() => setContactPreference('message')}
              className={`py-1.5 px-1.5 rounded-lg border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                contactPreference === 'message'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-1 ring-emerald-500 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <MessageCircle size={12} className={contactPreference === 'message' ? 'text-emerald-700' : 'text-stone-500'} />
              <span className="text-xs">Message</span>
            </button>

            <button
              type="button"
              onClick={() => setContactPreference('quote')}
              className={`py-1.5 px-1.5 rounded-lg border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                contactPreference === 'quote'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-1 ring-emerald-500 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <FileSpreadsheet size={12} className={contactPreference === 'quote' ? 'text-emerald-700' : 'text-stone-500'} />
              <span className="text-xs">Direct Quote</span>
            </button>
          </div>
        </div>

        {/* 3 & 4. Locality & City (Side by Side) */}
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-7 sm:col-span-8">
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Locality / Area *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Indiranagar, Whitefield..."
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#163e35]"
            />
          </div>
          <div className="col-span-5 sm:col-span-4">
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              City *
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#163e35]"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 5 & 6. First Name & Last Name (Side by Side) */}
        <div className="grid grid-cols-2 gap-2">
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

        {/* 7 & 8. Mobile Number & Requirement Details (Side by Side) */}
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-5 sm:col-span-6">
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              required
              placeholder="10-digit mobile"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#163e35]"
            />
          </div>
          <div className="col-span-7 sm:col-span-6">
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Requirement (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Repair, fitting, check..."
              value={customerMessage}
              onChange={(e) => setCustomerMessage(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#163e35]"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-1.5 py-2.5 px-4 bg-[#163e35] hover:bg-[#204e43] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Sending Service Request...
            </>
          ) : (
            <>
              <Check size={14} /> Send Service Request
            </>
          )}
        </button>
      </form>
    </div>
  );
}
