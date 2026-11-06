'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWorkspace, WORKSPACE_CONFIG } from '../WorkspaceContext';
import { useApp, useData } from '../../providers';
import NotificationPanel from './NotificationPanel';
import {
  Menu,
  Bell,
  Search,
  Plus,
  House,
  ShieldCheck,
  User as UserIcon,
  Sparkles
} from 'lucide-react';

export default function DashboardHeader({
  activeSection = 'overview',
  onOpenMobileMenu,
  onActionClick
}) {
  const { user } = useApp();
  const { currentConfig, activeWorkspace, openRegisterModal } = useWorkspace();
  const [notificationOpen, setNotificationOpen] = useState(false);

  const { data: notifData } = useData('notifications?limit=5');
  const unreadCount = notifData?.unread || 0;

  const sectionTitles = {
    overview: 'Workspace Overview',
    properties: 'My Properties',
    listings: 'My Property Portfolio',
    'add-property': 'Add New Property',
    projects: 'My Builder Projects',
    'add-project': 'Add New Project',
    'builder-profile': 'Developer & Firm Profile',
    services: 'Service Catalogue & Rates',
    requests: activeWorkspace === 'provider' ? 'Incoming Client Requests & Offers' : 'My Service Requests & Offers',
    bookings: activeWorkspace === 'provider' ? 'Incoming Client Requests & Offers' : 'My Service Requests & Offers',
    enquiries: 'Customer Enquiries',
    leads: 'Buyer & Tenant Leads',
    visits: 'Site & Property Visits',
    clients: 'Client Directory',
    favorites: 'Saved Properties',
    'saved-searches': 'Saved Searches & Alerts',
    payments: 'Billing & Transaction Receipts',
    technicians: 'Technicians & Team Members',
    reviews: 'Ratings & Client Reviews',
    performance: 'Listing Performance & Reach',
    analytics: 'Performance & Conversion Analytics',
    promotions: 'Promotional Campaigns',
    messages: 'Conversations & Messages',
    notifications: 'System Notifications',
    'business-profile': 'Service Business Profile',
    profile: 'Profile & Account Settings'
  };

  const currentTitle = sectionTitles[activeSection] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e6e8e1] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Header Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-stone-600 hover:text-[#163e35] hover:bg-[#ecf2e4] rounded-lg shrink-0"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-extrabold text-[#163e35] tracking-tight truncate">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Right: Quick actions, notifications, user avatar */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Workspace Quick Action */}
        {activeWorkspace === 'owner' || activeWorkspace === 'broker' || activeWorkspace === 'customer' ? (
          <Link
            href="/post-property"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] text-xs font-bold rounded-lg shadow-xs transition-all whitespace-nowrap"
          >
            <Plus size={15} />
            <span>Post Property</span>
          </Link>
        ) : activeWorkspace === 'builder' ? (
          <Link
            href="/post-property"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] text-xs font-bold rounded-lg shadow-xs transition-all"
          >
            <Plus size={15} />
            <span>Add Project</span>
          </Link>
        ) : activeWorkspace === 'provider' ? (
          <button
            type="button"
            onClick={() => onActionClick && onActionClick('add-service')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] text-xs font-bold rounded-lg shadow-xs transition-all"
          >
            <Plus size={15} />
            <span>Add Service</span>
          </button>
        ) : (
          <Link
            href="/properties"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] text-xs font-bold rounded-lg shadow-xs transition-all"
          >
            <Search size={14} />
            <span>Explore Homes</span>
          </Link>
        )}

        {/* Notifications Icon & Flyout */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-2 text-stone-600 hover:text-[#163e35] hover:bg-[#ecf2e4] rounded-xl transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white animate-pulse" />
            )}
          </button>
          <NotificationPanel
            isOpen={notificationOpen}
            onClose={() => setNotificationOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}
