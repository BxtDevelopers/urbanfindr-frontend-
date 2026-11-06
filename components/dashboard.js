'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useApp } from './providers';
import { WorkspaceProvider, useWorkspace, WORKSPACE_CONFIG } from './dashboard/WorkspaceContext';
import DashboardLayout from './dashboard/shared/DashboardLayout';
import CustomerWorkspace from './dashboard/workspaces/CustomerWorkspace';
import OwnerWorkspace from './dashboard/workspaces/OwnerWorkspace';
import BrokerWorkspace from './dashboard/workspaces/BrokerWorkspace';
import BuilderWorkspace from './dashboard/workspaces/BuilderWorkspace';
import ProviderWorkspace from './dashboard/workspaces/ProviderWorkspace';
import ChannelPartnerDashboard from './channel-partner-dashboard';
import BookingsTracker from './bookings-tracker';
import InteriorProjectHub from './interior/InteriorProjectHub';

function UnifiedDashboardInner({ initialSection = '', initialAction = '' }) {
  const { user } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { activeWorkspace, switchWorkspace } = useWorkspace();

  // Determine effective workspace & section
  // Examples:
  // /dashboard/customer -> workspace: customer, section: overview
  // /dashboard/customer/bookings -> workspace: customer, section: bookings
  // /dashboard/owner/properties -> workspace: owner, section: properties
  // /dashboard/bookings -> legacy direct section
  const urlSegments = useMemo(() => {
    return pathname.split('/').filter(Boolean);
  }, [pathname]);

  const [activeSection, setActiveSection] = useState(() => {
    const qSec = searchParams?.get('section');
    if (qSec) return qSec;

    // Check URL: /dashboard/[workspace]/[section]
    if (urlSegments[0] === 'dashboard') {
      if (WORKSPACE_CONFIG[urlSegments[1]]) {
        return urlSegments[2] || 'overview';
      }
      if (urlSegments[1]) {
        return urlSegments[1];
      }
    }

    if (initialAction) return initialAction;
    if (initialSection && !WORKSPACE_CONFIG[initialSection]) return initialSection;
    return 'overview';
  });

  // Keep activeSection in sync with URL
  useEffect(() => {
    const qSec = searchParams?.get('section');
    if (qSec) {
      setActiveSection(qSec);
      return;
    }
    if (urlSegments[0] === 'dashboard') {
      if (WORKSPACE_CONFIG[urlSegments[1]]) {
        setActiveSection(urlSegments[2] || 'overview');
      } else if (urlSegments[1]) {
        setActiveSection(urlSegments[1]);
      } else {
        setActiveSection('overview');
      }
    }
  }, [urlSegments, searchParams]);

  // Handle selecting section from sidebar or in-page links
  function handleSelectSection(secId) {
    if (secId === 'add-property') {
      router.push('/post-property');
      return;
    }
    if (secId === 'add-project') {
      router.push('/post-property');
      return;
    }

    setActiveSection(secId);
    // Push clean URL
    const targetPath = `/dashboard/${activeWorkspace}${secId === 'overview' ? '' : '/' + secId}`;
    router.push(targetPath);
  }

  // Handle quick actions from top header
  function handleActionClick(actionType) {
    if (actionType === 'add-service') {
      setActiveSection('services');
    }
  }

  // Render workspace content based on activeWorkspace
  const renderWorkspaceContent = () => {
    // Legacy direct routing support for interior project hub
    if (activeSection === 'interiors') {
      return (
        <div className="space-y-6">
          <div className="mb-2">
            <span className="eyebrow">HOME INTERIOR MANAGEMENT</span>
            <h2 className="!text-3xl font-extrabold text-stone-900 mt-1">
              Active Interior Projects &amp; 3D Proposals
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Track 3D walkthroughs, verify milestone progress, review custom design plans, and approve site deliverables.
            </p>
          </div>
          <InteriorProjectHub />
        </div>
      );
    }

    // Direct booking tracker support
    if (activeSection === 'bookings' && activeWorkspace === 'customer') {
      return (
        <div className="space-y-6">
          <BookingsTracker />
        </div>
      );
    }

    switch (activeWorkspace) {
      case 'owner':
        return (
          <OwnerWorkspace
            section={activeSection}
            onSelectSection={handleSelectSection}
          />
        );
      case 'broker':
        return (
          <BrokerWorkspace
            section={activeSection}
            onSelectSection={handleSelectSection}
          />
        );
      case 'builder':
        return (
          <BuilderWorkspace
            section={activeSection}
            onSelectSection={handleSelectSection}
          />
        );
      case 'provider':
        return (
          <ProviderWorkspace
            section={activeSection}
            onSelectSection={handleSelectSection}
          />
        );
      case 'customer':
      default:
        return (
          <CustomerWorkspace
            section={activeSection}
            onSelectSection={handleSelectSection}
          />
        );
    }
  };

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSelectSection={handleSelectSection}
      onActionClick={handleActionClick}
    >
      {renderWorkspaceContent()}
    </DashboardLayout>
  );
}

export default function Dashboard({ section = '', action = '' }) {
  const { user } = useApp();
  const searchParams = useSearchParams();
  const isUserView = searchParams?.get('view') === 'user';

  // Smart Channel Partner routing if not explicitly requesting customer view
  if (user && user.role === 'channel_partner' && !isUserView && section !== 'customer') {
    return <ChannelPartnerDashboard initialSection={section} />;
  }

  // Derive initial workspace if section matches workspace ID
  const initialWorkspace = WORKSPACE_CONFIG[section] ? section : undefined;
  const initialSection = WORKSPACE_CONFIG[section] ? action : section;

  return (
    <WorkspaceProvider
      initialWorkspace={initialWorkspace}
      initialSection={initialSection}
    >
      <UnifiedDashboardInner
        initialSection={initialSection}
        initialAction={action}
      />
    </WorkspaceProvider>
  );
}
