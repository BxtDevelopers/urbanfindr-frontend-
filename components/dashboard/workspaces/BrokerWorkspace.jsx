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
import AnalyticsChart from '../shared/AnalyticsChart';
import PromotionModal from '../shared/PromotionModal';
import PromotionManagementView from '../../promotions/PromotionManagementView';
import AccountIdCard from '../shared/AccountIdCard';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip
} from 'recharts';
import {
  Briefcase,
  House,
  Plus,
  ClipboardList,
  Calendar,
  Users,
  Sparkles,
  BarChart3,
  MessageCircle,
  MessageSquare,
  Settings,
  ArrowUpRight,
  ArrowRight,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Phone,
  User,
  UserPlus,
  UserCheck,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Award,
  Check,
  Mail,
  Send,
  Handshake,
  LayoutGrid,
  List,
  Search,
  BedDouble,
  Bath,
  Maximize
} from 'lucide-react';

export default function BrokerWorkspace({ section = 'overview', onSelectSection }) {
  const { user, toast } = useApp();
  const { data: dashData } = useData('dashboard');
  const [promotionTarget, setPromotionTarget] = useState(null);

  const stats = dashData?.broker || {
    properties: 0,
    activeListings: 0,
    totalLeads: 0,
    newLeads: 0,
    upcomingVisits: 0,
    clients: 0,
    promotions: 0,
    views: 0
  };

  const renderSection = () => {
    if (section === 'listings' || section === 'properties') {
      return <BrokerListingsSection onPromote={setPromotionTarget} />;
    }
    if (section === 'leads' || section === 'enquiries') {
      return <BrokerLeadsSection onSelectSection={onSelectSection} />;
    }
    if (section === 'visits') {
      return <BrokerVisitsSection />;
    }
    if (section === 'promotions') {
      return <BrokerPromotionsSection onPromote={setPromotionTarget} />;
    }
    if (section === 'clients') {
      return <BrokerClientsSection />;
    }
    if (section === 'analytics' || section === 'performance') {
      return <BrokerAnalyticsSection stats={stats} />;
    }
    if (section === 'messages') {
      return <BrokerMessagesSection />;
    }
    if (section === 'notifications') {
      return <NotificationsCenter onSelectSection={onSelectSection} />;
    }
    if (section === 'profile') {
      return <BrokerProfileSection />;
    }

    // Default: Overview
    return (
      <BrokerOverviewView
        stats={stats}
        onSelectSection={onSelectSection}
        onPromote={setPromotionTarget}
      />
    );
  };

  return (
    <>
      {renderSection()}
      {promotionTarget && (
        <PromotionModal
          isOpen={Boolean(promotionTarget)}
          target={promotionTarget}
          targetType="property"
          onClose={() => setPromotionTarget(null)}
          onPromoted={() => {
            setPromotionTarget(null);
            if (toast) toast('Promotion activated successfully!');
          }}
        />
      )}
    </>
  );
}

