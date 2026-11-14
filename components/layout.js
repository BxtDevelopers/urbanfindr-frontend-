'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {  useState, useEffect, useRef, Fragment, useMemo  } from 'react';
import {
  Menu,
  X,
  ArrowUpRight,
  House,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  User,
  Wrench,
  Bell,
  Briefcase,
  Building2,
  MapPin,
  ChevronRight,
  Zap,
  Scale,
  Boxes,
  Send,
  Grid,
} from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import NotificationPanel from './dashboard/shared/NotificationPanel';

import { useApp, useData } from './providers';
import { cityGuides } from '@/lib/catalog';
import { serviceCategories } from '@/lib/serviceCategories';

function CityPickerModal({ onClose }) {
  const router = useRouter();

  function handleCityClick(city) {
    onClose();
    router.push(`/projects?city=${encodeURIComponent(city.name)}`);
  }

  return (
    <div className="city-picker-overlay" onClick={onClose}>
      <div
        className="city-picker-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="city-picker-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={22} />
        </button>

        <div className="city-picker-header">
          <h2 className="city-picker-title">
            Choose Your Dream City
          </h2>
          <p className="city-picker-subtitle">
            Select the location of your dream home
          </p>
        </div>

        <div className="city-picker-grid">
          {cityGuides.map((city) => (
            <button
              key={city.slug}
              className="city-picker-item"
              onClick={() => handleCityClick(city)}
            >
              <div className="city-picker-img-wrap">
                <img
                  src={city.image}
                  alt={city.name}
                  className="city-picker-img"
                />
              </div>
              <span className="city-picker-name">
                {city.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const { user, roleMeta, logout, toast } = useApp();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [menuView, setMenuView] = useState('main');
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const pathname = usePathname();

  const isServiceProvider = user?.role === 'service_provider' || user?.role === 'service-provider';
  const isCustomer = user && !isServiceProvider && user.role !== 'admin';

  // Track active account mode: 'provider' (Business Account), 'customer' (User Account), or dedicated business roles
  const [activeAccountMode, setActiveAccountMode] = useState(() => {
    if (user?.role === 'broker') return 'broker';
    if (user?.role === 'owner') return 'owner';
    if (user?.role === 'builder') return 'builder';
    if (pathname.startsWith('/dashboard/provider')) return 'provider';
    if (pathname.startsWith('/dashboard/broker')) return 'broker';
    if (pathname.startsWith('/dashboard/owner')) return 'owner';
    if (pathname.startsWith('/dashboard/customer')) return 'customer';
    if (user?.role === 'service_provider' || user?.role === 'service-provider') return 'provider';
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('havenest_active_account_mode');
        if (stored === 'provider' || stored === 'customer') return stored;
      } catch (e) {}
    }
    return 'customer';
  });

  useEffect(() => {
    if (user?.role === 'broker') {
      setActiveAccountMode('broker');
      try { localStorage.setItem('havenest_active_account_mode', 'broker'); } catch (e) {}
    } else if (user?.role === 'owner') {
      setActiveAccountMode('owner');
      try { localStorage.setItem('havenest_active_account_mode', 'owner'); } catch (e) {}
    } else if (user?.role === 'builder') {
      setActiveAccountMode('builder');
      try { localStorage.setItem('havenest_active_account_mode', 'builder'); } catch (e) {}
    } else if (pathname.startsWith('/dashboard/provider')) {
      setActiveAccountMode('provider');
      try { localStorage.setItem('havenest_active_account_mode', 'provider'); } catch (e) {}
    } else if (pathname.startsWith('/dashboard/customer')) {
      setActiveAccountMode('customer');
      try { localStorage.setItem('havenest_active_account_mode', 'customer'); } catch (e) {}
    } else if (user?.role === 'service_provider' || user?.role === 'service-provider') {
      try {
        const stored = localStorage.getItem('havenest_active_account_mode');
        if (stored === 'customer' || stored === 'provider') {
          setActiveAccountMode(stored);
        }
      } catch (e) {}
    }
  }, [pathname, user]);

  const isServiceProviderDashboard =
    isServiceProvider &&
    (pathname.startsWith('/dashboard/provider') ||
      (pathname === '/dashboard' && activeAccountMode === 'provider'));

  const providerCategoryParam = isServiceProvider && user?.serviceCategory ? '&category=' + user.serviceCategory : '';
  const { data: requestData } = useData(user ? 'service-requests?limit=50' + providerCategoryParam : null);

  const newLeadsCount = useMemo(() => {
    if (!requestData?.items || !isServiceProvider || !user) return 0;
    const uId = String(user._id || user.id || '');
    const uName = String(user.name || '').toLowerCase().trim();
    const uCompany = String(user.company || '').toLowerCase().trim();
    const uEmail = String(user.email || '').toLowerCase().trim();

    return requestData.items.filter((i) => {
      if (!['submitted', 'requested', 'pending', 'new', 'quotation'].includes(i.status)) return false;
      if (uId && i.assignedSpecialistId && String(i.assignedSpecialistId) === uId) return true;
      if (i.assignedSpecialist) {
        const spec = String(i.assignedSpecialist).toLowerCase().trim();
        if (uName && (spec === uName || spec.includes(uName) || uName.includes(spec))) return true;
        if (uCompany && (spec === uCompany || spec.includes(uCompany) || uCompany.includes(spec))) return true;
        if (uEmail && spec.includes(uEmail)) return true;
      }
      if (i.technician?.name) {
        const techName = String(i.technician.name).toLowerCase().trim();
        if (uName && (techName === uName || techName.includes(uName))) return true;
      }
      return false;
    }).length;
  }, [requestData?.items, isServiceProvider, user]);

  const customerRequestsCount = useMemo(() => {
    if (!requestData?.items || !isCustomer || !user) return 0;
    const uId = String(user._id || user.id || '');
    const uEmail = String(user.email || '').toLowerCase().trim();
    return requestData.items.filter((item) => {
      const itemUserId = item.user?._id ? String(item.user._id) : item.user ? String(item.user) : '';
      const itemEmail = String(item.email || '').toLowerCase().trim();
      return (uId && itemUserId === uId) || (uEmail && itemEmail === uEmail);
    }).length;
  }, [requestData?.items, isCustomer, user]);

  const [notificationOpen, setNotificationOpen] = useState(false);
  const { data: notifData, reload: reloadNotifs } = useData(user ? 'notifications?limit=5' : null);
  const unreadNotifCount = notifData?.unread || 0;

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => reloadNotifs(), 15000);
    const onFocus = () => reloadNotifs();
    const onNotifSync = () => reloadNotifs();
    window.addEventListener('focus', onFocus);
    window.addEventListener('urbanfindr:notifications-updated', onNotifSync);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('urbanfindr:notifications-updated', onNotifSync);
    };
  }, [user, reloadNotifs]);

  useEffect(() => {
    setUserMenuOpen(false);
    setNotificationOpen(false);
    setOpen(false);
    setMenuView('main');
  }, [pathname]);

  // Prevent background scrolling when mobile menu drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const [servicesLauncherOpen, setServicesLauncherOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const launcherTimeoutRef = useRef(null);

  function handleLauncherMouseEnter() {
    if (launcherTimeoutRef.current) {
      clearTimeout(launcherTimeoutRef.current);
      launcherTimeoutRef.current = null;
    }
  }

  function handleLauncherMouseLeave() {
    launcherTimeoutRef.current = setTimeout(() => {
      setServicesLauncherOpen(false);
    }, 250);
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest?.('.services-launcher-wrap')) {
        setServicesLauncherOpen(false);
      }
      if (!e.target.closest?.('.user-menu-wrap')) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      if (launcherTimeoutRef.current) clearTimeout(launcherTimeoutRef.current);
    };
  }, []);

  const filteredLauncherCategories = serviceCategories.filter((cat) => {
    if (!categorySearch.trim()) return true;
    const q = categorySearch.toLowerCase().trim();
    return (
      cat.label.toLowerCase().includes(q) ||
      cat.shortTitle?.toLowerCase().includes(q) ||
      cat.tagline?.toLowerCase().includes(q) ||
      cat.description?.toLowerCase().includes(q)
    );
  });

  // Main navbar links
  const links = [
    ['Home interiors', '/interiors'],
  ];

  function handleProjectsClick() {
    setOpen(false);
    setShowProjectsModal(true);
  }

  return (
    <>
      {/* Main navbar */}
      <header className="header">
        <Link href="/" className="brand flex items-center gap-2 sm:gap-2.5 shrink-0 group min-w-0">
          <span className="brand-icon w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-forest text-lime flex items-center justify-center shrink-0 shadow-2xs p-0">
            <House size={20} />
          </span>
          <div className="flex flex-col justify-center min-w-0">
            <span className="brand-text text-xl sm:text-[23px] font-bold tracking-tight leading-none truncate">
              urban<span className="brand-finder">findr</span><span className="brand-dot">.</span>
            </span>
            <span className="text-[8px] min-[360px]:text-[8.5px] sm:text-[10px] font-medium tracking-tight text-stone-500 leading-none mt-1 whitespace-nowrap">
              Find. Connect. Build Your Life.
            </span>
          </div>
        </Link>

        {/* Right-side actions: Matching laptop reference image with tightened spacing */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-5 shrink-0">
          <Link
            href="/interiors"
            className="text-[14px] font-medium text-[#252d27] hover:text-[#163e35] transition-colors whitespace-nowrap"
          >
            Home interiors
          </Link>

          <button
            onClick={handleProjectsClick}
            className="text-[14px] font-medium text-[#252d27] hover:text-[#163e35] transition-colors cursor-pointer bg-transparent border-0 p-0 whitespace-nowrap"
          >
            Builder projects
          </button>

          {user ? (
            <div className="relative user-menu-wrap" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="w-10 h-10 rounded-full bg-forest text-white font-bold text-base flex items-center justify-center shadow-sm hover:shadow hover:bg-[#1f4a3f] ring-2 ring-forest/15 hover:ring-lime/50 transition-all cursor-pointer select-none"
                  aria-label="User account menu"
                  aria-expanded={userMenuOpen}
                  title={user.name || 'Account'}
                >
                  {(user.name || user.email || 'U').trim().charAt(0).toUpperCase()}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200/90 z-50 p-2 py-2.5 transition-all animate-in fade-in">
                    {/* User Profile Header */}
                    <div className="px-3 py-2 border-b border-stone-100 flex items-center gap-2.5 mb-1">
                      <div className="w-8 h-8 rounded-full bg-forest/10 text-forest font-bold text-sm flex items-center justify-center shrink-0">
                        {(user.name || user.email || 'U').trim().charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {user.name || 'User'}
                        </p>
                        <p className="text-[11px] text-stone-500 truncate capitalize">
                          {user.role === 'broker'
                            ? 'Broker'
                            : user.role === 'owner'
                            ? 'Property Owner'
                            : user.role === 'builder'
                            ? 'Builder'
                            : user.role === 'channel_partner'
                            ? 'Channel Partner'
                            : user.role === 'service_provider' || user.role === 'service-provider' || activeAccountMode === 'provider'
                            ? 'Service Provider'
                            : user.role === 'admin'
                            ? 'Administrator'
                            : 'Customer Account'}
                        </p>
                      </div>
                    </div>

                    {/* Dropdown Options */}
                    <div className="space-y-0.5 pt-1">
                      <Link
                        href={
                          user.role === 'admin'
                            ? '/admin'
                            : user.role === 'broker'
                            ? '/dashboard/broker'
                            : user.role === 'owner'
                            ? '/dashboard/owner'
                            : user.role === 'builder'
                            ? '/dashboard/builder'
                            : user.role === 'service_provider' || user.role === 'service-provider'
                            ? '/dashboard/provider'
                            : activeAccountMode === 'provider'
                            ? '/dashboard/provider'
                            : '/dashboard/customer'
                        }
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-forest hover:bg-stone-50 rounded-xl transition-all"
                      >
                        <LayoutDashboard size={15} className="text-stone-500" />
                        <span>Dashboard</span>
                      </Link>

                      {/* Switch User Account / Business Account option */}
                      {(user.role !== 'broker' && user.role !== 'owner' && user.role !== 'builder' && user.role !== 'channel_partner') && (
                        activeAccountMode === 'provider' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              try {
                                localStorage.setItem('havenest_active_account_mode', 'customer');
                              } catch (e) {}
                              setActiveAccountMode('customer');
                              router.push('/dashboard/customer');
                              if (toast) toast('Switched to User Account');
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-stone-700 hover:text-forest hover:bg-stone-50 rounded-xl transition-all text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <User size={15} className="text-stone-500" />
                              <span>Switch to User Account</span>
                            </div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                              User
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              try {
                                localStorage.setItem('havenest_active_account_mode', 'provider');
                              } catch (e) {}
                              setActiveAccountMode('provider');
                              router.push('/dashboard/provider');
                              if (toast) toast('Switched to Business Account');
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-stone-700 hover:text-forest hover:bg-stone-50 rounded-xl transition-all text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <Briefcase size={15} className="text-stone-500" />
                              <span>Switch to Business Account</span>
                            </div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Business
                            </span>
                          </button>
                        )
                      )}

                      {user.role === 'admin' && (
                        <Link
                          href="/dashboard?view=user"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-forest hover:bg-stone-50 rounded-xl transition-all"
                        >
                          <User size={15} className="text-stone-500" />
                          <span>User Portal View</span>
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all text-left cursor-pointer"
                      >
                        <LogOut size={15} className="text-red-500" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-[14px] font-medium text-[#252d27] hover:text-[#163e35] transition-colors whitespace-nowrap"
              >
                Log in
              </Link>
            )}

            {/* Universal Notification Bell for Logged-In Users */}
            {user && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative p-2 text-emerald-900 hover:text-[#163e35] transition-colors flex items-center justify-center cursor-pointer"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell size={21} className="text-emerald-900" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  )}
                </button>
                <NotificationPanel
                  isOpen={notificationOpen}
                  onClose={() => setNotificationOpen(false)}
                  onUpdated={reloadNotifs}
                />
              </div>
            )}

            {/* Google-style 9-Dots Services / Category App Launcher */}
            <div
              className="relative services-launcher-wrap flex items-center shrink-0"
              onMouseEnter={handleLauncherMouseEnter}
              onMouseLeave={handleLauncherMouseLeave}
            >
              <button
                type="button"
                onClick={() => {
                  setServicesLauncherOpen((prev) => !prev);
                  setCategorySearch('');
                }}
                aria-label="UrbanFindr Categories & Services"
                aria-expanded={servicesLauncherOpen}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  servicesLauncherOpen
                    ? 'bg-stone-200 text-forest shadow-inner'
                    : 'text-[#252d27] hover:text-forest hover:bg-stone-100'
                }`}
                title="Explore by Category"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <circle cx="5" cy="5" r="2.2" />
                  <circle cx="12" cy="5" r="2.2" />
                  <circle cx="19" cy="5" r="2.2" />
                  <circle cx="5" cy="12" r="2.2" />
                  <circle cx="12" cy="12" r="2.2" />
                  <circle cx="19" cy="12" r="2.2" />
                  <circle cx="5" cy="19" r="2.2" />
                  <circle cx="12" cy="19" r="2.2" />
                  <circle cx="19" cy="19" r="2.2" />
                </svg>
              </button>

              {/* Services Popup with Instant Search & Category Grid */}
              {servicesLauncherOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-3xl shadow-2xl border border-stone-200/90 z-50 p-4 transition-all duration-150 animate-in fade-in"
                  onMouseEnter={handleLauncherMouseEnter}
                  onMouseLeave={handleLauncherMouseLeave}
                >
                  <div className="flex items-center justify-between px-2 pt-1 pb-2 mb-2 border-b border-stone-100">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-stone-900 tracking-tight">
                        Explore by Category
                      </span>
                      <span className="text-[10px] font-bold text-forest bg-forest/10 px-1.5 py-0.5 rounded-full">
                        {serviceCategories.length}
                      </span>
                    </div>
                    <Link
                      href="/categories"
                      onClick={() => setServicesLauncherOpen(false)}
                      className="text-xs font-semibold text-forest hover:underline inline-flex items-center gap-1"
                    >
                      <span>All categories</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>

                  <div className="relative mb-3 px-1">
                    <Search size={14} className="absolute left-3.5 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      autoFocus
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="Search category or service..."
                      className="w-full pl-8 pr-7 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-forest focus:bg-white transition-all"
                    />
                    {categorySearch && (
                      <button
                        type="button"
                        onClick={() => setCategorySearch('')}
                        className="absolute right-3.5 top-2 text-stone-400 hover:text-stone-600 text-xs px-1"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {filteredLauncherCategories.length === 0 ? (
                    <div className="py-6 text-center text-xs text-stone-400">
                      No categories found for &quot;{categorySearch}&quot;
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-[340px] overflow-y-auto p-1 pr-1.5">
                      {filteredLauncherCategories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={cat.href}
                          onClick={() => setServicesLauncherOpen(false)}
                          className="flex flex-col items-center p-2 rounded-2xl hover:bg-stone-50 transition-all duration-150 group text-center"
                        >
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:shadow transition-transform"
                            style={{
                              backgroundColor: cat.bgTint || '#f5f5f5',
                              borderColor: cat.borderTint || '#e5e5e5',
                              borderWidth: '1px',
                              color: cat.accentColor || '#163e35',
                            }}
                          >
                            <CategoryIcon name={cat.iconName} size={22} />
                          </div>
                          <span className="text-[11px] font-medium text-stone-700 group-hover:text-forest mt-1.5 leading-tight line-clamp-1 w-full">
                            {cat.shortTitle || cat.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-r from-forest/5 via-lime/10 to-transparent border border-forest/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-stone-700">
                      <Sparkles size={15} className="text-forest shrink-0" />
                      <span className="font-medium text-[11px] leading-tight">
                        Explore 13+ verified categories
                      </span>
                    </div>
                    <Link
                      href="/categories"
                      onClick={() => setServicesLauncherOpen(false)}
                      className="font-bold text-forest text-xs hover:underline whitespace-nowrap ml-2"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/post-property"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#163e35] hover:bg-[#204e43] text-white font-medium text-[13.5px] transition-colors whitespace-nowrap shadow-xs shrink-0"
            >
              <span>Post property</span>{' '}
              <span className="bg-[#d8edb3] text-[#163e35] text-[10.5px] font-black px-1.5 py-0.5 rounded leading-none">
                FREE
              </span>
            </Link>
          </div>

        {/* Right side on mobile (< lg): Log in + Hamburger Menu Button */}
        <div className="flex lg:hidden items-center gap-1.5 sm:gap-2.5 shrink-0">
          {!user ? (
            <Link
              href="/login"
              className="text-[13px] sm:text-[14px] font-semibold text-[#252d27] hover:text-[#163e35] transition-colors px-1.5 sm:px-2 py-1"
            >
              Log in
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="w-8 h-8 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center shadow-xs"
              aria-label="User account menu"
            >
              {(user.name || user.email || 'U').trim().charAt(0).toUpperCase()}
            </button>
          )}

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="p-1.5 sm:p-2 rounded-xl text-stone-800 hover:text-forest hover:bg-stone-100 transition-colors flex items-center justify-center cursor-pointer shrink-0"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[1040] lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile navigation drawer matching Screens 2, 3, 4 */}
      {open && (
        <nav
          className="fixed inset-y-0 right-0 w-[88%] max-w-[360px] bg-white z-[1050] shadow-2xl flex flex-col overflow-y-auto lg:hidden animate-in slide-in-from-right duration-300"
          aria-label="Mobile navigation"
        >
          {/* Header with logo & close button */}
          <div className="bg-gradient-to-b from-[#eaf4ed] to-white px-5 pt-5 pb-4 border-b border-stone-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="brand-icon shrink-0 p-1.5 rounded-lg bg-forest text-lime">
                <House size={18} />
              </span>
              <div className="flex flex-col justify-center">
                <span className="brand-text text-xl font-bold tracking-tight leading-none">
                  urban<span className="brand-finder">findr</span><span className="brand-dot">.</span>
                </span>
                <span className="text-[9.5px] font-medium text-stone-500 leading-none mt-1">
                  Find. Connect. Build Your Life.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* View Switcher: Main Menu (Screen 2) vs Categories (Screen 3 & 4) */}
          <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 shrink-0 border-b border-stone-100">
            <button
              type="button"
              onClick={() => setMenuView('main')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                menuView === 'main'
                  ? 'bg-forest text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Main Menu
            </button>
            <button
              type="button"
              onClick={() => setMenuView('categories')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                menuView === 'categories'
                  ? 'bg-forest text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Menu Options
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="p-4 flex-1 space-y-4">
            {menuView === 'main' ? (
              /* Screen 2: Main Menu */
              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <House size={17} className="text-forest shrink-0" />
                  <span>Home</span>
                </Link>

                <Link
                  href="/properties"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <Building2 size={17} className="text-forest shrink-0" />
                  <span>Properties</span>
                </Link>

                <Link
                  href="/categories"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <Sparkles size={17} className="text-forest shrink-0" />
                  <span>Home Services</span>
                </Link>

                <Link
                  href="/categories/lawyers"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <Scale size={17} className="text-forest shrink-0" />
                  <span>Lawyers &amp; Maintenance</span>
                </Link>

                <Link
                  href="/categories/ac-technicians"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <Wrench size={17} className="text-forest shrink-0" />
                  <span>AC Technicians</span>
                </Link>

                <Link
                  href="/categories/electricians"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <Zap size={17} className="text-forest shrink-0" />
                  <span>Electricians</span>
                </Link>

                <Link
                  href="/categories/pest-control"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <ShieldCheck size={17} className="text-forest shrink-0" />
                  <span>Pest Control</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setMenuView('categories')}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Grid size={17} className="text-forest shrink-0" />
                    <span>More Services</span>
                  </div>
                  <ChevronRight size={15} className="text-stone-400" />
                </button>

                <div className="my-2 border-t border-stone-100" />

                <button
                  type="button"
                  onClick={handleProjectsClick}
                  className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors text-left cursor-pointer"
                >
                  <Boxes size={17} className="text-forest shrink-0" />
                  <span>Builder Projects</span>
                </button>
              </div>
            ) : (
              /* Screens 3 & 4: Menu Options & Categories */
              <div className="space-y-4">
                {/* Real Estate */}
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eef5ee] text-forest text-xs font-bold mb-1.5">
                    <Building2 size={13} />
                    <span>Real Estate</span>
                  </div>
                  <div className="space-y-0.5">
                    <Link
                      href="/properties"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:text-forest transition-colors"
                    >
                      <span>Properties</span>
                      <ChevronRight size={15} className="text-stone-400" />
                    </Link>
                    <Link
                      href="/interiors"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:text-forest transition-colors"
                    >
                      <span>Home Interior</span>
                      <ChevronRight size={15} className="text-stone-400" />
                    </Link>
                  </div>
                </div>

                {/* Home Services */}
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eef5ee] text-forest text-xs font-bold mb-1.5">
                    <Wrench size={13} />
                    <span>Home Services</span>
                  </div>
                  <div className="space-y-0.5">
                    <Link
                      href="/categories/electricians"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:text-forest transition-colors"
                    >
                      <span>Electricians</span>
                      <ChevronRight size={15} className="text-stone-400" />
                    </Link>
                    <Link
                      href="/categories/ac-technicians"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:text-forest transition-colors"
                    >
                      <span>AC Technicians</span>
                      <ChevronRight size={15} className="text-stone-400" />
                    </Link>
                    <Link
                      href="/categories/pest-control"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:text-forest transition-colors"
                    >
                      <span>Pest Control</span>
                      <ChevronRight size={15} className="text-stone-400" />
                    </Link>
                    <Link
                      href="/categories/pool-cleaning"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:text-forest transition-colors"
                    >
                      <span>Pool Cleaning</span>
                      <ChevronRight size={15} className="text-stone-400" />
                    </Link>
                    <Link
                      href="/categories/tank-cleaning"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:text-forest transition-colors"
                    >
                      <span>Tank Cleaning</span>
                      <ChevronRight size={15} className="text-stone-400" />
                    </Link>
                    <Link
                      href="/categories/inverter-maintenance"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:text-forest transition-colors"
                    >
                      <span>Inverter Maintenance</span>
                      <ChevronRight size={15} className="text-stone-400" />
                    </Link>
                  </div>
                </div>

                {/* Professional */}
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eef5ee] text-forest text-xs font-bold mb-1.5">
                    <Briefcase size={13} />
                    <span>Professional</span>
                  </div>
                  <div className="space-y-0.5">
                    <Link
                      href="/categories/lawyers"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:text-forest transition-colors"
                    >
                      <span>Lawyers</span>
                      <ChevronRight size={15} className="text-stone-400" />
                    </Link>
                    <Link
                      href="/categories/landscapers"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:text-forest transition-colors"
                    >
                      <span>Landscape</span>
                      <ChevronRight size={15} className="text-stone-400" />
                    </Link>
                  </div>
                </div>

                {/* Business */}
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eef5ee] text-forest text-xs font-bold mb-1.5">
                    <Building2 size={13} />
                    <span>Business</span>
                  </div>
                  <div className="space-y-0.5">
                    <Link
                      href="/categories/lift-maintenance"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:text-forest transition-colors"
                    >
                      <span>Lift Maintenance</span>
                      <ChevronRight size={15} className="text-stone-400" />
                    </Link>
                    <Link
                      href="/categories/office-supplies"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:text-forest transition-colors"
                    >
                      <span>Office Supply</span>
                      <ChevronRight size={15} className="text-stone-400" />
                    </Link>
                    <Link
                      href="/categories/facility-management"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:text-forest transition-colors"
                    >
                      <span>Facility Management</span>
                      <ChevronRight size={15} className="text-stone-400" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Promo Box (Screen 4) */}
            <div className="p-3.5 rounded-2xl bg-[#f0f7f2] border border-[#d2e7d7] flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
                  <House size={18} />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-stone-900 leading-tight">Find Your Perfect Property</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">Direct owner connections</div>
                </div>
              </div>
              <Link
                href="/properties"
                onClick={() => setOpen(false)}
                className="px-2.5 py-1.5 bg-forest text-white text-[11px] font-bold rounded-xl shadow-xs hover:bg-[#1f4a3f] whitespace-nowrap transition-colors shrink-0"
              >
                Search Now →
              </Link>
            </div>
          </div>

          {/* Action Footer (Screens 2 & 4) */}
          <div className="p-4 pt-2 border-t border-stone-100 space-y-2.5 mt-auto shrink-0 bg-white">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-2 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-forest text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {(user.name || user.email || 'U').trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-stone-900 truncate">{user.name || 'User'}</div>
                      <div className="text-[10px] text-stone-500 capitalize">{user.role || 'Member'}</div>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="text-xs font-bold text-forest hover:underline"
                  >
                    Dashboard
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-stone-300 font-bold text-stone-800 bg-white hover:bg-stone-50 shadow-2xs transition-all text-sm"
              >
                <User size={16} className="text-stone-600" />
                <span>Log In</span>
              </Link>
            )}

            <Link
              href="/post-property"
              onClick={() => setOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-forest text-white font-bold text-sm shadow-md hover:bg-[#1f4a3f] transition-all"
            >
              <Send size={15} />
              <span>Post Property</span>
              <span className="bg-[#d8edb3] text-[#163e35] text-[10px] font-black px-1.5 py-0.5 rounded ml-1">
                FREE
              </span>
            </Link>

            <p className="text-[11px] text-stone-400 text-center pt-1 font-medium">
              &copy; 2026 UrbanFindr. All rights reserved.
            </p>
          </div>
        </nav>
      )}

      {/* Discovery navbar */}
      {!pathname?.startsWith('/dashboard') && (
        <nav
          className="discovery-nav"
          aria-label="More ways to explore"
        >
          <Link href="/properties">
            All properties
          </Link>

          <Link href="/cities">
            Explore by city
          </Link>

          <Link href="/#featured-properties">
            Featured properties
          </Link>

          <Link href="/#latest-listings" className="hidden sm:inline-flex">
            Latest listings
          </Link>
        </nav>
      )}

      {/* Builder projects city picker */}
      {showProjectsModal && (
        <CityPickerModal
          onClose={() => setShowProjectsModal(false)}
        />
      )}
    </>
  );
}

export function Footer() {
  return (
    <footer className="bg-forest text-white" suppressHydrationWarning>
      <div className="wrap mx-auto grid grid-cols-2 md:grid-cols-5 gap-x-6 sm:gap-x-8 gap-y-10 py-12" suppressHydrationWarning>
        <div className="col-span-2 md:col-span-2">
          <Link
            href="/"
            className="brand !text-white flex items-center gap-2 mb-4"
          >
            <House size={24} />
            <span className="brand-text">urban<span className="brand-finder">findr</span><span className="brand-dot">.</span></span>
          </Link>

          <p className="max-w-sm text-sm text-white/70 mt-4 leading-7">
            A place for every next chapter. Find a home, meet its owner,
            and make it yours — direct and transparent.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/70">
            <span className="bg-white/10 px-2.5 py-1 rounded">100% Direct Owners</span>
            <span className="bg-white/10 px-2.5 py-1 rounded">Verified Listings</span>
            <span className="bg-white/10 px-2.5 py-1 rounded">Instant Site Visits</span>
          </div>

          <p className="mt-6 text-xs text-white/60 font-medium">
            India&apos;s verified direct-owner property and trusted home services network.
          </p>
        </div>

        <div>
          <h4 className="text-base font-semibold mb-3">
            Find your place
          </h4>

          <div className="footer-links space-y-2 text-sm text-white/80">
            <Link href="/buy" className="block hover:text-lime">
              Buy a home
            </Link>
            <Link href="/rent" className="block hover:text-lime">
              Rent a home
            </Link>
            <Link href="/pg" className="block hover:text-lime">
              PG / Co-living
            </Link>
            <Link href="/commercial" className="block hover:text-lime">
              Commercial
            </Link>
            <Link href="/projects" className="block hover:text-lime">
              Builder projects
            </Link>
            <Link href="/interiors" className="block hover:text-lime">
              Home interiors
            </Link>
            <Link href="/build-your-home" className="block hover:text-lime">
              Build your home
            </Link>
            <Link href="/categories" className="block hover:text-lime">
              All categories &amp; services
            </Link>
          </div>
        </div>

        <div>
          <h4 className="text-base font-semibold mb-3">
            Popular cities
          </h4>

          <div className="footer-links space-y-2 text-sm text-white/80">
            <Link href="/cities/bengaluru" className="block hover:text-lime">
              Bengaluru
            </Link>
            <Link href="/cities/mumbai" className="block hover:text-lime">
              Mumbai
            </Link>
            <Link href="/cities/pune" className="block hover:text-lime">
              Pune
            </Link>
            <Link href="/cities/hyderabad" className="block hover:text-lime">
              Hyderabad
            </Link>
            <Link href="/cities/delhi" className="block hover:text-lime">
              Delhi
            </Link>
            <Link href="/cities/chennai" className="block hover:text-lime">
              Chennai
            </Link>
            <Link href="/cities/gurugram" className="block hover:text-lime">
              Gurugram
            </Link>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 md:col-span-1">
          <h4 className="text-base font-semibold mb-3">
            Trust &amp; Legal
          </h4>

          <div className="footer-links space-y-2 text-sm text-white/80">
            <Link href="/about" className="block hover:text-lime">
              About us
            </Link>
            <Link href="/contact" className="block hover:text-lime">
              Contact us
            </Link>
            <Link href="/privacy" className="block hover:text-lime">
              Privacy policy
            </Link>
            <Link href="/terms" className="block hover:text-lime">
              Terms &amp; conditions
            </Link>
            <Link href="/post-property" className="block hover:text-lime">
              Post property (Free)
            </Link>
            <Link href="/dashboard" className="block hover:text-lime">
              Your dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Our Services Bar */}
      <div className="wrap border-t border-white/10 py-6 mx-auto">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p className="text-xs font-semibold text-white/60 tracking-wider uppercase">Our Services</p>
          <Link href="/categories" className="text-xs text-[#C19A6B] hover:underline inline-flex items-center gap-1 font-medium">
            All categories &amp; services
            <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/70">
          <Link href="/properties" className="hover:text-lime">Properties</Link>
          <span className="text-white/30">•</span>
          <Link href="/projects" className="hover:text-lime">Builder Projects</Link>
          <span className="text-white/30">•</span>
          <Link href="/interiors" className="hover:text-lime">Home Interiors</Link>
          <span className="text-white/30">•</span>
          <Link href="/build-your-home" className="hover:text-lime">Build Your Home</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/landscapers" className="hover:text-lime">Landscapers</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/lawyers" className="hover:text-lime">Lawyers &amp; Legal</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/electricians" className="hover:text-lime">Electricians</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/ac-technicians" className="hover:text-lime">AC Technicians</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/pest-control" className="hover:text-lime">Pest Control</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/pool-cleaning" className="hover:text-lime">Pool Cleaning</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/tank-cleaning" className="hover:text-lime">Tank Cleaning</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/inverter-maintenance" className="hover:text-lime">Inverter Maintenance</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/lift-maintenance" className="hover:text-lime">Lift Maintenance</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/office-supplies" className="hover:text-lime">Office Supplies</Link>
          <span className="text-white/30">•</span>
          <Link href="/categories/facility-management" className="hover:text-lime">Facility Management</Link>
        </div>
      </div>

      <div className="wrap border-t border-white/20 py-4 text-xs text-white/40 flex flex-col sm:flex-row justify-between items-center mx-auto">
        <span>
          © {new Date().getFullYear()} UrbanFindr. Built for better living.
        </span>

        <span className="flex items-center">
          Made for your next move
          <ArrowUpRight className="inline ml-1" size={13} />
        </span>
      </div>
    </footer>
  );
}

export function Guard({ children, roles }) {
  const { user, ready, hasRole } = useApp();

  if (!ready) {
    return (
      <div className="wrap py-20">
        Checking your account…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="wrap py-20">
        <div className="panel max-w-xl mx-auto p-10 text-center">
          <h2>Your next chapter starts here</h2>

          <p className="muted my-5">
            Log in to manage your homes, conversations and appointments.
          </p>

          <Link className="btn" href="/login">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  if (roles && !hasRole(roles)) {
    return (
      <div className="wrap py-20">
        <h2>This area requires additional access.</h2>

        <p className="muted my-5">
          This feature requires an account with {Array.isArray(roles) ? roles.join(' or ') : roles} access. Your current account role is &ldquo;{user.role}&rdquo;.
        </p>

        <div className="flex gap-4 items-center">
          <Link href="/dashboard" className="btn">
            Your dashboard
          </Link>
          <Link href="/dashboard/profile" className="btn-outline">
            Account settings &amp; roles
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
