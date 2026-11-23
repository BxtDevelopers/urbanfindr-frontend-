'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api, useApp } from '../providers';
import { cities, money } from '@/lib/format';
import { ALL_PROPERTY_TYPES, FURNISHING_OPTIONS } from '@/lib/propertyModel';
import {
  X,
  Bell,
  BellRing,
  Check,
  AlertCircle,
  Building,
  Home,
  MapPin,
  Sparkles,
  ShieldCheck,
  Mail
} from 'lucide-react';

export default function CreateAlertModal({
  isOpen,
  onClose,
  initialData = {},
  isEditing = false,
  alertId = null,
  onSaved
}) {
  const { user, toast } = useApp();

  const [name, setName] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [localities, setLocalities] = useState('');
  const [listingType, setListingType] = useState('buy');
  const [category, setCategory] = useState('Residential');
  const [propertyType, setPropertyType] = useState('');
  const [selectedBhk, setSelectedBhk] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [furnishing, setFurnishing] = useState('Any');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [inAppNotif, setInAppNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);
  const [frequency, setFrequency] = useState('instant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll and handle Escape key when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Format INR helper text
  function formatInrHelper(val) {
    const num = Number(val);
    if (!num || isNaN(num) || num <= 0) return '';
    return money(num);
  }

  // Pre-fill fields whenever modal opens or initialData changes
  useEffect(() => {
    if (!isOpen) return;

    setError('');
    const f = initialData.filters || initialData;

    // Resolve city
    const initCity = f.city || initialData.city || 'Hyderabad';
    setCity(initCity);

    // Resolve localities
    if (Array.isArray(f.localities)) {
      setLocalities(f.localities.join(', '));
    } else if (typeof f.locality === 'string') {
      setLocalities(f.locality);
    } else if (typeof f.localities === 'string') {
      setLocalities(f.localities);
    } else if (initialData.locality) {
      setLocalities(initialData.locality);
    } else {
      setLocalities('');
    }

    // Resolve listing type
    const initType = (f.listingType || f.purpose || initialData.purpose || 'buy').toLowerCase();
    setListingType(initType);

    // Resolve category
    setCategory(f.category || (initType === 'commercial' ? 'Commercial' : initType === 'pg' ? 'PG' : 'Residential'));

    // Resolve property type
    setPropertyType(f.propertyType || f.type || initialData.type || '');

    // Resolve BHK
    let bhkArr = [];
    if (Array.isArray(f.bhk)) {
      bhkArr = f.bhk.map(Number);
    } else if (f.bedrooms) {
      bhkArr = [Number(f.bedrooms)];
    } else if (initialData.bedrooms) {
      bhkArr = [Number(initialData.bedrooms)];
    }
    setSelectedBhk(bhkArr);

    // Resolve prices
    setMinPrice(f.minPrice !== null && f.minPrice !== undefined ? String(f.minPrice) : '');
    setMaxPrice(f.maxPrice !== null && f.maxPrice !== undefined ? String(f.maxPrice) : '');

    // Resolve furnishing
    setFurnishing(f.furnishing || initialData.furnishing || 'Any');

    // Resolve verified
    setVerifiedOnly(Boolean(f.verifiedOnly || f.verified || initialData.verified));

    // Resolve notification preferences
    const np = initialData.notificationPreferences || {};
    setInAppNotif(np.inApp !== false);
    setEmailNotif(Boolean(np.email));
    setFrequency(np.frequency === 'daily' ? 'daily' : 'instant');

    // Generate or set name
    if (isEditing && initialData.name) {
      setName(initialData.name);
    } else if (initialData.name || initialData.title) {
      setName(initialData.name || initialData.title);
    } else {
      // Generate intelligent default name
      const bhkText = bhkArr.length ? `${bhkArr.join('/')} BHK ` : '';
      const typeText = f.propertyType || f.type || (initType === 'rent' ? 'Rental' : 'Properties');
      const locText = f.locality || initialData.locality || '';
      const parts = [
        bhkText + typeText,
        locText ? `in ${locText}` : '',
        initCity ? `(${initCity})` : ''
      ].filter(Boolean);
      setName(parts.join(' ') || 'Smart Property Alert');
    }
  }, [isOpen, initialData, isEditing]);

  function toggleBhk(num) {
    if (selectedBhk.includes(num)) {
      setSelectedBhk(selectedBhk.filter(b => b !== num));
    } else {
      setSelectedBhk([...selectedBhk, num].sort());
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError('Please provide an alert name (at least 2 characters).');
      return;
    }

    const minNum = minPrice ? Number(minPrice) : null;
    const maxNum = maxPrice ? Number(maxPrice) : null;

    if (minNum !== null && minNum < 0) {
      setError('Minimum budget must be a positive number.');
      return;
    }
    if (maxNum !== null && maxNum < 0) {
      setError('Maximum budget must be a positive number.');
      return;
    }
    if (minNum !== null && maxNum !== null && minNum > maxNum) {
      setError('Minimum budget cannot exceed maximum budget.');
      return;
    }

    // Split localities
    const locArray = localities
      .split(',')
      .map(l => l.trim())
      .filter(Boolean);

    const payload = {
      name: trimmedName,
      filters: {
        city: city.trim(),
        localities: locArray,
        listingType,
        category,
        propertyType: propertyType || undefined,
        bhk: selectedBhk,
        minPrice: minNum,
        maxPrice: maxNum,
        furnishing,
        verifiedOnly
      },
      notificationPreferences: {
        inApp: inAppNotif,
        email: emailNotif,
        frequency
      }
    };

    setLoading(true);
    try {
      let result;
      if (isEditing && alertId) {
        result = await api(`property-alerts/${alertId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
        toast(`Alert "${trimmedName}" updated successfully.`);
      } else {
        result = await api('property-alerts', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        toast(`Smart Property Alert "${trimmedName}" created! We will notify you when new homes match.`);
      }

      if (onSaved) onSaved(result);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save property alert.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !mounted) return null;

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative my-auto bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#ecf2e4] text-[#163e35] flex items-center justify-center shadow-xs">
              <BellRing size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 leading-tight">
                {isEditing ? 'Edit Property Alert' : 'Create Smart Property Alert'}
              </h2>
              <p className="text-xs text-stone-500">
                Receive notifications whenever matching properties are newly listed
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 text-xs sm:text-sm">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Alert Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Alert Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={120}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. 3 BHK Apartments in Kondapur, Hyderabad"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#163e35] focus:ring-1 focus:ring-[#163e35] transition shadow-2xs"
            />
          </div>

          {/* Location: City and Localities */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">City</label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#163e35] transition shadow-2xs"
              >
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Localities (optional)
              </label>
              <input
                type="text"
                value={localities}
                onChange={e => setLocalities(e.target.value)}
                placeholder="e.g. Kondapur, Gachibowli"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#163e35] transition shadow-2xs"
              />
            </div>
          </div>

          {/* Listing Type & Category */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Listing Type</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-xl">
                {[
                  { id: 'buy', label: 'Buy' },
                  { id: 'rent', label: 'Rent' },
                  { id: 'any', label: 'Any' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setListingType(item.id)}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      listingType === item.id
                        ? 'bg-white text-[#163e35] shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Property Type</label>
              <select
                value={propertyType}
                onChange={e => setPropertyType(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#163e35] transition shadow-2xs"
              >
                <option value="">Any Property Type</option>
                {ALL_PROPERTY_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* BHK Multi-Select */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Bedrooms (BHK)
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { num: 1, label: '1 BHK' },
                { num: 2, label: '2 BHK' },
                { num: 3, label: '3 BHK' },
                { num: 4, label: '4 BHK' },
                { num: 5, label: '5+ BHK' }
              ].map(b => {
                const isSelected = selectedBhk.includes(b.num);
                return (
                  <button
                    key={b.num}
                    type="button"
                    onClick={() => toggleBhk(b.num)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-[#163e35] text-white border-[#163e35] shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
              {selectedBhk.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedBhk([])}
                  className="text-xs text-stone-400 hover:text-stone-600 px-2 py-1.5 transition"
                >
                  Clear BHK
                </button>
              )}
            </div>
          </div>

          {/* Budget Range (INR) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-stone-700">
                Budget Range (₹)
              </label>
              {(minPrice || maxPrice) && (
                <span className="text-[11px] font-medium text-[#163e35]">
                  {minPrice ? formatInrHelper(minPrice) : '₹0'} – {maxPrice ? formatInrHelper(maxPrice) : 'No Max'}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  placeholder="Min Price (e.g. 5000000)"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#163e35] transition shadow-2xs"
                />
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  placeholder="Max Price (e.g. 12000000)"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#163e35] transition shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Furnishing & Verified Filter */}
          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Furnishing</label>
              <select
                value={furnishing}
                onChange={e => setFurnishing(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#163e35] transition shadow-2xs"
              >
                <option value="Any">Any Furnishing</option>
                {FURNISHING_OPTIONS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2.5 cursor-pointer mt-5 sm:mt-4">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={e => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-[#163e35] focus:ring-[#163e35] border-stone-300"
                />
                <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-700" />
                  Verified Properties Only
                </span>
              </label>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="border-t border-stone-200/80 pt-4 space-y-2.5">
            <span className="block text-xs font-bold text-stone-900 uppercase tracking-wide">
              Alert Notification Preferences
            </span>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50 transition">
                <input
                  type="checkbox"
                  checked={inAppNotif}
                  onChange={e => setInAppNotif(e.target.checked)}
                  className="w-4 h-4 rounded text-[#163e35] focus:ring-[#163e35]"
                />
                <div>
                  <span className="block text-xs font-bold text-stone-900 flex items-center gap-1">
                    <Bell size={13} className="text-[#163e35]" /> In-App Notifications
                  </span>
                  <span className="text-[11px] text-stone-500">Live alerts in your dashboard</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50 transition">
                <input
                  type="checkbox"
                  checked={emailNotif}
                  onChange={e => setEmailNotif(e.target.checked)}
                  className="w-4 h-4 rounded text-[#163e35] focus:ring-[#163e35]"
                />
                <div>
                  <span className="block text-xs font-bold text-stone-900 flex items-center gap-1">
                    <Mail size={13} className="text-[#163e35]" /> Email Alerts
                  </span>
                  <span className="text-[11px] text-stone-500">Receive alerts in your inbox</span>
                </div>
              </label>
            </div>

            {/* Frequency Selection */}
            <div className="flex items-center gap-4 pt-1">
              <span className="text-xs font-semibold text-stone-600">Frequency:</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-stone-700">
                <input
                  type="radio"
                  name="alert-freq"
                  value="instant"
                  checked={frequency === 'instant'}
                  onChange={() => setFrequency('instant')}
                  className="text-[#163e35] focus:ring-[#163e35]"
                />
                Instant
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-stone-700">
                <input
                  type="radio"
                  name="alert-freq"
                  value="daily"
                  checked={frequency === 'daily'}
                  onChange={() => setFrequency('daily')}
                  className="text-[#163e35] focus:ring-[#163e35]"
                />
                Daily Digest
              </label>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-stone-200/80 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-[#163e35] text-white hover:bg-[#205246] transition shadow-sm disabled:opacity-50"
            >
              <Bell size={13} />
              {loading ? 'Saving Alert...' : isEditing ? 'Save Changes' : 'Create Property Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
}
