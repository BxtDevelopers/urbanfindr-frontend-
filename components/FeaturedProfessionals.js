'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  MapPin,
  Heart,
  ArrowRight,
  Phone,
  MessageCircle,
  Mail,
  CheckCircle2,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  Calendar,
  Clock
} from 'lucide-react';
import { initialServiceProviders } from '@/lib/serviceProviders';
import { useApp } from './providers';

export default function FeaturedProfessionals() {
  const { toast } = useApp();
  const [professionals, setProfessionals] = useState(initialServiceProviders);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedIds, setSavedIds] = useState([]);
  const [activeContactModal, setActiveContactModal] = useState(null);

  // Enquiry modal form states
  const [enquiryForm, setEnquiryForm] = useState({ name: '', phone: '', note: '' });
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch from API with graceful fallback to seeded providers
  useEffect(() => {
    async function fetchPros() {
      try {
        const res = await fetch('/api/professionals?featured=true');
        if (res.ok) {
          const data = await res.json();
          if (data?.items && data.items.length > 0) {
            setProfessionals(data.items);
          }
        }
      } catch (err) {
        // Fallback to static initialServiceProviders
      }
    }
    fetchPros();

    // Load saved pros from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('urban_shortlisted_pros') || '[]');
      if (Array.isArray(stored)) setSavedIds(stored);
    } catch (e) {}
  }, []);

  const toggleFavorite = (pro) => {
    const id = pro._id || pro.id || pro.name;
    let next;
    if (savedIds.includes(id)) {
      next = savedIds.filter((item) => item !== id);
      toast(`Removed ${pro.name} from shortlisted professionals.`);
    } else {
      next = [...savedIds, id];
      toast(`Saved ${pro.name} to your shortlisted professionals.`);
    }
    setSavedIds(next);
    try {
      localStorage.setItem('urban_shortlisted_pros', JSON.stringify(next));
    } catch (e) {}
  };

  const handleOpenContact = (pro) => {
    setActiveContactModal(pro);
    setEnquirySubmitted(false);
    setEnquiryForm({ name: '', phone: '', note: '' });
  };

  const handleCloseModal = () => {
    setActiveContactModal(null);
    setEnquirySubmitted(false);
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!enquiryForm.name.trim() || !enquiryForm.phone.trim()) {
      toast('Please enter your name and phone number.');
      return;
    }
    setSubmitting(true);
    try {
      await fetch('/api/professionals/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionalId: activeContactModal._id || activeContactModal.id,
          professionalName: activeContactModal.name,
          category: activeContactModal.category,
          ...enquiryForm
        })
      });
    } catch (e) {}
    setSubmitting(false);
    setEnquirySubmitted(true);
    toast(`Enquiry sent! ${activeContactModal.name} will reach out shortly.`);
  };

  // Filter options
  const filterCategories = [
    { label: 'All Experts', value: 'all' },
    { label: 'Interior & Decor', value: 'interior-designers' },
    { label: 'Landscapers', value: 'landscapers' },
    { label: 'AC & Cooling', value: 'ac-technicians' },
    { label: 'Electricians', value: 'electricians' },
    { label: 'Legal & Advocates', value: 'lawyers' },
    { label: 'Hygiene & Facilities', value: 'facilities' }
  ];

  const filteredPros = professionals.filter((pro) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'facilities') {
      return ['tank-cleaning', 'pest-control', 'pool-cleaning', 'inverter-maintenance', 'lift-maintenance', 'facility-management'].includes(pro.categorySlug);
    }
    return pro.categorySlug === selectedCategory;
  });

  return (
    <section className="wrap section !pt-4 !pb-10" id="featured-professionals" aria-label="Featured Professionals">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-forest mb-1.5">
            <span className="w-1.5 h-1.5 bg-forest rounded-full" />
            <span>VERIFIED SERVICE DIRECTORY</span>
          </div>
          <h2 className="!text-2xl sm:!text-3xl font-bold tracking-tight text-stone-900">
            Featured Professionals
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Verified experts for your home, office and facility needs.
          </p>
        </div>

        <Link
          href="/categories"
          className="text-xs sm:text-sm font-semibold text-forest hover:text-emerald-800 inline-flex items-center gap-1.5 group shrink-0 transition-colors"
        >
          <span>View All</span>
          <ArrowRight
            size={14}
            strokeWidth={2.25}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="tab-row mb-6 overflow-x-auto pb-1 flex-nowrap scrollbar-none">
        {filterCategories.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`whitespace-nowrap ${selectedCategory === tab.value ? 'active' : ''}`}
            onClick={() => setSelectedCategory(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4-Column Professional Cards Grid matching reference layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {filteredPros.slice(0, 8).map((pro) => {
          const proId = pro._id || pro.id || pro.name;
          const isSaved = savedIds.includes(proId);

          return (
            <article
              key={proId}
              className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-forest/40 transition-all duration-200 flex flex-col justify-between group"
            >
              {/* Top Section: Avatar & Info */}
              <div className="flex gap-3.5 items-start">
                {/* Avatar with fallback */}
                <div className="relative shrink-0">
                  <img
                    src={pro.avatar}
                    alt={pro.name}
                    loading="lazy"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-stone-100 shadow-xs group-hover:scale-[1.02] transition-transform"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                    }}
                  />
                  {pro.verified && (
                    <span
                      title="Verified by UrbanFinder"
                      className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs"
                    >
                      <CheckCircle2 size={15} className="text-forest fill-white" />
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <h3
                    className="font-bold text-stone-900 text-sm sm:text-base leading-snug truncate hover:text-forest transition-colors"
                    title={pro.name}
                  >
                    {pro.name}
                  </h3>

                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-1.5 mt-1 text-xs">
                    <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                      <Star size={13} fill="currentColor" strokeWidth={0} />
                      <span>{Number(pro.rating).toFixed(1)}</span>
                    </div>
                    <span className="text-stone-400">·</span>
                    <span className="text-stone-500">
                      ({pro.reviewsCount} reviews)
                    </span>
                  </div>

                  {/* Category & City */}
                  <p className="text-xs text-stone-600 font-medium mt-1 truncate">
                    {pro.category}
                  </p>
                  <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin size={11} className="text-stone-400 shrink-0" />
                    <span>{pro.city}</span>
                  </p>
                </div>
              </div>

              {/* Bottom Actions Row: Contact Button & Heart Icon */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => handleOpenContact(pro)}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-stone-800 bg-stone-50 hover:bg-forest hover:text-white border border-stone-200/80 hover:border-forest transition-all text-center duration-150 shadow-2xs"
                >
                  Contact
                </button>

                <button
                  type="button"
                  onClick={() => toggleFavorite(pro)}
                  aria-label={isSaved ? `Remove ${pro.name} from shortlist` : `Shortlist ${pro.name}`}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                    isSaved
                      ? 'border-red-200 bg-red-50 text-red-500'
                      : 'border-stone-200/80 text-stone-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50/50'
                  }`}
                >
                  <Heart
                    size={16}
                    fill={isSaved ? 'currentColor' : 'none'}
                    className="transition-transform active:scale-125"
                  />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Contact & Enquiry Modal */}
      {activeContactModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#163e35] to-[#1e5246] p-5 text-white flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <img
                  src={activeContactModal.avatar}
                  alt={activeContactModal.name}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-white/20"
                />
                <div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-lime text-stone-900 mb-1">
                    <CheckCircle2 size={11} className="text-forest" />
                    <span>Verified Professional</span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {activeContactModal.name}
                  </h3>
                  <p className="text-xs text-white/80">
                    {activeContactModal.category} • {activeContactModal.city}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
              {/* Quick Info Badges */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-sm">
                    <Star size={14} fill="currentColor" />
                    <span>{Number(activeContactModal.rating).toFixed(1)}</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {activeContactModal.reviewsCount} reviews
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <p className="text-xs font-bold text-forest">
                    {activeContactModal.experience || '8+ Years'}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">Experience</p>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <p className="text-xs font-bold text-stone-900">
                    {activeContactModal.startingPrice || '₹499 onwards'}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">Starting From</p>
                </div>
              </div>

              {/* Bio / Services */}
              <div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {activeContactModal.bio}
                </p>
                {activeContactModal.services && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {activeContactModal.services.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-stone-100 text-stone-700 font-medium"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Instant Action Buttons */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Direct Contact
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={`tel:${activeContactModal.phone}`}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest/90 transition shadow-xs"
                  >
                    <Phone size={14} />
                    <span>Call Directly</span>
                  </a>

                  <a
                    href={`https://wa.me/91${(activeContactModal.phone || '').replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(`Hi ${activeContactModal.name}, I found your profile on UrbanFinder and would like to inquire about your services.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-xs"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Callback / Enquiry Form */}
              <div className="border-t border-stone-100 pt-4">
                <p className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                  Request a Free Callback
                </p>

                {enquirySubmitted ? (
                  <div className="p-4 rounded-xl bg-lime/30 border border-forest/20 text-center space-y-1">
                    <CheckCircle2 size={24} className="text-forest mx-auto mb-1" />
                    <p className="text-sm font-bold text-stone-900">
                      Request Confirmed!
                    </p>
                    <p className="text-xs text-stone-600">
                      {activeContactModal.name} will call you back within 2 business hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleEnquirySubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                          Your Name
                        </label>
                        <input
                          required
                          value={enquiryForm.name}
                          onChange={(e) =>
                            setEnquiryForm({ ...enquiryForm, name: e.target.value })
                          }
                          placeholder="e.g. Rahul Sharma"
                          className="input !py-1.5 !px-3 !text-xs w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                          Phone Number
                        </label>
                        <input
                          required
                          type="tel"
                          value={enquiryForm.phone}
                          onChange={(e) =>
                            setEnquiryForm({ ...enquiryForm, phone: e.target.value })
                          }
                          placeholder="98765 43210"
                          className="input !py-1.5 !px-3 !text-xs w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        Requirement / Message (optional)
                      </label>
                      <textarea
                        rows={2}
                        value={enquiryForm.note}
                        onChange={(e) =>
                          setEnquiryForm({ ...enquiryForm, note: e.target.value })
                        }
                        placeholder="Briefly describe what you need help with..."
                        className="input !py-1.5 !px-3 !text-xs w-full"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn w-full !py-2.5 !text-xs !font-semibold flex items-center justify-center gap-2"
                    >
                      <Send size={13} />
                      <span>{submitting ? 'Sending Request…' : 'Submit Callback Request'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