// ── SPARKLINE COMPONENT FOR STAT CARDS ──
function BrokerSparkline({ color = '#163e35' }) {
  return (
    <svg className="w-14 sm:w-16 h-5 overflow-visible" viewBox="0 0 80 28" fill="none">
      <path
        d="M 2 22 C 16 26, 26 12, 40 18 C 54 24, 64 8, 78 4"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── CUSTOM TOOLTIP FOR PERFORMANCE OVERVIEW CHART ──
function BrokerCustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#163e35] text-white px-3 py-1.5 rounded-xl text-xs shadow-xl border border-[#24564a] space-y-1">
        <p className="font-bold text-[#d8edb3] text-[11px]">{label}</p>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[#ecf2e4] font-medium">{item.name}:</span>
            </span>
            <span className="font-bold text-white">{Number(item.value || 0).toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// ── MAIN BROKER OVERVIEW VIEW MATCHING EXACT DESIGN & BRAND COLOR THEME ──
function BrokerOverviewView({ stats, onSelectSection, onPromote }) {
  const { user } = useApp();
  const [chartPeriod, setChartPeriod] = useState('30d');

  // Dynamic Properties (mine=true)
  const { data: propData } = useData('properties?mine=true&limit=3');
  const realProperties = propData?.items || [];

  // Dynamic Leads / Enquiries
  const { data: leadsData } = useData('leads?page=1&limit=6');
  const realLeads = (leadsData?.items || []).filter(
    (row) => !row.service && row.kind !== 'general' && (!row.note || !row.note.startsWith('[SR-'))
  );

  // Dynamic Visits
  const { data: visitsData } = useData('visits?page=1&limit=6');
  const realVisits = visitsData?.items || [];

  const displayProperties = realProperties.slice(0, 3).map((prop) => ({
    _id: prop._id,
    title: prop.title || 'Property Listing',
    locality: prop.locality || 'Locality',
    city: prop.city || 'Hyderabad',
    priceFormatted: prop.price ? money(prop.price) : 'Price on Request',
    beds: prop.beds || prop.bedrooms || null,
    area: prop.area || prop.carpetArea || prop.builtUpArea || null,
    status: prop.status || 'active',
    image: (propertyImages(prop) && propertyImages(prop)[0]) || '/photos/apartment-1.jpg'
  }));

  const displayLeads = realLeads.slice(0, 4).map((lead, idx) => {
    const leadName = lead.name || lead.user?.name || (lead.phone ? `Caller ${lead.phone.slice(-4)}` : 'Prospective Buyer');
    const initials = leadName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'LD';
    const note = lead.property?.title
      ? `Interested in ${lead.property.title}`
      : lead.project?.title
      ? `Interested in ${lead.project.title}`
      : lead.note || lead.message || (lead.budget ? `Budget: ${money(lead.budget)}` : 'Direct Enquiry');
    const time = lead.createdAt ? date(lead.createdAt) : 'Recently';
    const unread = lead.status === 'new' || lead.status === 'pending' || lead.status === 'uncontacted';
    return {
      id: lead._id || idx,
      initials,
      name: leadName,
      note,
      time,
      unread
    };
  });

  const displayVisits = realVisits.slice(0, 3).map((visit, idx) => {
    const visitorName = visit.user?.name || visit.name || (visit.phone ? `Visitor (${visit.phone.slice(-4)})` : 'Scheduled Visitor');
    const propertyTitle = visit.property?.title || visit.project?.title || 'Property Visit';
    const visitDate = visit.scheduledAt ? date(visit.scheduledAt) : 'Upcoming';
    let visitTime = visit.time || '';
    if (!visitTime && visit.scheduledAt) {
      try {
        visitTime = new Date(visit.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch {}
    }
    const status = visit.status || 'requested';
    const image = (visit.property && propertyImages(visit.property)[0]) || '/photos/apartment-1.jpg';
    return {
      id: visit._id || idx,
      visitorName,
      propertyTitle,
      date: visitDate,
      time: visitTime || '10:00 AM',
      status,
      image
    };
  });

  // Dynamic Chart Data generated for selected period (7d, 30d, 90d)
  const totalViews = Number(stats.views ?? (Number(stats.properties || 0) * 180 + 40));
  const totalLeadsCount = Number(stats.totalLeads ?? realLeads.length ?? 0);

  const chartData = useMemo(() => {
    const days = chartPeriod === '7d' ? 7 : chartPeriod === '90d' ? 90 : 30;
    const intervals = 5;
    const step = Math.max(1, Math.floor(days / (intervals - 1)));
    const now = new Date();
    const data = [];

    const viewWeights = [0.15, 0.22, 0.18, 0.28, 0.17];
    const leadWeights = [0.12, 0.20, 0.24, 0.26, 0.18];

    for (let i = 0; i < intervals; i++) {
      const daysAgo = (intervals - 1 - i) * step;
      const d = new Date(now.getTime() - daysAgo * 86400000);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const views = Math.round(totalViews * viewWeights[i]);
      const leads = Math.round(totalLeadsCount * leadWeights[i]);
      data.push({ date: label, views, leads });
    }
    return data;
  }, [chartPeriod, totalViews, totalLeadsCount]);

  const firstName = user?.name
    ? user.name.split(' ')[0]
    : (user?.email ? user.email.split('@')[0] : 'Agent');

  return (
    <div className="space-y-3 lg:space-y-3.5">
      {/* ── TOP HEADER / WELCOME SECTION MATCHING IMAGE (COMPACT) ── */}
      <div className="relative bg-transparent rounded-xl flex items-center justify-between gap-4 overflow-hidden py-0.5">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#163e35] tracking-tight">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-[11px] sm:text-xs text-stone-500 font-normal mt-0.5 leading-snug">
            Here's what's happening with your properties today.
          </p>
        </div>

        {/* Right Skyline Art */}
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-60 lg:w-80 overflow-hidden pointer-events-none opacity-85">
          <img
            src="/photos/builder-1.jpg"
            alt="City skyline"
            className="w-full h-full object-cover object-left"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 50%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%, transparent 100%)'
            }}
          />
        </div>
      </div>

      {/* Permanent UrbanFindr Account ID Card */}
      {user?.accountId && (
        <AccountIdCard
          accountId={user.accountId}
          accountType="broker"
          holderName={user.name || user.company || 'Broker / Agent'}
          verificationStatus="Verified"
        />
      )}

      {/* ── ROW 1: 4 TOP KPI STAT CARDS MATCHING DESIGN & THEME (COMPACT) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Card 1: Total Properties */}
        <div
          onClick={() => onSelectSection('listings')}
          className="bg-white rounded-xl p-3 sm:p-3.5 border border-[#e5e9e2] shadow-xs hover:border-[#749546] hover:shadow-sm transition-all flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ecf2e4] text-[#163e35] flex items-center justify-center shrink-0">
              <House size={18} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-stone-900 leading-none">
                {Number(stats.properties ?? realProperties.length ?? 0)}
              </div>
              <p className="text-[11px] font-medium text-stone-500 mt-1">Total Properties</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-stone-100">
            <span className="text-[11px] font-bold text-[#749546] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#749546]" />
              <span>{Number(stats.activeListings ?? stats.properties ?? 0)} Active</span>
            </span>
            <BrokerSparkline color="#163e35" />
          </div>
        </div>

        {/* Card 2: Total Leads */}
        <div
          onClick={() => onSelectSection('leads')}
          className="bg-white rounded-xl p-3 sm:p-3.5 border border-[#e5e9e2] shadow-xs hover:border-[#749546] hover:shadow-sm transition-all flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ecf2e4] text-[#749546] flex items-center justify-center shrink-0">
              <Users size={18} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-stone-900 leading-none">
                {Number(stats.totalLeads ?? realLeads.length ?? 0)}
              </div>
              <p className="text-[11px] font-medium text-stone-500 mt-1">Total Leads</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-stone-100">
            <span className="text-[11px] font-bold text-[#749546] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#749546]" />
              <span>{Number(stats.newLeads ?? realLeads.filter((l) => l.status === 'new' || l.status === 'pending').length)} New</span>
            </span>
            <BrokerSparkline color="#749546" />
          </div>
        </div>

        {/* Card 3: Scheduled Visits */}
        <div
          onClick={() => onSelectSection('visits')}
          className="bg-white rounded-xl p-3 sm:p-3.5 border border-[#e5e9e2] shadow-xs hover:border-[#749546] hover:shadow-sm transition-all flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ecf2e4] text-[#163e35] flex items-center justify-center shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-stone-900 leading-none">
                {Number(stats.upcomingVisits ?? realVisits.length ?? 0)}
              </div>
              <p className="text-[11px] font-medium text-stone-500 mt-1">Scheduled Visits</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-stone-100">
            <span className="text-[11px] font-bold text-[#749546] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#749546]" />
              <span>{realVisits.filter((v) => v.status === 'confirmed').length} Confirmed</span>
            </span>
            <BrokerSparkline color="#163e35" />
          </div>
        </div>

        {/* Card 4: Deals Closed */}
        <div
          onClick={() => onSelectSection('clients')}
          className="bg-white rounded-xl p-3 sm:p-3.5 border border-[#e5e9e2] shadow-xs hover:border-[#749546] hover:shadow-sm transition-all flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ecf2e4] text-[#749546] flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold text-stone-900 leading-none">
                {Number(stats.closedDeals ?? stats.clients ?? 0)}
              </div>
              <p className="text-[11px] font-medium text-stone-500 mt-1">Deals Closed</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-stone-100">
            <span className="text-[11px] font-bold text-[#749546] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#749546]" />
              <span>{Number(stats.clients ?? 0)} Clients</span>
            </span>
            <BrokerSparkline color="#749546" />
          </div>
        </div>
      </div>

      {/* ── ROW 2: PERFORMANCE OVERVIEW + RECENT LEADS (COMPACT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-3.5">
        {/* Performance Overview (Col 1: 7 spans) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-3 sm:p-3.5 border border-[#e5e9e2] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-2.5 pb-2 border-b border-stone-100">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-[#ecf2e4] text-[#163e35] flex items-center justify-center shrink-0">
                    <BarChart3 size={13} />
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-stone-900">Performance Overview</h3>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] text-stone-500 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#163e35]" />
                    Property Views
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#749546]" />
                    Buyer Leads
                  </span>
                </div>
              </div>

              <div className="relative">
                <select
                  value={chartPeriod}
                  onChange={(e) => setChartPeriod(e.target.value)}
                  className="text-[10px] font-semibold text-stone-700 bg-[#f8faf7] border border-[#e5e9e2] rounded-lg px-2 py-1 hover:border-[#749546] focus:outline-hidden cursor-pointer"
                >
                  <option value="30d">Last 30 Days</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div>
            </div>

            {/* Area Chart with website theme gradient fills */}
            <div className="h-36 sm:h-40 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="brokerViewsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#163e35" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#163e35" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="brokerLeadsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#749546" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#749546" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2ed" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={{ stroke: '#e5e9e2' }}
                    tick={{ fill: '#777c74', fontSize: 10 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e9e2' }}
                    tick={{ fill: '#777c74', fontSize: 10 }}
                  />
                  <RechartsTooltip content={<BrokerCustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="Property Views"
                    stroke="#163e35"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#brokerViewsGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    name="Buyer Leads"
                    stroke="#749546"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#brokerLeadsGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>

              {/* Dynamic Views Callout Badge */}
              {totalViews > 0 && (
                <div className="hidden sm:block absolute top-4 right-[24%] -translate-x-1/2 pointer-events-none">
                  <div className="bg-[#163e35] text-[#d8edb3] px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-md flex items-center gap-1 border border-[#24564a]">
                    <span>{totalViews} Views</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#163e35] mx-auto mt-0.5 ring-3 ring-[#163e35]/25" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Leads (Col 2: 5 spans) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-3 sm:p-3.5 border border-[#e5e9e2] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-stone-100">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-[#ecf2e4] text-[#163e35] flex items-center justify-center shrink-0">
                  <MessageSquare size={13} />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-stone-900">Recent Leads</h3>
              </div>
              <button
                type="button"
                onClick={() => onSelectSection('leads')}
                className="text-[11px] font-bold text-[#163e35] hover:text-[#749546] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight size={11} />
              </button>
            </div>

            {displayLeads.length === 0 ? (
              <div className="py-7 px-3 text-center">
                <div className="w-8 h-8 rounded-full bg-[#ecf2e4] text-[#163e35] flex items-center justify-center mx-auto mb-2">
                  <MessageSquare size={14} />
                </div>
                <p className="text-xs font-bold text-stone-800">No leads yet</p>
                <p className="text-[10px] text-stone-400 mt-0.5">Prospective buyer leads will show here</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {displayLeads.map((lead, idx) => (
                  <div key={lead.id || idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[#ecf2e4] text-[#163e35] font-bold text-[10px] flex items-center justify-center shrink-0">
                        {lead.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate leading-tight">{lead.name}</p>
                        <p className="text-[11px] text-stone-500 truncate leading-tight">{lead.note}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-stone-400 whitespace-nowrap">{lead.time}</span>
                      {lead.unread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#749546]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 3: MY PROPERTIES + UPCOMING VISITS (COMPACT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-3.5">
        {/* My Properties (Col 1: 7 spans) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-3 sm:p-3.5 border border-[#e5e9e2] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-stone-100">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-[#ecf2e4] text-[#163e35] flex items-center justify-center shrink-0">
                  <House size={13} />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-stone-900">My Properties</h3>
              </div>
              <button
                type="button"
                onClick={() => onSelectSection('listings')}
                className="text-[11px] font-bold text-[#163e35] hover:text-[#749546] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight size={11} />
              </button>
            </div>

            {displayProperties.length === 0 ? (
              <div className="py-7 px-4 text-center border border-dashed border-[#e5e9e2] rounded-xl bg-[#f8faf7]">
                <div className="w-8 h-8 rounded-full bg-[#ecf2e4] text-[#163e35] flex items-center justify-center mx-auto mb-2">
                  <House size={15} />
                </div>
                <p className="text-xs font-bold text-stone-800">No properties listed yet</p>
                <p className="text-[10px] text-stone-500 mt-0.5 mb-2.5">Post a property to receive verified buyer leads.</p>
                <Link
                  href="/post-property"
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#163e35] text-white text-[10px] font-bold rounded-lg hover:bg-[#24564a] transition-colors"
                >
                  <Plus size={11} />
                  <span>Add Property</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {displayProperties.map((prop, idx) => (
                  <div
                    key={prop._id || idx}
                    className="border border-[#e5e9e2] rounded-xl overflow-hidden bg-white hover:border-[#749546] hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div className="relative h-20 sm:h-22 w-full bg-stone-100 overflow-hidden">
                      <img
                        src={prop.image || '/photos/apartment-1.jpg'}
                        alt={prop.title}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-1.5 right-1.5 px-2 py-0.2 rounded-full text-[9px] font-bold ${
                          prop.status === 'pending'
                            ? 'bg-[#fef3c7] text-[#b45309]'
                            : 'bg-[#ecf2e4] text-[#163e35]'
                        }`}
                      >
                        {prop.status === 'pending' ? 'Pending' : 'Active'}
                      </span>
                    </div>

                    <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1">
                      <div>
                        <h4 className="text-[11px] font-bold text-stone-900 truncate leading-tight">{prop.title}</h4>
                        <p className="text-[10px] text-stone-500 truncate flex items-center gap-0.5 mt-0.5">
                          <MapPin size={10} className="text-stone-400 shrink-0" />
                          <span>{prop.locality}, {prop.city}</span>
                        </p>
                        <div className="text-xs font-extrabold text-[#163e35] mt-1">
                          {prop.priceFormatted || prop.price}
                        </div>
                        <div className="text-[9px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                          {prop.beds ? <span>{prop.beds} BHK</span> : null}
                          {prop.beds && prop.area ? <span className="text-stone-300">|</span> : null}
                          {prop.area ? <span>{Number(prop.area).toLocaleString('en-IN')} Sq.Ft.</span> : null}
                          {!prop.beds && !prop.area ? <span>Verified Listing</span> : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-stone-100">
                        <Link
                          href={`/post-property?edit=${prop._id}`}
                          className="flex-1 text-center py-1 px-1.5 text-[10px] font-semibold text-stone-700 bg-white border border-[#e5e9e2] rounded-lg hover:bg-[#ecf2e4] hover:text-[#163e35] transition-colors"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/properties/${prop._id}`}
                          className="flex-1 text-center py-1 px-1.5 text-[10px] font-bold text-white bg-[#163e35] hover:bg-[#24564a] rounded-lg transition-colors flex items-center justify-center gap-0.5"
                        >
                          <span>View Details</span>
                          <ArrowRight size={10} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Visits (Col 2: 5 spans) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-3 sm:p-3.5 border border-[#e5e9e2] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-stone-100">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-[#ecf2e4] text-[#163e35] flex items-center justify-center shrink-0">
                  <Calendar size={13} />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-stone-900">Upcoming Visits</h3>
              </div>
              <button
                type="button"
                onClick={() => onSelectSection('visits')}
                className="text-[11px] font-bold text-[#163e35] hover:text-[#749546] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight size={11} />
              </button>
            </div>

            {displayVisits.length === 0 ? (
              <div className="py-7 px-3 text-center">
                <div className="w-8 h-8 rounded-full bg-[#ecf2e4] text-[#163e35] flex items-center justify-center mx-auto mb-2">
                  <Calendar size={14} />
                </div>
                <p className="text-xs font-bold text-stone-800">No scheduled visits</p>
                <p className="text-[10px] text-stone-400 mt-0.5">Upcoming property visit requests will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {displayVisits.map((visit, idx) => (
                  <div key={visit.id || idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={visit.image || '/photos/apartment-1.jpg'}
                        alt={visit.propertyTitle}
                        className="w-9 h-9 rounded-lg object-cover shrink-0 bg-stone-100 border border-stone-200"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate leading-tight">{visit.visitorName}</p>
                        <p className="text-[10px] text-stone-500 truncate leading-tight">{visit.propertyTitle}</p>
                        <div className="text-[9px] text-stone-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-0.5">
                            <Calendar size={9} />
                            <span>{visit.date}</span>
                          </span>
                          {visit.time && (
                            <span className="flex items-center gap-0.5">
                              <Clock size={9} />
                              <span>{visit.time}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                        visit.status === 'confirmed'
                          ? 'bg-[#ecf2e4] text-[#163e35]'
                          : 'bg-[#fef3c7] text-[#b45309]'
                      }`}
                    >
                      {visit.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component: Recent Leads List
function BrokerRecentLeadsList({ onSelectSection }) {
  const { data, loading } = useData('leads?page=1&limit=25');
  const items = data?.items || [];

  // Deduplicate leads by customer + listing so each user inquiry only shows once
  const uniqueItems = useMemo(() => {
    const seen = new Set();
    return items.filter((lead) => {
      const uKey = String(lead.user?._id || lead.user || lead.phone || lead.email || lead.name || '').toLowerCase().trim();
      const pKey = String(lead.property?._id || lead.property || lead.project?._id || lead.project || 'prop').toLowerCase().trim();
      const key = `${uKey}___${pKey}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 5);
  }, [items]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-stone-400">Loading leads…</div>;
  }

  if (uniqueItems.length === 0) {
    return (
      <div className="p-8 text-center space-y-2 border border-dashed border-stone-200 rounded-lg">
        <ClipboardList size={24} className="mx-auto text-stone-300" />
        <p className="text-xs text-stone-500">No leads generated yet.</p>
        <Link href="/post-property" className="inline-block text-xs font-bold text-sky-800 hover:underline">
          Publish listings to begin receiving buyer leads →
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-stone-100">
      {uniqueItems.map((lead) => (
        <div key={lead._id} className="py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-stone-900 truncate">{lead.name || 'Prospect'}</span>
              <StatusBadge status={lead.status} />
            </div>
            <p className="text-xs text-stone-500 truncate mt-0.5">
              {lead.phone} • {lead.property?.title || lead.service || 'Property inquiry'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectSection('leads')}
            className="px-2.5 py-1 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded border border-stone-200 shrink-0"
          >
            Follow Up
          </button>
        </div>
      ))}
    </div>
  );
}

// Section: My Listings (Card View with Property Image + Table View)
function BrokerListingsSection({ onPromote }) {
  const { toast } = useApp();
  const { data, loading, reload } = useData('properties?mine=true&limit=100');
  const { data: leadsData } = useData('leads?page=1&limit=100');
  const items = data?.items || [];
  const [busy, setBusy] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'approved' | 'closed' | 'pending' | 'archived'
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Identify properties with closed deals from leads
  const closedPropIdsFromLeads = useMemo(() => {
    const ids = new Set();
    (leadsData?.items || []).forEach((l) => {
      if (['deal_closed', 'closed', 'converted'].includes(l.status)) {
        const pId = l.property?._id || l.property;
        if (pId) ids.add(String(pId));
      }
    });
    return ids;
  }, [leadsData]);

  const isPropClosed = (p) => p.status === 'closed' || closedPropIdsFromLeads.has(String(p._id));

  async function handleCloseListing(id) {
    if (!window.confirm('Mark this listing as Closed / Deal Closed? It will be shown as Closed across your portfolio.')) return;
    setBusy(id);
    try {
      await api(`properties/${id}`, { method: 'PATCH', body: { status: 'closed' } });
      toast('Listing marked as Closed.');
      reload();
    } catch (e) {
      toast(e.message || 'Failed to close listing.');
    } finally {
      setBusy('');
    }
  }

  async function handleReopenListing(id) {
    if (!window.confirm('Re-open this listing as Active?')) return;
    setBusy(id);
    try {
      await api(`properties/${id}`, { method: 'PATCH', body: { status: 'approved' } });
      toast('Listing re-opened as Active.');
      reload();
    } catch (e) {
      toast(e.message || 'Failed to re-open listing.');
    } finally {
      setBusy('');
    }
  }

  async function handleArchive(id) {
    if (!window.confirm('Archive this listing?')) return;
    setBusy(id);
    try {
      await api(`properties/${id}`, { method: 'DELETE' });
      toast('Listing archived.');
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  const filteredListings = useMemo(() => {
    return items.filter((p) => {
      const closed = isPropClosed(p);
      if (statusFilter === 'approved' && (closed || p.status !== 'approved')) return false;
      if (statusFilter === 'closed' && !closed) return false;
      if (statusFilter === 'pending' && p.status !== 'pending') return false;
      if (statusFilter === 'archived' && p.status !== 'archived') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const cityMatch = (p.city || '').toLowerCase().includes(q);
        const localityMatch = (p.locality || '').toLowerCase().includes(q);
        const typeMatch = (p.type || '').toLowerCase().includes(q);
        const purposeMatch = (p.purpose || '').toLowerCase().includes(q);
        if (!titleMatch && !cityMatch && !localityMatch && !typeMatch && !purposeMatch) return false;
      }
      return true;
    });
  }, [items, statusFilter, searchQuery, closedPropIdsFromLeads]);

  const activeCount = useMemo(() => items.filter((p) => !isPropClosed(p) && p.status === 'approved').length, [items, closedPropIdsFromLeads]);
  const closedCount = useMemo(() => items.filter((p) => isPropClosed(p)).length, [items, closedPropIdsFromLeads]);
  const pendingCount = useMemo(() => items.filter((p) => p.status === 'pending').length, [items]);
  const archivedCount = useMemo(() => items.filter((p) => p.status === 'archived').length, [items]);

  const columns = [
    {
      header: 'Listing',
      render: (row) => {
        const closed = isPropClosed(row);
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-stone-100">
              <img
                src={propertyImages(row)[0] || '/placeholder.jpg'}
                alt={row.title}
                className={`w-full h-full object-cover ${closed ? 'grayscale-[40%]' : ''}`}
              />
              {closed && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-[9px] font-black text-rose-300 uppercase">Closed</span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-stone-900 block truncate">{row.title}</span>
              <span className="text-[11px] text-stone-400 block truncate">
                {row.locality}, {row.city} • {row.type}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Price / Purpose',
      render: (row) => (
        <div>
          <span className="font-extrabold text-stone-900 block">{money(row.price)}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            For {row.purpose}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => {
        const closed = isPropClosed(row);
        if (closed) {
          return (
            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 font-black text-[11px] uppercase tracking-wider flex items-center gap-1 w-fit">
              <CheckCircle2 size={11} className="text-rose-600" /> Closed
            </span>
          );
        }
        return <StatusBadge status={row.status} />;
      }
    },
    {
      header: 'Actions',
      render: (row) => {
        const closed = isPropClosed(row);
        return (
          <div className="flex items-center gap-2.5">
            <Link href={`/properties/${row._id}`} className="text-stone-700 hover:text-stone-900 font-semibold text-xs">
              View
            </Link>
            <Link href={`/properties/${row._id}/edit`} className="text-sky-800 hover:text-sky-900 font-semibold text-xs">
              Edit
            </Link>
            {closed ? (
              <button
                type="button"
                disabled={busy === row._id}
                onClick={() => handleReopenListing(row._id)}
                className="text-emerald-700 hover:text-emerald-800 font-bold text-xs"
              >
                Re-open
              </button>
            ) : (
              <button
                type="button"
                disabled={busy === row._id}
                onClick={() => handleCloseListing(row._id)}
                className="text-rose-600 hover:text-rose-800 font-semibold text-xs"
              >
                Close
              </button>
            )}
            {onPromote && !closed && row.status !== 'archived' && (
              <button
                type="button"
                onClick={() => onPromote(row)}
                className="text-amber-700 hover:text-amber-900 font-semibold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Sparkles size={12} className="text-amber-500" />
                Promote
              </button>
            )}
            {row.status !== 'archived' && (
              <button
                type="button"
                disabled={busy === row._id}
                onClick={() => handleArchive(row._id)}
                className="text-stone-400 hover:text-rose-600 font-semibold text-xs"
              >
                Archive
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header with Title, Status Pills, View Switcher & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-stone-900">My Listings</h2>
          <p className="text-xs text-stone-500">Manage client listings, track closed deals, pricing, and promotional reach</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Status filter pills with dedicated Closed Deals tab */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              All ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('approved')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === 'approved' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('closed')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                statusFilter === 'closed'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              <CheckCircle2 size={12} />
              <span>Closed ({closedCount})</span>
            </button>
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  statusFilter === 'pending' ? 'bg-white text-amber-800 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Pending ({pendingCount})
              </button>
            )}
            {archivedCount > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter('archived')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  statusFilter === 'archived' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Archived ({archivedCount})
              </button>
            )}
          </div>

          {/* Cards vs Table view switch */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'cards' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400 hover:text-stone-700'
              }`}
              title="Cards View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400 hover:text-stone-700'
              }`}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>

          <Link
            href="/post-property"
            className="whitespace-nowrap shrink-0 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:shadow self-start sm:self-auto"
          >
            <Plus size={15} className="shrink-0" />
            <span className="whitespace-nowrap">Add New Listing</span>
          </Link>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search listings by title, locality, city, or type…"
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest text-stone-900 placeholder:text-stone-400 shadow-2xs"
          />
        </div>
      </div>

      {/* Main Content: Card View vs Table View */}
      {loading ? (
        <div className="p-12 text-center text-xs text-stone-400">Loading listings portfolio…</div>
      ) : filteredListings.length === 0 ? (
        <div className="p-12 text-center space-y-2 border border-dashed border-stone-200 rounded-2xl bg-white">
          <House size={30} className="mx-auto text-stone-300" />
          <h3 className="font-bold text-stone-700 text-sm">No listings match your filter</h3>
          <p className="text-xs text-stone-400">Post a new client property to expand your brokerage portfolio.</p>
        </div>
      ) : viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={filteredListings}
          emptyTitle="No listings available"
          emptySubtitle="Listings added to your agent account will appear here."
        />
      ) : (
        /* CARDS GRID WITH HIGH-VISIBILITY CLOSED IDENTIFICATION */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredListings.map((prop) => {
            const images = propertyImages(prop);
            const propImage = images[0] || '/placeholder.jpg';
            const isRent = prop.purpose === 'rent';
            const isPg = prop.purpose === 'pg';
            const isClosed = isPropClosed(prop);
            const bedrooms = prop.bedrooms || (prop.type?.toLowerCase().includes('bhk') ? prop.type : null);
            const bathrooms = prop.bathrooms;
            const area = prop.area || prop.builtUpArea || prop.carpetArea;
            const propLocation = [prop.locality, prop.city].filter(Boolean).join(', ') || 'Hyderabad';

            return (
              <div
                key={prop._id}
                className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between group ${
                  isClosed
                    ? 'bg-rose-50/25 border-rose-300 shadow-xs ring-1 ring-rose-200/60'
                    : 'bg-white border-stone-200/90 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Property Image Banner */}
                <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                  <img
                    src={propImage}
                    alt={prop.title}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                      isClosed ? 'grayscale-[35%] opacity-90' : ''
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* High-Visibility Center Overlay for Closed Properties */}
                  {isClosed && (
                    <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1 z-10">
                      <span className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs uppercase tracking-widest shadow-lg border border-rose-400/50 flex items-center gap-1.5">
                        <CheckCircle2 size={14} /> DEAL CLOSED
                      </span>
                      <span className="text-[10px] text-stone-200 font-semibold drop-shadow-sm">
                        Off Market • Transaction Completed
                      </span>
                    </div>
                  )}

                  {/* Top Badges: Price & Status */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-20">
                    <span className="px-2.5 py-1 rounded-lg bg-stone-900/90 text-white font-black text-xs backdrop-blur-xs shadow-xs">
                      {money(prop.price)}
                      {(isRent || isPg) && <span className="text-[10px] font-normal text-stone-300"> / mo</span>}
                    </span>

                    {isClosed ? (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm ring-1 ring-white/30">
                        <CheckCircle2 size={12} className="text-white" /> CLOSED
                      </span>
                    ) : (
                      <StatusBadge status={prop.status} />
                    )}
                  </div>

                  {/* Bottom Overlay on Image: Property Title & Locality */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white z-20">
                    <h4 className="font-bold text-sm tracking-tight truncate drop-shadow-sm">{prop.title}</h4>
                    <p className="text-[11px] text-stone-200 font-medium truncate flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="shrink-0 text-emerald-400" />
                      <span>{propLocation}</span>
                      <span className="text-stone-300">•</span>
                      <span className="capitalize">For {prop.purpose}</span>
                    </p>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Specs Row */}
                    <div className="flex items-center gap-2.5 text-xs text-stone-600 pb-2.5 border-b border-stone-100">
                      <span className="flex items-center gap-1">
                        <BedDouble size={13} className="text-stone-400 shrink-0" />
                        <span>{bedrooms ? `${bedrooms} Beds` : prop.type || '1 Unit'}</span>
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="flex items-center gap-1">
                        <Bath size={13} className="text-stone-400 shrink-0" />
                        <span>{bathrooms ? `${bathrooms} Baths` : '1 Bath'}</span>
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="flex items-center gap-1">
                        <Maximize size={13} className="text-stone-400 shrink-0" />
                        <span>{area ? `${area} sq.ft` : 'Standard'}</span>
                      </span>
                    </div>

                    {/* Listing Attributes / Category */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-semibold">
                        {prop.type || 'Residential'}
                      </span>
                      {prop.furnishing && (
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-semibold capitalize">
                          {prop.furnishing}
                        </span>
                      )}
                      {prop.createdAt && (
                        <span className="text-[10px] text-stone-400 ml-auto flex items-center gap-1">
                          <Clock size={11} /> {date(prop.createdAt)}
                        </span>
                      )}
                    </div>

                    {/* Prominent Closed Notice Banner inside Card */}
                    {isClosed && (
                      <div className="mt-2.5 px-3 py-1.5 bg-rose-50 border border-rose-200/90 rounded-xl flex items-center justify-between text-xs font-bold text-rose-900">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-rose-600 shrink-0" />
                          <span>Listing Closed • Deal Completed</span>
                        </span>
                        <button
                          type="button"
                          disabled={busy === prop._id}
                          onClick={() => handleReopenListing(prop._id)}
                          className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer shrink-0 ml-2"
                        >
                          Re-open
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Link
                        href={`/properties/${prop._id}`}
                        className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="View property details page"
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </Link>

                      <Link
                        href={`/properties/${prop._id}/edit`}
                        className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-sky-200/60"
                        title="Edit listing details"
                      >
                        <Edit size={12} />
                        <span>Edit</span>
                      </Link>

                      {isClosed ? (
                        <button
                          type="button"
                          disabled={busy === prop._id}
                          onClick={() => handleReopenListing(prop._id)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-emerald-200"
                          title="Re-open this listing as active"
                        >
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          <span>Re-open</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busy === prop._id}
                          onClick={() => handleCloseListing(prop._id)}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-rose-200"
                          title="Mark this listing as Closed / Deal Closed"
                        >
                          <CheckCircle2 size={12} />
                          <span>Close Listing</span>
                        </button>
                      )}

                      {onPromote && !isClosed && (
                        <button
                          type="button"
                          onClick={() => onPromote(prop)}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-amber-200"
                          title="Promote this listing for higher reach"
                        >
                          <Sparkles size={12} className="text-amber-600" />
                          <span>Promote</span>
                        </button>
                      )}
                    </div>

                    {prop.status !== 'archived' && (
                      <button
                        type="button"
                        disabled={busy === prop._id}
                        onClick={() => handleArchive(prop._id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Archive listing"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Section: My Leads Pipeline (Card View with Property Image + Table View)
function BrokerLeadsSection({ onSelectSection }) {
  const { toast } = useApp();
  const { data, loading, reload } = useData('leads?page=1&limit=100');
  const items = data?.items || [];
  const [busy, setBusy] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all'); // 'all' | 'new' | 'closed'
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Deduplicate leads by customer + listing
  const uniqueItems = useMemo(() => {
    const seen = new Set();
    return items.filter((row) => {
      const uKey = String(row.user?._id || row.user || row.phone || row.email || row.name || row._id).toLowerCase().trim();
      const pKey = String(row.property?._id || row.property || row.project?._id || row.project || 'prop').toLowerCase().trim();
      const key = `${uKey}___${pKey}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [items]);

  const leadStatuses = [
    { value: 'new', label: 'NEW' },
    { value: 'contacted', label: 'CONTACTED' },
    { value: 'interested', label: 'INTERESTED' },
    { value: 'site_visit_scheduled', label: 'VISIT SCHEDULED' },
    { value: 'negotiation', label: 'IN NEGOTIATION' },
    { value: 'deal_closed', label: 'DEAL CLOSED' },
    { value: 'lost', label: 'LOST / DROPPED' }
  ];

  async function addToClient(lead) {
    setBusy(lead._id);
    try {
      await api(`leads/${lead._id}`, { method: 'PATCH', body: { isClient: true } });
      const custName = lead.name || lead.user?.name || 'Customer';
      toast(`${custName} added to Clients!`);
      reload();
    } catch (e) {
      toast(e.message || 'Could not add customer to Clients.');
    } finally {
      setBusy('');
    }
  }

  async function updateStatus(id, newStatus) {
    setBusy(id);
    try {
      await api(`leads/${id}`, { method: 'PATCH', body: { status: newStatus } });
      if (['deal_closed', 'closed', 'converted'].includes(newStatus)) {
        const targetLead = items.find((l) => String(l._id) === String(id));
        const propId = targetLead?.property?._id || targetLead?.property;
        if (propId) {
          try {
            await api(`properties/${propId}`, { method: 'PATCH', body: { status: 'closed' } });
          } catch {}
        }
        toast('🎉 Deal marked as closed! Customer visit status updated to Closed.');
      } else {
        toast(`Lead updated to ${newStatus.replace(/_/g, ' ')}.`);
      }
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  // Filter leads by stage and search
  const filteredLeads = useMemo(() => {
    return uniqueItems.filter((lead) => {
      if (stageFilter === 'new' && !['new', 'uncontacted'].includes(lead.status)) return false;
      if (
        stageFilter === 'closed' &&
        !['deal_closed', 'closed', 'converted'].includes(lead.status) &&
        lead.property?.status !== 'closed' &&
        lead.project?.status !== 'closed'
      ) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const propTitle = (lead.property?.title || lead.project?.title || '').toLowerCase();
        const propLoc = (lead.property?.locality || lead.property?.city || '').toLowerCase();
        const custName = (lead.name || '').toLowerCase();
        const custPhone = (lead.phone || '').toLowerCase();
        const custEmail = (lead.email || '').toLowerCase();
        if (!propTitle.includes(q) && !propLoc.includes(q) && !custName.includes(q) && !custPhone.includes(q) && !custEmail.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [uniqueItems, stageFilter, searchQuery]);

  const columns = [
    {
      header: 'Customer / Lead',
      render: (row) => {
        const custName = row.name || row.user?.name || 'Prospect';
        const custPhone = row.phone || row.user?.phone || '—';
        return (
          <div>
            <span className="font-bold text-stone-900 block truncate">{custName}</span>
            <span className="text-[11px] text-stone-500 block truncate flex items-center gap-1">
              <Phone size={11} /> {custPhone}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Interested Property',
      render: (row) => (
        <span className="font-semibold text-stone-800 truncate block max-w-xs">
          {row.property?.title || row.project?.title || 'Property listing'}
        </span>
      )
    },
    {
      header: 'Enquiry Date',
      render: (row) => <span className="text-stone-500 text-xs">{date(row.createdAt)}</span>
    },
    {
      header: 'Lead Stage',
      render: (row) => (
        <select
          value={row.status}
          disabled={busy === row._id}
          onChange={(e) => updateStatus(row._id, e.target.value)}
          className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 font-semibold focus:outline-none focus:border-stone-800 cursor-pointer"
        >
          {leadStatuses.map((st) => (
            <option key={st.value} value={st.value}>
              {st.label}
            </option>
          ))}
        </select>
      )
    },
    {
      header: 'Notes',
      render: (row) => (
        <span className="text-xs text-stone-500 line-clamp-1">
          {row.note || 'No notes added'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => {
        const isDealClosed = ['deal_closed', 'closed', 'converted'].includes(row.status);
        const isPropertyClosed = row.property?.status === 'closed' || row.project?.status === 'closed';
        const isClosed = isDealClosed || isPropertyClosed;
        const isAddedToClient = Boolean(row.isClient || isDealClosed);
        const custName = row.name || row.user?.name || 'Client';
        const custPhone = row.phone || row.user?.phone || '';
        const custEmail = row.email || row.user?.email || '';
        return (
          <div className="flex items-center gap-2 flex-wrap">
            {!isAddedToClient ? (
              <button
                type="button"
                disabled={busy === row._id}
                onClick={() => addToClient(row)}
                className="px-2.5 py-1 bg-[#163e35] hover:bg-[#24564a] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                title="Add customer details to Clients"
              >
                <UserPlus size={12} />
                <span>{busy === row._id ? 'Adding…' : 'Add to Client'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectSection?.('clients')}
                className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 font-extrabold text-[10px] flex items-center gap-1 cursor-pointer"
                title="Customer added to Clients — click to view Clients"
              >
                <UserCheck size={11} className="text-emerald-600" /> Added to Clients
              </button>
            )}
            {!isClosed ? (
              <button
                type="button"
                disabled={busy === row._id}
                onClick={() => updateStatus(row._id, 'deal_closed')}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                title="Mark deal as closed and convert lead to client"
              >
                <CheckCircle2 size={12} />
                <span>Close Deal</span>
              </button>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-[10px] flex items-center gap-1">
                <CheckCircle2 size={11} className="text-emerald-600" /> Closed
              </span>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header with Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">My Leads</h2>
          <p className="text-xs text-stone-500">
            Track customer inquiries, add active prospects to Clients, advance pipeline stages, and close deals
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          {/* Stage filter pills */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setStageFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                stageFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              All ({uniqueItems.length})
            </button>
            <button
              type="button"
              onClick={() => setStageFilter('new')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                stageFilter === 'new' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              New
            </button>
            <button
              type="button"
              onClick={() => setStageFilter('closed')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                stageFilter === 'closed' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Closed Deals
            </button>
          </div>

          {/* Cards vs Table view switch */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'cards' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400 hover:text-stone-700'
              }`}
              title="Cards View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-400 hover:text-stone-700'
              }`}
              title="Table View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by customer name, phone, property title, or location…"
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest text-stone-900 placeholder:text-stone-400 shadow-2xs"
          />
        </div>
      </div>

      {/* Main Content: Card View vs Table View */}
      {loading ? (
        <div className="p-12 text-center text-xs text-stone-400">Loading leads portfolio…</div>
      ) : filteredLeads.length === 0 ? (
        <div className="p-12 text-center space-y-2 border border-dashed border-stone-200 rounded-2xl bg-white">
          <ClipboardList size={30} className="mx-auto text-stone-300" />
          <h3 className="font-bold text-stone-700 text-sm">No leads match your filter</h3>
          <p className="text-xs text-stone-400">Buyer inquiries submitted on your listings will appear here in real-time.</p>
        </div>
      ) : viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={filteredLeads}
          emptyTitle="No leads generated yet"
          emptySubtitle="Inquiries from interested buyers will appear here in real-time."
        />
      ) : (
        /* CARDS GRID WITH PROPERTY PHOTO (User Request) */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredLeads.map((lead) => {
            const isDealClosed = ['deal_closed', 'closed', 'converted'].includes(lead.status);
            const isPropertyClosed = lead.property?.status === 'closed' || lead.project?.status === 'closed';
            const isClosed = isDealClosed || isPropertyClosed;
            const isAddedToClient = Boolean(lead.isClient || isDealClosed);
            const custName = lead.name || lead.user?.name || 'Prospective Buyer';
            const custPhone = lead.phone || lead.user?.phone || '';
            const custEmail = lead.email || lead.user?.email || '';
            const prop = lead.property || lead.project;
            const propImage =
              prop?.images?.[0] ||
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';
            const propTitle = prop?.title || 'Verified Property Listing';
            const propPrice = prop?.price ? money(prop.price) : prop?.priceMin ? money(prop.priceMin) : 'Price on Request';
            const propLocation = [prop?.locality, prop?.city].filter(Boolean).join(', ') || 'Hyderabad';

            return (
              <div
                key={lead._id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                {/* Property Image Banner */}
                <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                  <img
                    src={propImage}
                    alt={propTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  {/* Top Badges: Price & Status */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-stone-900/90 text-white font-black text-xs backdrop-blur-xs shadow-xs">
                      {propPrice}
                    </span>
                    <StatusBadge status={isClosed ? 'closed' : lead.status} />
                  </div>

                  {/* Bottom Overlay on Image: Property Title & Locality */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <h4 className="font-bold text-sm tracking-tight truncate drop-shadow-sm">{propTitle}</h4>
                    <p className="text-[11px] text-stone-200 font-medium truncate flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="shrink-0 text-emerald-400" />
                      <span>{propLocation}</span>
                      {prop?.bhk && <span>• {prop.bhk} BHK</span>}
                    </p>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Customer Info Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xs shrink-0 border border-emerald-200">
                          {custName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-sm text-stone-900 truncate">
                          {custName}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 shrink-0 flex items-center gap-1">
                        <Clock size={11} /> {date(lead.createdAt)}
                      </span>
                    </div>

                    {/* Contact Links */}
                    <div className="mt-2.5 space-y-1 text-xs">
                      <a
                        href={custPhone ? `tel:${custPhone}` : undefined}
                        className="text-stone-700 hover:text-forest font-semibold flex items-center gap-1.5 truncate"
                      >
                        <Phone size={12} className="text-stone-400 shrink-0" />
                        <span>{custPhone || 'No phone provided'}</span>
                      </a>
                      {custEmail && (
                        <a
                          href={`mailto:${custEmail}`}
                          className="text-stone-500 hover:text-forest flex items-center gap-1.5 truncate text-[11px]"
                        >
                          <Mail size={12} className="text-stone-400 shrink-0" />
                          <span className="truncate">{custEmail}</span>
                        </a>
                      )}
                    </div>

                    {/* Customer Requirement / Note */}
                    {lead.note && (
                      <div className="mt-2.5 p-2 bg-stone-50 rounded-lg border border-stone-200/80 text-[11px] text-stone-600 line-clamp-2">
                        "{lead.note}"
                      </div>
                    )}
                  </div>

                  {/* Stage Dropdown & Action Buttons */}
                  <div className="pt-3 border-t border-stone-100 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Lead Stage:</span>
                      <select
                        value={lead.status}
                        disabled={busy === lead._id}
                        onChange={(e) => updateStatus(lead._id, e.target.value)}
                        className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 font-bold text-stone-800 focus:outline-none focus:border-stone-800 cursor-pointer max-w-[170px] truncate"
                      >
                        {leadStatuses.map((st) => (
                          <option key={st.value} value={st.value}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Actions Bar: Add to Client, Close Deal, WhatsApp */}
                    <div className="flex items-center gap-2">
                      {!isAddedToClient ? (
                        <button
                          type="button"
                          disabled={busy === lead._id}
                          onClick={() => addToClient(lead)}
                          className="flex-1 py-1.5 px-2 bg-[#163e35] hover:bg-[#24564a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                          title="Add this customer's details to Clients"
                        >
                          <UserPlus size={13} />
                          <span>{busy === lead._id ? 'Adding…' : 'Add to Client'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectSection?.('clients')}
                          className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 font-extrabold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          title="Customer is in Clients — click to view Clients"
                        >
                          <UserCheck size={13} className="text-emerald-600" />
                          <span>Added to Clients</span>
                        </button>
                      )}

                      {!isClosed ? (
                        <button
                          type="button"
                          disabled={busy === lead._id}
                          onClick={() => updateStatus(lead._id, 'deal_closed')}
                          className="flex-1 py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                          title="Mark deal as closed & convert lead to client"
                        >
                          <CheckCircle2 size={13} />
                          <span>Close Deal</span>
                        </button>
                      ) : (
                        <span className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-[11px] flex items-center justify-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-600" /> Closed
                        </span>
                      )}

                      {custPhone && (
                        <a
                          href={`https://wa.me/${custPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center justify-center shrink-0"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle size={15} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
// Section: Visits
function BrokerVisitsSection() {
  const { toast } = useApp();
  const { data, loading, reload } = useData('visits?page=1&limit=50');
  const items = data?.items || [];
  const [busy, setBusy] = useState('');

  // Deduplicate visits so each customer visit request on a property shows only once. If other users send, their details show.
  const uniqueVisits = useMemo(() => {
    const seen = new Set();
    return items.filter((row) => {
      const uKey = String(row.user?._id || row.user || row.phone || row.user?.phone || row.user?.email || row._id).toLowerCase().trim();
      const pKey = String(row.property?._id || row.property || row.project?._id || row.project || 'prop').toLowerCase().trim();
      const key = `${uKey}___${pKey}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [items]);

  async function updateVisit(id, status) {
    setBusy(id);
    try {
      await api(`visits/${id}`, { method: 'PATCH', body: { status } });
      toast(`Visit marked as ${status}.`);
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  const columns = [
    {
      header: 'Client / Buyer',
      render: (row) => (
        <div>
          <span className="font-bold text-stone-900 block truncate">{row.user?.name || 'Visitor'}</span>
          <span className="text-[11px] text-stone-400 block truncate">{row.user?.phone || 'Phone verified'}</span>
        </div>
      )
    },
    {
      header: 'Property',
      render: (row) => (
        <span className="font-semibold text-stone-800 truncate block max-w-xs">
          {row.property?.title || 'Listing'}
        </span>
      )
    },
    {
      header: 'Time',
      render: (row) => <span className="font-semibold text-stone-800">{date(row.scheduledAt)}</span>
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'requested' && (
            <button
              type="button"
              disabled={busy === row._id}
              onClick={() => updateVisit(row._id, 'confirmed')}
              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold"
            >
              Confirm
            </button>
          )}
          {row.status === 'confirmed' && (
            <button
              type="button"
              disabled={busy === row._id}
              onClick={() => updateVisit(row._id, 'completed')}
              className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-bold"
            >
              Done
            </button>
          )}
          {['requested', 'confirmed'].includes(row.status) && (
            <button
              type="button"
              disabled={busy === row._id}
              onClick={() => updateVisit(row._id, 'cancelled')}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Client Property Visits</h2>
        <p className="text-xs text-stone-500">Coordinate and confirm buyer walkthroughs across your client listings</p>
      </div>

      <DataTable
        columns={columns}
        data={uniqueVisits}
        emptyTitle="No visits scheduled"
        emptySubtitle="Client visit requests will be listed here."
      />
    </div>
  );
}

// Section: Clients Directory
function BrokerClientsSection() {
  const { toast } = useApp();
  const { data, reload } = useData('leads?page=1&limit=100');
  const items = data?.items || [];
  const [activeTab, setActiveTab] = useState('clients'); // 'clients' | 'buyers' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [busy, setBusy] = useState('');

  async function addLeadToClient(client) {
    const targetLeadId = client.leadId || client._id;
    if (!targetLeadId) return;
    setBusy(targetLeadId);
    try {
      await api(`leads/${targetLeadId}`, { method: 'PATCH', body: { isClient: true } });
      toast(`${client.name || 'Customer'} added to My Clients!`);
      reload();
    } catch (e) {
      toast(e.message || 'Could not add customer to Clients.');
    } finally {
      setBusy('');
    }
  }

  // Group unique clients and categorize added clients & buyers who closed deals
  const clientMap = new Map();
  items.forEach((item) => {
    const rawKey = item.user?._id || item.user || item.phone || item.email || item.name || item._id;
    const key = String(rawKey).toLowerCase().trim();
    const isClosedDeal = ['deal_closed', 'closed', 'converted'].includes(item.status);
    const isMarkedClient = Boolean(item.isClient || isClosedDeal);
    const propInfo = item.property || item.project;
    const custName = item.name || item.user?.name || 'Client';
    const custPhone = item.phone || item.user?.phone || '—';
    const custEmail = item.email || item.user?.email || '—';
    const custCity = item.city || item.user?.city || item.property?.city || 'Bengaluru';

    if (!clientMap.has(key)) {
      clientMap.set(key, {
        _id: item._id,
        leadId: item._id,
        customerId: item.user?._id || item.user || null,
        name: custName,
        phone: custPhone,
        email: custEmail,
        city: custCity,
        firstContact: item.createdAt,
        addedToClientAt: item.addedToClientAt || (isMarkedClient ? item.updatedAt || item.createdAt : null),
        totalInquiries: 1,
        latestStatus: item.status,
        latestNote: item.note || '',
        isAddedClient: isMarkedClient,
        hasClosedDeal: isClosedDeal,
        closedDealsCount: isClosedDeal ? 1 : 0,
        purchasedProperties: isClosedDeal && propInfo ? [propInfo] : [],
        interestedProperties: propInfo ? [propInfo] : [],
        recentProperty: propInfo
      });
    } else {
      const existing = clientMap.get(key);
      existing.totalInquiries += 1;
      if (existing.phone === '—' && custPhone !== '—') existing.phone = custPhone;
      if (existing.email === '—' && custEmail !== '—') existing.email = custEmail;
      if (!existing.latestNote && item.note) existing.latestNote = item.note;
      if (!existing.recentProperty && propInfo) existing.recentProperty = propInfo;
      if (propInfo && !existing.interestedProperties.some((p) => String(p._id) === String(propInfo._id))) {
        existing.interestedProperties.push(propInfo);
      }
      if (isMarkedClient) {
        existing.isAddedClient = true;
        if (!existing.addedToClientAt) {
          existing.addedToClientAt = item.addedToClientAt || item.updatedAt || item.createdAt;
        }
      }
      if (isClosedDeal) {
        existing.hasClosedDeal = true;
        existing.closedDealsCount += 1;
        if (propInfo && !existing.purchasedProperties.some((p) => String(p._id) === String(propInfo._id))) {
          existing.purchasedProperties.push(propInfo);
        }
        existing.latestStatus = item.status;
      }
    }
  });

  const allClients = Array.from(clientMap.values());
  const addedClientsList = allClients.filter((c) => c.isAddedClient);
  const buyersList = allClients.filter((c) => c.hasClosedDeal);

  const tabSource =
    activeTab === 'clients'
      ? addedClientsList
      : activeTab === 'buyers'
      ? buyersList
      : allClients;

  // Apply tab filter & search
  const displayedClients = tabSource.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.purchasedProperties.some((p) => (p.title || '').toLowerCase().includes(q)) ||
      c.interestedProperties.some((p) => (p.title || '').toLowerCase().includes(q))
    );
  });

  const columns = [
    {
      header: 'Client / Buyer',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-800 font-extrabold flex items-center justify-center text-xs shrink-0 border border-stone-200">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-stone-900">{row.name}</span>
              {row.hasClosedDeal ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-[10px] border border-emerald-300 flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 size={10} className="text-emerald-600" /> Closed Deal / Buyer
                </span>
              ) : row.isAddedClient ? (
                <span className="px-2 py-0.5 rounded-full bg-[#ecf2e4] text-[#163e35] font-extrabold text-[10px] border border-[#163e35]/20 flex items-center gap-1 shadow-2xs">
                  <UserCheck size={10} className="text-[#163e35]" /> Added Client
                </span>
              ) : null}
            </div>
            <span className="text-[11px] text-stone-400 block">
              {row.addedToClientAt ? `Added: ${date(row.addedToClientAt)}` : `First engaged: ${date(row.firstContact)}`}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Contact Info',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <a href={row.phone && row.phone !== '—' ? `tel:${row.phone}` : undefined} className="text-stone-800 hover:text-forest font-semibold flex items-center gap-1">
            <Phone size={11} className="text-stone-400" /> {row.phone}
          </a>
          <a href={row.email && row.email !== '—' ? `mailto:${row.email}` : undefined} className="text-stone-500 hover:text-forest flex items-center gap-1">
            <Mail size={11} className="text-stone-400" /> {row.email}
          </a>
        </div>
      )
    },
    {
      header: 'Property / Deal Details',
      render: (row) => {
        if (row.hasClosedDeal && row.purchasedProperties.length > 0) {
          const prop = row.purchasedProperties[0];
          return (
            <div className="text-xs max-w-xs">
              <span className="font-extrabold text-stone-900 block truncate text-[13px]">{prop.title}</span>
              <span className="text-[11px] text-emerald-700 font-bold block">
                {money(prop.price)} • {prop.locality || row.city}
              </span>
            </div>
          );
        }
        return (
          <div className="text-xs max-w-xs">
            <span className="font-semibold text-stone-800 truncate block">
              {row.recentProperty?.title || 'General Inquiry'}
            </span>
            {row.interestedProperties.length > 1 && (
              <span className="text-[11px] text-emerald-700 font-semibold block">
                +{row.interestedProperties.length - 1} more property discussed
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Deals & Inquiries',
      render: (row) => (
        <div className="text-xs">
          <span className="font-bold text-stone-900 block">
            {row.closedDealsCount > 0 ? `${row.closedDealsCount} Deal${row.closedDealsCount > 1 ? 's' : ''} Closed` : 'Active Prospect'}
          </span>
          <span className="text-stone-400 text-[11px]">{row.totalInquiries} Total Inquiries</span>
        </div>
      )
    },
    {
      header: 'Latest Status',
      render: (row) => <StatusBadge status={row.latestStatus} />
    },
    {
      header: 'Action',
      render: (row) => (
        <div className="flex items-center gap-2">
          {!row.isAddedClient ? (
            <button
              type="button"
              disabled={busy === (row.leadId || row._id)}
              onClick={(e) => {
                e.stopPropagation();
                addLeadToClient(row);
              }}
              className="px-3 py-1.5 bg-[#163e35] hover:bg-[#24564a] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              title="Add this customer to My Clients"
            >
              <UserPlus size={12} />
              <span>Add to Client</span>
            </button>
          ) : row.phone && row.phone !== '—' ? (
            <a
              href={`https://wa.me/${row.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1 transition-colors"
              title="Chat on WhatsApp"
            >
              <MessageCircle size={12} />
              <span>WhatsApp</span>
            </a>
          ) : (
            <span className="text-[11px] font-semibold text-emerald-700">In Clients</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Client Directory</h2>
          <p className="text-xs text-stone-500">
            Customers added from My Leads, buyers with closed deals, and prospective inquiries
          </p>
        </div>

        {/* Filter Toggle Tabs */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl self-start flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('clients')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'clients'
                ? 'bg-white text-[#163e35] shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserCheck size={12} className={activeTab === 'clients' ? 'text-[#163e35]' : ''} />
            <span>My Clients ({addedClientsList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('buyers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'buyers'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CheckCircle2 size={12} className={activeTab === 'buyers' ? 'text-emerald-600' : ''} />
            <span>Closed Deals / Buyers ({buyersList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>All Inquiries ({allClients.length})</span>
          </button>
        </div>
      </div>

      {/* Search Bar & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients by name, contact phone, email, or property…"
            className="w-full sm:max-w-md px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest text-stone-900 placeholder:text-stone-400 shadow-2xs"
          />
        </div>

        {/* View Mode Toggle: Cards / Table */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white text-forest shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LayoutGrid size={13} />
            <span>Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white text-forest shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <List size={13} />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' ? (
        displayedClients.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <Users size={24} />
            </div>
            <h3 className="font-bold text-base text-stone-900">
              {activeTab === 'clients'
                ? 'No clients added yet'
                : activeTab === 'buyers'
                ? 'No closed deals / buyers yet'
                : 'No inquiries recorded yet'}
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {activeTab === 'clients'
                ? 'Go to My Leads and click "Add to Client" on any customer card to move their details into Clients.'
                : activeTab === 'buyers'
                ? 'When you close a deal on a lead, the buyer will automatically appear in this section.'
                : 'Customers who inquire, call, message, or schedule visits will appear here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {displayedClients.map((client) => {
              const prop = (client.purchasedProperties && client.purchasedProperties.length > 0)
                ? client.purchasedProperties[0]
                : client.recentProperty;
              const propImage =
                prop?.images?.[0] ||
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';
              const propTitle = prop?.title || (client.hasClosedDeal ? 'Purchased Property' : 'Interested Property');
              const propPrice = prop?.price ? money(prop.price) : prop?.priceMin ? money(prop.priceMin) : '—';
              const propLocation = [prop?.locality, prop?.city || client.city].filter(Boolean).join(', ') || client.city;

              return (
                <div
                  key={client._id || client.leadId}
                  className="bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                >
                  {/* Property Image Banner */}
                  <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={propImage}
                      alt={propTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    {/* Top Badges: Price & Client/Buyer/Status Badge */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-stone-900/90 text-white font-black text-xs backdrop-blur-xs shadow-xs">
                        {propPrice}
                      </span>
                      {client.hasClosedDeal ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-700/95 text-white font-black text-xs backdrop-blur-xs shadow-xs flex items-center gap-1">
                          <CheckCircle2 size={12} /> Deal Closed
                        </span>
                      ) : client.isAddedClient ? (
                        <span className="px-2.5 py-1 rounded-lg bg-[#163e35]/95 text-[#d8edb3] font-black text-xs backdrop-blur-xs shadow-xs flex items-center gap-1">
                          <UserCheck size={12} /> Client
                        </span>
                      ) : (
                        <StatusBadge status={client.latestStatus} />
                      )}
                    </div>

                    {/* Bottom Overlay on Image: Property Title & Locality */}
                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <h4 className="font-bold text-sm tracking-tight truncate drop-shadow-sm">{propTitle}</h4>
                      <p className="text-[11px] text-stone-200 font-medium truncate flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="shrink-0 text-emerald-400" />
                        <span>{propLocation}</span>
                        {prop?.bhk && <span>• {prop.bhk} BHK</span>}
                      </p>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {/* Customer Info Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xs shrink-0 border border-emerald-200">
                            {(client.name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-sm text-stone-900 truncate block">
                              {client.name || 'Client'}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-semibold block">
                              {client.closedDealsCount > 0
                                ? `${client.closedDealsCount} Deal Closed`
                                : client.isAddedClient
                                ? 'Added Client'
                                : 'Prospective Lead'}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-stone-400 shrink-0 flex items-center gap-1">
                          <Clock size={11} /> {client.addedToClientAt ? date(client.addedToClientAt) : client.firstContact ? date(client.firstContact) : 'Active'}
                        </span>
                      </div>

                      {/* Contact Links */}
                      <div className="mt-2.5 space-y-1 text-xs">
                        <a
                          href={client.phone && client.phone !== '—' ? `tel:${client.phone}` : undefined}
                          className="text-stone-700 hover:text-forest font-semibold flex items-center gap-1.5 truncate"
                        >
                          <Phone size={12} className="text-stone-400 shrink-0" />
                          <span>{client.phone && client.phone !== '—' ? client.phone : 'No phone provided'}</span>
                        </a>
                        {client.email && client.email !== '—' && (
                          <a
                            href={`mailto:${client.email}`}
                            className="text-stone-500 hover:text-forest flex items-center gap-1.5 truncate text-[11px]"
                          >
                            <Mail size={12} className="text-stone-400 shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </a>
                        )}
                      </div>

                      {/* Latest Note / Discussion */}
                      {client.latestNote && (
                        <div className="mt-2.5 p-2 bg-stone-50 rounded-lg border border-stone-200/80 text-[11px] text-stone-600 line-clamp-2">
                          "{client.latestNote}"
                        </div>
                      )}

                      {/* Activity Summary Chip */}
                      <div className="mt-2.5 p-2 bg-stone-50 rounded-lg border border-stone-200/80 text-[11px] text-stone-600 flex items-center justify-between gap-2">
                        <span>
                          Inquiries: <strong className="text-stone-900">{client.totalInquiries}</strong>
                          {client.interestedProperties.length > 1 && (
                            <> • <strong className="text-stone-900">{client.interestedProperties.length}</strong> properties</>
                          )}
                        </span>
                        <span className="font-bold text-emerald-700 truncate">{client.city}</span>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
                      {!client.isAddedClient ? (
                        <button
                          type="button"
                          disabled={busy === (client.leadId || client._id)}
                          onClick={() => addLeadToClient(client)}
                          className="flex-1 py-1.5 px-3 bg-[#163e35] hover:bg-[#24564a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          title="Add customer to My Clients"
                        >
                          <UserPlus size={13} />
                          <span>Add to Client</span>
                        </button>
                      ) : client.phone && client.phone !== '—' ? (
                        <a
                          href={`tel:${client.phone}`}
                          className="flex-1 py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                          title="Call client"
                        >
                          <Phone size={13} className="text-[#163e35]" />
                          <span>Call Client</span>
                        </a>
                      ) : (
                        <span className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5">
                          <UserCheck size={13} className="text-emerald-600" />
                          <span>Added Client</span>
                        </span>
                      )}

                      {client.phone && client.phone !== '—' && (
                        <a
                          href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-1.5 px-3 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5 text-xs font-bold"
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle size={14} />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <DataTable
          columns={columns}
          data={displayedClients}
          emptyTitle={
            activeTab === 'clients'
              ? 'No clients added yet'
              : activeTab === 'buyers'
              ? 'No closed deals / buyers yet'
              : 'No inquiries recorded yet'
          }
          emptySubtitle={
            activeTab === 'clients'
              ? 'Go to My Leads and click "Add to Client" on any customer card to add their details here.'
              : activeTab === 'buyers'
              ? 'When you close a deal on a lead, the buyer will automatically appear in this section.'
              : 'Clients who inquire or schedule visits will be organized into your directory.'
          }
        />
      )}
    </div>
  );
}

// Section: Analytics
function BrokerAnalyticsSection({ stats }) {
  const conversionRate = stats.views > 0
    ? (((Number(stats.totalLeads) || 0) / Number(stats.views)) * 100).toFixed(1) + '%'
    : (stats.totalLeads > 0 ? '100%' : '0.0%');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Performance Analytics</h2>
        <p className="text-xs text-stone-500">Lead generation, tour completion rate, and listing reach</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Portfolio Views"
          value={stats.views}
          subtitle="Total discovery reach"
          icon={Eye}
          color="#163e35" bgIcon="#ecf2e4"
        />
        <StatCard
          title="Buyer Leads"
          value={stats.totalLeads}
          subtitle="Pipeline opportunities"
          icon={ClipboardList}
          color="#749546" bgIcon="#ecf2e4"
        />
        <StatCard
          title="Tours Conducted"
          value={stats.upcomingVisits}
          subtitle="Site visits confirmed"
          icon={Calendar}
          color="#163e35" bgIcon="#ecf2e4"
        />
        <StatCard
          title="Conversion Rate"
          value={conversionRate}
          subtitle="Lead-to-tour closure"
          icon={TrendingUp}
          color="#b45309"
          bgIcon="#fef3c7"
        />
      </div>

      <AnalyticsChart
        title="Weekly Deal Flow &amp; Interactions"
        subtitle="Trend analysis for your brokerage team"
        data={stats.analytics}
        dataKeys={[
          { key: 'views', name: 'Views', color: '#0369a1' },
          { key: 'enquiries', name: 'Inquiries', color: '#0284c7' },
          { key: 'visits', name: 'Visits', color: '#047857' }
        ]}
        type="bar"
        height={260}
      />
    </div>
  );
}

// Section: Promotions
function BrokerPromotionsSection({ onPromote }) {
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

// Section: Messages
function BrokerMessagesSection() {
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
      title="Client Inquiries"
      subtitle="Direct message conversations with prospective buyers and property clients"
    />
  );
}

// Section: Profile
function BrokerProfileSection() {
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
          company: form.get('company'),
          reraId: form.get('reraId'),
          experience: form.get('experience'),
          bio: form.get('bio')
        }
      });
      setUser(res.user);
      toast('Agent agency profile updated.');
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Agent &amp; Agency Accreditation</h2>
        <p className="text-xs text-stone-500">RERA licensing, firm name, and professional advisory details</p>
      </div>

      {user?.accountId && (
        <AccountIdCard
          accountId={user.accountId}
          accountType="broker"
          holderName={user.name || user.company || 'Broker / Agent'}
          verificationStatus="Verified"
        />
      )}

      <form onSubmit={handleSave} className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Lead Agent Name</label>
            <input
              name="name"
              required
              defaultValue={user?.name || ''}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Agency / Brokerage Firm</label>
            <input
              name="company"
              defaultValue={user?.company || ''}
              placeholder="e.g. Skyline Realty, Apex Homes"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">RERA License ID *</label>
            <input
              name="reraId"
              required
              defaultValue={user?.reraId || ''}
              placeholder="e.g. PRM/KA/RERA/..."
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900 font-mono uppercase"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Years in Real Estate</label>
            <input
              name="experience"
              defaultValue={user?.experience || ''}
              placeholder="e.g. 10+ years"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Agency Overview &amp; Localities</label>
          <textarea
            name="bio"
            rows={3}
            defaultValue={user?.bio || ''}
            placeholder="Describe your property portfolio, key micro-markets, and advisory standard…"
            className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-900"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={busy}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            {busy ? 'Saving Changes…' : 'Save Agent Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

