'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkspace, WORKSPACE_CONFIG } from '../WorkspaceContext';
import { useApp } from '../../providers';
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
  ChevronLeft,
  ChevronRight,
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
  Menu,
  X
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

  // Role-specific navigation items (Quotations, calendar schedules, and booking terms replaced with direct requests & offers)
  const navItems = {
    customer: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'properties', label: 'My Properties', icon: House },
      { id: 'add-property', label: 'Add Property', icon: PlusCircle, isAction: true },
      { id: 'visits', label: 'Property Visits', icon: Calendar },
      { id: 'favorites', label: 'Saved Properties', icon: Heart },
      { id: 'saved-searches', label: 'Saved Searches', icon: Search },
      { id: 'requests', label: 'My Service Requests', icon: Wrench },
      { id: 'messages', label: 'Messages', icon: MessageCircle },
      { id: 'profile', label: 'My Profile & Settings', icon: Settings }
    ],
    owner: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'properties', label: 'My Properties', icon: House },
      { id: 'add-property', label: 'Add Property', icon: PlusCircle, isAction: true },
      { id: 'enquiries', label: 'Property Enquiries', icon: ClipboardList },
      { id: 'visits', label: 'Property Visits', icon: Calendar },
      { id: 'performance', label: 'Listing Performance', icon: BarChart3 },
      { id: 'messages', label: 'Messages', icon: MessageCircle },
      { id: 'profile', label: 'Profile Settings', icon: Settings }
    ],
    broker: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'listings', label: 'My Listings', icon: House },
      { id: 'leads', label: 'My Leads', icon: ClipboardList },
      { id: 'visits', label: 'Property Visits', icon: Calendar },
      { id: 'clients', label: 'Clients', icon: Users },
      { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
      { id: 'messages', label: 'Messages', icon: MessageCircle },
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
      { id: 'profile', label: 'Settings', icon: Settings }
    ]
  };

  const currentNav = navItems[activeWorkspace] || navItems.customer;

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-white border-r border-[#e6e8e1] flex flex-col justify-between transition-all duration-200 shrink-0 ${
          collapsed ? 'w-20' : 'w-72'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding & Workspace Switcher */}
        <div className="p-4 border-b border-[#e6e8e1] space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#163e35] flex items-center justify-center text-[#d8edb3] font-black text-lg shadow-xs shrink-0">
                U
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <span className="font-extrabold text-[#163e35] tracking-tight text-base block truncate">
                    Business Suite
                  </span>
                </div>
              )}
            </Link>

            <div className="flex items-center gap-1">
              {/* Collapse desktop toggle */}
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 text-stone-400 hover:text-[#163e35] hover:bg-[#ecf2e4] rounded-lg transition-colors"
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>

              {/* Mobile close */}
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Workspace Switcher */}
          {!collapsed ? (
            <WorkspaceSwitcher />
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
                style={{ backgroundColor: currentConfig.bgBadge, color: currentConfig.accentColor }}
                title={`Active: ${currentConfig.label}`}
              >
                {(() => {
                  const Icon = currentConfig.icon;
                  return <Icon size={18} />;
                })()}
              </button>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {!collapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
              {currentConfig.shortLabel} Menu
            </p>
          )}

          {currentNav.map((item) => {
            const Icon = item.icon;
            const isSelected = activeSection === item.id || (item.id === 'requests' && activeSection === 'bookings');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectSection(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#163e35] text-[#d8edb3] shadow-xs'
                    : 'text-stone-700 hover:text-[#163e35] hover:bg-[#ecf2e4]'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={item.label}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Footer actions */}
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
      </aside>
    </>
  );
}
