'use client';

import { useState, useEffect, useMemo } from 'react';
import MessageCenter from '../shared/MessageCenter';
import NotificationsCenter from '../shared/NotificationsCenter';
import Link from 'next/link';
import { useApp, useData, api } from '../../providers';
import { date, money } from '@/lib/format';
import { propertyImages } from '@/lib/media';
import StatCard from '../shared/StatCard';
import StatusBadge from '../shared/StatusBadge';
import DataTable from '../shared/DataTable';
import PropertyDashboardCard from '../shared/PropertyDashboardCard';
import PropertyRequestsModal from '../shared/PropertyRequestsModal';
import PromotionModal from '../shared/PromotionModal';
import PromotionManagementView from '../../promotions/PromotionManagementView';
import BookingsTracker from '../../bookings-tracker';
import InteriorProjectHub from '../../interior/InteriorProjectHub';
import PropertyAlertsSection from '@/components/alerts/PropertyAlertsSection';
import DashboardAlertsWidget from '@/components/alerts/DashboardAlertsWidget';
import CreateAlertModal from '@/components/alerts/CreateAlertModal';
import {
  Heart,
  Calendar,
  ClipboardList,
  Wrench,
  Search,
  MessageCircle,
  FileText,
  CreditCard,
  Bell,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  MapPin,
  Sparkles,
  House,
  Plus,
  ShieldCheck,
  Check,
  X,
  XCircle,
  RotateCw,
  MousePointerClick,
  MessageSquare,
  TrendingUp,
  Eye,
  ChevronRight
} from 'lucide-react';

