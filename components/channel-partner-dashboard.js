'use client';

import { useState, useMemo, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Building2,
  Users,
  ShieldCheck,
  PhoneCall,
  Phone,
  MessageSquare,
  ClipboardList,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  ExternalLink,
  Trash2,
  Pencil,
  LifeBuoy,
  Bell,
  MapPin,
  Sparkles,
  Check,
  Eye,
  Send,
  Calendar,
  Home,
  Tag,
  ChevronRight,
  TrendingUp,
  UserCheck,
  CheckSquare,
  HelpCircle,
  Mail,
  BarChart3,
  PieChart,
  Layers,
  ArrowUpRight,
  LogOut,
  Target,
  Flame,
  Award,
  CircleDollarSign,
  User,
  Settings,
  Lock,
  Key,
  ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { api, useApp, useData } from './providers';
import { money, date } from '@/lib/format';
import { propertyImages } from '@/lib/media';
import { Image, State } from './ui';

export const TIME_RANGE_OPTIONS = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: '7days', label: 'Last 7 Days' },
  { id: '30days', label: 'Last 30 Days' },
  { id: '6months', label: 'Last 6 Months' },
  { id: '9months', label: 'Last 9 Months' }
];

export function isWithinTimeRange(dateStr, range) {
  if (!range || range === 'all') return true;
  if (!dateStr) return false;
  const targetDate = new Date(dateStr);
  const time = targetDate.getTime();
  if (isNaN(time)) return false;
  const now = Date.now();
  const diff = now - time;
  if (diff < 0) return true; // lead dated in future / clock skew

  switch (range) {
    case 'today': {
      const isPast24h = diff <= 86400000;
      const nowDate = new Date(now);
      const isSameDay =
        targetDate.getFullYear() === nowDate.getFullYear() &&
        targetDate.getMonth() === nowDate.getMonth() &&
        targetDate.getDate() === nowDate.getDate();
      return isPast24h || isSameDay;
    }
    case '7days':
      return diff <= 7 * 86400000;
    case '30days':
      return diff <= 30 * 86400000;
    case '6months':
      return diff <= 182.5 * 86400000;
    case '9months':
      return diff <= 273.75 * 86400000;
    default:
      return true;
  }
}

export const TimeRangeContext = createContext(null);
export function useTimeRange() {
  return useContext(TimeRangeContext);
}

export const PIPELINE_TIME_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: '7days', label: 'Last 7 Days' },
  { id: '30days', label: 'Last 30 Days' },
  { id: '6months', label: 'Last 6 Months' },
  { id: '9months', label: 'Last 9 Months' },
  { id: 'all', label: 'All Time' }
];

export const PIPELINE_CHANNEL_OPTIONS = [
  { id: 'all', label: 'All Channels', icon: null },
  { id: 'phone', label: 'Phone Calls', icon: PhoneCall },
  { id: 'message', label: 'Direct Messages', icon: MessageSquare },
  { id: 'enquiry', label: 'Property Enquiries', icon: ClipboardList }
];

export const PIPELINE_STATUS_OPTIONS = [
  { id: 'all', label: 'All Statuses', dot: 'bg-stone-400' },
  { id: 'uncontacted', label: 'Uncontacted (New)', dot: 'bg-blue-500' },
  { id: 'contacted', label: 'Contacted', dot: 'bg-amber-500' },
  { id: 'interested', label: 'Interested / Qualified', dot: 'bg-emerald-500' },
  { id: 'site_visit_scheduled', label: 'Site Visit Scheduled', dot: 'bg-indigo-500' },
  { id: 'negotiation', label: 'Negotiation', dot: 'bg-purple-500' },
  { id: 'converted', label: 'Converted (Won)', dot: 'bg-[#163e35]' },
  { id: 'dropped', label: 'Dropped (Lost)', dot: 'bg-rose-500' }
];

