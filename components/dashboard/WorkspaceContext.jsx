'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useApp, api } from '../providers';
import {
  User,
  House,
  Briefcase,
  Building2,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const WorkspaceCtx = createContext(null);

export const WORKSPACE_CONFIG = {
  customer: {
    id: 'customer',
    type: 'customer',
    label: 'Customer Dashboard',
    shortLabel: 'Customer',
    title: 'Customer Workspace',
    description: 'Find homes, book doorstep services, and track site visits',
    path: '/dashboard/customer',
    accentColor: '#163e35',
    bgBadge: '#ecf2e4',
    textBadge: '#163e35',
    icon: User,
    defaultSection: 'overview'
  },
  owner: {
    id: 'owner',
    type: 'owner',
    label: 'Property Owner Dashboard',
    shortLabel: 'Owner',
    title: 'Property Owner Workspace',
    description: 'Manage rental & resale listings, tenant visits, and direct inquiries',
    path: '/dashboard/owner',
    accentColor: '#163e35',
    bgBadge: '#ecf2e4',
    textBadge: '#163e35',
    icon: House,
    defaultSection: 'overview'
  },
  broker: {
    id: 'broker',
    type: 'broker',
    label: 'Broker Dashboard',
    shortLabel: 'Broker',
    title: 'Broker Workspace',
    description: 'Manage client property portfolio, leads pipeline, and client deals',
    path: '/dashboard/broker',
    accentColor: '#1c4a40',
    bgBadge: '#ecf2e4',
    textBadge: '#163e35',
    icon: Briefcase,
    defaultSection: 'overview'
  },
  builder: {
    id: 'builder',
    type: 'builder',
    label: 'Builder Dashboard',
    shortLabel: 'Builder',
    title: 'Builder Workspace',
    description: 'Showcase real estate projects, configurations, towers & unit inquiries',
    path: '/dashboard/builder',
    accentColor: '#163e35',
    bgBadge: '#ecf2e4',
    textBadge: '#163e35',
    icon: Building2,
    defaultSection: 'overview'
  },
  provider: {
    id: 'provider',
    type: 'provider',
    label: 'Service Provider Dashboard',
    shortLabel: 'Service Pro',
    title: 'Service Provider Workspace',
    description: 'Receive doorstep service requests, field dispatch & job bookings',
    path: '/dashboard/provider',
    accentColor: '#1c4a40',
    bgBadge: '#ecf2e4',
    textBadge: '#163e35',
    icon: Wrench,
    defaultSection: 'overview'
  }
};

export function WorkspaceProvider({ children, initialWorkspace, initialSection }) {
  const { user, setUser, toast } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [authorizedTypes, setAuthorizedTypes] = useState(['customer']);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerModalType, setRegisterModalType] = useState('provider');

  // Determine active workspace from URL or preference
  const derivedWorkspace = useMemo(() => {
    // 1. Check if URL pathname starts with /dashboard/<workspace>
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'dashboard' && segments[1] && WORKSPACE_CONFIG[segments[1]]) {
      return segments[1];
    }
    // 2. Check initial prop
    if (initialWorkspace && WORKSPACE_CONFIG[initialWorkspace]) {
      return initialWorkspace;
    }
    // 3. Fallback based on user primary role
    if (user?.role === 'owner') return 'owner';
    if (user?.role === 'broker') return 'broker';
    if (user?.role === 'builder') return 'builder';
    if (user?.role === 'service_provider' || user?.role === 'service-provider') return 'provider';
    return 'customer';
  }, [pathname, initialWorkspace, user?.role]);

  const [activeWorkspace, setActiveWorkspace] = useState(derivedWorkspace);

  useEffect(() => {
    setActiveWorkspace(derivedWorkspace);
  }, [derivedWorkspace]);

  // Fetch authorized workspaces for this user
  const fetchWorkspaces = useCallback(async () => {
    if (!user) {
      setAuthorizedTypes(['customer']);
      setLoadingWorkspaces(false);
      return;
    }
    try {
      setLoadingWorkspaces(true);
      const res = await api('workspaces');
      if (res?.authorizedTypes) {
        setAuthorizedTypes(res.authorizedTypes);
      }
    } catch (e) {
      // Fallback from user.role
      const types = ['customer'];
      if (user.role === 'admin') {
        types.push('owner', 'broker', 'builder', 'provider');
      } else if (['owner', 'broker', 'builder'].includes(user.role)) {
        types.push(user.role);
      } else if (user.role === 'service_provider' || user.role === 'service-provider') {
        types.push('provider');
      }
      setAuthorizedTypes(types);
    } finally {
      setLoadingWorkspaces(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Switch workspace without logout or data reset
  const switchWorkspace = useCallback((targetType) => {
    if (!WORKSPACE_CONFIG[targetType]) return;
    setActiveWorkspace(targetType);
    router.push(WORKSPACE_CONFIG[targetType].path);
    toast(`Switched to ${WORKSPACE_CONFIG[targetType].label}`);
  }, [router, toast]);

  // Open workspace registration modal
  const openRegisterModal = useCallback((type = 'provider') => {
    setRegisterModalType(type);
    setRegisterModalOpen(true);
  }, []);

  const closeRegisterModal = useCallback(() => {
    setRegisterModalOpen(false);
  }, []);

  // Compute available and unavailable workspaces
  const availableWorkspaces = useMemo(() => {
    return Object.values(WORKSPACE_CONFIG).filter(w => authorizedTypes.includes(w.id));
  }, [authorizedTypes]);

  const upgradeOptions = useMemo(() => {
    return Object.values(WORKSPACE_CONFIG).filter(w => !authorizedTypes.includes(w.id));
  }, [authorizedTypes]);

  const currentConfig = WORKSPACE_CONFIG[activeWorkspace] || WORKSPACE_CONFIG.customer;

  return (
    <WorkspaceCtx.Provider
      value={{
        activeWorkspace,
        currentConfig,
        availableWorkspaces,
        upgradeOptions,
        authorizedTypes,
        loadingWorkspaces,
        switchWorkspace,
        fetchWorkspaces,
        registerModalOpen,
        registerModalType,
        openRegisterModal,
        closeRegisterModal
      }}
    >
      {children}
    </WorkspaceCtx.Provider>
  );
}

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceCtx);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
};