function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Recently';
  const past = new Date(dateInput).getTime();
  if (isNaN(past)) return 'Recently';
  const diffSec = Math.floor((Date.now() - past) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateInput).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatVisitSchedule(scheduledAt) {
  if (!scheduledAt) return 'Scheduled Visit';
  const d = new Date(scheduledAt);
  if (isNaN(d.getTime())) return 'Scheduled Visit';
  const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${dateStr} • ${timeStr}`;
}

export default function CustomerWorkspace({ section = 'overview', onSelectSection }) {
  const { user, toast } = useApp();
  const { data: dashData, loading: dashLoading, reload: reloadDash } = useData('dashboard');
  const { data: favData, loading: favLoading, reload: reloadFavs } = useData('properties?favorites=true&limit=3');
  const { data: visitsData, loading: visitsLoading, reload: reloadVisits } = useData('visits?limit=3');
  const { data: alertsData, loading: alertsLoading, reload: reloadAlerts } = useData('property-alerts?limit=1');
  const { data: notifData, loading: notifLoading } = useData('notifications?limit=3');
  const [createAlertOpen, setCreateAlertOpen] = useState(false);
  const [promotionTarget, setPromotionTarget] = useState(null);

  // Live dynamic database metrics for logged-in user
  const stats = dashData?.customer || {
    favorites: user?.favorites?.length ?? 0,
    savedSearches: 0,
    activeAlerts: 0,
    enquiries: 0,
    upcomingVisits: 0,
    bookings: 0,
    activeBookings: 0,
    messages: 0
  };

  const dynamicSavedCount = stats.favorites ?? (user?.favorites?.length ?? 0);
  const dynamicVisitsCount = stats.upcomingVisits ?? (visitsData?.items?.length ?? 0);
  const dynamicAlertsCount = stats.activeAlerts ?? (alertsData?.total ?? (alertsData?.items?.length ?? 0));
  const dynamicRequestsCount = stats.bookings ?? 0;

  // Dynamic user data
  const savedPropertiesList = favData?.items || [];
  const visitsList = visitsData?.items || [];
  const latestAlert = (alertsData?.items || [])[0];
  const activitiesList = notifData?.items || [];
  const userName = user?.name ? user.name.split(' ')[0] : 'there';

  if (section === 'properties' || section === 'my-properties') {
    return <CustomerPropertiesSection onSelectSection={onSelectSection} />;
  }
  if (section === 'favorites') {
    return <SavedPropertiesSection />;
  }
  if (section === 'saved-searches' || section === 'property-alerts' || section === 'alerts') {
    return <PropertyAlertsSection />;
  }
  if (section === 'promotions' || section === 'spotlight') {
    return (
      <div className="space-y-6">
        <CustomerPromotionsSection onPromote={setPromotionTarget} />
        {promotionTarget && (
          <PromotionModal
            isOpen={Boolean(promotionTarget)}
            target={promotionTarget}
            targetType="property"
            onClose={() => setPromotionTarget(null)}
            onPromoted={() => {
              setPromotionTarget(null);
              reloadDash();
              if (toast) toast('Promotion activated successfully!');
            }}
          />
        )}
      </div>
    );
  }
  if (section === 'visits' || section === 'enquiries') {
    return <PropertyVisitsSection />;
  }
  if (section === 'requests' || section === 'bookings') {
    return <CustomerRequestsSection />;
  }
  if (section === 'payments') {
    return <PaymentsInvoicesSection />;
  }
  if (section === 'messages') {
    return <CustomerMessagesSection />;
  }
  if (section === 'notifications') {
    return <NotificationsCenter onSelectSection={onSelectSection} />;
  }
  if (section === 'profile') {
    return <CustomerProfileSection />;
  }

  // Default: Unified single-view Overview with 100% dynamic database data & brand theme
  return (
    <div className="space-y-4">
      {/* 1. Hero Welcome Banner (Dark Theme, without image) */}
      <div className="bg-gradient-to-r from-[#163e35] via-[#1a473d] to-[#12332c] text-white rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden shadow-xs border border-[#163e35]">
        <div className="space-y-1.5 max-w-2xl z-10">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="text-xs sm:text-sm text-[#d8edb3]/90 leading-relaxed font-normal">
            Find your dream home, explore new properties, and stay updated with the latest opportunities.
          </p>
        </div>
        <div className="shrink-0 z-10 sm:self-center">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white text-[#163e35] hover:bg-[#ecf2e4] text-xs font-bold rounded-full transition-all shadow-xs whitespace-nowrap"
          >
            <span>Explore Properties</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* 2. Four KPI Metric Cards in a row (100% dynamic values) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Saved Properties */}
        <div
          onClick={() => onSelectSection('favorites')}
          className="bg-white rounded-xl p-3 sm:p-3.5 border border-stone-200/80 shadow-2xs hover:shadow-md hover:border-[#163e35]/30 transition-all flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ecf2e4] text-[#163e35] flex items-center justify-center shrink-0">
              <House size={18} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
                {dynamicSavedCount}
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-stone-500">
                Saved Properties
              </div>
            </div>
          </div>
          <ChevronRight size={15} className="text-stone-400 group-hover:text-[#163e35] group-hover:translate-x-0.5 transition" />
        </div>

        {/* Card 2: Upcoming Visits */}
        <div
          onClick={() => onSelectSection('visits')}
          className="bg-white rounded-xl p-3 sm:p-3.5 border border-stone-200/80 shadow-2xs hover:shadow-md hover:border-[#163e35]/30 transition-all flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
                {dynamicVisitsCount}
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-stone-500">
                Upcoming Visits
              </div>
            </div>
          </div>
          <ChevronRight size={15} className="text-stone-400 group-hover:text-[#163e35] group-hover:translate-x-0.5 transition" />
        </div>

        {/* Card 3: Active Alerts */}
        <div
          onClick={() => onSelectSection('saved-searches')}
          className="bg-white rounded-xl p-3 sm:p-3.5 border border-stone-200/80 shadow-2xs hover:shadow-md hover:border-[#163e35]/30 transition-all flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ecf2e4] text-[#163e35] flex items-center justify-center shrink-0">
              <Bell size={18} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
                {dynamicAlertsCount}
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-stone-500">
                Active Alerts
              </div>
            </div>
          </div>
          <ChevronRight size={15} className="text-stone-400 group-hover:text-[#163e35] group-hover:translate-x-0.5 transition" />
        </div>

        {/* Card 4: Service Requests */}
        <div
          onClick={() => onSelectSection('requests')}
          className="bg-white rounded-xl p-3 sm:p-3.5 border border-stone-200/80 shadow-2xs hover:shadow-md hover:border-[#163e35]/30 transition-all flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Wrench size={18} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
                {dynamicRequestsCount}
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-stone-500">
                Service Requests
              </div>
            </div>
          </div>
          <ChevronRight size={15} className="text-stone-400 group-hover:text-[#163e35] group-hover:translate-x-0.5 transition" />
        </div>
      </div>

      {/* 3. Middle Row: My Saved Properties (left 65%) + Upcoming Visits (right 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: My Saved Properties (100% dynamic from database) */}
        <div className="lg:col-span-8 bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <House size={18} className="text-[#163e35]" />
              <h3 className="font-bold text-stone-900 text-sm sm:text-base">My Saved Properties</h3>
              <span className="text-xs text-stone-400 font-semibold">({dynamicSavedCount})</span>
            </div>
            <button
              type="button"
              onClick={() => onSelectSection('favorites')}
              className="text-xs font-bold text-[#163e35] hover:text-[#205246] flex items-center gap-1 transition cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {favLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="rounded-2xl border border-stone-100 p-3 space-y-2 animate-pulse">
                  <div className="aspect-video bg-stone-100 rounded-xl" />
                  <div className="h-4 bg-stone-100 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : savedPropertiesList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {savedPropertiesList.slice(0, 3).map((prop) => {
                const isRent = prop.purpose === 'rent';
                const propImg = propertyImages(prop)[0] || '/photos/apartment-1.jpg';
                return (
                  <div
                    key={prop._id}
                    className="rounded-2xl border border-stone-200/80 overflow-hidden bg-white hover:shadow-md transition group flex flex-col"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                      <img
                        src={propImg}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-2xs ${
                        isRent ? 'bg-blue-50 text-blue-700 border border-blue-200/60' : 'bg-[#ecf2e4] text-[#163e35] border border-[#d8edb3]'
                      }`}>
                        {isRent ? 'For Rent' : 'For Sale'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectSection('favorites')}
                        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-500 hover:text-red-500 shadow-2xs transition"
                        title="Saved"
                      >
                        <Heart size={13} className="fill-red-500 text-red-500" />
                      </button>
                    </div>

                    <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
                      <div>
                        <Link href={`/properties/${prop._id}`} className="font-bold text-xs sm:text-sm text-stone-900 hover:text-[#163e35] transition truncate block">
                          {prop.title}
                        </Link>
                        <p className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin size={11} className="shrink-0 text-stone-400" />
                          <span>{prop.locality}, {prop.city}</span>
                        </p>
                      </div>

                      <div className="pt-1 border-t border-stone-100">
                        <div className="text-sm font-extrabold text-stone-900">
                          {money(prop.price)}
                          {isRent && <span className="text-[10px] font-normal text-stone-500"> / month</span>}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-1 font-medium">
                          {prop.bedrooms && <span>{prop.bedrooms} BHK</span>}
                          {prop.bedrooms && prop.area && <span>•</span>}
                          {prop.area && <span>{Number(prop.area).toLocaleString()} Sq.Ft.</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 px-4 text-center bg-stone-50/60 rounded-2xl border border-dashed border-stone-200">
              <div className="w-10 h-10 rounded-full bg-[#ecf2e4] text-[#163e35] flex items-center justify-center mx-auto mb-2.5">
                <Heart size={18} />
              </div>
              <p className="text-xs font-bold text-stone-800">No saved properties yet</p>
              <p className="text-[11px] text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Click the heart icon on any property listing while searching to save and compare them here.
              </p>
              <Link
                href="/properties"
                className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#163e35] text-white text-xs font-bold rounded-full hover:bg-[#205246] transition shadow-xs"
              >
                <span>Browse Properties</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>

        {/* Right: Upcoming Visits (100% dynamic from database) */}
        <div className="lg:col-span-4 bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#163e35]" />
              <h3 className="font-bold text-stone-900 text-sm sm:text-base">Upcoming Visits</h3>
              <span className="text-xs text-stone-400 font-semibold">({dynamicVisitsCount})</span>
            </div>
            <button
              type="button"
              onClick={() => onSelectSection('visits')}
              className="text-xs font-bold text-[#163e35] hover:text-[#205246] flex items-center gap-1 transition cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {visitsLoading ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map(n => (
                <div key={n} className="flex items-center gap-2.5 p-2 rounded-xl border border-stone-100 animate-pulse">
                  <div className="w-11 h-11 rounded-lg bg-stone-100 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-stone-100 rounded w-3/4" />
                    <div className="h-3 bg-stone-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : visitsList.length > 0 ? (
            <div className="space-y-2.5">
              {visitsList.slice(0, 3).map((visit) => {
                const isConfirmed = visit.status === 'confirmed' || visit.status === 'completed' || visit.status === 'accepted';
                const statusLabel = isConfirmed ? 'Confirmed' : visit.status === 'cancelled' ? 'Cancelled' : 'Pending';
                const propTitle = visit.property?.title || visit.project?.title || 'Property Inspection';
                const propLocality = visit.property?.locality ? `${visit.property.locality}, ${visit.property.city || ''}` : (visit.project?.title || 'Scheduled Visit');
                const visitImg = visit.property ? (propertyImages(visit.property)[0] || '/photos/apartment-1.jpg') : '/photos/apartment-1.jpg';

                return (
                  <div
                    key={visit._id}
                    onClick={() => onSelectSection('visits')}
                    className="flex items-center gap-2.5 p-2 rounded-xl border border-stone-100 hover:border-[#163e35]/30 hover:bg-[#ecf2e4]/30 transition cursor-pointer"
                  >
                    <img
                      src={visitImg}
                      alt={propTitle}
                      className="w-11 h-11 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-stone-900 truncate">
                        {formatVisitSchedule(visit.scheduledAt)}
                      </p>
                      <p className="text-xs font-medium text-stone-700 truncate mt-0.5">
                        {propTitle}
                      </p>
                      <p className="text-[10px] text-stone-400 truncate">
                        {propLocality}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 capitalize ${
                      isConfirmed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : visit.status === 'cancelled'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    }`}>
                      {statusLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-7 px-4 text-center bg-stone-50/60 rounded-xl border border-dashed border-stone-200">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <Calendar size={16} />
              </div>
              <p className="text-xs font-bold text-stone-800">No scheduled visits</p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Book on-site visits on any property listing to track inspections here.
              </p>
              <Link
                href="/properties"
                className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 bg-white text-[#163e35] border border-stone-200 text-xs font-bold rounded-full hover:bg-stone-50 transition shadow-2xs"
              >
                <span>Find Homes</span>
                <ArrowRight size={11} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 4. Bottom Row: Property Alerts (col 1) + Recent Activity (col 2) + Need a Home Service? (col 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* Column 1: Property Alerts (100% dynamic from database) */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-[#163e35]" />
                <h3 className="font-bold text-stone-900 text-sm sm:text-base">Property Alerts</h3>
                <span className="text-xs text-stone-400 font-semibold">({dynamicAlertsCount})</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectSection('saved-searches')}
                className="text-xs font-bold text-[#163e35] hover:text-[#205246] flex items-center gap-1 transition cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {alertsLoading ? (
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 flex items-center gap-3 animate-pulse">
                <div className="w-14 h-14 bg-stone-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-200 rounded w-1/2" />
                </div>
              </div>
            ) : latestAlert ? (
              <div
                onClick={() => onSelectSection('saved-searches')}
                className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50/80 hover:bg-[#ecf2e4]/50 border border-stone-200/60 transition cursor-pointer"
              >
                <img
                  src={latestAlert.latestMatch ? (propertyImages(latestAlert.latestMatch)[0] || '/photos/apartment-1.jpg') : '/photos/apartment-1.jpg'}
                  alt="Property Alert"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-stone-900 line-clamp-2">
                    {latestAlert.name}
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1.5">
                    <span>{formatRelativeTime(latestAlert.lastMatchedAt || latestAlert.createdAt)}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                    {latestAlert.stats?.totalMatches > 0
                      ? `${latestAlert.stats.totalMatches} matching properties found`
                      : `Active • Monitoring ${latestAlert.filters?.city ? latestAlert.filters.city.toUpperCase() : 'your criteria'}`}
                  </p>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setCreateAlertOpen(true)}
                className="p-5 text-center bg-stone-50/60 rounded-2xl border border-dashed border-stone-200 cursor-pointer hover:bg-[#ecf2e4]/40 transition"
              >
                <div className="w-9 h-9 rounded-full bg-[#ecf2e4] text-[#163e35] flex items-center justify-center mx-auto mb-2">
                  <Bell size={16} />
                </div>
                <p className="text-xs font-bold text-stone-800">No active alerts</p>
                <p className="text-[11px] text-stone-500 mt-1">
                  Save your search filters to get notified when new matching properties arrive.
                </p>
                <span className="mt-2.5 inline-block text-[11px] font-bold text-[#163e35] underline">
                  Create Property Alert →
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Recent Activity (100% dynamic from database) */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={18} className="text-[#163e35]" />
              <h3 className="font-bold text-stone-900 text-sm sm:text-base">Recent Activity</h3>
            </div>

            {notifLoading ? (
              <div className="space-y-2.5 animate-pulse">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-4 bg-stone-100 rounded w-full" />
                ))}
              </div>
            ) : activitiesList.length > 0 ? (
              <div className="space-y-3 relative pl-4 border-l-2 border-[#ecf2e4] ml-2">
                {activitiesList.map((notif, i) => (
                  <div key={notif._id || i} className="relative">
                    <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#163e35] ring-4 ring-white" />
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-stone-800 font-medium leading-snug truncate">
                          {notif.title}
                        </p>
                        {notif.body && (
                          <p className="text-[10px] text-stone-500 truncate mt-0.5">
                            {notif.body}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 shrink-0 whitespace-nowrap ml-2">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-5 px-4 text-center bg-stone-50/60 rounded-xl border border-dashed border-stone-200">
                <Clock size={18} className="text-stone-300 mx-auto mb-1" />
                <p className="text-xs font-bold text-stone-800">No recent activity</p>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  Activity like visit confirmations, alerts, and enquiry updates will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Need a Home Service? */}
        <div className="bg-[#163e35] rounded-2xl p-4 sm:p-5 shadow-md flex flex-col justify-between relative overflow-hidden text-white min-h-[140px]">
          <div className="relative z-10 space-y-1.5 max-w-[65%]">
            <h3 className="text-sm sm:text-base font-bold text-white">Need a Home Service?</h3>
            <p className="text-[11px] sm:text-xs text-[#d8edb3]/90 leading-relaxed">
              Book trusted professionals for all your home needs.
            </p>
            <div className="pt-1.5">
              <Link
                href="/services"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-[#163e35] text-xs font-bold rounded-full hover:bg-stone-100 transition shadow-xs"
              >
                <span>Request a Service</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 w-32 h-32 overflow-hidden pointer-events-none opacity-90">
            <img
              src="/photos/build-home-engineer.jpg"
              alt="Technician"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </div>

      {/* Quick Alert Creation Modal Shortcut */}
      <CreateAlertModal
        isOpen={createAlertOpen}
        onClose={() => setCreateAlertOpen(false)}
        onSaved={() => {
          reloadAlerts();
          reloadDash();
        }}
        initialData={{ city: 'Hyderabad' }}
      />

      {/* Promotion Modal */}
      {promotionTarget && (
        <PromotionModal
          isOpen={Boolean(promotionTarget)}
          target={promotionTarget}
          targetType="property"
          onClose={() => setPromotionTarget(null)}
          onPromoted={() => {
            setPromotionTarget(null);
            reloadDash();
            if (toast) toast('Promotion activated successfully!');
          }}
        />
      )}
    </div>
  );
}

// Sub-component: Customer Promotions Section matching Owner promotions hub
function CustomerPromotionsSection({ onPromote }) {
  const { data: propData } = useData('properties?mine=true&limit=100');
  const myProperties = propData?.items || [];

  return (
    <PromotionManagementView
      myListings={myProperties}
      targetType="property"
      onPromoteNew={onPromote}
    />
  );
}

// Sub-component: Recent Bookings List
function CustomerRecentBookingsList({ onSelectSection }) {
  const { user } = useApp();
  const { data, loading } = useData('service-requests?limit=4');
  const items = data?.items || [];

  if (loading) {
    return <div className="p-8 text-center text-xs text-stone-400">Loading your service bookings…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center space-y-2 border border-dashed border-stone-200 rounded-lg">
        <Wrench size={24} className="mx-auto text-stone-300" />
        <p className="text-xs text-stone-500">No active service bookings yet.</p>
        <Link href="/services" className="inline-block text-xs font-bold text-emerald-700 hover:underline">
          Browse verified doorstep services →
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-stone-100">
      {items.slice(0, 3).map((item) => (
        <div key={item._id} className="py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-stone-900 truncate">
                {item.serviceType}
              </span>
              <StatusBadge status={item.status} />
            </div>
            <p className="text-[11px] text-stone-400 truncate mt-0.5">
              {item.city} {item.preferredDate ? `• Date: ${item.preferredDate}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectSection('requests')}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 px-2.5 py-1 rounded bg-stone-50 hover:bg-stone-100 border border-stone-200 shrink-0"
          >
            {item.offer && ['contacted', 'quotation', 'quoted', 'pending'].includes(item.status) ? 'Review Offer' : 'Track'}
          </button>
        </div>
      ))}
    </div>
  );
}

