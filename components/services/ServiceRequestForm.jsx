'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  MapPin,
  User,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Wrench,
  ArrowRight,
  ChevronDown,
  Check
} from 'lucide-react';
import { api } from '@/components/providers';

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
  const serviceOptions = useMemo(() => {
    const base = category?.serviceOptions && category.serviceOptions.length > 0
      ? category.serviceOptions
      : ['General Consultation / Inspection', 'Standard Repair', 'Maintenance Service'];
    return base.includes('Others') ? base : [...base, 'Others'];
  }, [category]);

  const [serviceType, setServiceType] = useState(
    selectedServicePreload && serviceOptions.includes(selectedServicePreload)
      ? selectedServicePreload
      : serviceOptions[0] || ''
  );
  const [customService, setCustomService] = useState('');
  const [city, setCity] = useState(initialCity || '');
  const [cityOpen, setCityOpen] = useState(false);
  const cityRef = useRef(null);

  const [description, setDescription] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

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

  // Click outside listener for the city dropdown popover
  useEffect(() => {
    function handleClickOutside(event) {
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setCityOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const dynamicPlaceholder = useMemo(() => {
    if (serviceType === 'Others') {
      return `Describe what you need or any specific instructions for this service...`;
    }
    if (category?.servicePlaceholders && category.servicePlaceholders[serviceType]) {
      return category.servicePlaceholders[serviceType];
    }
    return (
      category?.defaultPlaceholder ||
      `Briefly describe what you need for ${serviceType || category?.label || 'this service'}...`
    );
  }, [category, serviceType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCityOpen(false);
    setErrorMessage('');

    if (!serviceType) {
      setErrorMessage('Please select a service type.');
      return;
    }
    if (serviceType === 'Others' && !customService.trim()) {
      setErrorMessage('Please specify what service you need.');
      return;
    }
    if (!city) {
      setErrorMessage('Please select your city.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please describe your requirement or problem.');
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
      const finalServiceType = serviceType === 'Others'
        ? (customService.trim() ? `Other (${customService.trim()})` : 'Others')
        : serviceType;

      const payload = {
        category: category?.label || 'General Service',
        categorySlug: category?.slug || 'general',
        serviceType: finalServiceType,
        description: description.trim(),
        city,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: fullName,
        phone: cleanPhone,
        email: email.trim() || undefined
      };

      const res = await api('service-requests', {
        method: 'POST',
        body: payload
      });

      setSubmittedData({
        requestId: res.requestId || 'SR-' + Date.now().toString().slice(-6),
        serviceType: finalServiceType,
        city,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: fullName,
        phone: cleanPhone
      });
    } catch (err) {
      setErrorMessage(err.message || 'Unable to submit your service request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setDescription('');
    setCustomService('');
    setCity(initialCity || '');
    setFirstName('');
    setLastName('');
    setPhone('');
    setEmail('');
    setErrorMessage('');
    if (onResetPreload) onResetPreload();
  };

  // SUCCESS STATE
  if (submittedData) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xl p-4 sm:p-5 text-center animate-fadeIn w-full max-w-[420px] ml-auto">
        <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 size={22} />
        </div>
        <span className="inline-block px-2 py-0.5 bg-forest/10 text-forest text-[10px] font-bold rounded-full uppercase tracking-wider mb-1">
          Request Confirmed
        </span>
        <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
          Request Submitted!
        </h3>
        <p className="text-xs text-stone-600 mt-0.5 max-w-xs mx-auto">
          A verified {category?.label || 'service'} specialist will contact you shortly.
        </p>

        <div className="mt-3 bg-stone-50 rounded-xl p-2.5 text-left border border-stone-200/80 text-xs space-y-1">
          <div className="flex justify-between items-center pb-1 border-b border-stone-200">
            <span className="text-stone-500 font-medium text-[11px]">Ref ID</span>
            <span className="font-mono font-bold text-forest bg-forest/5 px-1.5 py-0.5 rounded border border-forest/20 text-[10.5px]">
              {submittedData.requestId}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500 text-[11px]">Customer</span>
            <span className="font-medium text-stone-800 text-[11px]">{submittedData.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500 text-[11px]">Service</span>
            <span className="font-medium text-stone-800 truncate max-w-[170px] text-[11px]">{submittedData.serviceType}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500 text-[11px]">City</span>
            <span className="font-medium text-stone-800 text-[11px]">{submittedData.city}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500 text-[11px]">Phone</span>
            <span className="font-medium text-stone-800 text-[11px]">+91 {submittedData.phone}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="mt-3 w-full py-2 px-3 rounded-lg font-semibold text-xs bg-forest text-white hover:bg-[#114032] transition-colors shadow-sm cursor-pointer"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  // COMPACT, HIGH-VISIBILITY FORM CARD
  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xl p-3.5 sm:p-4 relative w-full max-w-[420px] ml-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-stone-100">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight leading-tight">
            Tell Us What You Need
          </h2>
          <p className="text-[10.5px] text-stone-500 leading-tight">
            Get matched with verified {category?.label?.toLowerCase() || 'service'} pros
          </p>
        </div>
        <div className="flex items-center gap-1 text-forest text-[10px] font-bold tracking-wider uppercase bg-forest/10 px-2 py-0.5 rounded-full shrink-0">
          <Wrench size={11} className="text-forest" />
          <span>Quick Book</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-start gap-1.5">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2 text-left">
        {/* Row 1: Service Type & City (2 Columns) */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10.5px] font-semibold text-stone-700 mb-0.5">
              Service <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full h-8 px-2 pr-6 rounded-lg border border-stone-300 bg-stone-50/50 text-stone-900 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest transition-colors appearance-none cursor-pointer truncate"
                required
              >
                {serviceOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-stone-500">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          <div ref={cityRef} className="relative">
            <label className="block text-[10.5px] font-semibold text-stone-700 mb-0.5">
              City <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setCityOpen((prev) => !prev)}
              className="w-full h-8 px-2 pl-6 pr-5 rounded-lg border border-stone-300 bg-stone-50/50 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest transition-colors flex items-center justify-between cursor-pointer"
            >
              <MapPin size={12} className="absolute left-2 text-stone-400 pointer-events-none" />
              <span className={`truncate text-xs ${!city ? 'text-stone-400 font-normal' : 'text-stone-900 font-medium'}`}>
                {city || 'Search City'}
              </span>
              <ChevronDown
                size={12}
                className={`text-stone-400 transition-transform duration-200 pointer-events-none shrink-0 ${
                  cityOpen ? 'rotate-180 text-forest' : ''
                }`}
              />
            </button>

            {/* Compact City Dropdown Menu: Shows only actual cities */}
            {cityOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-stone-200/90 p-1 z-50 max-h-48 overflow-y-auto animate-fadeIn">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCity(c);
                      setCityOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 text-left text-xs font-medium flex items-center justify-between rounded-md hover:bg-forest/10 hover:text-forest transition-colors cursor-pointer ${
                      city === c ? 'bg-forest/10 text-forest font-bold' : 'text-stone-700'
                    }`}
                  >
                    <span>{c}</span>
                    {city === c && <Check size={12} className="text-forest shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* If 'Others' is selected, show custom service input */}
        {serviceType === 'Others' && (
          <div className="animate-fadeIn">
            <label className="block text-[10.5px] font-semibold text-stone-700 mb-0.5">
              Specify Other Service <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={customService}
              onChange={(e) => setCustomService(e.target.value)}
              placeholder="Type the service you need..."
              className="w-full h-8 px-2 rounded-lg border border-stone-300 bg-stone-50/50 text-stone-900 text-xs placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest transition-colors"
              required
            />
          </div>
        )}

        {/* Row 2: Requirement Details */}
        <div>
          <label className="block text-[10.5px] font-semibold text-stone-700 mb-0.5">
            Requirement Details <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder={dynamicPlaceholder}
            className="w-full p-1.5 px-2 rounded-lg border border-stone-300 bg-stone-50/50 text-stone-900 text-xs placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest transition-colors resize-none leading-snug"
            required
          />
        </div>

        {/* Row 3: First Name & Last Name (2 Columns) */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10.5px] font-semibold text-stone-700 mb-0.5">
              First Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full h-8 px-2 pl-6 rounded-lg border border-stone-300 bg-stone-50/50 text-stone-900 text-xs placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest transition-colors"
                required
              />
              <User size={12} className="absolute left-2 top-2 text-stone-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[10.5px] font-semibold text-stone-700 mb-0.5">
              Last Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full h-8 px-2 pl-6 rounded-lg border border-stone-300 bg-stone-50/50 text-stone-900 text-xs placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest transition-colors"
                required
              />
              <User size={12} className="absolute left-2 top-2 text-stone-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 4: Phone Number & Email (2 Columns) */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10.5px] font-semibold text-stone-700 mb-0.5">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex">
              <span className="inline-flex items-center px-1.5 rounded-l-lg border border-r-0 border-stone-300 bg-stone-100 text-stone-600 text-[10.5px] font-semibold select-none">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit number"
                className="w-full h-8 px-1.5 rounded-r-lg border border-stone-300 bg-stone-50/50 text-stone-900 text-xs placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10.5px] font-semibold text-stone-700 mb-0.5">
              Email <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full h-8 px-2 pl-6 rounded-lg border border-stone-300 bg-stone-50/50 text-stone-900 text-xs placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest transition-colors"
              />
              <Mail size={12} className="absolute left-2 top-2 text-stone-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Submit CTA Button */}
        <div className="pt-1.5">
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-9 bg-[#16503e] hover:bg-[#114032] active:bg-[#0c2e24] disabled:opacity-70 text-white font-semibold text-xs sm:text-sm rounded-lg shadow hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin text-white" />
                <span>Finding Professional...</span>
              </>
            ) : (
              <>
                <span>Find a Professional</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </div>

        <p className="text-[9.5px] text-stone-400 text-center pt-0.5">
          🔒 Verified professionals only &bull; Free instant quote
        </p>
      </form>
    </div>
  );
}
