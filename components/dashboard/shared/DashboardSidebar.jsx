'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkspace, WORKSPACE_CONFIG } from '../WorkspaceContext';
import { useApp, useData, useNotificationSummary } from '../../providers';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import {
  House,
  LayoutDashboard,
  Heart,
  Calendar,
  ClipboardList,
  Wrench,
  MessageCircle,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  PlusCircle,
  Search,
  Building2,
  Briefcase,
  FileText,
  CreditCard,
  Star,
  Users,
  TrendingUp,
  BarChart3,
  Layers,
  Sparkles,
  ShieldCheck,
  User,
  Menu,
  X,
  LayoutGrid,
  MessageSquare,
  Send,
  Headphones,
  ChevronDown
} from 'lucide-react';

export default function DashboardSidebar({
  activeSection = 'overview',
  onSelectSection,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile
}) {
  const { user, logout } = useApp();
  const { activeWorkspace, currentConfig, openRegisterModal } = useWorkspace();
  const { unread: unreadNotifCount, unreadMessages: unreadMessagesCount } = useNotificationSummary();
  const isOwner = activeWorkspace === 'owner';
  const isBroker = activeWorkspace === 'broker';
  const isOwnerOrBroker = isOwner || isBroker;
  const isCustomer = activeWorkspace === 'customer';
  const { data: dashData } = useData(isOwnerOrBroker ? 'dashboard' : null);
  const { data: alertStats } = useData(isCustomer ? 'property-alerts/stats' : null);
  const ownerEnquiriesCount = Number(dashData?.owner?.enquiries ?? 0);
  const brokerLeadsCount = Number(dashData?.broker?.newLeads ?? 0);
  const customerAlertsCount = Number(alertStats?.activeAlerts ?? 0);

  // Role-specific navigation items matching reference layout
  const navItems = {
    customer: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'properties', label: 'My Property', icon: House },
      { id: 'add-property', label: 'Add Property', icon: PlusCircle, isAction: true },
      { id: 'visits', label: 'Property Visits', icon: Calendar },
      { id: 'favorites', label: 'Save Properties', icon: Heart },
      { id: 'saved-searches', label: 'Property Alerts', icon: Bell },
      { id: 'spotlight', label: 'Promotions', icon: Send },
      { id: 'requests', label: 'My Services Request', icon: Wrench },
      { id: 'messages', label: 'Messages', icon: MessageSquare },
      { id: 'profile', label: 'My Profile Setting', icon: Settings },
      { id: 'support', label: 'Help Support', icon: Headphones },
      { id: 'logout', label: 'Logout', icon: LogOut, isLogout: true }
    ],
    owner: [
      { id: 'overview', label: 'Dashboard', icon: LayoutGrid },
      { id: 'properties', label: 'My Properties', icon: House },
      { id: 'enquiries', label: 'Enquiries', icon: MessageSquare },
      { id: 'visits', label: 'Visits & Schedules', icon: Calendar },
      { id: 'leads', label: 'Leads', icon: Users },
      { id: 'clients', label: 'Clients', icon: Users },
      { id: 'spotlight', label: 'Promotions', icon: Send },
      { id: 'support', label: 'Support', icon: HelpCircle },
      { id: 'profile', label: 'Settings', icon: Settings },
      { id: 'add-property', label: 'Add Property', icon: PlusCircle, isAction: true, hidden: true },
      { id: 'notifications', label: 'Notifications', icon: Bell, hidden: true }
    ],
    broker: [
      { id: 'overview', label: 'Dashboard', icon: LayoutGrid },
      { id: 'listings', label: 'My Listings', icon: House },
      { id: 'leads', label: 'My Leads', icon: ClipboardList },
      { id: 'visits', label: 'Property Visits', icon: Calendar },
      { id: 'clients', label: 'Clients', icon: Users },
      { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
      { id: 'messages', label: 'Messages', icon: MessageCircle },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'profile', label: 'Profile Settings', icon: Settings }
    ],
    builder: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'builder-profile', label: 'Builder Profile', icon: Building2 },
      { id: 'projects', label: 'Manage Projects', icon: Layers },
      { id: 'enquiries', label: 'Manage Project Enquiries', icon: ClipboardList },
      { id: 'visits', label: 'Schedule Site Visits', icon: Calendar },
      { id: 'clients', label: 'Clients & Buyers', icon: Users },
      { id: 'performance', label: 'Track Project Performance', icon: BarChart3 },
      { id: 'messages', label: 'Messages', icon: MessageCircle },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'profile', label: 'Settings', icon: Settings }
    ],
    provider: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'properties', label: 'My Properties', icon: House },
      { id: 'add-property', label: 'Add Property', icon: PlusCircle, isAction: true },
      { id: 'business-profile', label: 'Business Profile', icon: Building2 },
      { id: 'enquiries', label: 'Property Enquiries', icon: ClipboardList },
      { id: 'requests', label: 'Client Requests & Offers', icon: ClipboardList },
      { id: 'services', label: 'My Services', icon: Wrench },
      { id: 'reviews', label: 'Reviews', icon: Star },
      { id: 'messages', label: 'Messages', icon: MessageCircle },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'profile', label: 'Settings', icon: Settings }
    ]
  };

  const currentNav = navItems[activeWorkspace] || navItems.customer;
  const displayNav = currentNav.filter((item) => !item.hidden);

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 top-[var(--header-h,72px)] z-40 bg-stone-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-[var(--header-h,72px)] lg:top-0 left-0 z-40 h-[calc(100dvh-var(--header-h,72px))] lg:h-screen bg-white ${
          isOwnerOrBroker ? 'border-r border-[#e5e9e2]' : 'border-r border-[#e6e8e1]'
        } flex flex-col justify-between transition-all duration-200 shrink-0 ${
          collapsed ? 'w-20' : 'w-60 sm:w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Profile Card & Mobile Close */}
        {isOwnerOrBroker ? (
          <div className="lg:hidden p-3 border-b border-[#e5e9e2] flex items-center justify-between">
            <span className="text-xs font-bold text-[#163e35]">{isBroker ? 'Certified Broker / Agent' : 'Property Owner'}</span>
            <button
              type="button"
              onClick={onCloseMobile}
              className="w-8 h-8 rounded-lg bg-[#ecf2e4] text-[#163e35] flex items-center justify-center cursor-pointer"
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          </div>
        ) : isCustomer ? (
          <div
            onClick={() => {
              onSelectSection('profile');
              if (onCloseMobile) onCloseMobile();
            }}
            className="p-3.5 sm:p-4 border-b border-stone-100 flex items-center justify-between gap-2.5 hover:bg-stone-50/80 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#163e35] text-[#d8edb3] text-xs font-bold flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-stone-200 shadow-2xs">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{(user?.name || 'C').charAt(0).toUpperCase()}</span>
                )}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-stone-900 leading-tight">My Profile</p>
                  <p className="text-[11px] text-stone-500 font-medium truncate mt-0.5">{user?.name || 'Customer'}</p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onCloseMobile) onCloseMobile();
              }}
              className="lg:hidden w-8 h-8 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="p-3 sm:p-4 border-b border-[#e6e8e1]">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex-1 min-w-0">
                {!collapsed ? (
                  <WorkspaceSwitcher
                    onSelectProfile={() => {
                      onSelectSection('profile');
                      if (onCloseMobile) onCloseMobile();
                    }}
                  />
                ) : (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSection('profile');
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs bg-[#163e35] text-[#d8edb3] hover:bg-[#1f5247] transition-colors cursor-pointer"
                      title="My Profile"
                    >
                      <User size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Close Button - integrated cleanly on the same row */}
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-600 hover:text-stone-900 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-0.5">
          {!isOwnerOrBroker && !collapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
              Menu
            </p>
          )}

          {displayNav.map((item) => {
            const Icon = item.icon;
            const isSelected =
              activeSection === item.id ||
              (item.id === 'overview' && activeSection === 'dashboard') ||
              (item.id === 'spotlight' && activeSection === 'promotions') ||
              (item.id === 'requests' && activeSection === 'bookings');
            const showMessageGreenDot = item.id === 'messages' && unreadMessagesCount > 0;
            const showNotifBadge = item.id === 'notifications' && unreadNotifCount > 0;
            const isEnquiries = item.id === 'enquiries';
            const showDivider = isOwner && item.id === 'spotlight';

            return (
              <div key={item.id}>
                {showDivider && !collapsed && (
                  <div className="my-1.5 border-t border-[#e5e9e2]" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (item.isLogout) {
                      logout();
                    } else if (item.id === 'support') {
                      if (typeof window !== 'undefined') window.location.href = '/contact';
                    } else if (item.id === 'add-property') {
                      if (typeof window !== 'undefined') window.location.href = '/post-property';
                    } else if ((isOwner || isCustomer) && item.id === 'spotlight') {
                      onSelectSection('promotions');
                    } else if (isOwner && item.id === 'leads') {
                      onSelectSection('enquiries');
                    } else if (isOwner && item.id === 'clients') {
                      onSelectSection('services');
                    } else {
                      onSelectSection(item.id);
                    }
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? isOwnerOrBroker || isCustomer
                        ? 'bg-[#ecf2e4] text-[#163e35] font-bold shadow-xs'
                        : 'bg-[#163e35] text-[#d8edb3] shadow-xs'
                      : isOwnerOrBroker || isCustomer
                      ? 'text-stone-700 hover:text-[#163e35] hover:bg-[#ecf2e4]/70'
                      : 'text-stone-700 hover:text-[#163e35] hover:bg-[#ecf2e4]'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                  title={item.label}
                >
                  <Icon
                    size={17}
                    className={`shrink-0 ${
                      isSelected && (isOwnerOrBroker || isCustomer) ? 'text-[#163e35]' : ''
                    }`}
                  />
                  {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                  {isOwner && isEnquiries && !collapsed && ownerEnquiriesCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#ef4444] text-white shrink-0 min-w-[18px] text-center">
                      {ownerEnquiriesCount}
                    </span>
                  )}
                  {isBroker && item.id === 'leads' && !collapsed && brokerLeadsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#ef4444] text-white shrink-0 min-w-[18px] text-center">
                      {brokerLeadsCount}
                    </span>
                  )}
                  {isCustomer && item.id === 'saved-searches' && !collapsed && customerAlertsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#ef4444] text-white shrink-0 min-w-[18px] text-center">
                      {customerAlertsCount}
                    </span>
                  )}
                  {showMessageGreenDot && (
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"
                      aria-label="New message"
                    />
                  )}
                  {showNotifBadge && !isCustomer && !collapsed && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white shrink-0">
                      {unreadNotifCount}
                    </span>
                  )}
                </button>
              </div>
            );
          })}

          {/* Customer Boost Your Listings / Go Premium Card placed directly under menu items (somewhat up side) */}
          {isCustomer && !collapsed && (
            <div className="pt-2.5 pb-2">
              <div className="p-2.5 bg-white border border-stone-200/90 rounded-2xl shadow-2xs space-y-2">
                <img
                  src="/photos/living-1.jpg"
                  alt="Boost listings"
                  className="w-full h-24 sm:h-28 object-cover rounded-xl"
                />
                <div className="px-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-tight">Boost Your Listings</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                    Get more visibility with featured listings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSelectSection('promotions');
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full py-2 px-3 bg-[#163e35] hover:bg-[#205246] text-[#d8edb3] hover:text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                >
                  <span>Go Premium →</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        {isOwnerOrBroker ? (
          !collapsed ? (
            <div className="shrink-0 bg-white">
              <div className="mx-2.5 my-1.5 p-2.5 bg-[#f8faf7] border border-[#e5e9e2] rounded-xl space-y-1.5">
                <img
                  src="/photos/apartment-1.jpg"
                  alt="Boost listings"
                  className="w-full h-18 object-cover rounded-lg"
                />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Boost Your Listings</h4>
                  <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">
                    Get more visibility with featured listings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSelectSection('promotions');
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full py-1.5 px-3 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                >
                  <span className="text-[11px]">Go Premium →</span>
                </button>
              </div>
            </div>
          ) : null
        ) : isCustomer ? null : (
          /* Non-owner footer actions */
          <div className="p-3 border-t border-[#e6e8e1] space-y-1 bg-[#f7f8f3]/60">
            <Link
              href="/contact"
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-[#163e35] hover:bg-[#ecf2e4] transition-colors ${
                collapsed ? 'justify-center px-0' : ''
              }`}
              title="Help & Support"
            >
              <HelpCircle size={17} className="shrink-0" />
              {!collapsed && <span>Help &amp; Support</span>}
            </Link>

            <button
              type="button"
              onClick={logout}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors ${
                collapsed ? 'justify-center px-0' : ''
              }`}
              title="Log Out"
            >
              <LogOut size={17} className="shrink-0" />
              {!collapsed && <span>Log Out</span>}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