// Sub-component: Recent Visits List
function CustomerRecentVisitsList({ onSelectSection }) {
  const { data: visitsData, loading: loadingVisits, reload: reloadVisits } = useData('visits?limit=10');
  const { data: leadsData, reload: reloadLeads } = useData('leads?limit=10');
  const { toast } = useApp();
  const [cancellingId, setCancellingId] = useState('');

  async function handleCancel(v) {
    if (!window.confirm('Are you sure you want to cancel this scheduled property visit?')) return;
    setCancellingId(v._id);
    try {
      if (v.isVisit) {
        await api(`visits/${v._id}`, { method: 'PATCH', body: { status: 'cancelled' } });
      } else {
        await api(`leads/${v._id}`, { method: 'PATCH', body: { status: 'cancelled' } });
      }
      toast('Visit request has been cancelled.');
      reloadVisits?.();
      reloadLeads?.();
    } catch (e) {
      toast(e.message || 'Failed to cancel.');
    } finally {
      setCancellingId('');
    }
  }

  const items = useMemo(() => {
    // Identify closed property/project IDs from leads where deal was closed
    const closedPropertyIds = new Set();
    (leadsData?.items || []).forEach((l) => {
      if (['deal_closed', 'closed', 'converted'].includes(l.status)) {
        const pId = l.property?._id || l.property;
        if (pId) closedPropertyIds.add(String(pId));
        const prjId = l.project?._id || l.project;
        if (prjId) closedPropertyIds.add(String(prjId));
      }
    });

    const rawVisits = (visitsData?.items || []).map((v) => {
      const propId = String(v.property?._id || v.property || '');
      const prjId = String(v.project?._id || v.project || '');
      const isClosed =
        v.status === 'closed' ||
        v.status === 'deal_closed' ||
        v.property?.status === 'closed' ||
        (propId && closedPropertyIds.has(propId)) ||
        (prjId && closedPropertyIds.has(prjId));

      return {
        _id: v._id,
        title: v.property?.title || v.project?.title || 'Property Visit',
        property: v.property,
        project: v.project,
        images: v.property?.images || [],
        scheduledAt: v.scheduledAt,
        createdAt: v.createdAt || v.scheduledAt,
        status: isClosed ? 'closed' : (v.status || 'requested'),
        ownerName: v.owner?.name || 'Property Host',
        locality: v.property?.locality || '',
        city: v.property?.city || 'Bengaluru',
        isVisit: true
      };
    });

    const rawLeads = (leadsData?.items || [])
      .filter((l) => l.preferredAt || l.status === 'site_visit_scheduled')
      .map((l) => {
        const propId = String(l.property?._id || l.property || '');
        const prjId = String(l.project?._id || l.project || '');
        const isClosed =
          ['deal_closed', 'closed', 'converted'].includes(l.status) ||
          l.property?.status === 'closed' ||
          (propId && closedPropertyIds.has(propId)) ||
          (prjId && closedPropertyIds.has(prjId));

        return {
          _id: l._id,
          title: l.property?.title || l.project?.title || 'Property Visit',
          property: l.property,
          project: l.project,
          images: l.property?.images || [],
          scheduledAt: l.preferredAt || l.createdAt,
          createdAt: l.createdAt,
          status: isClosed ? 'closed' : (l.status === 'site_visit_scheduled' ? 'requested' : l.status || 'requested'),
          ownerName: l.manager?.name || 'Property Host',
          locality: l.property?.locality || '',
          city: l.property?.city || l.city || 'Bengaluru',
          isVisit: false
        };
      });

    const combined = [...rawVisits];
    const seen = new Set(rawVisits.map((v) => String(v.property?._id || v.project?._id || v._id)));

    for (const l of rawLeads) {
      const idKey = String(l.property?._id || l.project?._id || l._id);
      if (!seen.has(idKey)) {
        seen.add(idKey);
        combined.push(l);
      }
    }

    return combined.sort((a, b) => new Date(b.scheduledAt || b.createdAt) - new Date(a.scheduledAt || a.createdAt));
  }, [visitsData?.items, leadsData?.items]);

  if (loadingVisits) {
    return <div className="p-8 text-center text-xs text-stone-400">Loading scheduled visits…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center space-y-2 border border-dashed border-stone-200 rounded-lg">
        <Calendar size={24} className="mx-auto text-stone-300" />
        <p className="text-xs text-stone-500">No site visits scheduled right now.</p>
        <Link href="/properties" className="inline-block text-xs font-bold text-emerald-700 hover:underline">
          Find a home to schedule a visit →
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-stone-100">
      {items.slice(0, 4).map((v) => {
        const d = v.scheduledAt ? new Date(v.scheduledAt) : null;
        const formattedDate = d
          ? d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
          : '—';
        const formattedTime = d
          ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : '';

        return (
          <div key={v._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {v.images?.[0] ? (
                <img
                  src={v.images[0]}
                  alt={v.title}
                  className="w-11 h-11 rounded-lg object-cover border border-stone-200 shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 shrink-0">
                  <Calendar size={18} />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-stone-900 truncate">
                    {v.title}
                  </span>
                  <StatusBadge status={v.status} />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#163e35] font-semibold mt-0.5">
                  <Calendar size={12} className="text-[#059669]" />
                  <span>{formattedDate} • {formattedTime}</span>
                </div>
                <p className="text-[11px] text-stone-400 truncate">
                  Host: {v.ownerName}{v.locality ? ` • ${v.locality}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => onSelectSection('visits')}
                className="text-xs font-bold text-[#163e35] hover:text-[#059669] px-3 py-1.5 rounded-lg bg-[#ecf2e4] hover:bg-[#d8edb3] transition-colors cursor-pointer"
              >
                View Visit
              </button>
              {!['cancelled', 'rejected', 'completed', 'closed'].includes(v.status) && (
                <button
                  type="button"
                  disabled={cancellingId === v._id}
                  onClick={() => handleCancel(v)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer border border-rose-200"
                >
                  {cancellingId === v._id ? 'Cancelling…' : 'Cancel'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Section: Property Enquiries
function PropertyEnquiriesSection() {
  const { toast } = useApp();
  const { data: leadsData, reload: reloadLeads } = useData('leads?page=1&limit=50');
  const { data: visitsData, reload: reloadVisits } = useData('visits?limit=50');
  const [busyId, setBusyId] = useState('');

  async function handleCancelEnquiry(row) {
    if (!window.confirm('Are you sure you want to cancel this enquiry?')) return;
    setBusyId(row._id);
    try {
      if (row.isVisit) {
        await api(`visits/${row._id}`, { method: 'PATCH', body: { status: 'cancelled' } });
      } else {
        await api(`leads/${row._id}`, { method: 'PATCH', body: { status: 'cancelled' } });
      }
      toast('Enquiry has been cancelled.');
      reloadLeads?.();
      reloadVisits?.();
    } catch (e) {
      toast(e.message || 'Failed to cancel.');
    } finally {
      setBusyId('');
    }
  }

  const items = useMemo(() => {
    const closedPropertyIds = new Set();
    (leadsData?.items || []).forEach((l) => {
      if (['deal_closed', 'closed', 'converted'].includes(l.status)) {
        const pId = l.property?._id || l.property;
        if (pId) closedPropertyIds.add(String(pId));
        const prjId = l.project?._id || l.project;
        if (prjId) closedPropertyIds.add(String(prjId));
      }
    });

    const leadItems = (leadsData?.items || []).map((l) => {
      const propId = String(l.property?._id || l.property || '');
      const prjId = String(l.project?._id || l.project || '');
      const isClosed =
        ['deal_closed', 'closed', 'converted'].includes(l.status) ||
        l.property?.status === 'closed' ||
        (propId && closedPropertyIds.has(propId)) ||
        (prjId && closedPropertyIds.has(prjId));

      return {
        ...l,
        title: l.property?.title || l.project?.title || l.service || l.note || 'Property Enquiry',
        status: isClosed ? 'closed' : l.status,
        isVisit: false
      };
    });

    // Also include site visits booked via the property form so every visited/enquired property shows here
    const visitItems = (visitsData?.items || []).map((v) => {
      const propId = String(v.property?._id || v.property || '');
      const prjId = String(v.project?._id || v.project || '');
      const isClosed =
        v.status === 'closed' ||
        v.status === 'deal_closed' ||
        v.property?.status === 'closed' ||
        (propId && closedPropertyIds.has(propId)) ||
        (prjId && closedPropertyIds.has(prjId));

      return {
        _id: v._id,
        createdAt: v.createdAt || v.scheduledAt,
        property: v.property,
        project: v.project,
        title: v.property?.title || v.project?.title || 'Property Site Visit Enquiry',
        city: v.property?.city || 'Bengaluru',
        budget: v.property?.price || undefined,
        note: v.note || `Site visit scheduled for ${date(v.scheduledAt)}`,
        status: isClosed ? 'closed' : (v.status || 'requested'),
        isVisit: true
      };
    });

    // Combine and deduplicate if same property is in both
    const merged = [...leadItems];
    const seen = new Set(leadItems.map((l) => String(l.property?._id || l.project?._id || l._id)));

    for (const v of visitItems) {
      const idKey = String(v.property?._id || v.project?._id || v._id);
      if (!seen.has(idKey)) {
        seen.add(idKey);
        merged.push(v);
      }
    }

    return merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [leadsData?.items, visitsData?.items]);

  const columns = [
    {
      header: 'Listing / Property',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.property?.images?.[0] ? (
            <img
              src={row.property.images[0]}
              alt={row.property.title || 'Listing'}
              className="w-12 h-10 object-cover rounded-lg border border-stone-200 shrink-0"
            />
          ) : null}
          <div className="min-w-0">
            <span className="font-bold text-stone-900 block truncate max-w-[220px]">
              {row.property?.title || row.project?.title || row.service || row.note || 'Property Inquiry'}
            </span>
            <span className="text-[11px] text-stone-400 block truncate">
              {row.property?.locality ? `${row.property.locality}, ` : ''}{row.city || row.property?.city || 'Bengaluru'}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Enquiry Date',
      render: (row) => <span className="text-stone-600 text-xs font-medium">{date(row.createdAt)}</span>
    },
    {
      header: 'Budget / Note',
      render: (row) => (
        <div className="space-y-0.5">
          {row.note ? (
            <span className="text-xs text-stone-800 line-clamp-1 max-w-[220px] block">
              {row.note}
            </span>
          ) : null}
          {row.budget ? (
            <span className="font-bold text-[#163e35] text-xs block">
              {money(row.budget)}
            </span>
          ) : !row.note ? <span className="text-stone-400 text-xs">—</span> : null}
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.property?._id ? (
            <Link
              href={`/properties/${row.property._id}`}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 text-xs"
            >
              <span>View</span>
              <ExternalLink size={12} />
            </Link>
          ) : row.project?._id ? (
            <Link
              href={`/projects/${row.project._id}`}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 text-xs"
            >
              <span>View</span>
              <ExternalLink size={12} />
            </Link>
          ) : null}
          {!['cancelled', 'rejected', 'completed', 'closed'].includes(row.status) && (
            <button
              type="button"
              disabled={busyId === row._id}
              onClick={() => handleCancelEnquiry(row)}
              className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-rose-200"
            >
              {busyId === row._id ? 'Cancelling…' : 'Cancel'}
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">My Property Enquiries</h2>
          <p className="text-xs text-stone-500">Inquiries sent directly to owners and builder developers</p>
        </div>
        <Link href="/properties" className="px-3.5 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold self-start">
          Explore Listings
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={items}
        searchKey="title"
        searchPlaceholder="Search property enquiries…"
        emptyTitle="No property enquiries found"
        emptySubtitle="You haven't enquired about any properties yet. Find a home you like and contact the owner directly!"
      />
    </div>
  );
}

// Section: Property Visits
function PropertyVisitsSection() {
  const { toast } = useApp();
  const { data: visitsData, loading: loadingVisits, reload: reloadVisits } = useData('visits?page=1&limit=50');
  const { data: leadsData, reload: reloadLeads } = useData('leads?page=1&limit=50');
  const [busy, setBusy] = useState('');

  const items = useMemo(() => {
    const closedPropertyIds = new Set();
    (leadsData?.items || []).forEach((l) => {
      if (['deal_closed', 'closed', 'converted'].includes(l.status)) {
        const pId = l.property?._id || l.property;
        if (pId) closedPropertyIds.add(String(pId));
        const prjId = l.project?._id || l.project;
        if (prjId) closedPropertyIds.add(String(prjId));
      }
    });

    const rawVisits = (visitsData?.items || []).map((v) => {
      const propId = String(v.property?._id || v.property || '');
      const prjId = String(v.project?._id || v.project || '');
      const isClosed =
        v.status === 'closed' ||
        v.status === 'deal_closed' ||
        v.property?.status === 'closed' ||
        (propId && closedPropertyIds.has(propId)) ||
        (prjId && closedPropertyIds.has(prjId));

      return {
        _id: v._id,
        title: v.property?.title || v.project?.title || 'Property Visit',
        property: v.property,
        project: v.project,
        images: v.property?.images || [],
        scheduledAt: v.scheduledAt,
        createdAt: v.createdAt || v.scheduledAt,
        status: isClosed ? 'closed' : (v.status || 'requested'),
        owner: v.owner,
        ownerName: v.owner?.name || 'Property Host',
        locality: v.property?.locality || '',
        city: v.property?.city || 'Bengaluru',
        price: v.property?.price,
        note: v.note || '',
        isVisit: true
      };
    });

    const rawLeads = (leadsData?.items || [])
      .filter((l) => l.preferredAt || l.status === 'site_visit_scheduled')
      .map((l) => {
        const propId = String(l.property?._id || l.property || '');
        const prjId = String(l.project?._id || l.project || '');
        const isClosed =
          ['deal_closed', 'closed', 'converted'].includes(l.status) ||
          l.property?.status === 'closed' ||
          (propId && closedPropertyIds.has(propId)) ||
          (prjId && closedPropertyIds.has(prjId));

        return {
          _id: l._id,
          title: l.property?.title || l.project?.title || 'Property Visit',
          property: l.property,
          project: l.project,
          images: l.property?.images || [],
          scheduledAt: l.preferredAt || l.createdAt,
          createdAt: l.createdAt,
          status: isClosed ? 'closed' : (l.status === 'site_visit_scheduled' ? 'requested' : l.status || 'requested'),
          owner: l.manager,
          ownerName: l.manager?.name || 'Property Host',
          locality: l.property?.locality || '',
          city: l.property?.city || l.city || 'Bengaluru',
          price: l.property?.price,
          note: l.note || '',
          isVisit: false
        };
      });

    const combined = [...rawVisits];
    const seen = new Set(rawVisits.map((v) => String(v.property?._id || v.project?._id || v._id)));

    for (const l of rawLeads) {
      const idKey = String(l.property?._id || l.project?._id || l._id);
      if (!seen.has(idKey)) {
        seen.add(idKey);
        combined.push(l);
      }
    }

    return combined.sort((a, b) => new Date(b.scheduledAt || b.createdAt) - new Date(a.scheduledAt || a.createdAt));
  }, [visitsData?.items, leadsData?.items]);

  async function handleCancel(row) {
    if (!window.confirm('Are you sure you want to cancel this scheduled property visit?')) return;
    setBusy(row._id);
    try {
      if (row.isVisit) {
        await api(`visits/${row._id}`, { method: 'PATCH', body: { status: 'cancelled' } });
      } else {
        await api(`leads/${row._id}`, { method: 'PATCH', body: { status: 'cancelled' } });
      }
      toast('Visit has been cancelled.');
      reloadVisits();
      reloadLeads();
    } catch (e) {
      toast(e.message || 'Failed to cancel visit.');
    } finally {
      setBusy('');
    }
  }

  const columns = [
    {
      header: 'Property / Project',
      render: (row) => {
        const propId = row.property?._id || row.property;
        return (
          <div className="flex items-center gap-3 max-w-sm">
            {row.images?.[0] ? (
              <img
                src={row.images[0]}
                alt={row.title}
                className="w-14 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
              />
            ) : (
              <div className="w-14 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 shrink-0">
                <Calendar size={20} />
              </div>
            )}
            <div className="min-w-0">
              {propId ? (
                <Link
                  href={`/properties/${propId}`}
                  className="font-bold text-xs sm:text-sm text-stone-900 hover:text-[#163e35] hover:underline block truncate"
                >
                  {row.title}
                </Link>
              ) : (
                <span className="font-bold text-xs sm:text-sm text-stone-900 block truncate">
                  {row.title}
                </span>
              )}
              <span className="text-[11px] text-stone-400 block truncate">
                Host: <strong className="text-stone-600">{row.ownerName}</strong>
                {row.locality ? ` • ${row.locality}, ${row.city}` : ` • ${row.city}`}
                {row.price ? ` • ${money(row.price)}` : ''}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Scheduled Date & Time',
      render: (row) => {
        const d = row.scheduledAt ? new Date(row.scheduledAt) : null;
        if (!d || isNaN(d.getTime())) return <span className="text-stone-400 text-xs">—</span>;
        const formattedDate = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        const formattedTime = d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });

        return (
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#ecf2e4] text-[#163e35] shrink-0">
              <Calendar size={15} />
            </div>
            <div>
              <span className="font-bold text-xs text-stone-900 block">
                {formattedDate}
              </span>
              <span className="text-[11px] text-[#059669] font-bold block">
                {formattedTime}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Note / Request',
      render: (row) => (
        <span className="text-xs text-stone-600 line-clamp-2 max-w-xs">
          {row.note || 'Site visit tour'}
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      render: (row) => {
        const propId = row.property?._id || row.property;
        return (
          <div className="flex items-center gap-2.5">
            {propId && (
              <Link
                href={`/properties/${propId}`}
                className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                View Listing
              </Link>
            )}
            {!['cancelled', 'rejected', 'completed', 'closed'].includes(row.status) && (
              <button
                type="button"
                disabled={busy === row._id}
                onClick={() => handleCancel(row)}
                className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-rose-200"
              >
                {busy === row._id ? 'Cancelling…' : 'Cancel'}
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">My Scheduled Property Visits</h2>
          <p className="text-xs text-stone-500">
            In-person property tours and site visits scheduled with hosts
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            reloadVisits();
            reloadLeads();
          }}
          className="text-xs font-bold text-[#163e35] hover:text-[#059669] px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer self-start sm:self-auto"
        >
          Refresh Visits
        </button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        emptyTitle="No property visits scheduled yet"
        emptySubtitle="When you choose a date and time on any property listing to schedule a visit, it will appear here."
      />
    </div>
  );
}

// Section: Saved Properties
function SavedPropertiesSection() {
  const { user, setUser, toast } = useApp();
  const { data, loading, reload } = useData('properties?favorites=true&limit=50');
  const items = data?.items || [];
  const [busy, setBusy] = useState('');

  async function removeFavorite(id) {
    setBusy(id);
    try {
      const res = await api(`favorites/${id}`, { method: 'POST' });
      setUser((prev) => ({ ...prev, favorites: res.favorites }));
      toast('Property removed from saved homes.');
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Saved Properties</h2>
          <p className="text-xs text-stone-500">Your shortlisted properties and comparison candidates</p>
        </div>
        <Link href="/compare" className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold self-start">
          Compare Shortlist
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-xl space-y-3">
          <Heart size={32} className="mx-auto text-stone-300" />
          <h3 className="font-bold text-stone-800 text-base">No saved properties yet</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Click the heart icon on any property card to save it here for quick access and comparison.
          </p>
          <Link href="/properties" className="inline-block px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold mt-2">
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((prop) => (
            <div key={prop._id} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between">
              <div>
                <div className="relative h-44 bg-stone-100 overflow-hidden">
                  <img
                    src={propertyImages(prop)[0] || '/placeholder.jpg'}
                    alt={prop.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      disabled={busy === prop._id}
                      onClick={() => removeFavorite(prop._id)}
                      className="p-1.5 bg-white/90 hover:bg-white text-rose-600 rounded-full shadow-xs"
                      title="Remove from saved"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-900/80 text-white backdrop-blur-xs">
                      {prop.purpose}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="font-extrabold text-base text-stone-900">
                    {money(prop.price)}
                  </div>
                  <h4 className="font-bold text-sm text-stone-800 line-clamp-1">{prop.title}</h4>
                  <p className="text-xs text-stone-500 flex items-center gap-1 truncate">
                    <MapPin size={12} className="shrink-0" />
                    <span>{prop.locality}, {prop.city}</span>
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between">
                <span className="text-xs text-stone-400">{prop.type}</span>
                <Link
                  href={`/properties/${prop._id}`}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Section: Customer Service Requests & Direct Offers
function CustomerRequestsSection() {
  const { user, toast } = useApp();
  const { data, loading, reload } = useData('service-requests?limit=50&as=customer');
  const [actingId, setActingId] = useState(null);

  const items = data?.items || [];

  async function handleAccept(item) {
    setActingId(item._id);
    try {
      await api(`service-requests/${item._id || item.requestId}`, {
        method: 'PATCH',
        body: { action: 'accept' }
      });
      toast('Offer accepted! The specialist has been notified.');
      reload();
    } catch (err) {
      toast(err.message || 'Failed to accept offer.');
    } finally {
      setActingId(null);
    }
  }

  async function handleDecline(item) {
    setActingId(item._id);
    try {
      await api(`service-requests/${item._id || item.requestId}`, {
        method: 'PATCH',
        body: { action: 'decline', reason: 'Customer declined the offer.' }
      });
      toast('Offer declined.');
      reload();
    } catch (err) {
      toast(err.message || 'Failed to decline offer.');
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">My Service Requests</h2>
          <p className="text-xs text-stone-500">
            Track direct inquiries across lawyers, electricians, maintenance and home services
          </p>
        </div>
        <Link
          href="/categories"
          className="px-4 py-2 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] text-xs font-bold rounded-lg shadow-xs transition-all inline-flex items-center gap-1.5 self-start"
        >
          <Wrench size={14} />
          <span>New Service Request</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-stone-400">Loading service requests…</div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-xl space-y-3">
          <Wrench size={32} className="mx-auto text-stone-300" />
          <h3 className="font-bold text-stone-800 text-sm">No service requests yet</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Book trusted specialists across legal advisory, electrical, AC repair, and pest control.
          </p>
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#749546] hover:bg-[#5f7b38] text-white text-xs font-bold rounded-lg transition-all"
          >
            <span>Explore Services</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const hasOffer = Boolean(item.offer && (item.offer.amount !== undefined || item.offer.fee !== undefined || item.offer.title)) || Boolean(item.quotation && (item.quotation.amount !== undefined || item.quotation.title));
            const isOfferPending = ['contacted', 'quotation', 'quoted', 'submitted', 'requested', 'pending'].includes(item.status) && hasOffer && item.offer?.status !== 'declined' && item.offer?.status !== 'rejected' && item.offer?.status !== 'accepted';
            const isAccepted = item.status === 'accepted' || item.status === 'scheduled' || item.status === 'in_progress' || item.offer?.status === 'accepted';
            const isDeclined = item.status === 'rejected' || item.status === 'declined' || item.offer?.status === 'declined' || item.offer?.status === 'rejected';
            const isCompleted = item.status === 'completed';

            const providerPhone = item.offer?.providerPhone || item.technician?.phone || '';
            const cleanPhone = String(providerPhone).replace(/\D/g, '');

            return (
              <div
                key={item._id}
                className="bg-white border border-[#e6e8e1] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-all"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ecf2e4] text-[#163e35]">
                        {item.category || 'Service'}
                      </span>
                      <span className="text-xs font-mono font-semibold text-stone-400">
                        {item.requestId}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-stone-900">
                      {item.serviceType}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-stone-400">{date(item.createdAt)}</span>
                  </div>
                </div>

                {/* Requirement note & location */}
                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-stone-400 block font-semibold">Requirement Details:</span>
                    <p className="text-stone-700 bg-[#f7f8f3] p-3 rounded-xl border border-[#e6e8e1] leading-relaxed">
                      {item.customerMessage || item.description || 'Direct consultation requested.'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-stone-400 block font-semibold">Service Location:</span>
                      <span className="font-bold text-stone-800">
                        {item.locality ? `${item.locality}, ` : ''}{item.city}
                      </span>
                    </div>

                    {/* Specialist contact info */}
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 font-semibold">Assigned Specialist:</span>
                        <span className="font-bold text-[#163e35]">
                          {item.assignedSpecialist || item.offer?.providerName || 'Verified Partner'}
                        </span>
                      </div>
                      {cleanPhone && (
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={`tel:${cleanPhone}`}
                            className="px-3 py-1.5 bg-[#163e35] text-[#d8edb3] rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#24564a] transition-all"
                          >
                            <Phone size={12} />
                            <span>Call</span>
                          </a>
                          <a
                            href={`https://wa.me/91${cleanPhone}?text=Hello%20regarding%20my%20${encodeURIComponent(item.serviceType)}%20request%20${item.requestId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-[#749546] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#5f7b38] transition-all"
                          >
                            <MessageCircle size={12} />
                            <span>Chat</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Specialist Offer Card (Accept / Decline) */}
                {hasOffer && (
                  <div className="p-4 rounded-xl border-2 border-[#163e35]/20 bg-[#ecf2e4]/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#749546] block">
                          Specialist Direct Offer
                        </span>
                        <h4 className="font-bold text-sm text-stone-900">
                          {item.offer?.title || item.quotation?.title || 'Consultation & Service Proposal'}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-extrabold text-[#163e35]">
                          {money(item.offer?.amount || item.offer?.fee || item.quotation?.amount || 0)}
                        </span>
                      </div>
                    </div>

                    {(item.offer?.notes || item.quotation?.notes) && (
                      <p className="text-xs text-stone-700 italic border-l-2 border-[#163e35] pl-3 py-0.5">
                        &ldquo;{item.offer?.notes || item.quotation?.notes}&rdquo;
                      </p>
                    )}

                    {isAccepted && (
                      <div className="pt-1 flex items-center gap-2 text-xs font-bold text-[#163e35]">
                        <CheckCircle2 size={16} />
                        <span>Offer Accepted • Service in progress</span>
                      </div>
                    )}

                    {isDeclined && (
                      <div className="pt-1 flex items-center gap-2 text-xs font-semibold text-rose-700">
                        <XCircle size={16} />
                        <span>Offer was declined.</span>
                      </div>
                    )}
                  </div>
                )}

                {!hasOffer && !isAccepted && !isDeclined && (
                  <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-xl text-xs text-stone-600 flex items-center gap-2">
                    <Clock size={15} className="text-amber-600 shrink-0" />
                    <span>Request sent to certified specialist. Awaiting specialist review and offer.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Section: Payments & Invoices
function PaymentsInvoicesSection() {
  const { data, loading } = useData('service-requests?limit=50');
  const items = (data?.items || []).filter((i) => i.invoice && (i.status === 'completed' || i.invoice.total > 0));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Payments &amp; Invoices</h2>
        <p className="text-xs text-stone-500">Official tax invoices and payment receipts for completed services</p>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-xl space-y-2">
          <CreditCard size={32} className="mx-auto text-stone-300" />
          <h3 className="font-bold text-stone-800 text-sm">No payment records found</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Payment receipts are automatically generated when service bookings or interior milestones are completed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item._id} className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-stone-700">
                    {item.invoice.invoiceNumber || `INV-${item.requestId}`}
                  </span>
                  <StatusBadge status={item.invoice.status === 'paid' ? 'completed' : 'pending'} />
                </div>
                <h4 className="font-bold text-stone-900 text-sm">{item.serviceType}</h4>
                <p className="text-xs text-stone-400">Issued on {date(item.invoice.issueDate || item.createdAt)}</p>
              </div>

              <div className="text-right">
                <div className="text-xl font-extrabold text-stone-900">
                  {money(item.invoice.total || item.invoice.subtotal || 0)}
                </div>
                <span className="text-xs text-stone-500">Includes all applicable taxes</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Section: Saved Searches
function SavedSearchesSection() {
  const { toast } = useApp();
  const { data, loading, reload } = useData('saved-searches');
  const items = data?.items || [];
  const [busy, setBusy] = useState('');

  async function toggleAlert(id) {
    setBusy(id);
    try {
      const res = await api(`saved-searches/${id}/alert`, { method: 'PATCH' });
      toast(res.alertEnabled ? 'Alerts active for this search.' : 'Alerts paused.');
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  async function deleteSearch(id) {
    if (!window.confirm('Delete this saved search?')) return;
    setBusy(id);
    try {
      await api(`saved-searches/${id}`, { method: 'DELETE' });
      toast('Saved search removed.');
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Saved Searches &amp; Alerts</h2>
          <p className="text-xs text-stone-500">Receive alerts when new homes matching your exact preferences are posted</p>
        </div>
        <Link href="/properties" className="px-3.5 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold self-start">
          New Search
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-xl space-y-2">
          <Search size={32} className="mx-auto text-stone-300" />
          <h3 className="font-bold text-stone-800 text-sm">No saved searches</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            When searching for properties, save your search to get notified immediately when matching listings are approved.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-stone-900 text-sm">{item.title}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 uppercase">
                    {item.purpose || 'buy'}
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  {item.city} {item.query ? `• Localities: ${item.query}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  disabled={busy === item._id}
                  onClick={() => toggleAlert(item._id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    item.alertEnabled
                      ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                      : 'border-stone-200 text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  {item.alertEnabled ? 'Alerts Active' : 'Alerts Paused'}
                </button>
                <button
                  type="button"
                  disabled={busy === item._id}
                  onClick={() => deleteSearch(item._id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Section: Messages
function CustomerMessagesSection() {
  const [initialThreadId, setInitialThreadId] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tid = params.get('thread');
      if (tid) setInitialThreadId(tid);
    }
  }, []);

  return (
    <MessageCenter
      initialThreadId={initialThreadId}
      title="Direct Conversations"
      subtitle="Direct message inquiries with property owners, channel partners, and building managers"
    />
  );
}

// Section: Notifications
function CustomerNotificationsSection() {
  const { toast } = useApp();
  const { data, reload } = useData('notifications?limit=50');
  const items = data?.items || [];

  async function markAllRead() {
    try {
      await api('notifications', { method: 'PATCH' });
      reload();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('urbanfindr:notifications-updated'));
      toast('All notifications marked as read.');
    } catch (e) {
      toast(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Notifications</h2>
          <p className="text-xs text-stone-500">Updates on visit requests and booking confirmations</p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden shadow-xs">
        {items.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400">
            <Bell size={24} className="mx-auto text-stone-300 mb-2" />
            No notifications in your inbox.
          </div>
        ) : (
          items.map((item) => (
            <div key={item._id} className={`p-4 ${!item.read ? 'bg-amber-50/30' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <span className="font-bold text-xs text-stone-900">{item.title}</span>
                <span className="text-[11px] text-stone-400">{date(item.createdAt)}</span>
              </div>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{item.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Section: Profile
function CustomerProfileSection() {
  const { user, setUser, toast } = useApp();
  const [busy, setBusy] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const form = new FormData(e.currentTarget);
      const res = await api('auth/profile', {
        method: 'PATCH',
        body: {
          name: form.get('name'),
          phone: form.get('phone'),
          bio: form.get('bio')
        }
      });
      setUser(res.user);
      toast('Profile updated successfully.');
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Personal Account &amp; Profile</h2>
        <p className="text-xs text-stone-500">Manage your contact information and platform identity</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
            <input
              name="name"
              required
              defaultValue={user?.name || ''}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
            <input
              name="phone"
              required
              defaultValue={user?.phone || ''}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
          <input
            disabled
            value={user?.email || ''}
            className="w-full px-3 py-2 text-sm bg-stone-100 border border-stone-200 rounded-lg text-stone-500 cursor-not-allowed"
          />
          <p className="text-[11px] text-stone-400 mt-1">Email is tied to your primary authentication and cannot be changed.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Bio / Notes</label>
          <textarea
            name="bio"
            rows={3}
            defaultValue={user?.bio || ''}
            placeholder="Tell property owners a bit about yourself…"
            className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={busy}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            {busy ? 'Saving Changes…' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ==========================================
// CUSTOMER PROPERTIES SECTION
// ==========================================
function CustomerPropertiesSection({ onSelectSection }) {
  const { toast } = useApp();
  const { data: propertiesData, loading, reload } = useData('properties?mine=true&limit=100');
  const { data: leadsData, reload: reloadLeads } = useData('leads?page=1&limit=100');
  const { data: visitsData, reload: reloadVisits } = useData('visits?limit=100');
  const { data: promoData, reload: reloadPromos } = useData('promotions?mine=true');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [busy, setBusy] = useState('');
  const [selectedPropertyForRequests, setSelectedPropertyForRequests] = useState(null);
  const [promotionTarget, setPromotionTarget] = useState(null);

  const items = propertiesData?.items || [];
  const userPromotions = promoData?.items || [];

  // Group promotions by property ID
  const promotionsByPropertyId = useMemo(() => {
    const map = {};
    for (const promo of userPromotions) {
      if (promo.targetId) {
        const pid = String(promo.targetId);
        if (!map[pid]) map[pid] = [];
        map[pid].push(promo);
      }
    }
    return map;
  }, [userPromotions]);

  const getPropertyPromo = (propId) => {
    const list = promotionsByPropertyId[String(propId)] || [];
    if (!list.length) return null;
    return [...list].sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))[0];
  };

  const isExpiredPromo = (promo) => {
    if (!promo) return false;
    if (promo.promotionStatus === 'expired') return true;
    if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) return true;
    return false;
  };

  const isActivePromo = (promo) => {
    if (!promo) return false;
    if (promo.promotionStatus !== 'active') return false;
    if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) return false;
    return true;
  };

  // Group customer visit requests and inquiries by propertyId
  const requestsByProperty = useMemo(() => {
    const map = {};
    const visits = visitsData?.items || [];
    const leads = leadsData?.items || [];

    const all = [
      ...visits.map((v) => ({
        _id: v._id,
        propertyId: String(v.property?._id || v.property || ''),
        isVisit: true,
        type: 'Visit Request',
        customerName: v.user?.name || v.customerName || 'Customer',
        email: v.user?.email || v.email || '',
        phone: v.phone || v.user?.phone || '',
        status: v.status || 'requested',
        note: v.note || v.notes || '',
        scheduledAt: v.scheduledAt,
        createdAt: v.createdAt || v.scheduledAt
      })),
      ...leads.map((l) => ({
        _id: l._id,
        propertyId: String(l.property?._id || l.property || ''),
        isVisit: false,
        type: 'Inquiry Request',
        customerName: l.name || l.user?.name || 'Customer',
        email: l.email || l.user?.email || '',
        phone: l.phone || l.user?.phone || '',
        status: l.status || 'requested',
        note: l.note || '',
        scheduledAt: l.preferredAt,
        createdAt: l.createdAt
      }))
    ];

    for (const req of all) {
      if (req.propertyId) {
        if (!map[req.propertyId]) map[req.propertyId] = [];
        map[req.propertyId].push(req);
      }
    }
    return map;
  }, [visitsData?.items, leadsData?.items]);

  // Counts for tabs
  const activeCount = items.filter((i) => i.status !== 'closed' && i.status !== 'archived').length;
  const closedCount = items.filter((i) => i.status === 'closed' || i.status === 'archived').length;
  const renewCount = items.filter((i) => isExpiredPromo(getPropertyPromo(i._id))).length;
  const promotionsCount = items.filter((i) => Boolean(getPropertyPromo(i._id))).length;

  // Promoted properties and their aggregate stats for the Promotions tab
  const promotedProperties = useMemo(() => {
    return items.filter((item) => Boolean(getPropertyPromo(item._id)));
  }, [items, promotionsByPropertyId]);

  const promoStats = useMemo(() => {
    let impressions = 0;
    let clicks = 0;
    let enquiries = 0;
    let siteVisits = 0;

    for (const p of promotedProperties) {
      const promo = getPropertyPromo(p._id);
      const reqs = requestsByProperty[String(p._id)] || [];
      impressions += Number(promo?.impressions) || Number(p.views) || 0;
      clicks += Number(promo?.clicks) || Number(p.clicks) || 0;
      enquiries += Number(promo?.enquiries) || reqs.filter((r) => !r.isVisit).length || 0;
      siteVisits += Number(promo?.siteVisits) || reqs.filter((r) => r.isVisit).length || 0;
    }

    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : '0.0';
    return { impressions, clicks, enquiries, siteVisits, ctr, count: promotedProperties.length };
  }, [promotedProperties, promotionsByPropertyId, requestsByProperty]);

  async function handleAcceptRequest(request) {
    setBusy(request._id);
    try {
      if (request.isVisit) {
        await api(`visits/${request._id}`, { method: 'PATCH', body: { status: 'accepted' } });
      } else {
        await api(`leads/${request._id}`, { method: 'PATCH', body: { status: 'accepted' } });
      }
      toast('Customer request accepted!');
      reloadLeads();
      reloadVisits();
      setSelectedPropertyForRequests((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          requests: (prev.requests || []).map((r) =>
            r._id === request._id ? { ...r, status: 'accepted' } : r
          )
        };
      });
    } catch (e) {
      toast(e.message || 'Failed to accept request.');
    } finally {
      setBusy('');
    }
  }

  async function handleClose(id) {
    if (!window.confirm('Close this property? It will be removed from the public website so visitors cannot see it, but will stay saved in your dashboard.')) return;
    setBusy(id);
    try {
      await api(`properties/${id}`, { method: 'PATCH', body: { status: 'closed' } });
      toast('Property closed. It is now hidden from the public website.');
      reload();
    } catch (e) {
      toast(e.message || 'Failed to close property.');
    } finally {
      setBusy('');
    }
  }

  async function handleReopen(id) {
    if (!window.confirm('Re-open this property listing so visitors can see it on the website again?')) return;
    setBusy(id);
    try {
      await api(`properties/${id}`, { method: 'PATCH', body: { status: 'approved' } });
      toast('Property re-opened and visible on the website.');
      reload();
    } catch (e) {
      toast(e.message || 'Failed to re-open property.');
    } finally {
      setBusy('');
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const promo = getPropertyPromo(item._id);
      if (statusFilter === 'approved' && item.status !== 'approved' && item.status !== 'active') return false;
      if (statusFilter === 'closed' && item.status !== 'closed' && item.status !== 'archived') return false;
      if (statusFilter === 'renew' && !isExpiredPromo(promo)) return false;
      if (statusFilter === 'promotions' && !promo) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesLocality = item.locality?.toLowerCase().includes(q);
        const matchesCity = item.city?.toLowerCase().includes(q);
        const matchesType = item.type?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLocality && !matchesCity && !matchesType) return false;
      }
      return true;
    });
  }, [items, statusFilter, search, promotionsByPropertyId]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-stone-900">My Properties</h2>
          <p className="text-xs text-stone-500">
            Manage all your posted residential and commercial listings. Closed properties remain visible here in your dashboard cards but are hidden from visitors on the website.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties by title, locality, city, or type…"
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#163e35]/20 focus:border-[#163e35]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Pills: All, Active, Closed, Renew, Promotions */}
          <div className="flex flex-wrap items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold gap-0.5">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-[#163e35] text-white shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'approved' ? 'bg-[#163e35] text-white shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('closed')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'closed' ? 'bg-[#163e35] text-white shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Closed ({closedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('renew')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                statusFilter === 'renew' ? 'bg-[#163e35] text-white shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <RotateCw size={12} className={statusFilter === 'renew' ? 'text-white' : 'text-amber-600'} />
              <span>Renew ({renewCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('promotions')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                statusFilter === 'promotions' ? 'bg-[#163e35] text-white shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles size={12} className={statusFilter === 'promotions' ? 'text-white' : 'text-emerald-700'} />
              <span>Promotions ({promotionsCount})</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-stone-400">Loading your properties…</div>
      ) : statusFilter === 'promotions' ? (
        <div className="space-y-6">
          {/* Promotions KPI Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-500 font-medium">Promoted Listings</p>
                <Sparkles size={14} className="text-[#749546]" />
              </div>
              <p className="text-2xl font-extrabold text-stone-900 mt-1">{promotedProperties.length}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Sponsored across search</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-500 font-medium">Total Impressions</p>
                <Eye size={14} className="text-blue-600" />
              </div>
              <p className="text-2xl font-extrabold text-stone-900 mt-1">{promoStats.impressions.toLocaleString()}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Views in search & category</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-500 font-medium">Total Clicks</p>
                <MousePointerClick size={14} className="text-amber-600" />
              </div>
              <p className="text-2xl font-extrabold text-stone-900 mt-1">{promoStats.clicks.toLocaleString()}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">CTR: {promoStats.ctr}%</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-500 font-medium">Total Enquiries</p>
                <MessageSquare size={14} className="text-emerald-700" />
              </div>
              <p className="text-2xl font-extrabold text-stone-900 mt-1">{promoStats.enquiries.toLocaleString()}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Direct buyer leads</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-stone-500 font-medium">Site Visits</p>
                <Calendar size={14} className="text-purple-600" />
              </div>
              <p className="text-2xl font-extrabold text-stone-900 mt-1">{promoStats.siteVisits.toLocaleString()}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">Confirmed visits</p>
            </div>
          </div>

          {/* Promoted Properties Cards */}
          {promotedProperties.length === 0 ? (
            <div className="p-12 text-center space-y-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <Sparkles size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-stone-900">No Promoted Properties Yet</h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Boost your property listings to appear at the top of search results and generate up to 5x more buyer enquiries.
                </p>
              </div>

              {items.filter((i) => i.status !== 'closed').length > 0 && (
                <button
                  type="button"
                  onClick={() => setPromotionTarget(items.filter((i) => i.status !== 'closed')[0])}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#163e35] hover:bg-[#24564a] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Sparkles size={14} /> Promote Your First Property
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <span>Sponsored Properties & Performance</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#ecf2e4] text-[#163e35] border border-[#749546]/30">
                    {promotedProperties.length} listing{promotedProperties.length > 1 ? 's' : ''}
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {promotedProperties.map((prop) => {
                  const promo = getPropertyPromo(prop._id);
                  const isExp = isExpiredPromo(promo);
                  const isAct = isActivePromo(promo);
                  const images = propertyImages(prop);
                  const reqs = requestsByProperty[String(prop._id)] || [];

                  const pImpressions = Number(promo?.impressions) || Number(prop.views) || 0;
                  const pClicks = Number(promo?.clicks) || Number(prop.clicks) || 0;
                  const pEnquiries = Number(promo?.enquiries) || reqs.filter((r) => !r.isVisit).length || 0;
                  const pVisits = Number(promo?.siteVisits) || reqs.filter((r) => r.isVisit).length || 0;
                  const pCtr = pImpressions > 0 ? ((pClicks / pImpressions) * 100).toFixed(1) : '0.0';

                  const planName = promo?.planId?.name || promo?.plan || (promo?.priority >= 100 ? 'Elite Boost' : promo?.priority >= 60 ? 'Premium Boost' : 'Basic Boost');
                  const expiry = promo?.expiryDate ? new Date(promo.expiryDate) : null;
                  const daysLeft = expiry ? Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

                  return (
                    <div
                      key={prop._id}
                      className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:border-stone-300 transition-all flex flex-col md:flex-row"
                    >
                      {/* Left: Thumbnail & Property Info */}
                      <div className="md:w-72 shrink-0 relative bg-stone-100 min-h-[160px]">
                        <img
                          src={images[0] || '/placeholder.jpg'}
                          alt={prop.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-900/80 text-white backdrop-blur-xs">
                            For {prop.purpose}
                          </span>
                          <StatusBadge status={prop.status} />
                        </div>
                      </div>

                      {/* Right: Details, Promotion Tier, and Stats */}
                      <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-base text-stone-900">{prop.title}</h4>
                              {isAct && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#163e35] text-[#ecf2e4] border border-[#749546]/40 shadow-2xs">
                                  <Sparkles size={11} className="text-amber-300" />
                                  <span>{planName}</span>
                                </span>
                              )}
                              {isExp && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
                                  <RotateCw size={11} />
                                  <span>Boost Expired</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                              <MapPin size={12} className="text-stone-400" />
                              <span>{prop.locality ? `${prop.locality}, ` : ''}{prop.city}</span>
                              <span className="text-stone-300">•</span>
                              <span className="font-extrabold text-stone-900">{money(prop.price)}</span>
                            </p>
                          </div>

                          {/* Promotion Status / Expiry */}
                          <div className="text-right shrink-0">
                            {isAct ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                                <span>Active • {daysLeft} days remaining</span>
                              </div>
                            ) : isExp ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold">
                                <span>Expired on {expiry ? expiry.toLocaleDateString('en-IN') : '–'}</span>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {/* Performance Metrics Bar for this property */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 bg-stone-50 p-3 rounded-xl border border-stone-100 text-center">
                          <div>
                            <span className="text-[11px] text-stone-500 font-medium block">Impressions</span>
                            <span className="text-sm font-bold text-stone-900 inline-flex items-center gap-1">
                              <Eye size={12} className="text-blue-600" /> {pImpressions.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-stone-500 font-medium block">Clicks</span>
                            <span className="text-sm font-bold text-stone-900 inline-flex items-center gap-1">
                              <MousePointerClick size={12} className="text-amber-600" /> {pClicks.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-stone-500 font-medium block">Enquiries</span>
                            <span className="text-sm font-bold text-stone-900 inline-flex items-center gap-1">
                              <MessageSquare size={12} className="text-emerald-700" /> {pEnquiries.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-stone-500 font-medium block">Site Visits</span>
                            <span className="text-sm font-bold text-stone-900 inline-flex items-center gap-1">
                              <Calendar size={12} className="text-purple-600" /> {pVisits.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-stone-500 font-medium block">CTR</span>
                            <span className="text-sm font-bold text-stone-900 inline-flex items-center gap-1">
                              <TrendingUp size={12} className="text-[#749546]" /> {pCtr}%
                            </span>
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center justify-between gap-3 pt-1 border-t border-stone-100">
                          <Link
                            href={`/properties/${prop._id}`}
                            className="text-xs font-semibold text-stone-600 hover:text-stone-900 inline-flex items-center gap-1"
                          >
                            <span>View Live Listing</span>
                            <ExternalLink size={12} />
                          </Link>

                          <div className="flex items-center gap-2">
                            {isExp ? (
                              <button
                                type="button"
                                onClick={() => setPromotionTarget(prop)}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                              >
                                <RotateCw size={13} />
                                <span>Renew Boost (from ₹499)</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setPromotionTarget(prop)}
                                className="px-3 py-1.5 bg-[#163e35] hover:bg-[#24564a] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                              >
                                <Sparkles size={13} />
                                <span>Renew / Upgrade Plan</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : statusFilter === 'renew' ? (
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-stone-200 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-500 mx-auto flex items-center justify-center">
                <RotateCw size={24} />
              </div>
              <h3 className="font-bold text-sm text-stone-800">No Promotions Pending Renewal</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                All your boosted property subscriptions are currently active, or you haven't promoted any listings yet. When a promotion expires, you can quickly review and renew it from here.
              </p>
              {items.filter((i) => i.status !== 'closed').length > 0 && (
                <button
                  type="button"
                  onClick={() => setStatusFilter('promotions')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#163e35] hover:bg-[#24564a] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Sparkles size={14} /> View All Promotions
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <RotateCw size={15} className="text-amber-700 shrink-0" />
                  <span>
                    <strong>{filteredItems.length} promotion{filteredItems.length > 1 ? 's have' : ' has'} expired.</strong> Renew your promotion subscription to regain guaranteed top search placement and verified badges.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((prop) => (
                  <PropertyDashboardCard
                    key={prop._id}
                    property={prop}
                    promotion={getPropertyPromo(prop._id)}
                    busy={busy}
                    requests={requestsByProperty[String(prop._id)] || []}
                    onOpenRequests={(p, r) => setSelectedPropertyForRequests({ property: p, requests: r })}
                    onAcceptRequest={handleAcceptRequest}
                    onClose={handleClose}
                    onReopen={handleReopen}
                    onPromote={() => setPromotionTarget(prop)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <House size={32} className="mx-auto text-stone-300" />
          <h3 className="font-bold text-sm text-stone-800">No properties match your filter</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {items.length === 0
              ? 'Start reaching buyers and tenants directly with zero brokerage.'
              : 'Try clearing your search or filter pills to see other properties.'}
          </p>
          {items.length === 0 && (
            <Link
              href="/post-property"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs whitespace-nowrap"
            >
              <Plus size={14} className="shrink-0" />
              <span className="whitespace-nowrap">Post Property</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((prop) => (
            <PropertyDashboardCard
              key={prop._id}
              property={prop}
              promotion={getPropertyPromo(prop._id)}
              busy={busy}
              requests={requestsByProperty[String(prop._id)] || []}
              onOpenRequests={(p, r) => setSelectedPropertyForRequests({ property: p, requests: r })}
              onAcceptRequest={handleAcceptRequest}
              onClose={handleClose}
              onReopen={handleReopen}
              onPromote={() => setPromotionTarget(prop)}
            />
          ))}
        </div>
      )}

      {/* Promotion Modal for Customer properties */}
      {promotionTarget && (
        <PromotionModal
          isOpen={Boolean(promotionTarget)}
          target={promotionTarget}
          targetType="property"
          onClose={() => setPromotionTarget(null)}
          onPromoted={() => {
            setPromotionTarget(null);
            reloadPromos();
            reload();
            if (toast) toast('Promotion activated successfully!');
          }}
        />
      )}

      {/* Property Visit Requests Modal */}
      {selectedPropertyForRequests && (
        <PropertyRequestsModal
          isOpen={true}
          property={selectedPropertyForRequests.property}
          requests={
            requestsByProperty[String(selectedPropertyForRequests.property?._id || '')] ||
            selectedPropertyForRequests.requests ||
            []
          }
          busyId={busy}
          busy={busy}
          onClose={() => setSelectedPropertyForRequests(null)}
          onAcceptRequest={handleAcceptRequest}
        />
      )}
    </div>
  );
}
