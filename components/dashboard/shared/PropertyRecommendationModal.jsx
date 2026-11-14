'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Send,
  Building2,
  MapPin,
  Tag,
  Phone,
  Mail,
  MessageCircle,
  Smartphone,
  Bell,
  Sparkles,
  CheckCircle2,
  Loader2,
  RotateCcw,
  FileText,
  ChevronDown
} from 'lucide-react';
import { api, useApp } from '@/components/providers';
import { money } from '@/lib/format';

export default function PropertyRecommendationModal({
  isOpen,
  onClose,
  client,
  onSuccess
}) {
  const { toast } = useApp();

  const [properties, setProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');

  // Typable & editable property fields
  const [propertyTitle, setPropertyTitle] = useState('');
  const [propertyPrice, setPropertyPrice] = useState('');
  const [propertyLocation, setPropertyLocation] = useState('');
  const [propertyDescription, setPropertyDescription] = useState('');

  const [showSuggestions, setShowSuggestions] = useState(false);
  const propertyInputRef = useRef(null);

  const [channel, setChannel] = useState('whatsapp'); // 'whatsapp' | 'email' | 'sms' | 'in_app'
  const [personalMessage, setPersonalMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(null);

  // Fetch properties for dropdown suggestions
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    async function loadProperties() {
      setLoadingProps(true);
      try {
        let res = await api('properties?mine=true&limit=100');
        let list = res?.items || [];
        if (list.length === 0) {
          const fallbackRes = await api('properties?limit=50&status=approved');
          list = fallbackRes?.items || [];
        }
        if (active) {
          setProperties(list);
        }
      } catch (err) {
        if (active) setProperties([]);
      } finally {
        if (active) setLoadingProps(false);
      }
    }
    loadProperties();
    return () => {
      active = false;
    };
  }, [isOpen]);

  // Click outside to close listings suggestions
  useEffect(() => {
    function handleClickOutside(e) {
      if (propertyInputRef.current && !propertyInputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter listings based on what broker types
  const filteredListings = useMemo(() => {
    if (!propertyTitle.trim()) return properties;
    const q = propertyTitle.toLowerCase().trim();
    return properties.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.locality || '').toLowerCase().includes(q) ||
        (p.city || '').toLowerCase().includes(q)
    );
  }, [properties, propertyTitle]);

  // Reset form when modal opens so it starts clean
  useEffect(() => {
    if (isOpen) {
      setSelectedPropertyId('');
      setPropertyTitle('');
      setPropertyPrice('');
      setPropertyLocation('');
      setPropertyDescription('');
      setPersonalMessage('');
      setChannel('whatsapp');
      setSentSuccess(null);
      setShowSuggestions(false);
    }
  }, [isOpen, client]);

  // Optional helper for broker: fill a template message based on current inputs
  const handleFillTemplate = () => {
    const clientName = client?.name || 'Valued Client';
    const title = propertyTitle.trim() || 'a new property';
    const loc = propertyLocation.trim() ? ` in ${propertyLocation.trim()}` : '';
    const pr = propertyPrice.trim() ? ` priced at ${propertyPrice.trim()}` : '';

    setPersonalMessage(
      `Hi ${clientName}, based on your previous property purchase with us, I found this new property that might interest you: "${title}"${loc}${pr}. Let me know if you would like complete details or a walkthrough!`
    );
  };

  if (!isOpen || !client) return null;

  const customerName = client.name || 'Valued Client';
  const customerContact = [client.phone, client.email].filter(Boolean).join(' • ') || 'Contact on file';

  async function handleSend(e) {
    if (e) e.preventDefault();
    const finalTitle = propertyTitle.trim();
    if (!finalTitle) {
      toast('Please enter or select the property to recommend.');
      return;
    }
    if (!personalMessage.trim()) {
      toast('Please enter your recommendation message for the buyer.');
      return;
    }

    setBusy(true);
    try {
      const selectedProp = properties.find((p) => String(p._id) === String(selectedPropertyId));

      await api('leads/recommend', {
        method: 'POST',
        body: {
          leadId: client.leadId || client._id,
          customerId: client.customerId || client.user?._id || client.user,
          customerName,
          customerPhone: client.phone || '',
          customerEmail: client.email || '',
          propertyId: selectedProp?._id || undefined,
          propertyTitle: finalTitle,
          propertyPrice: propertyPrice.trim(),
          propertyLocation: propertyLocation.trim(),
          propertyDescription: propertyDescription.trim(),
          channel,
          message: personalMessage.trim()
        }
      });

      const cleanPhone = (client.phone || '').replace(/[^0-9]/g, '');
      const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(personalMessage.trim())}`;
      const mailtoUrl = `mailto:${client.email || ''}?subject=${encodeURIComponent(
        `New Property Recommendation: ${finalTitle}`
      )}&body=${encodeURIComponent(personalMessage.trim())}`;
      const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(personalMessage.trim())}`;

      setSentSuccess({
        channel,
        customerName,
        propertyTitle: finalTitle,
        waUrl,
        mailtoUrl,
        smsUrl
      });

      if (channel === 'whatsapp' && cleanPhone) {
        window.open(waUrl, '_blank');
      }

      toast(`Recommendation dispatched to ${customerName} via ${channel.toUpperCase()}!`);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast(err.message || 'Failed to send recommendation.');
    } finally {
      setBusy(false);
    }
  }

  const channels = [
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, activeClass: 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/30' },
    { id: 'email', name: 'Email', icon: Mail, activeClass: 'bg-sky-700 text-white border-sky-700 ring-2 ring-sky-600/30' },
    { id: 'sms', name: 'SMS', icon: Smartphone, activeClass: 'bg-violet-700 text-white border-violet-700 ring-2 ring-violet-600/30' }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header - Fixed & Compact */}
        <div className="px-5 py-3 bg-gradient-to-r from-stone-900 to-emerald-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Sparkles size={15} />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Recommend Property</h3>
              <p className="text-[11px] text-stone-300 leading-none mt-0.5">Direct suggestion to {customerName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>

        {/* Content Body */}
        {sentSuccess ? (
          <div className="p-6 text-center space-y-3.5 overflow-y-auto">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-4 ring-emerald-50">
              <CheckCircle2 size={26} />
            </div>
            <div>
              <h4 className="text-base font-bold text-stone-900">Recommendation Dispatched!</h4>
              <p className="text-xs text-stone-600 mt-1">
                <span className="font-semibold text-stone-900">{sentSuccess.propertyTitle}</span> recommended to{' '}
                <span className="font-semibold text-stone-900">{sentSuccess.customerName}</span> via{' '}
                <span className="font-bold text-emerald-700 uppercase">{sentSuccess.channel}</span>.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {sentSuccess.channel === 'whatsapp' && (
                <a
                  href={sentSuccess.waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <MessageCircle size={14} /> Open WhatsApp
                </a>
              )}
              {sentSuccess.channel === 'email' && (
                <a
                  href={sentSuccess.mailtoUrl}
                  className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Mail size={14} /> Open Email
                </a>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs">
              {/* Buyer Information Chip */}
              <div className="px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] shrink-0">
                    {customerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-stone-900 mr-1.5">{customerName}</span>
                    {client.hasClosedDeal && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase tracking-wide">
                        Previous Buyer
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-stone-500 truncate shrink-0">{customerContact}</span>
              </div>

              {/* Enter a Property (Directly Typable with Searchable Listings Suggestions) */}
              <div ref={propertyInputRef} className="relative">
                <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Building2 size={12} className="text-forest" /> Enter a Property *
                  </span>
                  {propertyTitle && (
                    <button
                      type="button"
                      onClick={() => {
                        setPropertyTitle('');
                        setPropertyPrice('');
                        setPropertyLocation('');
                        setPropertyDescription('');
                        setSelectedPropertyId('');
                      }}
                      className="text-[10px] text-stone-400 hover:text-stone-700 font-semibold cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={propertyTitle}
                    onFocus={() => setShowSuggestions(true)}
                    onChange={(e) => {
                      setPropertyTitle(e.target.value);
                      setSelectedPropertyId('');
                      setShowSuggestions(true);
                    }}
                    placeholder="Enter a property or pick from listings…"
                    className="w-full px-2.5 py-2 text-xs font-semibold text-stone-900 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-forest pr-8"
                  />
                  {properties.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowSuggestions((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                      title="View your listings"
                    >
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-150 ${showSuggestions ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </div>

                {/* Dropdown Suggestions List (Filtered as broker types) */}
                {showSuggestions && filteredListings.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto bg-white border border-stone-200 rounded-xl shadow-lg divide-y divide-stone-100 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 bg-stone-50 text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center justify-between sticky top-0">
                      <span>Pick from available listings</span>
                      <span>{filteredListings.length} found</span>
                    </div>
                    {filteredListings.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => {
                          setPropertyTitle(p.title || '');
                          setPropertyPrice(p.price ? money(p.price) : '');
                          setPropertyLocation([p.locality, p.city].filter(Boolean).join(', '));
                          setPropertyDescription(p.description || p.title || '');
                          setSelectedPropertyId(p._id);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-emerald-50/70 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-stone-900 block truncate">{p.title}</span>
                          <span className="text-[11px] text-stone-500 block truncate">
                            {p.locality ? `${p.locality}, ` : ''}{p.city}
                          </span>
                        </div>
                        <span className="font-extrabold text-forest text-xs shrink-0">
                          {money(p.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Editable Price & Location (2-columns) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Property Price
                  </label>
                  <input
                    type="text"
                    value={propertyPrice}
                    onChange={(e) => setPropertyPrice(e.target.value)}
                    placeholder="e.g. ₹95 Lakhs or ₹45,000/mo"
                    className="w-full px-2.5 py-1.5 text-xs text-stone-900 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Location / Locality
                  </label>
                  <input
                    type="text"
                    value={propertyLocation}
                    onChange={(e) => setPropertyLocation(e.target.value)}
                    placeholder="e.g. Gachibowli, Hyderabad"
                    className="w-full px-2.5 py-1.5 text-xs text-stone-900 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              {/* Editable Highlights / Description */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Property Highlights / Key Details
                </label>
                <textarea
                  rows={2}
                  value={propertyDescription}
                  onChange={(e) => setPropertyDescription(e.target.value)}
                  placeholder="e.g. 1850 sq ft, East facing, clubhouse access, 2 covered car parkings, high rental yield potential"
                  className="w-full px-2.5 py-1.5 text-xs text-stone-900 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-forest leading-relaxed font-sans"
                />
              </div>

              {/* Communication Channel (Compact 3-pills) */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1.5">
                  Send Recommendation Via *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {channels.map((ch) => {
                    const Icon = ch.icon;
                    const isSelected = channel === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setChannel(ch.id)}
                        className={`py-1.5 px-2 rounded-lg border text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs ${
                          isSelected
                            ? ch.activeClass
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <Icon size={13} />
                        <span>{ch.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Personal Recommendation Message (Filled by Broker) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-stone-700">
                    Personal Message from Broker *
                  </label>
                  <button
                    type="button"
                    onClick={handleFillTemplate}
                    className="text-[10px] text-emerald-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    title="Click to insert a suggested message draft using the fields above"
                  >
                    <Sparkles size={10} /> Auto-draft template
                  </button>
                </div>
                <textarea
                  rows={3}
                  required
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder={`Write your recommendation message to ${customerName}...`}
                  className="w-full px-2.5 py-1.5 text-xs text-stone-900 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-forest leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* Footer - Pinned & Compact */}
            <div className="px-5 py-3 bg-stone-50 border-t border-stone-200/80 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={busy || !propertyTitle.trim() || !personalMessage.trim()}
                className="px-4 py-2 bg-forest hover:bg-[#114032] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
              >
                {busy ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Sending…</span>
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Send Recommendation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
