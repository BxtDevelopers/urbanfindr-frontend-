'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Search, Bell, ChevronDown } from 'lucide-react';
import { useApp, useNotificationSummary } from '../../providers';
import { useWorkspace } from '../WorkspaceContext';

export default function DashboardHeader({
  activeSection = 'overview',
  onSelectSection,
  onOpenMobileMenu
}) {
  const router = useRouter();
  const { user } = useApp();
  const { activeWorkspace } = useWorkspace();
  const { unread: unreadNotifCount } = useNotificationSummary();
  const [searchQuery, setSearchQuery] = useState('');

  const isCustomer = activeWorkspace === 'customer';

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/properties?q=${encodeURIComponent(searchQuery.trim())}`);
  }

  const sectionTitles = {
    overview: 'Workspace Overview',
    properties: 'My Properties',
    listings: 'My Property Portfolio',
    'add-property': 'Add New Property',
    projects: activeWorkspace === 'builder' ? 'Manage Projects' : 'My Builder Projects',
    'add-project': 'Add New Project',
    'builder-profile': 'Developer & Firm Profile',
    services: 'Service Catalogue & Rates',
    requests: activeWorkspace === 'provider' ? 'Incoming Client Requests & Offers' : 'My Service Requests & Offers',
    bookings: activeWorkspace === 'provider' ? 'Incoming Client Requests & Offers' : 'My Service Requests & Offers',
    enquiries: activeWorkspace === 'builder' ? 'Manage Project Enquiries' : 'Customer Enquiries',
    leads: activeWorkspace === 'broker' ? 'My Leads' : 'Buyer & Tenant Leads',
    visits: activeWorkspace === 'builder' ? 'Schedule Site Visits' : 'Site & Property Visits',
    clients: 'Client Directory',
    favorites: 'Saved Properties',
    'saved-searches': 'Saved Searches & Alerts',
    payments: 'Billing & Transaction Receipts',
    technicians: 'Technicians & Team Members',
    reviews: 'Ratings & Client Reviews',
    performance: activeWorkspace === 'builder' ? 'Track Project Performance' : 'Listing Performance & Reach',
    analytics: 'Performance & Conversion Analytics',
    promotions: 'Promotional Campaigns',
    messages: 'Conversations & Messages',
    notifications: 'System Notifications',
    'business-profile': 'Service Business Profile',
    profile: 'Profile & Account Settings'
  };

  const currentTitle = sectionTitles[activeSection] || 'Dashboard';

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-[var(--header-h,72px)] z-30 bg-white/95 backdrop-blur-md border-b border-[#e6e8e1] px-4 py-2.5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-1.5 text-stone-600 hover:text-[#163e35] hover:bg-[#ecf2e4] rounded-lg shrink-0 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
          <span>Menu</span>
        </button>

        <span className="text-xs font-extrabold text-[#163e35] truncate">
          {currentTitle}
        </span>
      </header>
    </>
  );
}
