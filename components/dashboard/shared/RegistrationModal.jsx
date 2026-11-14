'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWorkspace, WORKSPACE_CONFIG } from '../WorkspaceContext';
import { useApp, api } from '../../providers';
import {
  X,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { serviceCategories } from '@/lib/serviceCategories';

export default function RegistrationModal() {
  const { user, toast } = useApp();
  const {
    registerModalOpen,
    registerModalType,
    closeRegisterModal,
    fetchWorkspaces,
    switchWorkspace,
    memberships = []
  } = useWorkspace();

  const [busy, setBusy] = useState(false);
  const [selectedType, setSelectedType] = useState(registerModalType || 'provider');

  useEffect(() => {
    if (registerModalOpen) {
      setSelectedType(registerModalType || 'provider');
    }
  }, [registerModalOpen, registerModalType]);

  if (!registerModalOpen || typeof document === 'undefined') return null;

  const currentType = selectedType || registerModalType;
  const config = WORKSPACE_CONFIG[currentType] || WORKSPACE_CONFIG.provider;
  const Icon = config.icon;
  const existingMembership = memberships.find((m) => m.workspaceType === currentType);
  const isAlreadyPending = existingMembership?.status === 'pending';

  const providerServices = serviceCategories.filter((c) => c.slug !== 'properties');

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const form = new FormData(e.currentTarget);
      const data = {
        workspaceType: currentType,
        company: form.get('company')?.toString().trim() || '',
        reraId: form.get('reraId')?.toString().trim() || '',
        category: form.get('category')?.toString().trim() || '',
        phone: form.get('phone')?.toString().trim() || user?.phone || '',
        city: form.get('city')?.toString().trim() || 'Bengaluru',
        address: form.get('address')?.toString().trim() || '',
        bio: form.get('bio')?.toString().trim() || ''
      };

      const res = await api('workspaces/register', {
        method: 'POST',
        body: data
      });

      toast(res.message || `Registration submitted for Admin review.`);
      await fetchWorkspaces();
      closeRegisterModal();
      if (res.alreadyActive) {
        switchWorkspace(currentType);
      }
    } catch (err) {
      toast(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] overflow-y-auto bg-stone-900/65 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 pt-20 pb-8 sm:pt-24 sm:pb-10 animate-in fade-in duration-200"
      onClick={closeRegisterModal}
    >
      <div
        className="my-auto bg-white rounded-2xl max-w-xl w-full max-h-[calc(100vh-8rem)] overflow-y-auto shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: config.bgBadge, color: config.accentColor }}
            >
              <Icon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Register for {config.label}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {config.description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeRegisterModal}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Workspace selector tabs */}
        <div className="px-6 pt-4 flex gap-2 border-b border-stone-100 pb-3 overflow-x-auto">
          {['owner', 'broker', 'builder', 'provider'].map((typeKey) => {
            const tabConfig = WORKSPACE_CONFIG[typeKey];
            const TabIcon = tabConfig.icon;
            const isTabActive = currentType === typeKey;
            return (
              <button
                key={typeKey}
                type="button"
                onClick={() => setSelectedType(typeKey)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isTabActive
                    ? 'bg-[#163e35] text-[#d8edb3] shadow-xs'
                    : 'bg-[#f7f8f3] text-stone-600 hover:bg-[#ecf2e4]'
                }`}
              >
                <TabIcon size={14} />
                <span>{tabConfig.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {currentType === 'owner'
                  ? 'Your Name / Host Name'
                  : currentType === 'builder'
                  ? 'Developer / Firm Name'
                  : currentType === 'broker'
                  ? 'Agency / Brokerage Firm'
                  : 'Business / Trade Name'} *
              </label>
              <input
                name="company"
                required
                defaultValue={user?.company || user?.name || ''}
                placeholder={
                  currentType === 'owner'
                    ? user?.name || 'Full name'
                    : currentType === 'builder'
                    ? 'e.g. Prestige Urban Developers'
                    : currentType === 'broker'
                    ? 'e.g. Skyline Realty Partners'
                    : 'e.g. UrbanCraft Interiors & Renovation'
                }
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Direct Contact Phone *
              </label>
              <input
                name="phone"
                required
                defaultValue={user?.phone || ''}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900 transition-colors"
              />
            </div>
          </div>

          {/* RERA and specialized fields */}
          {(currentType === 'broker' || currentType === 'builder') && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  RERA Registration / License Number *
                </label>
                <input
                  name="reraId"
                  required
                  defaultValue={user?.reraId || ''}
                  placeholder="e.g. PRM/KA/RERA/1251/..."
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900 transition-colors font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Primary Operational City *
                </label>
                <input
                  name="city"
                  required
                  defaultValue="Bengaluru"
                  placeholder="e.g. Bengaluru, Mumbai, Pune"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Service Provider Category selector */}
          {currentType === 'provider' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Primary Service Specialization *
                </label>
                <select
                  name="category"
                  required
                  defaultValue={user?.serviceCategory || 'interior-designers'}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900 transition-colors"
                >
                  {providerServices.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Operating City *
                </label>
                <input
                  name="city"
                  required
                  defaultValue="Bengaluru"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Owner details */}
          {currentType === 'owner' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Property Localities *
                </label>
                <input
                  name="address"
                  required
                  placeholder="e.g. Indiranagar, Whitefield, Koramangala"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  City *
                </label>
                <input
                  name="city"
                  required
                  defaultValue="Bengaluru"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Business Overview / Portfolio Summary
            </label>
            <textarea
              name="bio"
              rows={3}
              defaultValue={user?.bio || ''}
              placeholder={
                currentType === 'owner'
                  ? 'Tell prospective tenants or buyers about your properties…'
                  : currentType === 'provider'
                  ? 'Describe your expertise, past projects, warranty terms, and client guarantees…'
                  : currentType === 'builder'
                  ? 'Describe your developer portfolio, upcoming developments, and architectural standard…'
                  : 'Tell prospective clients about your brokerage reach, active localities, and client advisory track record…'
              }
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900 transition-colors"
            />
          </div>

          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
            {isAlreadyPending ? (
              <Clock size={16} className="text-amber-700 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck size={16} className="text-emerald-700 shrink-0 mt-0.5" />
            )}
            <span>
              {isAlreadyPending
                ? `Your ${config.shortLabel} registration is currently under Admin review. Submitting again will update your application details for review.`
                : `Your ${config.shortLabel} registration will be sent to the UrbanFindr Admin team for approval. Once approved, your business dashboard will unlock automatically while keeping customer and business records separate.`}
            </span>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeRegisterModal}
              disabled={busy}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2.5 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              {busy ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  {isAlreadyPending ? `Update ${config.shortLabel} Application` : `Submit ${config.shortLabel} Request`}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