export function PipelineFiltersWidget({
  timeRange,
  setTimeRange,
  propSetTimeRange,
  onTimeRangeChange,
  leadChannelFilter,
  setLeadChannelFilter,
  leadStatusFilter,
  setLeadStatusFilter,
  leadAdvisorFilter,
  setLeadAdvisorFilter,
  leads = [],
  timeFilteredLeads = [],
  team = [],
  activeFiltersCount = 0,
  onResetFilters,
  showHeader = true
}) {
  const [sectionsOpen, setSectionsOpen] = useState({
    time: true,
    channel: true,
    status: true,
    advisor: true
  });

  const toggle = (sec) => setSectionsOpen((p) => ({ ...p, [sec]: !p[sec] }));

  const getChannelCount = (channelId) => {
    if (channelId === 'all') return timeFilteredLeads.length;
    if (channelId === 'phone') return timeFilteredLeads.filter((l) => l.source === 'phone').length;
    if (channelId === 'message') return timeFilteredLeads.filter((l) => l.source === 'message').length;
    if (channelId === 'enquiry') return timeFilteredLeads.filter((l) => (l.source || 'enquiry') === 'enquiry').length;
    return 0;
  };

  const getStatusCount = (statusId) => {
    if (statusId === 'all') return timeFilteredLeads.length;
    if (statusId === 'uncontacted') return timeFilteredLeads.filter((l) => l.status === 'uncontacted' || l.status === 'new').length;
    if (statusId === 'contacted') return timeFilteredLeads.filter((l) => l.status === 'contacted').length;
    if (statusId === 'interested') return timeFilteredLeads.filter((l) => l.status === 'interested' || l.status === 'consultation').length;
    if (statusId === 'site_visit_scheduled') return timeFilteredLeads.filter((l) => l.status === 'site_visit_scheduled').length;
    if (statusId === 'negotiation') return timeFilteredLeads.filter((l) => l.status === 'negotiation').length;
    if (statusId === 'converted') return timeFilteredLeads.filter((l) => l.status === 'converted' || l.status === 'deal_closed').length;
    if (statusId === 'dropped') return timeFilteredLeads.filter((l) => l.status === 'dropped' || l.status === 'lost').length;
    return timeFilteredLeads.filter((l) => l.status === statusId).length;
  };

  return (
    <div className="space-y-4">
      {/* Header: Pipeline Filters with Active Badge and Reset All */}
      {showHeader && (
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-[#163e35]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">Pipeline Filters</h3>
            {activeFiltersCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#163e35] text-[#d8edb3]">
                {activeFiltersCount} active
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer transition-colors"
            >
              Reset All
            </button>
          )}
        </div>
      )}

      {/* Section 1: Time Period */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggle('time')}
            className="flex items-center gap-1.5 hover:text-stone-950 cursor-pointer text-[11px] uppercase tracking-wider text-stone-500 font-bold"
          >
            <Clock size={12} className="text-stone-400" />
            <span>Time Period</span>
            <ChevronDown
              size={13}
              className={`text-stone-400 transition-transform ${sectionsOpen.time ? 'rotate-180' : ''}`}
            />
          </button>
          {timeRange !== 'all' && (
            <button
              type="button"
              onClick={() => {
                setTimeRange('all');
                propSetTimeRange?.('all');
                onTimeRangeChange?.('all');
              }}
              className="text-[10px] font-semibold text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {sectionsOpen.time && (
          <div className="space-y-1 pt-0.5">
            {PIPELINE_TIME_OPTIONS.map((tr) => {
              const isSelected = timeRange === tr.id;
              const count = leads.filter((l) => isWithinTimeRange(l.createdAt, tr.id)).length;
              return (
                <button
                  key={tr.id}
                  type="button"
                  onClick={() => {
                    setTimeRange(tr.id);
                    propSetTimeRange?.(tr.id);
                    onTimeRangeChange?.(tr.id);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#163e35] text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <span>{tr.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-[#d8edb3]' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Channel / Touchpoint */}
      <div className="space-y-2 pt-3 border-t border-stone-100">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggle('channel')}
            className="flex items-center gap-1.5 hover:text-stone-950 cursor-pointer text-[11px] uppercase tracking-wider text-stone-500 font-bold"
          >
            <Layers size={12} className="text-stone-400" />
            <span>Channel / Touchpoint</span>
            <ChevronDown
              size={13}
              className={`text-stone-400 transition-transform ${sectionsOpen.channel ? 'rotate-180' : ''}`}
            />
          </button>
          {leadChannelFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setLeadChannelFilter('all')}
              className="text-[10px] font-semibold text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {sectionsOpen.channel && (
          <div className="space-y-1 pt-0.5">
            {PIPELINE_CHANNEL_OPTIONS.map((btn) => {
              const Icon = btn.icon;
              const isSelected = leadChannelFilter === btn.id;
              const count = getChannelCount(btn.id);
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setLeadChannelFilter(btn.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#163e35] text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {Icon && <Icon size={13} className={isSelected ? 'text-[#d8edb3]' : 'text-stone-400'} />}
                    <span>{btn.label}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-[#d8edb3]' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Pipeline Status */}
      <div className="space-y-2 pt-3 border-t border-stone-100">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggle('status')}
            className="flex items-center gap-1.5 hover:text-stone-950 cursor-pointer text-[11px] uppercase tracking-wider text-stone-500 font-bold"
          >
            <CheckCircle2 size={12} className="text-stone-400" />
            <span>Pipeline Status</span>
            <ChevronDown
              size={13}
              className={`text-stone-400 transition-transform ${sectionsOpen.status ? 'rotate-180' : ''}`}
            />
          </button>
          {leadStatusFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setLeadStatusFilter('all')}
              className="text-[10px] font-semibold text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {sectionsOpen.status && (
          <div className="space-y-1 pt-0.5">
            {PIPELINE_STATUS_OPTIONS.map((st) => {
              const isSelected = leadStatusFilter === st.id;
              const count = getStatusCount(st.id);
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setLeadStatusFilter(st.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#163e35] text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${st.dot} ${
                        isSelected ? 'ring-2 ring-white/50' : ''
                      }`}
                    />
                    <span className="truncate">{st.label}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ml-1.5 ${
                      isSelected ? 'bg-white/20 text-[#d8edb3]' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 4: Assigned Sales Advisor */}
      <div className="space-y-2 pt-3 border-t border-stone-100">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => toggle('advisor')}
            className="flex items-center gap-1.5 hover:text-stone-950 cursor-pointer text-[11px] uppercase tracking-wider text-stone-500 font-bold"
          >
            <Users size={12} className="text-stone-400" />
            <span>Assigned Sales Advisor</span>
            <ChevronDown
              size={13}
              className={`text-stone-400 transition-transform ${sectionsOpen.advisor ? 'rotate-180' : ''}`}
            />
          </button>
          {leadAdvisorFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setLeadAdvisorFilter('all')}
              className="text-[10px] font-semibold text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {sectionsOpen.advisor && (
          <div className="space-y-1 pt-0.5">
            {/* All Advisors */}
            <button
              type="button"
              onClick={() => setLeadAdvisorFilter('all')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                leadAdvisorFilter === 'all'
                  ? 'bg-[#163e35] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={13} className={leadAdvisorFilter === 'all' ? 'text-[#d8edb3]' : 'text-stone-400'} />
                <span>All Advisors</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  leadAdvisorFilter === 'all' ? 'bg-white/20 text-[#d8edb3]' : 'bg-stone-100 text-stone-500'
                }`}
              >
                {timeFilteredLeads.length}
              </span>
            </button>

            {/* Individual Team Members */}
            {team.map((m) => {
              const isSel = leadAdvisorFilter === m.name;
              const mCount = timeFilteredLeads.filter((l) => l.assignedTeamMember === m.name).length;
              return (
                <button
                  key={m._id || m.name}
                  type="button"
                  onClick={() => setLeadAdvisorFilter(m.name)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSel
                      ? 'bg-[#163e35] text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isSel ? 'bg-[#d8edb3] text-[#163e35]' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {m.name.charAt(0)}
                    </div>
                    <span className="truncate">{m.name}</span>
                    <UserCheck
                      size={12}
                      className={`shrink-0 ${isSel ? 'text-[#d8edb3]' : 'text-emerald-700'}`}
                    />
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ml-1.5 ${
                      isSel ? 'bg-white/20 text-[#d8edb3]' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {mCount}
                  </span>
                </button>
              );
            })}

            {/* Unassigned Leads */}
            <button
              type="button"
              onClick={() => setLeadAdvisorFilter('unassigned')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                leadAdvisorFilter === 'unassigned'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle
                  size={13}
                  className={leadAdvisorFilter === 'unassigned' ? 'text-amber-200' : 'text-amber-600'}
                />
                <span>Unassigned</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  leadAdvisorFilter === 'unassigned' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {timeFilteredLeads.filter((l) => !l.assignedTeamMember).length}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChannelPartnerDashboard({
  initialSection = '',
  timeRange: propTimeRange,
  setTimeRange: propSetTimeRange,
  onTimeRangeChange
}) {
  const router = useRouter();
  const { user, toast, logout } = useApp();

  // Tab navigation state: maps 'properties' to 'listings' for backwards compatibility
  const resolvedTab = initialSection === 'properties' ? 'listings' : initialSection === 'profile' ? 'overview' : initialSection || 'overview';
  const [tab, setTab] = useState(resolvedTab);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync tab with initialSection prop if changed
  useEffect(() => {
    if (initialSection === 'profile') {
      setIsProfileOpen(true);
      setTab('overview');
    } else if (initialSection) {
      setTab(initialSection === 'properties' ? 'listings' : initialSection);
    }
  }, [initialSection]);

  // Data fetching
  const { data: partnerData, reload: reloadPartner, loading: loadingPartner } = useData('channel-partner');
  const { data: propertiesData, reload: reloadProperties, loading: loadingProperties } = useData('properties?mine=true&limit=100');
  const { data: leadsData, reload: reloadLeads, loading: loadingLeads } = useData('leads?limit=100');
  const { data: ticketsData, reload: reloadTickets, loading: loadingTickets } = useData('support-tickets?limit=50');
  const { data: notificationsData, reload: reloadNotifications, loading: loadingNotifications } = useData('notifications?limit=50');

  const partner = partnerData?.partner || {};
  const stats = partnerData?.stats || {};
  const team = partner?.team || [];
  const properties = propertiesData?.items || [];
  const leads = leadsData?.items || [];
  const tickets = ticketsData?.items || [];
  const notifications = notificationsData?.items || [];
  const unreadNotificationsCount = notificationsData?.unread || 0;

  // Active Modals
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isRaiseTicketOpen, setIsRaiseTicketOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState('credentials');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [busyAction, setBusyAction] = useState('');

  // Close modals on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedLead(null);
        setSelectedListing(null);
        setSelectedMember(null);
        setIsAddMemberOpen(false);
        setSelectedTicket(null);
        setIsRaiseTicketOpen(false);
        setIsProfileOpen(false);
        setIsMobileFilterOpen(false);
        setIsTimeDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter & Chart View States
  const [timeRange, setTimeRange] = useState('all');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [chartViewType, setChartViewType] = useState('bars'); // 'bars' | 'trend'
  const [leadChannelFilter, setLeadChannelFilter] = useState('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [leadAdvisorFilter, setLeadAdvisorFilter] = useState('all');
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Close time dropdown on click outside
  useEffect(() => {
    if (!isTimeDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest('#time-range-dropdown-container')) {
        setIsTimeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTimeDropdownOpen]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (timeRange !== 'all') count++;
    if (leadChannelFilter !== 'all') count++;
    if (leadStatusFilter !== 'all') count++;
    if (leadAdvisorFilter !== 'all') count++;
    if (leadSearchQuery.trim()) count++;
    return count;
  }, [timeRange, leadChannelFilter, leadStatusFilter, leadAdvisorFilter, leadSearchQuery]);

  const handleResetFilters = () => {
    setTimeRange('all');
    propSetTimeRange?.('all');
    onTimeRangeChange?.('all');
    setLeadChannelFilter('all');
    setLeadStatusFilter('all');
    setLeadAdvisorFilter('all');
    setLeadSearchQuery('');
  };

  const [listingStatusFilter, setListingStatusFilter] = useState('all');
  const [listingSearchQuery, setListingSearchQuery] = useState('');

  const [ticketStatusFilter, setTicketStatusFilter] = useState('all');
  const [notificationFilter, setNotificationFilter] = useState('all');

  // Sync external controlled timeRange if provided
  useEffect(() => {
    if (propTimeRange !== undefined && propTimeRange !== timeRange) {
      setTimeRange(propTimeRange);
    }
  }, [propTimeRange]);

  // Filter leads by selected time range ('today', '7days', '30days', '6months', '9months', 'all')
  const timeFilteredLeads = useMemo(() => {
    return leads.filter((lead) => isWithinTimeRange(lead.createdAt, timeRange));
  }, [leads, timeRange]);

  // Filtered Leads (incorporating timeRange, channel, advisor, status and search queries)
  const filteredLeads = useMemo(() => {
    return timeFilteredLeads.filter((lead) => {
      if (leadChannelFilter !== 'all' && (lead.source || 'enquiry') !== leadChannelFilter) return false;
      if (leadAdvisorFilter !== 'all') {
        if (leadAdvisorFilter === 'unassigned') {
          if (lead.assignedTeamMember) return false;
        } else if (lead.assignedTeamMember !== leadAdvisorFilter) {
          return false;
        }
      }
      if (leadStatusFilter !== 'all') {
        if (leadStatusFilter === 'uncontacted' && lead.status !== 'uncontacted' && lead.status !== 'new') return false;
        if (leadStatusFilter === 'interested' && lead.status !== 'interested' && lead.status !== 'consultation') return false;
        if (leadStatusFilter === 'converted' && lead.status !== 'converted' && lead.status !== 'deal_closed') return false;
        if (leadStatusFilter === 'dropped' && lead.status !== 'dropped' && lead.status !== 'lost') return false;
        if (leadStatusFilter !== 'uncontacted' && leadStatusFilter !== 'interested' && leadStatusFilter !== 'converted' && leadStatusFilter !== 'dropped' && lead.status !== leadStatusFilter) return false;
      }
      if (leadSearchQuery.trim()) {
        const q = leadSearchQuery.toLowerCase();
        const matchesName = lead.name?.toLowerCase().includes(q);
        const matchesPhone = lead.phone?.toLowerCase().includes(q);
        const matchesEmail = lead.email?.toLowerCase().includes(q);
        const matchesProp = lead.property?.title?.toLowerCase().includes(q) || lead.project?.title?.toLowerCase().includes(q);
        const matchesMember = lead.assignedTeamMember?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesEmail && !matchesProp && !matchesMember) return false;
      }
      return true;
    });
  }, [timeFilteredLeads, leadChannelFilter, leadStatusFilter, leadAdvisorFilter, leadSearchQuery]);

  // Filtered Listings
  const filteredListings = useMemo(() => {
    return properties.filter((prop) => {
      if (listingStatusFilter !== 'all' && prop.status !== listingStatusFilter) return false;
      if (listingSearchQuery.trim()) {
        const q = listingSearchQuery.toLowerCase();
        const matchesTitle = prop.title?.toLowerCase().includes(q);
        const matchesLocality = prop.locality?.toLowerCase().includes(q);
        const matchesCity = prop.city?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLocality && !matchesCity) return false;
      }
      return true;
    });
  }, [properties, listingStatusFilter, listingSearchQuery]);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (ticketStatusFilter !== 'all' && t.status !== ticketStatusFilter) return false;
      return true;
    });
  }, [tickets, ticketStatusFilter]);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (notificationFilter === 'unread' && n.read) return false;
      return true;
    });
  }, [notifications, notificationFilter]);

  // Analytics & Pipeline Metrics for Charts (derived from timeFilteredLeads)
  const pipelineStats = useMemo(() => {
    const uncontacted = timeFilteredLeads.filter((l) => l.status === 'uncontacted' || l.status === 'new').length;
    const contacted = timeFilteredLeads.filter((l) => l.status === 'contacted').length;
    const interested = timeFilteredLeads.filter((l) => l.status === 'interested' || l.status === 'consultation').length;
    const visitScheduled = timeFilteredLeads.filter((l) => l.status === 'site_visit_scheduled').length;
    const negotiation = timeFilteredLeads.filter((l) => l.status === 'negotiation').length;
    const converted = timeFilteredLeads.filter((l) => l.status === 'converted' || l.status === 'deal_closed').length;
    const dropped = timeFilteredLeads.filter((l) => l.status === 'dropped' || l.status === 'lost').length;

    const total = timeFilteredLeads.length || 1;
    const conversionRate = Math.round((converted / total) * 100);

    const phoneCount = timeFilteredLeads.filter((l) => l.source === 'phone').length;
    const msgCount = timeFilteredLeads.filter((l) => l.source === 'message').length;
    const enquiryCount = timeFilteredLeads.filter((l) => (l.source || 'enquiry') === 'enquiry').length;

    const phonePct = Math.round((phoneCount / total) * 100);
    const msgPct = Math.round((msgCount / total) * 100);
    const enquiryPct = Math.max(0, 100 - phonePct - msgPct);

    return {
      uncontacted,
      contacted,
      interested,
      visitScheduled,
      negotiation,
      converted,
      dropped,
      total: timeFilteredLeads.length,
      conversionRate,
      phoneCount,
      msgCount,
      enquiryCount,
      phonePct,
      msgPct,
      enquiryPct
    };
  }, [timeFilteredLeads]);

  // Inbound Leads vs Outbound Outreach Performance Trend Data
  const trendData = useMemo(() => {
    const contactedCount = timeFilteredLeads.filter((l) =>
      ['contacted', 'interested', 'site_visit_scheduled', 'negotiation', 'deal_closed', 'converted'].includes(l.status)
    ).length;
    const visitsCount = pipelineStats.visitScheduled || 0;

    if (timeRange === 'today') {
      return [
        { period: '9:00 AM', month: '9:00 AM', inbound: 0, outbound: 0, visits: 0, leads: 0, responseRate: '100%' },
        { period: '12:00 PM', month: '12:00 PM', inbound: 1, outbound: 1, visits: 0, leads: 1, responseRate: '100%' },
        { period: '3:00 PM', month: '3:00 PM', inbound: 1, outbound: 1, visits: 0, leads: 1, responseRate: '100%' },
        { period: '6:00 PM', month: '6:00 PM', inbound: Math.max(0, timeFilteredLeads.length - 2), outbound: Math.max(0, contactedCount - 2), visits: 0, leads: Math.max(0, timeFilteredLeads.length - 2), responseRate: '100%' },
        { period: 'Current', month: 'Current', inbound: timeFilteredLeads.length, outbound: contactedCount, visits: visitsCount, leads: timeFilteredLeads.length, responseRate: '100%' }
      ];
    }

    if (timeRange === '7days') {
      return [
        { period: 'Mon', month: 'Mon', inbound: 1, outbound: 1, visits: 0, leads: 1, responseRate: '100%' },
        { period: 'Tue', month: 'Tue', inbound: 0, outbound: 0, visits: 0, leads: 0, responseRate: '—' },
        { period: 'Wed', month: 'Wed', inbound: 1, outbound: 1, visits: 0, leads: 1, responseRate: '100%' },
        { period: 'Thu', month: 'Thu', inbound: 1, outbound: 1, visits: 0, leads: 1, responseRate: '100%' },
        { period: 'Fri', month: 'Fri', inbound: 0, outbound: 0, visits: 0, leads: 0, responseRate: '—' },
        { period: 'Sat', month: 'Sat', inbound: 1, outbound: 1, visits: 1, leads: 1, responseRate: '100%' },
        { period: 'Today', month: 'Today', inbound: Math.max(timeFilteredLeads.length, 2), outbound: Math.max(contactedCount, 2), visits: visitsCount, leads: Math.max(timeFilteredLeads.length, 2), responseRate: '100%' }
      ];
    }

    if (timeRange === '30days') {
      return [
        { period: 'Week 1', month: 'Week 1', inbound: 4, outbound: 3, visits: 1, leads: 4, responseRate: '75%' },
        { period: 'Week 2', month: 'Week 2', inbound: 6, outbound: 5, visits: 2, leads: 6, responseRate: '83%' },
        { period: 'Week 3', month: 'Week 3', inbound: 5, outbound: 4, visits: 1, leads: 5, responseRate: '80%' },
        { period: 'Week 4 (Current)', month: 'Week 4', inbound: Math.max(timeFilteredLeads.length, 6), outbound: Math.max(contactedCount, 5), visits: Math.max(visitsCount, 2), leads: Math.max(timeFilteredLeads.length, 6), responseRate: '83%' }
      ];
    }

    // Default 6-Month Comparison (May - Oct) with smooth, realistic benchmarks
    return [
      { period: 'May', month: 'May', inbound: 18, outbound: 15, visits: 6, leads: 18, responseRate: '83%' },
      { period: 'Jun', month: 'Jun', inbound: 24, outbound: 21, visits: 9, leads: 24, responseRate: '88%' },
      { period: 'Jul', month: 'Jul', inbound: 30, outbound: 26, visits: 12, leads: 30, responseRate: '87%' },
      { period: 'Aug', month: 'Aug', inbound: 26, outbound: 23, visits: 10, leads: 26, responseRate: '88%' },
      { period: 'Sep', month: 'Sep', inbound: 34, outbound: 30, visits: 14, leads: 34, responseRate: '88%' },
      {
        period: 'Oct (Current)',
        month: 'Oct (Current)',
        inbound: Math.max(38, 28 + timeFilteredLeads.length),
        outbound: Math.max(33, 24 + contactedCount),
        visits: Math.max(16, 12 + visitsCount),
        leads: Math.max(38, 28 + timeFilteredLeads.length),
        responseRate: '87%'
      }
    ];
  }, [timeFilteredLeads, pipelineStats.visitScheduled, timeRange]);

  // Dynamic Real Average Speed to Contact Calculation from actual leads
  const avgSpeedToContact = useMemo(() => {
    const contactedLeads = timeFilteredLeads.filter((l) =>
      ['contacted', 'interested', 'site_visit_scheduled', 'negotiation', 'deal_closed', 'converted'].includes(l.status)
    );
    if (contactedLeads.length === 0) return 'Awaiting Contact';

    const durations = contactedLeads.map((l) => {
      const created = new Date(l.createdAt).getTime();
      const contacted = l.contactedAt ? new Date(l.contactedAt).getTime() : 0;
      const firstNote = l.notes && l.notes.length > 0 ? new Date(l.notes[0].createdAt).getTime() : 0;
      const updated = l.updatedAt ? new Date(l.updatedAt).getTime() : 0;
      const contactTime = contacted || firstNote || updated || created;
      return Math.max(15 * 60 * 1000, contactTime - created);
    });

    const avgMs = durations.reduce((a, b) => a + b, 0) / durations.length;
    const avgMinutes = Math.round(avgMs / (1000 * 60));

    if (avgMinutes < 60) return `${Math.max(15, avgMinutes)} Mins`;
    const hours = (avgMinutes / 60).toFixed(1);
    return `< ${hours.endsWith('.0') ? parseInt(hours, 10) : hours} Hours`;
  }, [timeFilteredLeads]);

  // Lead Action Handlers
  async function handleUpdateLead(leadId, patchData) {
    setBusyAction('lead_' + leadId);
    try {
      const updated = await api(`leads/${leadId}`, {
        method: 'PATCH',
        body: patchData
      });
      reloadLeads();
      reloadPartner();
      if (selectedLead && selectedLead._id === leadId) {
        setSelectedLead((prev) => ({ ...prev, ...updated }));
      }
      toast('Lead updated successfully.');
    } catch (err) {
      toast(err.message);
    } finally {
      setBusyAction('');
    }
  }

  // Team Member Handlers
  async function handleAddMember(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    setBusyAction('add_member');
    try {
      await api('channel-partner/team', {
        method: 'POST',
        body: data
      });
      reloadPartner();
      setIsAddMemberOpen(false);
      toast(`Team member ${data.name} added.`);
    } catch (err) {
      toast(err.message);
    } finally {
      setBusyAction('');
    }
  }

  async function handleUpdateMember(memberId, patchData) {
    setBusyAction('member_' + memberId);
    try {
      await api(`channel-partner/team/${memberId}`, {
        method: 'PATCH',
        body: patchData
      });
      reloadPartner();
      if (selectedMember && selectedMember._id === memberId) {
        setSelectedMember({ ...selectedMember, ...patchData });
      }
      toast('Team member updated.');
    } catch (err) {
      toast(err.message);
    } finally {
      setBusyAction('');
    }
  }

  async function handleDeleteMember(memberId) {
    if (!window.confirm('Are you sure you want to remove this team member? Assigned leads will remain archived.')) return;
    setBusyAction('del_member_' + memberId);
    try {
      await api(`channel-partner/team/${memberId}`, {
        method: 'DELETE'
      });
      reloadPartner();
      setSelectedMember(null);
      toast('Team member removed.');
    } catch (err) {
      toast(err.message);
    } finally {
      setBusyAction('');
    }
  }

  // Support Ticket Handlers
  async function handleRaiseTicket(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    setBusyAction('raise_ticket');
    try {
      const ticket = await api('support-tickets', {
        method: 'POST',
        body: data
      });
      reloadTickets();
      setIsRaiseTicketOpen(false);
      toast(`Support ticket ${ticket.ticketNumber} opened.`);
    } catch (err) {
      toast(err.message);
    } finally {
      setBusyAction('');
    }
  }

  async function handleReplyTicket(ticketId, message) {
    if (!message?.trim()) return;
    setBusyAction('reply_ticket_' + ticketId);
    try {
      const updated = await api(`support-tickets/${ticketId}/reply`, {
        method: 'POST',
        body: { message }
      });
      reloadTickets();
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket(updated);
      }
      toast('Reply sent to support coordinator.');
    } catch (err) {
      toast(err.message);
    } finally {
      setBusyAction('');
    }
  }

  async function handleResolveTicket(ticketId) {
    setBusyAction('resolve_ticket_' + ticketId);
    try {
      const updated = await api(`support-tickets/${ticketId}`, {
        method: 'PATCH',
        body: { status: 'resolved' }
      });
      reloadTickets();
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket(updated);
      }
      toast('Ticket marked as resolved.');
    } catch (err) {
      toast(err.message);
    } finally {
      setBusyAction('');
    }
  }

  // Listing Handlers
  async function handleArchiveListing(id) {
    if (!window.confirm('Archive this listing? It will be removed from public search results.')) return;
    try {
      await api(`properties/${id}`, { method: 'DELETE' });
      reloadProperties();
      setSelectedListing(null);
      toast('Listing archived.');
    } catch (err) {
      toast(err.message);
    }
  }

  async function handlePromoteListing(id) {
    try {
      const res = await api(`properties/${id}/promote`, { method: 'POST' });
      reloadProperties();
      toast(res.featured ? 'Listing marked as Featured!' : 'Listing unpromoted.');
    } catch (err) {
      toast(err.message);
    }
  }

  // Agency Profile Update
  async function handleUpdateProfile(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    setBusyAction('update_profile');
    try {
      await api('channel-partner', {
        method: 'PATCH',
        body: data
      });
      reloadPartner();
      toast('Agency credentials updated.');
    } catch (err) {
      toast(err.message);
    } finally {
      setBusyAction('');
    }
  }

  // Change Password Handler
  async function handleChangePassword(e) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('New password confirmation does not match.');
      return;
    }
    setPasswordLoading(true);
    try {
      // TODO: In future, integrate SMS / Email OTP verification flow before confirming password reset.
      await api('auth/password', {
        method: 'POST',
        body: {
          currentPassword,
          newPassword
        }
      });
      toast('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsProfileOpen(false);
    } catch (err) {
      toast(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  }

  // Mark all notifications read
  async function handleMarkAllNotificationsRead() {
    try {
      await api('notifications', { method: 'PATCH' });
      reloadNotifications();
      toast('All notifications marked as read.');
    } catch (err) {
      toast(err.message);
    }
  }

  // Nav Items Definition for Sidebar
  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    {
      id: 'leads',
      label: 'Leads Dashboard',
      icon: PhoneCall,
      badge: leads.length,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'listings',
      label: 'Portfolio Listings',
      icon: Building2,
      badge: properties.length,
      badgeColor: 'bg-stone-100 text-stone-700'
    },
    {
      id: 'team',
      label: 'Sales Team',
      icon: Users,
      badge: team.length,
      badgeColor: 'bg-sky-100 text-sky-800'
    },
    {
      id: 'support',
      label: 'Support Desk',
      icon: LifeBuoy,
      badge: tickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed').length,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount,
      badgeColor: 'bg-red-500 text-white'
    }
  ];

  return (
    <TimeRangeContext.Provider
      value={{
        timeRange,
        setTimeRange,
        isWithinTimeRange,
        TIME_RANGE_OPTIONS,
        timeFilteredLeads,
        pipelineStats
      }}
    >
      <div className="wrap py-8 pb-24">
      {/* =========================================================================
          CHANNEL PARTNER TOP COMMAND BANNER (HIGH CONTRAST, DEEP FOREST GREEN)
         ========================================================================= */}
      <div
        style={{ backgroundColor: '#163e35' }}
        className="text-white p-6 sm:p-8 rounded-3xl shadow-xl mb-8 border border-[#23584c] relative overflow-hidden"
      >
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#d8edb3] text-[#163e35] shadow-xs">
                <Briefcase size={13} />
                RERA Registered Channel Partner
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/20 backdrop-blur-sm">
                <ShieldCheck size={13} className="text-[#d8edb3]" />
                {partner.reraId || user?.reraId || 'KA/RERA/AGENT/2024/00842'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-200 border border-amber-300/30">
                <Sparkles size={13} />
                {partner.tier || 'Platinum Partner Network'}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {partner.company || user?.company || 'Apex Realty Advisory Network'}
              </h1>
              <p className="text-stone-200 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed opacity-90">
                {partner.bio ||
                  'Institutional channel sales network managing premium residential developments, buyer leads, and sales teams.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-200 pt-1 font-medium">
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-[#d8edb3]" />
                <strong className="text-white font-bold">{team.length}</strong> Active Sales Advisors
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Building2 size={14} className="text-[#d8edb3]" />
                <strong className="text-white font-bold">{properties.length}</strong> Portfolio Listings
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <PhoneCall size={14} className="text-[#d8edb3]" />
                <strong className="text-white font-bold">{stats.totalLeads ?? leads.length}</strong> Inbound Contacts
              </span>
            </div>
          </div>

          {/* Agency Profile & Password Action Button */}
          <button
            onClick={() => {
              setProfileModalTab('credentials');
              setIsProfileOpen(true);
            }}
            className="sm:self-start shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-sm text-white text-xs font-bold transition-all cursor-pointer shadow-xs group"
            title="Agency Profile & Security Settings"
          >
            <div className="w-6 h-6 rounded-lg bg-[#d8edb3] text-[#163e35] flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
              <User size={13} />
            </div>
            <span>Agency Profile &amp; Security</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN SIDEBAR + CONTENT GRID LAYOUT (3-COLUMN ON LEADS, 2-COLUMN ON OTHERS)
         ========================================================================= */}
      <div
        className={`grid gap-6 items-start ${
          tab === 'leads'
            ? 'lg:grid-cols-[220px_260px_1fr] xl:grid-cols-[230px_280px_1fr]'
            : 'lg:grid-cols-[280px_1fr]'
        }`}
      >
        {/* =======================================================================
            COLUMN 1: PARTNER WORKSPACE SIDEBAR
           ======================================================================= */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto no-scrollbar pb-8">
          {/* Agency Identification Badge with Profile Icon */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-[#163e35] text-[#d8edb3] flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {(partner.company || user?.name || 'CP').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-stone-900 text-sm truncate">
                  {partner.company || user?.company || 'Channel Partner'}
                </div>
                <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-pulse" />
                  Verified Agency
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setProfileModalTab('credentials');
                setIsProfileOpen(true);
              }}
              title="Agency Profile & Security Settings"
              className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-[#163e35] text-stone-600 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
            >
              <Settings size={15} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="bg-white p-2.5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Partner Workspace
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#163e35] text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-[#d8edb3]' : 'text-stone-400'} />
                    <span>{item.label}</span>
                  </div>

                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-[#d8edb3] text-[#163e35]' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Actions Panel in Sidebar */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-2.5">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Quick Shortcuts
            </div>
            <Link
              href="/post-property"
              className="w-full py-2 px-3 bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all flex items-center justify-between shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <Plus size={14} className="text-[#163e35]" />
                Post Property
              </span>
              <ChevronRight size={14} className="text-stone-400" />
            </Link>
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="w-full py-2 px-3 bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all flex items-center justify-between shadow-2xs cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Users size={14} className="text-[#163e35]" />
                Add Advisor
              </span>
              <ChevronRight size={14} className="text-stone-400" />
            </button>
            <button
              onClick={() => setIsRaiseTicketOpen(true)}
              className="w-full py-2 px-3 bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all flex items-center justify-between shadow-2xs cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <LifeBuoy size={14} className="text-[#163e35]" />
                Open Ticket
              </span>
              <ChevronRight size={14} className="text-stone-400" />
            </button>
          </div>

          {/* Logout Action */}
          <div className="pt-2 border-t border-stone-200">
            <button
              onClick={logout}
              className="w-full py-2 px-3 text-stone-500 hover:text-red-700 hover:bg-red-50 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={15} />
              Sign Out of Channel Account
            </button>
          </div>
        </aside>

        {/* =======================================================================
            COLUMN 2: 2ND SIDEBAR OF FILTERS IN LEADS DASHBOARD (BESIDE WORKSPACE)
           ======================================================================= */}
        {tab === 'leads' && (
          <aside className="space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto no-scrollbar pb-8">
            <div className="bg-white p-4.5 rounded-3xl border border-stone-200 shadow-xs">
              <PipelineFiltersWidget
                timeRange={timeRange}
                setTimeRange={setTimeRange}
                propSetTimeRange={propSetTimeRange}
                onTimeRangeChange={onTimeRangeChange}
                leadChannelFilter={leadChannelFilter}
                setLeadChannelFilter={setLeadChannelFilter}
                leadStatusFilter={leadStatusFilter}
                setLeadStatusFilter={setLeadStatusFilter}
                leadAdvisorFilter={leadAdvisorFilter}
                setLeadAdvisorFilter={setLeadAdvisorFilter}
                leads={leads}
                timeFilteredLeads={timeFilteredLeads}
                team={team}
                activeFiltersCount={activeFiltersCount}
                onResetFilters={handleResetFilters}
                showHeader={true}
              />
            </div>
          </aside>
        )}

        {/* =======================================================================
            RIGHT MAIN CONTENT AREA
           ======================================================================= */}
        <main className="min-w-0 space-y-8">
          {/* =====================================================================
              TAB 1: OVERVIEW SCREEN WITH CHARTS & PIPELINE ANALYTICS
             ===================================================================== */}
          {tab === 'overview' && (
            <div className="space-y-8">
              {/* Executive Overview Header with compact Time Range Dropdown (Replaces huge horizontal card) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
                    Executive Performance Overview
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                    Real-time pipeline analytics, lead acquisition breakdown, and sales conversion metrics.
                  </p>
                </div>

                {/* Compact Dropdown Selector */}
                <div id="time-range-dropdown-container" className="relative shrink-0 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => setIsTimeDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-bold shadow-2xs transition-all cursor-pointer group"
                    title="Change Time Filter Range"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#163e35] flex items-center justify-center font-bold">
                      <Calendar size={13} />
                    </div>
                    <span>{TIME_RANGE_OPTIONS.find((t) => t.id === timeRange)?.label || 'All Time'}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {timeFilteredLeads.length}
                    </span>
                    <ChevronDown size={14} className={`text-stone-400 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isTimeDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 mb-1">
                        Select Time Range
                      </div>
                      {TIME_RANGE_OPTIONS.map((tr) => {
                        const isSelected = timeRange === tr.id;
                        const count = leads.filter((l) => isWithinTimeRange(l.createdAt, tr.id)).length;
                        return (
                          <button
                            key={tr.id}
                            type="button"
                            onClick={() => {
                              setTimeRange(tr.id);
                              propSetTimeRange?.(tr.id);
                              onTimeRangeChange?.(tr.id);
                              setIsTimeDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 text-[#163e35] font-bold'
                                : 'text-stone-700 hover:bg-stone-50 hover:text-stone-900'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {isSelected ? <Check size={13} className="text-[#163e35]" /> : <span className="w-3.5" />}
                              {tr.label}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                isSelected ? 'bg-[#163e35] text-white' : 'bg-stone-100 text-stone-500'
                              }`}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* 4 Top KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1 */}
                <div
                  onClick={() => setTab('leads')}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-[#163e35] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Total Inbound Leads
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-[#163e35] group-hover:text-white transition-colors">
                      <PhoneCall size={16} />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                    {timeRange === 'all' ? (stats.totalLeads ?? leads.length) : timeFilteredLeads.length}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-stone-500">
                    <span className="font-semibold text-emerald-700">{pipelineStats.converted} Converted</span>
                    <span>·</span>
                    <span>{pipelineStats.uncontacted} New Uncontacted</span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div
                  onClick={() => setTab('listings')}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-[#163e35] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Portfolio Listings
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center group-hover:bg-[#163e35] group-hover:text-white transition-colors">
                      <Building2 size={16} />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                    {properties.length}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-stone-500">
                    <span className="font-semibold text-emerald-700">
                      {properties.filter((p) => p.status === 'approved').length} Live
                    </span>
                    <span>·</span>
                    <span className="text-amber-700 font-semibold">
                      {properties.filter((p) => p.status === 'pending').length} In Review
                    </span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div
                  onClick={() => setTab('team')}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-[#163e35] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Sales Advisors
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center group-hover:bg-[#163e35] group-hover:text-white transition-colors">
                      <Users size={16} />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                    {team.length}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-stone-500">
                    <span className="font-semibold text-emerald-700">
                      {team.filter((m) => m.status === 'active').length} Active
                    </span>
                    <span>·</span>
                    <span>{team.reduce((acc, m) => acc + (m.assignedLeadsCount || 0), 0)} Allocated</span>
                  </div>
                </div>

                {/* Metric 4 */}
                <div
                  onClick={() => setTab('overview')}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-[#163e35] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Closing Win Rate
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-[#163e35] group-hover:text-white transition-colors">
                      <Target size={16} />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                    {pipelineStats.conversionRate}%
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-stone-500">
                    <span className="font-semibold text-emerald-700">
                      {pipelineStats.visitScheduled} Visits
                    </span>
                    <span>·</span>
                    <span>{pipelineStats.negotiation} In Negotiation</span>
                  </div>
                </div>
              </div>

              {/* ===============================================================
                  VISUAL CHART 1 & 2: CONVERSION FUNNEL + CHANNEL ACQUISITION (RECHARTS)
                 =============================================================== */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* CHART 1: Lead Conversion Funnel Progression (Recharts BarChart) */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                        <TrendingUp size={18} className="text-[#163e35]" />
                        Lead Conversion Funnel
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Interactive stage pipeline from inquiry to closed deal.
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                      {pipelineStats.conversionRate}% Overall Conversion
                    </span>
                  </div>

                  {isMounted ? (
                    <div className="h-64 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { stage: 'Uncontacted', count: pipelineStats.uncontacted, id: 'uncontacted' },
                            { stage: 'Contacted', count: pipelineStats.contacted, id: 'contacted' },
                            { stage: 'Interested', count: pipelineStats.interested, id: 'interested' },
                            { stage: 'Site Visits', count: pipelineStats.visitScheduled, id: 'site_visit_scheduled' },
                            { stage: 'Negotiation', count: pipelineStats.negotiation, id: 'negotiation' },
                            { stage: 'Converted', count: pipelineStats.converted, id: 'converted' }
                          ]}
                          margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748b' }} angle={-15} textAnchor="end" />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                          <RechartsTooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                            formatter={(val) => [`${val} Leads`, 'Pipeline Volume']}
                          />
                          <Bar
                            dataKey="count"
                            radius={[6, 6, 0, 0]}
                            onClick={(entry) => {
                              if (entry?.id) {
                                setLeadStatusFilter(entry.id);
                                setTab('leads');
                              }
                            }}
                            className="cursor-pointer"
                          >
                            {[
                              '#f59e0b',
                              '#0284c7',
                              '#6366f1',
                              '#8b5cf6',
                              '#14b8a6',
                              '#163e35'
                            ].map((color, index) => (
                              <Cell key={`cell-${index}`} fill={color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 bg-stone-50 rounded-2xl animate-pulse flex items-center justify-center text-xs text-stone-400">
                      Loading pipeline chart...
                    </div>
                  )}

                  {/* Quick Stage Filter Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {[
                      { label: 'Uncontacted', count: pipelineStats.uncontacted, bg: 'bg-amber-100 text-amber-900', key: 'uncontacted' },
                      { label: 'Contacted', count: pipelineStats.contacted, bg: 'bg-sky-100 text-sky-900', key: 'contacted' },
                      { label: 'Interested', count: pipelineStats.interested, bg: 'bg-indigo-100 text-indigo-900', key: 'interested' },
                      { label: 'Visits', count: pipelineStats.visitScheduled, bg: 'bg-purple-100 text-purple-900', key: 'site_visit_scheduled' },
                      { label: 'Negotiation', count: pipelineStats.negotiation, bg: 'bg-teal-100 text-teal-900', key: 'negotiation' },
                      { label: 'Converted', count: pipelineStats.converted, bg: 'bg-[#163e35] text-white', key: 'converted' }
                    ].map((st) => (
                      <button
                        key={st.key}
                        onClick={() => {
                          setLeadStatusFilter(st.key);
                          setTab('leads');
                        }}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-lg transition-transform hover:scale-105 cursor-pointer ${st.bg}`}
                      >
                        {st.label}: {st.count}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CHART 2: Inbound Channel Acquisition (Recharts PieChart) */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                        <PieChart size={18} className="text-[#163e35]" />
                        Inbound Channel Breakdown
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Share of leads acquired via Phone, Chat, and Property Forms.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-stone-500">
                      Total: {pipelineStats.total}
                    </span>
                  </div>

                  {isMounted ? (
                    <div className="h-64 w-full pt-2 flex flex-col sm:flex-row items-center justify-around gap-2">
                      <div className="h-56 w-56 relative flex items-center justify-center shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <RechartsTooltip
                              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                              formatter={(val, name) => [`${val} (${Math.round((val / (pipelineStats.total || 1)) * 100)}%)`, name]}
                            />
                            <Pie
                              data={[
                                { name: 'Phone Callbacks', value: pipelineStats.phoneCount || (pipelineStats.total === 0 ? 1 : 0), fill: '#10b981', id: 'phone' },
                                { name: 'Direct Messages', value: pipelineStats.msgCount || 0, fill: '#0284c7', id: 'message' },
                                { name: 'Property Forms', value: pipelineStats.enquiryCount || 0, fill: '#f59e0b', id: 'enquiry' }
                              ]}
                              innerRadius={55}
                              outerRadius={80}
                              paddingAngle={4}
                              dataKey="value"
                              className="cursor-pointer"
                              onClick={(entry) => {
                                if (entry?.id) {
                                  setLeadChannelFilter(entry.id);
                                  setTab('leads');
                                }
                              }}
                            >
                              {[ '#10b981', '#0284c7', '#f59e0b' ].map((c, i) => (
                                <Cell key={`cell-${i}`} fill={c} />
                              ))}
                            </Pie>
                          </RechartsPieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-2xl font-black text-stone-900 leading-none">
                            {pipelineStats.total}
                          </span>
                          <span className="text-[10px] font-bold text-stone-400 uppercase mt-0.5">
                            Leads
                          </span>
                        </div>
                      </div>

                      {/* Channel Legend & Shortcut Filters */}
                      <div className="space-y-2.5 w-full max-w-xs">
                        <div
                          onClick={() => {
                            setLeadChannelFilter('phone');
                            setTab('leads');
                          }}
                          className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                              <PhoneCall size={12} /> Phone Callbacks
                            </span>
                          </div>
                          <div className="text-xs font-extrabold text-emerald-900">
                            {pipelineStats.phoneCount} ({pipelineStats.phonePct}%)
                          </div>
                        </div>

                        <div
                          onClick={() => {
                            setLeadChannelFilter('message');
                            setTab('leads');
                          }}
                          className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-50 transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-sky-500 inline-block" />
                            <span className="text-xs font-bold text-sky-950 flex items-center gap-1">
                              <MessageSquare size={12} /> Direct Messages
                            </span>
                          </div>
                          <div className="text-xs font-extrabold text-sky-900">
                            {pipelineStats.msgCount} ({pipelineStats.msgPct}%)
                          </div>
                        </div>

                        <div
                          onClick={() => {
                            setLeadChannelFilter('enquiry');
                            setTab('leads');
                          }}
                          className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                            <span className="text-xs font-bold text-amber-950 flex items-center gap-1">
                              <ClipboardList size={12} /> Property Forms
                            </span>
                          </div>
                          <div className="text-xs font-extrabold text-amber-900">
                            {pipelineStats.enquiryCount} ({pipelineStats.enquiryPct}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 bg-stone-50 rounded-2xl animate-pulse flex items-center justify-center text-xs text-stone-400">
                      Loading channel breakdown chart...
                    </div>
                  )}
                </div>
              </div>

              {/* ===============================================================
                  VISUAL CHART 3: INBOUND LEADS VS OUTBOUND ENGAGEMENT (SELF-EXPLANATORY)
                 =============================================================== */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#163e35] text-[#d8edb3] flex items-center justify-center font-bold shadow-2xs">
                        <TrendingUp size={16} />
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
                        Inbound Leads vs. Outbound Outreach
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500 max-w-2xl leading-relaxed">
                      Measures incoming buyer demand against your team's active outreach response speed and confirmed property site tours.
                    </p>
                  </div>

                  {/* Mode View Switcher: Grouped Bars vs Trend Lines */}
                  <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                    <div className="bg-stone-100 p-1 rounded-xl flex items-center gap-1 border border-stone-200/70">
                      <button
                        type="button"
                        onClick={() => setChartViewType('bars')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          chartViewType === 'bars'
                            ? 'bg-white text-[#163e35] shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Grouped Bars
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartViewType('trend')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          chartViewType === 'trend'
                            ? 'bg-white text-[#163e35] shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Trend Lines
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3 Executive Metric Highlights Explaining the Chart */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Outreach Contact Rate</div>
                      <div className="text-xl font-black text-stone-900 mt-0.5">
                        {Math.round(((pipelineStats.contacted + pipelineStats.interested + pipelineStats.visitScheduled + pipelineStats.negotiation + pipelineStats.converted) / (pipelineStats.total || 1)) * 100)}%
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold">Leads contacted by team</div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <PhoneCall size={16} />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Avg Speed to Contact</div>
                      <div className="text-xl font-black text-stone-900 mt-0.5">{avgSpeedToContact}</div>
                      <div className="text-[10px] text-sky-700 font-semibold">First response callback</div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                      <Clock size={16} />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Site Visits Booked</div>
                      <div className="text-xl font-black text-amber-900 mt-0.5">{pipelineStats.visitScheduled} Tours</div>
                      <div className="text-[10px] text-amber-700 font-semibold">Confirmed buyer walkthroughs</div>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Target size={16} />
                    </div>
                  </div>
                </div>

                {isMounted ? (
                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartViewType === 'bars' ? (
                        <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} />
                          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                          <RechartsTooltip
                            content={({ active, payload, label }) => {
                              if (!active || !payload?.length) return null;
                              const row = payload[0]?.payload || {};
                              return (
                                <div className="bg-white p-3.5 rounded-2xl shadow-xl border border-stone-200 text-xs space-y-2 min-w-[210px]">
                                  <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                                    <span className="font-extrabold text-stone-900 text-sm">{label}</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      {row.responseRate || '85%'} Response
                                    </span>
                                  </div>
                                  <div className="space-y-1.5 pt-0.5">
                                    <div className="flex items-center justify-between">
                                      <span className="flex items-center gap-1.5 text-stone-600 font-medium">
                                        <span className="w-2.5 h-2.5 rounded-xs bg-[#163e35]" /> Inbound Inquiries
                                      </span>
                                      <span className="font-extrabold text-stone-900">{row.inbound}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="flex items-center gap-1.5 text-stone-600 font-medium">
                                        <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981]" /> Outbound Contacted
                                      </span>
                                      <span className="font-extrabold text-stone-900">{row.outbound}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="flex items-center gap-1.5 text-stone-600 font-medium">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> Site Visits Confirmed
                                      </span>
                                      <span className="font-extrabold text-amber-900">{row.visits}</span>
                                    </div>
                                  </div>
                                  <div className="pt-2 border-t border-stone-100 text-[10px] text-stone-500 italic">
                                    💡 {row.outbound} of {row.inbound} buyers qualified by team advisors
                                  </div>
                                </div>
                              );
                            }}
                          />
                          <Bar dataKey="inbound" name="Inbound Inquiries" fill="#163e35" radius={[6, 6, 0, 0]} maxBarSize={28} />
                          <Bar dataKey="outbound" name="Outbound Contacted" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={28} />
                          <Line type="monotone" dataKey="visits" name="Site Visits Scheduled" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 1.5, stroke: '#fff' }} />
                        </ComposedChart>
                      ) : (
                        <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#163e35" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#163e35" stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} />
                          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                          <RechartsTooltip
                            content={({ active, payload, label }) => {
                              if (!active || !payload?.length) return null;
                              const row = payload[0]?.payload || {};
                              return (
                                <div className="bg-white p-3.5 rounded-2xl shadow-xl border border-stone-200 text-xs space-y-2 min-w-[210px]">
                                  <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                                    <span className="font-extrabold text-stone-900 text-sm">{label}</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      {row.responseRate || '85%'} Response
                                    </span>
                                  </div>
                                  <div className="space-y-1.5 pt-0.5">
                                    <div className="flex items-center justify-between">
                                      <span className="flex items-center gap-1.5 text-stone-600 font-medium">
                                        <span className="w-2.5 h-2.5 rounded-xs bg-[#163e35]" /> Inbound Inquiries
                                      </span>
                                      <span className="font-extrabold text-stone-900">{row.inbound}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="flex items-center gap-1.5 text-stone-600 font-medium">
                                        <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981]" /> Outbound Contacted
                                      </span>
                                      <span className="font-extrabold text-stone-900">{row.outbound}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="flex items-center gap-1.5 text-stone-600 font-medium">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> Site Visits Confirmed
                                      </span>
                                      <span className="font-extrabold text-amber-900">{row.visits}</span>
                                    </div>
                                  </div>
                                  <div className="pt-2 border-t border-stone-100 text-[10px] text-stone-500 italic">
                                    💡 {row.outbound} of {row.inbound} buyers qualified by team advisors
                                  </div>
                                </div>
                              );
                            }}
                          />
                          <Area type="monotone" dataKey="inbound" name="Inbound Inquiries" stroke="#163e35" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInbound)" />
                          <Area type="monotone" dataKey="outbound" name="Outbound Contacted" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOutbound)" />
                          <Line type="monotone" dataKey="visits" name="Site Visits Scheduled" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 1.5, stroke: '#fff' }} />
                        </ComposedChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 bg-stone-50 rounded-2xl animate-pulse flex items-center justify-center text-xs text-stone-400">
                    Loading performance chart...
                  </div>
                )}

                {/* Explanatory Legend Footer Defining Inbound, Outbound & Visits */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4 text-stone-600">
                    <span className="flex items-center gap-1.5 font-semibold text-stone-800">
                      <span className="w-3 h-3 rounded-xs bg-[#163e35]" /> Inbound Inquiries
                      <span className="text-stone-400 font-normal">(Incoming calls, chat & forms)</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-stone-800">
                      <span className="w-3 h-3 rounded-xs bg-[#10b981]" /> Outbound Outreach
                      <span className="text-stone-400 font-normal">(Team follow-ups & qualification)</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-amber-800">
                      <span className="w-3 h-3 rounded-full bg-[#f59e0b]" /> Site Visits
                      <span className="text-stone-400 font-normal">(Confirmed client tours)</span>
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 italic">
                    💡 Hover any bar or data point to inspect team outreach response metrics
                  </div>
                </div>
              </div>

              {/* ===============================================================
                  2-COLUMN: RECENT INBOUND LEADS & SALES TEAM SNAPSHOT
                 =============================================================== */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Recent Leads Feed */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-stone-900">Recent Inbound Stream</h3>
                      <p className="text-xs text-stone-500">Click any row to open the complete Lead Details modal.</p>
                    </div>
                    <button
                      onClick={() => setTab('leads')}
                      className="text-xs font-bold text-[#163e35] hover:underline cursor-pointer"
                    >
                      View All ({timeFilteredLeads.length}) →
                    </button>
                  </div>

                  {timeFilteredLeads.length === 0 ? (
                    <div className="text-center py-10 text-stone-400 text-sm">
                      No inbound leads received in this time range.
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100">
                      {timeFilteredLeads.slice(0, 5).map((lead) => (
                        <div
                          key={lead._id}
                          onClick={() => setSelectedLead(lead)}
                          className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/80 -mx-3 px-3 rounded-xl transition-colors cursor-pointer"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                                lead.source === 'phone'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : lead.source === 'message'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {lead.source === 'phone' ? (
                                <PhoneCall size={15} />
                              ) : lead.source === 'message' ? (
                                <MessageSquare size={15} />
                              ) : (
                                <ClipboardList size={15} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-stone-900 text-sm truncate">
                                  {lead.name}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    lead.source === 'phone'
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                      : lead.source === 'message'
                                      ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  {lead.source === 'phone'
                                    ? 'Phone Callback'
                                    : lead.source === 'message'
                                    ? 'Chat Inquiry'
                                    : 'Property Form'}
                                </span>
                                {lead.assignedTeamMember ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                                    <UserCheck size={11} className="text-emerald-700" />
                                    <span>{lead.assignedTeamMember}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-500">
                                    <Users size={10} className="text-stone-400" />
                                    Unassigned
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-500 truncate mt-0.5">
                                {lead.property?.title || lead.project?.title || `${lead.city || 'Bengaluru'} Inquiry`} · {lead.phone}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-bold capitalize ${
                                lead.status === 'converted' || lead.status === 'deal_closed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : lead.status === 'site_visit_scheduled'
                                  ? 'bg-purple-100 text-purple-800'
                                  : lead.status === 'interested'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : lead.status === 'contacted'
                                  ? 'bg-sky-100 text-sky-800'
                                  : lead.status === 'dropped' || lead.status === 'lost'
                                  ? 'bg-stone-200 text-stone-600'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {lead.status?.replace(/_/g, ' ')}
                            </span>
                            <ChevronRight size={16} className="text-stone-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right 1 Col: Sales Team Allocation */}
                <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-stone-900">Sales Advisors</h3>
                      <button
                        onClick={() => setIsAddMemberOpen(true)}
                        className="text-xs font-bold text-[#163e35] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={13} /> Add
                      </button>
                    </div>

                    {team.length === 0 ? (
                      <div className="text-center py-8 text-stone-400 text-sm">
                        No team members registered yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {team.slice(0, 5).map((member) => (
                          <div
                            key={member._id}
                            onClick={() => setSelectedMember(member)}
                            className="p-3 rounded-2xl border border-stone-100 hover:border-stone-300 hover:bg-stone-50/70 transition-all flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-[#163e35] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                {member.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-xs text-stone-900 truncate">
                                  {member.name}
                                </div>
                                <div className="text-[11px] text-stone-500 truncate">{member.role}</div>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full shrink-0 border border-emerald-100">
                              {member.assignedLeadsCount || 0} Leads
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setTab('team')}
                    className="mt-4 w-full py-2.5 text-xs font-bold text-[#163e35] bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer text-center"
                  >
                    View Sales Network ({team.length}) →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 2: LEADS DASHBOARD (STATUSES: UNCONTACTED, CONTACTED, INTERESTED, CONVERTED)
             ===================================================================== */}
          {tab === 'leads' && (
            <div className="space-y-6">
              {/* Sleek High-Efficiency Leads Top Bar */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3.5">
                {/* Header Row: Title & Mobile Filter Drawer Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">Leads &amp; Contacts Pipeline</h2>
                    <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                      Track and filter client inquiries across Phone, Direct Chat, and Property Forms.
                    </p>
                  </div>

                  {/* Mobile Filter Drawer Button (Visible on screens < lg) */}
                  <div className="lg:hidden shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsMobileFilterOpen(true)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#163e35] text-white hover:bg-[#12332c] shadow-xs transition-all cursor-pointer"
                    >
                      <Filter size={14} className="text-[#d8edb3]" />
                      <span>Filters</span>
                      {activeFiltersCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#d8edb3] text-[#163e35]">
                          {activeFiltersCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Full-width Search Bar */}
                <div className="relative w-full">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={leadSearchQuery}
                    onChange={(e) => setLeadSearchQuery(e.target.value)}
                    placeholder="Search by client name, mobile phone number, property title, or advisor..."
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163e35] focus:bg-white transition-all text-stone-900 placeholder:text-stone-400"
                  />
                  {leadSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setLeadSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 rounded-lg"
                      title="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Active Filters Summary Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-stone-500 font-medium mr-1">
                      Showing <span className="font-bold text-stone-900">{filteredLeads.length}</span> of{' '}
                      <span className="font-bold text-stone-900">{leads.length}</span> leads
                    </span>

                    {/* Active Pill: Time Range */}
                    {timeRange !== 'all' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-[11px] font-semibold">
                        <Clock size={11} className="text-emerald-700" />
                        <span>
                          Time: {PIPELINE_TIME_OPTIONS.find((t) => t.id === timeRange)?.label || timeRange}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setTimeRange('all');
                            propSetTimeRange?.('all');
                            onTimeRangeChange?.('all');
                          }}
                          className="hover:text-red-700 ml-0.5 p-0.5 rounded cursor-pointer"
                          title="Remove time filter"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}

                    {/* Active Pill: Channel */}
                    {leadChannelFilter !== 'all' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-[11px] font-semibold">
                        <Layers size={11} className="text-emerald-700" />
                        <span>
                          Channel:{' '}
                          {leadChannelFilter === 'phone'
                            ? 'Phone Calls'
                            : leadChannelFilter === 'message'
                            ? 'Direct Messages'
                            : 'Property Enquiries'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setLeadChannelFilter('all')}
                          className="hover:text-red-700 ml-0.5 p-0.5 rounded cursor-pointer"
                          title="Remove channel filter"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}

                    {/* Active Pill: Status */}
                    {leadStatusFilter !== 'all' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-[11px] font-semibold">
                        <CheckCircle2 size={11} className="text-emerald-700" />
                        <span>
                          Status:{' '}
                          {PIPELINE_STATUS_OPTIONS.find((s) => s.id === leadStatusFilter)?.label || leadStatusFilter}
                        </span>
                        <button
                          type="button"
                          onClick={() => setLeadStatusFilter('all')}
                          className="hover:text-red-700 ml-0.5 p-0.5 rounded cursor-pointer"
                          title="Remove status filter"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}

                    {/* Active Pill: Advisor */}
                    {leadAdvisorFilter !== 'all' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-[11px] font-semibold">
                        <UserCheck size={11} className="text-emerald-700" />
                        <span>
                          Advisor: {leadAdvisorFilter === 'unassigned' ? 'Unassigned' : leadAdvisorFilter}
                        </span>
                        <button
                          type="button"
                          onClick={() => setLeadAdvisorFilter('all')}
                          className="hover:text-red-700 ml-0.5 p-0.5 rounded cursor-pointer"
                          title="Remove advisor filter"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}

                    {/* Active Pill: Search Query */}
                    {leadSearchQuery && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200 text-[11px] font-semibold">
                        <Search size={11} className="text-stone-500" />
                        <span>&ldquo;{leadSearchQuery}&rdquo;</span>
                        <button
                          type="button"
                          onClick={() => setLeadSearchQuery('')}
                          className="hover:text-red-700 ml-0.5 p-0.5 rounded cursor-pointer"
                          title="Clear search"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )}
                  </div>

                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-[11px] font-bold text-stone-500 hover:text-red-600 hover:underline cursor-pointer transition-colors"
                    >
                      Reset all filters
                    </button>
                  )}
                </div>
              </div>

              {/* Leads Cards Feed: Displays Name, Touchpoint, Assigned Advisor, Progress Status, and Received */}
              {filteredLeads.length === 0 ? (
                <div className="bg-white rounded-3xl border border-stone-200 shadow-xs text-center py-14 px-4 text-stone-500">
                  <PhoneCall size={36} className="mx-auto text-stone-300 mb-3" />
                  <h4 className="font-bold text-stone-800 text-base">No matching leads found</h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    Try adjusting your channel filter, status filter, advisor filter, or search query.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLeads.map((lead) => {
                    const isPhone = lead.source === 'phone';
                    const isMsg = lead.source === 'message';
                    return (
                      <div
                        key={lead._id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedLead(lead)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedLead(lead);
                          }
                        }}
                        className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 p-4 sm:p-5 hover:border-[#163e35]/60 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        {/* 1. Name */}
                        <div className="font-bold text-stone-900 text-sm sm:text-base group-hover:text-[#163e35] transition-colors truncate min-w-0">
                          {lead.name}
                        </div>

                        {/* Badges: Touchpoint, Assigned Advisor, Progress Status, Received */}
                        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
                          {/* 2. Touchpoint */}
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                              isPhone
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : isMsg
                                ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                            title="Touchpoint Channel"
                          >
                            {isPhone ? (
                              <PhoneCall size={12} />
                            ) : isMsg ? (
                              <MessageSquare size={12} />
                            ) : (
                              <ClipboardList size={12} />
                            )}
                            <span>
                              {isPhone
                                ? 'Phone Callback'
                                : isMsg
                                ? 'Direct Chat'
                                : 'Property Form'}
                            </span>
                          </span>

                          {/* 3. Assigned Advisor */}
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                              lead.assignedTeamMember
                                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs'
                                : 'bg-stone-100 text-stone-600 border border-stone-200'
                            }`}
                            title="Assigned Advisor"
                          >
                            <UserCheck
                              size={13}
                              className={lead.assignedTeamMember ? 'text-emerald-700' : 'text-stone-400'}
                            />
                            <span className="truncate max-w-[140px]">
                              {lead.assignedTeamMember || 'Unassigned'}
                            </span>
                          </span>

                          {/* 4. Progress Status */}
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border capitalize ${
                              lead.status === 'converted' || lead.status === 'deal_closed'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : lead.status === 'site_visit_scheduled'
                                ? 'bg-purple-100 text-purple-900 border-purple-300'
                                : lead.status === 'interested'
                                ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                                : lead.status === 'contacted'
                                ? 'bg-sky-100 text-sky-900 border-sky-300'
                                : lead.status === 'dropped' || lead.status === 'lost'
                                ? 'bg-stone-100 text-stone-600 border-stone-300'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}
                            title="Progress Status"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                            <span>
                              {lead.status === 'uncontacted'
                                ? 'Uncontacted'
                                : lead.status === 'contacted'
                                ? 'Contacted'
                                : lead.status === 'interested'
                                ? 'Interested'
                                : lead.status === 'site_visit_scheduled'
                                ? 'Site Visit Booked'
                                : lead.status === 'negotiation'
                                ? 'Negotiation'
                                : lead.status === 'converted' || lead.status === 'deal_closed'
                                ? 'Converted'
                                : lead.status === 'dropped' || lead.status === 'lost'
                                ? 'Dropped'
                                : lead.status
                                ? lead.status.replace(/_/g, ' ')
                                : 'Uncontacted'}
                            </span>
                          </span>

                          {/* 5. Received */}
                          <div className="flex items-center gap-1.5 text-xs text-stone-500 whitespace-nowrap pl-1">
                            <Clock size={12} className="text-stone-400" />
                            <span>{date(lead.createdAt)}</span>
                          </div>

                          <ChevronRight
                            size={16}
                            className="text-stone-300 group-hover:text-[#163e35] group-hover:translate-x-0.5 transition-all hidden sm:block"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              TAB 3: OUR LISTINGS
             ===================================================================== */}
          {tab === 'listings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-stone-900">Agency Listings Portfolio</h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                    Residential and commercial properties managed by your Channel Partner license.
                  </p>
                </div>
                <Link
                  href="/post-property"
                  className="btn !bg-[#163e35] !text-white hover:!bg-[#1f5247] !font-bold !text-xs sm:!text-sm flex items-center gap-1.5 py-2.5 px-4 rounded-xl self-start sm:self-auto"
                >
                  <Plus size={16} />
                  Add New Listing
                </Link>
              </div>

              {/* Filter Bar */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {['all', 'approved', 'pending', 'archived'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setListingStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                        listingStatusFilter === st
                          ? 'bg-[#163e35] text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {st === 'pending' ? 'Under Review' : st}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={listingSearchQuery}
                    onChange={(e) => setListingSearchQuery(e.target.value)}
                    placeholder="Search properties by title or locality..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#163e35]"
                  />
                </div>
              </div>

              {/* Listings Grid */}
              {filteredListings.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-3xl border border-stone-200">
                  <Home size={36} className="mx-auto text-stone-300 mb-3" />
                  <h4 className="font-bold text-stone-800 text-base">No listings found</h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    Post your properties to start receiving direct buyer and tenant enquiries.
                  </p>
                  <Link href="/post-property" className="btn mt-4 !text-xs !bg-[#163e35] !text-white">
                    <Plus size={14} /> Post Property Now
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredListings.map((prop) => {
                    const photos = propertyImages(prop);
                    const isApprox = prop.locationPrecision === 'approximate';
                    return (
                      <div
                        key={prop._id}
                        className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                      >
                        <div>
                          {/* Image Preview with Badges */}
                          <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                            <img
                              src={photos[0]}
                              alt={prop.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  prop.status === 'approved'
                                    ? 'bg-emerald-600 text-white'
                                    : prop.status === 'pending'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-stone-600 text-white'
                                }`}
                              >
                                {prop.status === 'pending' ? 'Under Review' : prop.status}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-black/60 backdrop-blur-sm text-white">
                                {prop.purpose}
                              </span>
                            </div>

                            {isApprox && (
                              <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-[#d8edb3] text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold">
                                <MapPin size={11} /> Approximate Area (~500m)
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            <div className="font-extrabold text-stone-900 text-lg text-forest">
                              {money(prop.price)}
                              {prop.purpose === 'rent' && <span className="text-xs font-normal text-stone-500"> /mo</span>}
                            </div>
                            <h4 className="font-bold text-stone-900 text-sm mt-1 line-clamp-1">
                              {prop.title}
                            </h4>
                            <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                              <MapPin size={12} className="text-stone-400 shrink-0" />
                              <span className="truncate">{prop.locality}, {prop.city}</span>
                            </p>

                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-stone-100 text-[11px] text-stone-600">
                              {prop.bedrooms > 0 && <span>{prop.bedrooms} BHK</span>}
                              <span>{prop.area} sq.ft</span>
                              <span>{prop.furnishing || 'Unfurnished'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Footer */}
                        <div className="p-3 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/properties/${prop._id}`}
                              className="font-semibold text-stone-700 hover:text-stone-900 flex items-center gap-1"
                            >
                              View <ExternalLink size={12} />
                            </Link>
                            <span>·</span>
                            <Link
                              href={`/properties/${prop._id}/edit`}
                              className="font-semibold text-[#163e35] hover:underline"
                            >
                              Edit
                            </Link>
                          </div>

                          <div className="flex items-center gap-2">
                            {prop.status === 'approved' && (
                              <button
                                onClick={() => handlePromoteListing(prop._id)}
                                className={`font-semibold cursor-pointer ${
                                  prop.featured ? 'text-amber-700' : 'text-stone-500 hover:text-stone-800'
                                }`}
                              >
                                {prop.featured ? '★ Featured' : '☆ Promote'}
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedListing(prop)}
                              className="px-2.5 py-1 bg-[#163e35] text-white rounded-lg font-semibold hover:bg-[#1f5247] cursor-pointer"
                            >
                              Inspect
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              TAB 4: SALES TEAM MEMBERS
             ===================================================================== */}
          {tab === 'team' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-stone-900">Channel Sales Network</h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                    Sales managers, luxury specialists, and agents operating under your firm.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddMemberOpen(true)}
                  className="btn !bg-[#163e35] !text-white hover:!bg-[#1f5247] !font-bold !text-xs sm:!text-sm flex items-center gap-1.5 py-2.5 px-4 rounded-xl cursor-pointer self-start sm:self-auto"
                >
                  <Plus size={16} />
                  Add Team Member
                </button>
              </div>

              {team.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-3xl border border-stone-200">
                  <Users size={36} className="mx-auto text-stone-300 mb-3" />
                  <h4 className="font-bold text-stone-800 text-base">No team members registered</h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    Add your sales advisors and property managers to assign inbound leads and track visit schedules.
                  </p>
                  <button
                    onClick={() => setIsAddMemberOpen(true)}
                    className="btn mt-4 !text-xs !bg-[#163e35] !text-white cursor-pointer"
                  >
                    <Plus size={14} /> Add First Advisor
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {team.map((member) => {
                    const assignedLeads = leads.filter(
                      (l) => l.assignedTeamMember === member.name
                    );
                    const contactedCount = assignedLeads.filter((l) => l.status === 'contacted').length;
                    const interestedCount = assignedLeads.filter((l) => l.status === 'interested' || l.status === 'consultation').length;
                    const convertedCount = assignedLeads.filter((l) => l.status === 'converted' || l.status === 'deal_closed').length;

                    return (
                      <div
                        key={member._id}
                        className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-all cursor-pointer group"
                        onClick={() => setSelectedMember(member)}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#163e35] to-[#255e52] text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
                                {member.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-bold text-stone-900 text-sm leading-tight group-hover:text-[#163e35] transition-colors">
                                  {member.name}
                                </h4>
                                <p className="text-xs text-stone-500 mt-0.5 font-medium">
                                  {member.role || 'Property Specialist'}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                                member.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : member.status === 'on_leave'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {member.status?.replace('_', ' ') || 'Active'}
                            </span>
                          </div>

                          <div className="space-y-1.5 py-3 border-y border-stone-100 text-xs text-stone-600">
                            {member.phone && (
                              <div className="flex items-center gap-2">
                                <Phone size={13} className="text-stone-400" />
                                <a
                                  href={`tel:${member.phone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="hover:underline"
                                >
                                  {member.phone}
                                </a>
                              </div>
                            )}
                            {member.email && (
                              <div className="flex items-center gap-2">
                                <Mail size={13} className="text-stone-400" />
                                <a
                                  href={`mailto:${member.email}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="hover:underline truncate"
                                >
                                  {member.email}
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Lead Allocation & Status Badges */}
                          <div className="pt-3 space-y-2">
                            <div className="flex items-center justify-between text-xs text-stone-500">
                              <span className="font-semibold">Assigned Leads:</span>
                              <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                                {assignedLeads.length || member.assignedLeadsCount || 0} Total
                              </span>
                            </div>

                            {/* Status badges: contacted, interested, converted */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {contactedCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" />
                                  {contactedCount} Contacted
                                </span>
                              )}
                              {interestedCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                                  {interestedCount} Interested
                                </span>
                              )}
                              {convertedCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                  {convertedCount} Converted
                                </span>
                              )}
                            </div>

                            {/* Assigned Leads Preview List */}
                            {assignedLeads.length > 0 && (
                              <div className="pt-2 border-t border-stone-100 space-y-1">
                                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                                  Recent Leads:
                                </div>
                                <div className="space-y-1 max-h-32 overflow-y-auto no-scrollbar">
                                  {assignedLeads.slice(0, 3).map((al) => (
                                    <div
                                      key={al._id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedLead(al);
                                      }}
                                      className="p-1.5 rounded-lg bg-stone-50 hover:bg-stone-100/90 flex items-center justify-between text-xs transition-colors border border-stone-100/80 cursor-pointer"
                                    >
                                      <div className="truncate mr-2 font-medium text-stone-800">
                                        {al.name}
                                      </div>
                                      <span
                                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${
                                          al.status === 'contacted'
                                            ? 'bg-sky-100 text-sky-900 border border-sky-300'
                                            : al.status === 'interested'
                                            ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                                            : al.status === 'converted' || al.status === 'deal_closed'
                                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                            : al.status === 'site_visit_scheduled'
                                            ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                            : al.status === 'negotiation'
                                            ? 'bg-teal-100 text-teal-900 border border-teal-300'
                                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                                        }`}
                                      >
                                        {al.status?.replace(/_/g, ' ')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-stone-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLeadAdvisorFilter(member.name);
                              setTab('leads');
                            }}
                            className="px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                            title="Filter this advisor's leads in pipeline"
                          >
                            Filter Leads
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMember(member._id);
                              }}
                              className="p-1.5 text-stone-400 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              title="Remove member"
                            >
                              <Trash2 size={15} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMember(member);
                              }}
                              className="px-3 py-1.5 text-xs font-bold text-[#163e35] bg-[#163e35]/10 hover:bg-[#163e35] hover:text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <UserCheck size={13} /> View Leads &amp; Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              TAB 5: SUPPORT DESK SCREEN
             ===================================================================== */}
          {tab === 'support' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-stone-900">Support &amp; Verification Desk</h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                    Priority helpdesk for listing reviews, RERA license verification, and technical assistance.
                  </p>
                </div>
                <button
                  onClick={() => setIsRaiseTicketOpen(true)}
                  className="btn !bg-[#163e35] !text-white hover:!bg-[#1f5247] !font-bold !text-xs sm:!text-sm flex items-center gap-1.5 py-2.5 px-4 rounded-xl cursor-pointer self-start sm:self-auto"
                >
                  <Plus size={16} />
                  Raise New Ticket
                </button>
              </div>

              {/* Ticket Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Tickets', count: tickets.length, color: 'text-stone-900' },
                  {
                    label: 'Open',
                    count: tickets.filter((t) => t.status === 'open').length,
                    color: 'text-amber-700'
                  },
                  {
                    label: 'In Progress',
                    count: tickets.filter((t) => t.status === 'in_progress').length,
                    color: 'text-sky-700'
                  },
                  {
                    label: 'Resolved',
                    count: tickets.filter((t) => t.status === 'resolved').length,
                    color: 'text-emerald-700'
                  }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-stone-200 text-center">
                    <div className={`text-2xl font-extrabold ${stat.color}`}>{stat.count}</div>
                    <div className="text-xs text-stone-500 font-medium mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2">
                {['all', 'open', 'in_progress', 'resolved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTicketStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                      ticketStatusFilter === st
                        ? 'bg-[#163e35] text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Ticket Cards List */}
              {filteredTickets.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-3xl border border-stone-200">
                  <LifeBuoy size={36} className="mx-auto text-stone-300 mb-3" />
                  <h4 className="font-bold text-stone-800 text-base">No tickets matching filter</h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    Need help with property moderation or account verification? Open a priority ticket anytime.
                  </p>
                  <button
                    onClick={() => setIsRaiseTicketOpen(true)}
                    className="btn mt-4 !text-xs !bg-[#163e35] !text-white cursor-pointer"
                  >
                    <Plus size={14} /> Raise Ticket
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-[#163e35]/60 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                            {ticket.ticketNumber}
                          </span>
                          <span className="text-xs font-bold text-stone-800 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded">
                            {ticket.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              ticket.priority === 'urgent' || ticket.priority === 'high'
                                ? 'bg-red-50 text-red-800 border border-red-200'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </div>

                        <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                          {ticket.subject}
                        </h4>
                        <p className="text-xs text-stone-500 line-clamp-1 max-w-2xl">
                          {ticket.message}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                            ticket.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ticket.status === 'in_progress'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <button className="px-3 py-1.5 text-xs font-bold text-[#163e35] bg-[#163e35]/10 hover:bg-[#163e35] hover:text-white rounded-lg transition-colors cursor-pointer">
                          Inspect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              TAB 6: NOTIFICATIONS SCREEN
             ===================================================================== */}
          {tab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-stone-900">Notifications &amp; Alerts</h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                    Real-time updates regarding new leads, property approvals, and support messages.
                  </p>
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={handleMarkAllNotificationsRead}
                    className="btn !bg-stone-100 !text-stone-800 hover:!bg-stone-200 !text-xs font-semibold py-2 px-3 rounded-xl cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
                  >
                    <CheckSquare size={14} /> Mark All as Read
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {['all', 'unread'].map((flt) => (
                  <button
                    key={flt}
                    onClick={() => setNotificationFilter(flt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                      notificationFilter === flt
                        ? 'bg-[#163e35] text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {flt}
                  </button>
                ))}
              </div>

              {filteredNotifications.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-3xl border border-stone-200">
                  <Bell size={36} className="mx-auto text-stone-300 mb-3" />
                  <h4 className="font-bold text-stone-800 text-base">No notifications</h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    You are completely up to date. New lead alerts and moderation updates will appear here.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-stone-200 divide-y divide-stone-100 overflow-hidden shadow-xs">
                  {filteredNotifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`p-4 sm:p-5 flex items-start gap-3.5 transition-colors ${
                        !notif.read ? 'bg-emerald-50/40' : 'hover:bg-stone-50'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          !notif.read ? 'bg-[#163e35] text-white' : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        <Bell size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-stone-900 text-sm">{notif.title}</h4>
                          <span className="text-[11px] text-stone-400 whitespace-nowrap">
                            {date(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">{notif.body}</p>
                        {notif.link && (
                          <Link
                            href={notif.link}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#163e35] hover:underline mt-2"
                          >
                            Open item <ExternalLink size={12} />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          MOBILE SLIDE-OVER FILTER DRAWER (SCREENS < LG)
         ========================================================================= */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[99990] lg:hidden flex">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
            aria-hidden="true"
          />
          <div className="relative ml-auto w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-[#163e35]" />
                <h3 className="font-bold text-stone-900 text-sm">Pipeline Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#163e35] text-[#d8edb3]">
                    {activeFiltersCount} active
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              <PipelineFiltersWidget
                timeRange={timeRange}
                setTimeRange={setTimeRange}
                propSetTimeRange={propSetTimeRange}
                onTimeRangeChange={onTimeRangeChange}
                leadChannelFilter={leadChannelFilter}
                setLeadChannelFilter={setLeadChannelFilter}
                leadStatusFilter={leadStatusFilter}
                setLeadStatusFilter={setLeadStatusFilter}
                leadAdvisorFilter={leadAdvisorFilter}
                setLeadAdvisorFilter={setLeadAdvisorFilter}
                leads={leads}
                timeFilteredLeads={timeFilteredLeads}
                team={team}
                activeFiltersCount={activeFiltersCount}
                onResetFilters={handleResetFilters}
                showHeader={false}
              />
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 py-2.5 px-3 text-xs font-bold text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer text-center"
                >
                  Reset All
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 px-3 text-xs font-bold text-white bg-[#163e35] hover:bg-[#12332c] rounded-xl shadow-xs transition-colors cursor-pointer text-center"
              >
                Show {filteredLeads.length} Leads
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          RICH MODAL 1: LEAD DETAIL & INSPECTION MODAL
         ========================================================================= */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-[99999] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedLead(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden no-scrollbar my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-900 to-[#163e35] text-white flex items-center justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      selectedLead.source === 'phone'
                        ? 'bg-emerald-400 text-stone-950'
                        : selectedLead.source === 'message'
                        ? 'bg-sky-400 text-stone-950'
                        : 'bg-amber-400 text-stone-950'
                    }`}
                  >
                    {selectedLead.source === 'phone'
                      ? 'Phone Callback Lead'
                      : selectedLead.source === 'message'
                      ? 'Live Message Lead'
                      : 'Property Enquiry Form'}
                  </span>
                  <span className="text-xs text-stone-300">
                    Received {date(selectedLead.createdAt)}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                    selectedLead.status === 'contacted'
                      ? 'bg-sky-200 text-sky-950 font-bold'
                      : selectedLead.status === 'interested'
                      ? 'bg-indigo-200 text-indigo-950 font-bold'
                      : selectedLead.status === 'converted' || selectedLead.status === 'deal_closed'
                      ? 'bg-emerald-300 text-emerald-950 font-bold'
                      : 'bg-white/20 text-white'
                  }`}>
                    {selectedLead.status?.replace(/_/g, ' ')}
                  </span>
                  {selectedLead.assignedTeamMember && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#d8edb3] text-[#163e35]">
                      <UserCheck size={11} className="text-[#163e35]" />
                      Handled by {selectedLead.assignedTeamMember}
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mt-1 text-white">
                  {selectedLead.name}
                </h3>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
              {/* Client Contact Grid */}
              <div className="grid sm:grid-cols-2 gap-3.5 bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
                <div>
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Phone Number
                  </span>
                  <div className="flex items-center gap-2 mt-1 font-bold text-stone-900 text-sm">
                    <Phone size={14} className="text-[#163e35]" />
                    <a href={`tel:${selectedLead.phone}`} className="hover:underline">
                      {selectedLead.phone}
                    </a>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Email Address
                  </span>
                  <div className="flex items-center gap-2 mt-1 font-bold text-stone-900 text-sm">
                    <Mail size={14} className="text-[#163e35]" />
                    <a href={`mailto:${selectedLead.email}`} className="hover:underline truncate">
                      {selectedLead.email || 'Not provided'}
                    </a>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Operating City / Area
                  </span>
                  <div className="flex items-center gap-2 mt-1 font-semibold text-stone-800 text-sm">
                    <MapPin size={14} className="text-stone-400" />
                    {selectedLead.city || 'Bengaluru'}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Current Status &amp; Handler
                  </span>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                      selectedLead.status === 'contacted'
                        ? 'bg-sky-100 text-sky-900 border border-sky-300'
                        : selectedLead.status === 'interested'
                        ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                        : selectedLead.status === 'converted' || selectedLead.status === 'deal_closed'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : selectedLead.status === 'site_visit_scheduled'
                        ? 'bg-purple-100 text-purple-900 border border-purple-300'
                        : selectedLead.status === 'negotiation'
                        ? 'bg-teal-100 text-teal-900 border border-teal-300'
                        : selectedLead.status === 'dropped' || selectedLead.status === 'lost'
                        ? 'bg-stone-100 text-stone-600 border border-stone-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {selectedLead.status?.replace(/_/g, ' ')}
                    </span>
                    {selectedLead.assignedTeamMember ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                        <UserCheck size={12} className="text-emerald-700" />
                        {selectedLead.assignedTeamMember}
                      </span>
                    ) : (
                      <span className="text-xs text-stone-400 italic">Unassigned</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Referenced Property Card */}
              {selectedLead.property && (
                <div className="p-4 rounded-2xl border border-stone-200 bg-white shadow-xs">
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Inquired Property
                  </div>
                  <div className="flex items-center gap-3.5">
                    {selectedLead.property.images?.[0] && (
                      <img
                        src={selectedLead.property.images[0]}
                        alt=""
                        className="w-16 h-14 object-cover rounded-xl shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-stone-900 text-sm truncate">
                        {selectedLead.property.title}
                      </h4>
                      <p className="text-xs text-stone-500">
                        {selectedLead.property.locality}, {selectedLead.property.city} ·{' '}
                        <span className="font-bold text-forest">{money(selectedLead.property.price)}</span>
                      </p>
                    </div>
                    <Link
                      href={`/properties/${selectedLead.property._id}`}
                      target="_blank"
                      className="px-3 py-1.5 text-xs font-bold text-[#163e35] bg-stone-100 hover:bg-stone-200 rounded-lg shrink-0 flex items-center gap-1"
                    >
                      View <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              )}

              {/* Assigned Personal Team Member Section */}
              {(() => {
                const assignedAdvisor = team.find((m) => m.name === selectedLead.assignedTeamMember);
                return (
                  <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck size={15} className="text-[#163e35]" />
                        Assigned Personal Team Advisor
                      </span>
                      {assignedAdvisor ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck size={11} className="text-emerald-700" />
                          Assigned Sales Advisor
                        </span>
                      ) : selectedLead.assignedTeamMember ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          Advisor Assigned
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-200 text-stone-600">
                          No Advisor Assigned
                        </span>
                      )}
                    </div>

                    {/* Display Personal Team Member Details: Name, Role, Email, Phone */}
                    {assignedAdvisor ? (
                      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#163e35] to-[#255e52] text-[#d8edb3] flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                              {assignedAdvisor.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
                                <span>{assignedAdvisor.name}</span>
                              </div>
                              <div className="text-xs text-stone-500 font-medium">
                                {assignedAdvisor.role || 'Senior Property Advisor'}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                              assignedAdvisor.status === 'active'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {assignedAdvisor.status?.replace('_', ' ') || 'Active'}
                          </span>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-2.5 pt-2.5 border-t border-stone-100 text-xs text-stone-700">
                          <div className="flex items-center gap-2">
                            <Phone size={13} className="text-[#163e35] shrink-0" />
                            <span className="font-semibold text-stone-500">Phone:</span>
                            {assignedAdvisor.phone ? (
                              <a href={`tel:${assignedAdvisor.phone}`} className="font-bold text-stone-900 hover:underline">
                                {assignedAdvisor.phone}
                              </a>
                            ) : (
                              <span className="text-stone-400 italic">Not listed</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 min-w-0">
                            <Mail size={13} className="text-[#163e35] shrink-0" />
                            <span className="font-semibold text-stone-500">Email:</span>
                            {assignedAdvisor.email ? (
                              <a href={`mailto:${assignedAdvisor.email}`} className="font-bold text-stone-900 hover:underline truncate">
                                {assignedAdvisor.email}
                              </a>
                            ) : (
                              <span className="text-stone-400 italic">Not listed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : selectedLead.assignedTeamMember ? (
                      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 text-xs space-y-1">
                        <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                          <UserCheck size={14} className="text-emerald-700" />
                          {selectedLead.assignedTeamMember}
                        </div>
                        <div className="text-stone-500 text-[11px]">Assigned Personal Team Member</div>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-white rounded-2xl border border-dashed border-stone-300 text-xs text-stone-500 text-center">
                        This lead is currently unassigned. Choose a personal team member below to allocate client follow-ups.
                      </div>
                    )}

                    {/* Selector to assign / reassign the lead to any team member */}
                    <div className="pt-1">
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        {selectedLead.assignedTeamMember ? 'Reassign to Personal Team Member:' : 'Assign to Personal Team Member:'}
                      </label>
                      <select
                        value={selectedLead.assignedTeamMember || ''}
                        onChange={(e) =>
                          handleUpdateLead(selectedLead._id, { assignedTeamMember: e.target.value })
                        }
                        className="w-full py-2.5 px-3 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35] font-medium cursor-pointer"
                      >
                        <option value="">Unassigned (None)</option>
                        {team.map((m) => (
                          <option key={m._id} value={m.name}>
                            {m.name} — {m.role} {m.phone ? `(${m.phone})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })()}

              {/* Update Progress Status */}
              <div className="pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-700">
                    Update Progress Status
                  </label>
                  {selectedLead.assignedTeamMember && (
                    <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                      <UserCheck size={11} className="text-emerald-700" />
                      Associated with {selectedLead.assignedTeamMember}
                    </span>
                  )}
                </div>
                <select
                  value={selectedLead.status}
                  onChange={(e) =>
                    handleUpdateLead(selectedLead._id, { status: e.target.value })
                  }
                  className={`w-full py-2.5 px-3 text-sm border rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35] font-bold capitalize cursor-pointer ${
                    selectedLead.status === 'contacted'
                      ? 'bg-sky-50 text-sky-900 border-sky-300'
                      : selectedLead.status === 'interested'
                      ? 'bg-indigo-50 text-indigo-900 border-indigo-300'
                      : selectedLead.status === 'converted' || selectedLead.status === 'deal_closed'
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : selectedLead.status === 'site_visit_scheduled'
                      ? 'bg-purple-50 text-purple-900 border-purple-300'
                      : selectedLead.status === 'negotiation'
                      ? 'bg-teal-50 text-teal-900 border-teal-300'
                      : selectedLead.status === 'dropped' || selectedLead.status === 'lost'
                      ? 'bg-stone-50 text-stone-600 border-stone-300'
                      : 'bg-amber-50 text-amber-900 border-amber-300'
                  }`}
                >
                  <option value="uncontacted">Uncontacted (New Lead)</option>
                  <option value="contacted">Contacted (Initial Outreach Completed)</option>
                  <option value="interested">Interested (Qualified Prospect)</option>
                  <option value="consultation">Consultation Scheduled</option>
                  <option value="site_visit_scheduled">Site Visit Booked</option>
                  <option value="negotiation">Price &amp; Term Negotiation</option>
                  <option value="converted">Converted (Deal Closed / Won)</option>
                  <option value="dropped">Dropped (Lost)</option>
                </select>
              </div>

              {/* Interaction Notes History */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  Follow-up Notes &amp; Activity Log
                </span>

                {selectedLead.notes && selectedLead.notes.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedLead.notes.map((noteItem, idx) => (
                      <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs">
                        <div className="flex items-center justify-between text-stone-500 font-medium mb-1">
                          <span className="font-bold text-stone-800">{noteItem.author}</span>
                          <span>{date(noteItem.createdAt)}</span>
                        </div>
                        <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                          {noteItem.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : selectedLead.note ? (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs text-stone-700">
                    {selectedLead.note}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 italic">No notes recorded yet.</p>
                )}

                {/* Add Follow-up Note Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const noteText = e.currentTarget.note.value;
                    if (!noteText?.trim()) return;
                    handleUpdateLead(selectedLead._id, { note: noteText.trim() });
                    e.currentTarget.reset();
                  }}
                  className="space-y-2 pt-2"
                >
                  <textarea
                    name="note"
                    rows={2}
                    placeholder="Add a follow-up note (e.g. client requested floor plans or callback on Friday)..."
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#163e35] text-white rounded-xl text-xs font-bold hover:bg-[#1f5247] transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Add Note
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 bg-stone-200 text-stone-800 rounded-xl text-xs font-bold hover:bg-stone-300 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          RICH MODAL 2: LISTING INSPECTION MODAL
         ========================================================================= */}
      {selectedListing && (
        <div
          className="fixed inset-0 z-[99999] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedListing(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden no-scrollbar my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Preview */}
            <div className="relative aspect-[16/9] bg-stone-900">
              <img
                src={propertyImages(selectedListing)[0]}
                alt={selectedListing.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedListing(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="absolute bottom-3 left-4 flex gap-2">
                <span className="px-3 py-1 bg-[#163e35] text-white rounded-full text-xs font-bold">
                  {selectedListing.status?.toUpperCase()}
                </span>
                <span className="px-3 py-1 bg-black/60 text-white rounded-full text-xs font-bold">
                  {selectedListing.purpose?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
              <div>
                <div className="text-2xl font-extrabold text-[#163e35]">
                  {money(selectedListing.price)}
                  {selectedListing.purpose === 'rent' && <span className="text-sm font-normal text-stone-500"> /month</span>}
                </div>
                <h3 className="text-lg font-bold text-stone-900 mt-1">
                  {selectedListing.title}
                </h3>
                <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                  <MapPin size={13} className="text-stone-400" />
                  {selectedListing.locality}, {selectedListing.city}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 border-y border-stone-100 text-xs">
                <div className="p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Type</span>
                  <span className="font-bold text-stone-800">{selectedListing.type}</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Area</span>
                  <span className="font-bold text-stone-800">{selectedListing.area} sq.ft</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Furnishing</span>
                  <span className="font-bold text-stone-800">{selectedListing.furnishing || 'Unfurnished'}</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-xl">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Bedrooms</span>
                  <span className="font-bold text-stone-800">{selectedListing.bedrooms || 'Studio'} BHK</span>
                </div>
              </div>

              {/* Location Precision Detail */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 text-xs space-y-1">
                <div className="font-bold text-stone-800 flex items-center gap-1.5">
                  <MapPin size={14} className="text-forest" />
                  Map Display Mode:{' '}
                  <span className="capitalize font-normal">
                    {selectedListing.locationPrecision === 'approximate'
                      ? 'Approximate Circle Privacy (~500m radius)'
                      : 'Exact Location Pin'}
                  </span>
                </div>
                <p className="text-stone-500 text-[11px]">
                  Coordinates: {selectedListing.coordinates?.lat?.toFixed(4)}, {selectedListing.coordinates?.lng?.toFixed(4)}
                </p>
              </div>

              {/* Amenities */}
              {selectedListing.amenities?.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-stone-700 block mb-2">Amenities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedListing.amenities.map((am) => (
                      <span key={am} className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg font-medium">
                        ✓ {am}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={() => handleArchiveListing(selectedListing._id)}
                className="text-xs font-semibold text-red-700 hover:underline cursor-pointer"
              >
                Archive Listing
              </button>

              <div className="flex items-center gap-2">
                <Link
                  href={`/properties/${selectedListing._id}/edit`}
                  className="px-4 py-2 bg-stone-200 text-stone-800 rounded-xl text-xs font-bold hover:bg-stone-300 transition-colors"
                >
                  Edit Listing
                </Link>
                <Link
                  href={`/properties/${selectedListing._id}`}
                  target="_blank"
                  className="px-4 py-2 bg-[#163e35] text-white rounded-xl text-xs font-bold hover:bg-[#1f5247] transition-colors flex items-center gap-1"
                >
                  View Public Page <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          RICH MODAL 3: ADD TEAM MEMBER MODAL
         ========================================================================= */}
      {isAddMemberOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setIsAddMemberOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden no-scrollbar my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 bg-[#163e35] text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Add Sales Advisor</h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  Register a sales advisor to route inbound property enquiries and manage site visits.
                </p>
              </div>
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Sameer Dixit"
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Role / Designation
                </label>
                <input
                  name="role"
                  defaultValue="Senior Property Advisor"
                  placeholder="e.g. Senior Property Advisor, Area Sales Lead"
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Direct Phone Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 00000"
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Official Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="advisor@agency.demo"
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">Status</label>
                <select
                  name="status"
                  defaultValue="active"
                  className="w-full py-2.5 px-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                >
                  <option value="active">Active (Available for Lead Assignment)</option>
                  <option value="on_leave">On Leave / Traveling</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busyAction === 'add_member'}
                  className="px-5 py-2 bg-[#163e35] text-white rounded-xl text-xs font-bold hover:bg-[#1f5247] transition-colors cursor-pointer"
                >
                  {busyAction === 'add_member' ? 'Adding...' : 'Add Advisor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          RICH MODAL 4: EDIT / INSPECT TEAM MEMBER MODAL WITH ASSIGNED LEADS
         ========================================================================= */}
      {selectedMember && (() => {
        const memberLeads = leads.filter((l) => l.assignedTeamMember === selectedMember.name);
        const memberContacted = memberLeads.filter((l) => l.status === 'contacted').length;
        const memberInterested = memberLeads.filter((l) => l.status === 'interested' || l.status === 'consultation').length;
        const memberConverted = memberLeads.filter((l) => l.status === 'converted' || l.status === 'deal_closed').length;

        return (
          <div
            className="fixed inset-0 z-[99999] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={() => setSelectedMember(null)}
          >
            <div
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden no-scrollbar my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-900 to-[#163e35] text-white flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#d8edb3] text-[#163e35] flex items-center justify-center font-extrabold text-base shadow-sm shrink-0">
                    {selectedMember.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
                        {selectedMember.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          selectedMember.status === 'active'
                            ? 'bg-[#d8edb3] text-[#163e35]'
                            : 'bg-white/20 text-white'
                        }`}
                      >
                        {selectedMember.status?.replace('_', ' ') || 'Active'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 mt-0.5">{selectedMember.role || 'Sales Advisor'}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMember(null)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
                {/* Advisor Quick Contact & KPI Stats Bar */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-2 text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-[#163e35]" />
                      <span className="font-semibold text-stone-500">Direct Phone:</span>
                      {selectedMember.phone ? (
                        <a href={`tel:${selectedMember.phone}`} className="font-bold text-stone-900 hover:underline">
                          {selectedMember.phone}
                        </a>
                      ) : (
                        <span className="text-stone-400 italic">Not set</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail size={13} className="text-[#163e35]" />
                      <span className="font-semibold text-stone-500">Official Email:</span>
                      {selectedMember.email ? (
                        <a href={`mailto:${selectedMember.email}`} className="font-bold text-stone-900 hover:underline truncate">
                          {selectedMember.email}
                        </a>
                      ) : (
                        <span className="text-stone-400 italic">Not set</span>
                      )}
                    </div>
                  </div>

                  {/* 4 Performance Metric Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-200/80 text-center">
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <div className="text-base font-extrabold text-stone-900">{memberLeads.length}</div>
                      <div className="text-[10px] font-bold text-stone-400 uppercase mt-0.5">Assigned Leads</div>
                    </div>
                    <div className="bg-sky-50 p-2.5 rounded-xl border border-sky-200">
                      <div className="text-base font-extrabold text-sky-950">{memberContacted}</div>
                      <div className="text-[10px] font-bold text-sky-800 uppercase mt-0.5">Contacted</div>
                    </div>
                    <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-200">
                      <div className="text-base font-extrabold text-indigo-950">{memberInterested}</div>
                      <div className="text-[10px] font-bold text-indigo-800 uppercase mt-0.5">Interested</div>
                    </div>
                    <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      <div className="text-base font-extrabold text-emerald-950">{memberConverted}</div>
                      <div className="text-[10px] font-bold text-emerald-800 uppercase mt-0.5">Converted</div>
                    </div>
                  </div>
                </div>

                {/* =================================================================
                    PRIMARY REQUIREMENT: ASSIGNED LEADS FOR THIS ADVISOR
                   ================================================================= */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        <UserCheck size={16} className="text-[#163e35]" />
                        Assigned Leads Portfolio ({memberLeads.length})
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Client inquiries assigned to {selectedMember.name} (filtering by advisor name).
                      </p>
                    </div>
                    {memberLeads.length > 0 && (
                      <button
                        onClick={() => {
                          setLeadAdvisorFilter(selectedMember.name);
                          setSelectedMember(null);
                          setTab('leads');
                        }}
                        className="text-xs font-bold text-[#163e35] hover:underline cursor-pointer"
                      >
                        Open in Pipeline →
                      </button>
                    )}
                  </div>

                  {memberLeads.length === 0 ? (
                    <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                      <Users size={32} className="mx-auto text-stone-300 mb-2" />
                      <div className="text-xs font-bold text-stone-700">No leads currently assigned</div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Assign inbound buyer and tenant inquiries to {selectedMember.name} from the Leads Dashboard.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedMember(null);
                          setLeadAdvisorFilter('unassigned');
                          setTab('leads');
                        }}
                        className="mt-3 px-3.5 py-1.5 text-xs font-bold bg-[#163e35] text-white rounded-xl hover:bg-[#1f5247] transition-colors cursor-pointer"
                      >
                        Assign Unallocated Leads
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto no-scrollbar pr-1">
                      {memberLeads.map((al) => {
                        const isContacted = al.status === 'contacted';
                        const isInterested = al.status === 'interested' || al.status === 'consultation';
                        const isConverted = al.status === 'converted' || al.status === 'deal_closed';

                        return (
                          <div
                            key={al._id}
                            className={`p-3.5 rounded-2xl border transition-all ${
                              isContacted
                                ? 'bg-sky-50/40 border-sky-200 hover:border-sky-300'
                                : isInterested
                                ? 'bg-indigo-50/40 border-indigo-200 hover:border-indigo-300'
                                : isConverted
                                ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                                : 'bg-white border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                              {/* Client Info */}
                              <div className="min-w-0 flex items-start gap-3">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                    isContacted
                                      ? 'bg-sky-100 text-sky-800'
                                      : isInterested
                                      ? 'bg-indigo-100 text-indigo-800'
                                      : isConverted
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-stone-100 text-stone-700'
                                  }`}
                                >
                                  {al.source === 'phone' ? (
                                    <PhoneCall size={15} />
                                  ) : al.source === 'message' ? (
                                    <MessageSquare size={15} />
                                  ) : (
                                    <ClipboardList size={15} />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-extrabold text-stone-900 text-sm">
                                      {al.name}
                                    </span>
                                    {/* Status Badge - especially contacted and interested */}
                                    <span
                                      className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full capitalize ${
                                        al.status === 'contacted'
                                          ? 'bg-sky-100 text-sky-950 border border-sky-300'
                                          : al.status === 'interested'
                                          ? 'bg-indigo-100 text-indigo-950 border border-indigo-300'
                                          : al.status === 'converted' || al.status === 'deal_closed'
                                          ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                                          : al.status === 'site_visit_scheduled'
                                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                          : al.status === 'negotiation'
                                          ? 'bg-teal-100 text-teal-900 border border-teal-300'
                                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                                      }`}
                                    >
                                      {al.status?.replace(/_/g, ' ')}
                                    </span>
                                  </div>
                                  <div className="text-xs text-stone-500 mt-0.5 truncate">
                                    {al.property?.title || al.project?.title || `${al.city || 'Bengaluru'} Inquiry`} · {al.phone}
                                  </div>
                                </div>
                              </div>

                              {/* Status Dropdown & Inspect Button */}
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <select
                                  value={al.status}
                                  onChange={(e) =>
                                    handleUpdateLead(al._id, { status: e.target.value })
                                  }
                                  className={`text-xs font-bold rounded-lg px-2 py-1 border focus:outline-none capitalize cursor-pointer ${
                                    al.status === 'contacted'
                                      ? 'bg-sky-100 text-sky-950 border-sky-300'
                                      : al.status === 'interested'
                                      ? 'bg-indigo-100 text-indigo-950 border-indigo-300'
                                      : al.status === 'converted' || al.status === 'deal_closed'
                                      ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                                      : 'bg-stone-50 text-stone-800 border-stone-200'
                                  }`}
                                  title="Update lead status"
                                >
                                  <option value="uncontacted">Uncontacted</option>
                                  <option value="contacted">Contacted</option>
                                  <option value="interested">Interested</option>
                                  <option value="consultation">Consultation</option>
                                  <option value="site_visit_scheduled">Site Visit Booked</option>
                                  <option value="negotiation">Negotiation</option>
                                  <option value="converted">Converted</option>
                                  <option value="dropped">Dropped</option>
                                </select>

                                <button
                                  onClick={() => setSelectedLead(al)}
                                  className="px-2.5 py-1 text-xs font-bold text-[#163e35] bg-[#163e35]/10 hover:bg-[#163e35] hover:text-white rounded-lg transition-colors cursor-pointer"
                                >
                                  Inspect
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* =================================================================
                    ADVISOR EDIT CREDENTIALS FORM
                   ================================================================= */}
                <div className="pt-4 border-t border-stone-200">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
                    Advisor Credentials &amp; Status
                  </h4>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleUpdateMember(selectedMember._id, Object.fromEntries(formData));
                    }}
                    className="space-y-4"
                  >
                    <div className="grid sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5">Full Name</label>
                        <input
                          name="name"
                          defaultValue={selectedMember.name}
                          required
                          className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5">
                          Role / Designation
                        </label>
                        <input
                          name="role"
                          defaultValue={selectedMember.role}
                          className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5">Direct Phone</label>
                        <input
                          name="phone"
                          defaultValue={selectedMember.phone || ''}
                          className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5">Email</label>
                        <input
                          name="email"
                          type="email"
                          defaultValue={selectedMember.email || ''}
                          className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">Status</label>
                      <select
                        name="status"
                        defaultValue={selectedMember.status || 'active'}
                        className="w-full py-2 px-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                      >
                        <option value="active">Active (Available for Lead Assignment)</option>
                        <option value="on_leave">On Leave</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(selectedMember._id)}
                        className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        Remove Member
                      </button>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedMember(null)}
                          className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-200 transition-colors cursor-pointer"
                        >
                          Close
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-[#163e35] text-white rounded-xl text-xs font-bold hover:bg-[#1f5247] transition-colors cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          RICH MODAL 5: RAISE SUPPORT TICKET MODAL
         ========================================================================= */}
      {isRaiseTicketOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setIsRaiseTicketOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden no-scrollbar my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 bg-[#163e35] text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Raise Priority Support Ticket</h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  Direct inquiry to platform moderators and partner coordination desk.
                </p>
              </div>
              <button
                onClick={() => setIsRaiseTicketOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRaiseTicket} className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Category</label>
                  <select
                    name="category"
                    defaultValue="Listing Review"
                    className="w-full py-2.5 px-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                  >
                    <option value="Listing Review">Listing Moderation &amp; Review</option>
                    <option value="Lead Inquiry">Lead Delivery &amp; Contact Issue</option>
                    <option value="Billing & RERA">RERA Verification &amp; Badge</option>
                    <option value="Technical Support">Technical &amp; Map Bug</option>
                    <option value="Account Verification">Agency Account Verification</option>
                    <option value="Other">Other Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Priority</label>
                  <select
                    name="priority"
                    defaultValue="medium"
                    className="w-full py-2.5 px-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Standard / Medium</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Escalation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  name="subject"
                  required
                  placeholder="e.g. Expedite moderation for Prestige Lakeside 3 BHK listing"
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Detailed Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Explain your inquiry in detail, including listing IDs, sanction numbers, or RERA certificates..."
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsRaiseTicketOpen(false)}
                  className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busyAction === 'raise_ticket'}
                  className="px-5 py-2 bg-[#163e35] text-white rounded-xl text-xs font-bold hover:bg-[#1f5247] transition-colors cursor-pointer"
                >
                  {busyAction === 'raise_ticket' ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          RICH MODAL 6: SUPPORT TICKET DETAIL & REPLY THREAD MODAL
         ========================================================================= */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-[99999] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden no-scrollbar my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {selectedTicket.ticketNumber}
                  </span>
                  <span className="text-xs text-stone-300">· {selectedTicket.category}</span>
                  <span className="text-xs px-2 py-0.5 rounded uppercase font-bold bg-white/20 text-white">
                    {selectedTicket.priority}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mt-1 text-white">
                  {selectedTicket.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto no-scrollbar">
              {/* Original Query */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80">
                <div className="flex items-center justify-between text-xs text-stone-500 mb-2 font-medium">
                  <span className="font-bold text-stone-900">Your Original Query</span>
                  <span>{date(selectedTicket.createdAt)}</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.message}
                </p>
              </div>

              {/* Response Thread */}
              {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
                    Coordinator Updates &amp; Discussion
                  </span>
                  {selectedTicket.responses.map((resp, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                        resp.role === 'admin'
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : 'bg-stone-50 border-stone-200 text-stone-800'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold mb-1.5">
                        <span className="flex items-center gap-1.5">
                          {resp.role === 'admin' && (
                            <ShieldCheck size={14} className="text-emerald-700" />
                          )}
                          {resp.senderName || (resp.role === 'admin' ? 'Support Administrator' : 'Channel Partner')}
                        </span>
                        <span className="font-normal text-[11px] text-stone-400">
                          {date(resp.createdAt)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{resp.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const replyText = e.currentTarget.replyMessage.value;
                  if (!replyText?.trim()) return;
                  handleReplyTicket(selectedTicket._id, replyText.trim());
                  e.currentTarget.reset();
                }}
                className="space-y-2.5 pt-3 border-t border-stone-100"
              >
                <label className="block text-xs font-bold text-stone-700">Send Reply</label>
                <textarea
                  name="replyMessage"
                  rows={2}
                  required
                  placeholder="Provide clarification or attach updated document references..."
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                />
                <div className="flex justify-between items-center">
                  {selectedTicket.status !== 'resolved' && (
                    <button
                      type="button"
                      onClick={() => handleResolveTicket(selectedTicket._id)}
                      className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                    >
                      ✓ Mark Ticket as Resolved
                    </button>
                  )}
                  <button
                    type="submit"
                    className="ml-auto px-4 py-2 bg-[#163e35] text-white rounded-xl text-xs font-bold hover:bg-[#1f5247] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Send size={13} /> Send Reply
                  </button>
                </div>
              </form>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-5 py-2 bg-stone-200 text-stone-800 rounded-xl text-xs font-bold hover:bg-stone-300 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          RICH MODAL 7: AGENCY PROFILE & PASSWORD / SECURITY MODAL
         ========================================================================= */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-[99999] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setIsProfileOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden no-scrollbar my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 bg-[#163e35] text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#d8edb3] text-[#163e35]">
                    <Briefcase size={12} /> Channel Partner
                  </span>
                  <span className="text-xs text-stone-300">· {partner.tier || 'Platinum'} Network</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mt-1 text-white">
                  Agency Profile &amp; Account Settings
                </h3>
              </div>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Tabs: Credentials vs Security */}
            <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 gap-6">
              <button
                type="button"
                onClick={() => setProfileModalTab('credentials')}
                className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  profileModalTab === 'credentials'
                    ? 'border-[#163e35] text-[#163e35]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Briefcase size={15} /> Agency Credentials
              </button>
              <button
                type="button"
                onClick={() => setProfileModalTab('password')}
                className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  profileModalTab === 'password'
                    ? 'border-[#163e35] text-[#163e35]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Lock size={15} /> Password &amp; Security
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto no-scrollbar">
              {profileModalTab === 'credentials' ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Agency / Firm Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="company"
                        defaultValue={partner.company || user?.company || ''}
                        required
                        className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Channel Partner RERA ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="reraId"
                        defaultValue={partner.reraId || user?.reraId || ''}
                        required
                        className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">Primary Contact Phone</label>
                      <input
                        name="phone"
                        defaultValue={partner.phone || user?.phone || ''}
                        className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">Official Email</label>
                      <input
                        name="email"
                        defaultValue={partner.email || user?.email || ''}
                        type="email"
                        className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">Headquarters City</label>
                      <input
                        name="city"
                        defaultValue={partner.city || 'Bengaluru'}
                        className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">Partner Tier</label>
                      <input
                        disabled
                        value={partner.tier || 'Platinum Channel Partner'}
                        className="w-full px-3.5 py-2.5 text-sm bg-stone-100 border border-stone-200 rounded-xl text-stone-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Agency Overview &amp; Bio</label>
                    <textarea
                      name="bio"
                      defaultValue={partner.bio || user?.bio || ''}
                      rows={3}
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                      placeholder="Describe your firm's track record, premium residential projects handled, and prime commercial advisory services..."
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setIsProfileOpen(false)}
                      className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={busyAction === 'update_profile'}
                      className="px-5 py-2.5 bg-[#163e35] text-white rounded-xl text-xs font-bold hover:bg-[#1f5247] transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {busyAction === 'update_profile' ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                /* PASSWORD & SECURITY TAB */
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {/* Security Notice / Future OTP Roadmap */}
                  <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Key size={14} className="text-amber-700" />
                      Account Password Update
                    </div>
                    <p className="text-amber-800">
                      Enter your current password followed by your desired new password (at least 8 characters).
                    </p>
                    <p className="text-[11px] text-amber-700 font-semibold pt-0.5">
                      Note: In an upcoming update, an OTP (One-Time Password) will be sent to your verified mobile number before updating credentials.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current account password..."
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        New Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters..."
                        className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Confirm New Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password..."
                        className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#163e35]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setIsProfileOpen(false)}
                      className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="px-5 py-2.5 bg-[#163e35] text-white rounded-xl text-xs font-bold hover:bg-[#1f5247] transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Lock size={13} />
                      {passwordLoading ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </TimeRangeContext.Provider>
  );
}
