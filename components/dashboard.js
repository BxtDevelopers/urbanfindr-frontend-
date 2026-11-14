'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useApp } from './providers';
import { WorkspaceProvider, useWorkspace, WORKSPACE_CONFIG } from './dashboard/WorkspaceContext';
import DashboardLayout from './dashboard/shared/DashboardLayout';
import RegistrationModal from './dashboard/shared/RegistrationModal';
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

  const { activeWorkspace, authorizedTypes, memberships = [], loadingWorkspaces, switchWorkspace, openRegisterModal } = useWorkspace();

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

  // Gate business dashboards outside DashboardLayout so pending/unapproved users never see the business sidebar or dashboard
  if (activeWorkspace !== 'customer') {
    if (loadingWorkspaces) {
      return (
        <div className="min-h-[75vh] bg-[#fafbfc] flex items-center justify-center p-6">
          <div className="text-sm font-medium text-stone-500">Verifying workspace access…</div>
          <RegistrationModal />
        </div>
      );
    }

    if (!authorizedTypes.includes(activeWorkspace)) {
      const label = WORKSPACE_CONFIG[activeWorkspace]?.label || activeWorkspace;
      const membership = memberships.find((m) => m.workspaceType === activeWorkspace);

      if (membership?.status === 'pending') {
        return (
          <div className="min-h-[75vh] bg-[#fafbfc] flex items-center justify-center p-4 sm:p-8">
            <div className="bg-white border border-amber-200 rounded-3xl p-8 sm:p-12 text-center space-y-6 max-w-2xl w-full shadow-md">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
                Application In Review
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-snug">
                {label} Pending Admin Approval
              </h2>
              <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl mx-auto">
                Your registration request{membership.businessName ? ` for ${membership.businessName}` : ''} has been submitted to the Admin team and is currently under review. Once approved by an administrator, your <strong>{label}</strong> will unlock automatically.
              </p>
              <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-5 text-left text-sm sm:text-base text-stone-700 space-y-2 max-w-lg mx-auto">
                {membership.businessName && (
                  <div><strong>Business Name:</strong> {membership.businessName}</div>
                )}
                {membership.businessProfile?.category && (
                  <div><strong>Specialization:</strong> {membership.businessProfile.category}</div>
                )}
                {membership.businessProfile?.city && (
                  <div><strong>City:</strong> {membership.businessProfile.city}</div>
                )}
              </div>
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => switchWorkspace('customer')}
                  className="px-6 py-3 bg-[#163e35] hover:bg-[#24564a] text-[#d8edb3] text-sm font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Go to Customer Workspace
                </button>
              </div>
            </div>
            <RegistrationModal />
          </div>
        );
      }

      if (membership?.status === 'rejected') {
        return (
          <div className="min-h-[75vh] bg-[#fafbfc] flex items-center justify-center p-4 sm:p-8">
            <div className="bg-white border border-rose-200 rounded-3xl p-8 sm:p-12 text-center space-y-5 max-w-2xl w-full shadow-md">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
                Application Not Approved
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-snug">
                {label} Request Declined
              </h2>
              <p className="text-base text-stone-600 leading-relaxed max-w-xl mx-auto">
                {membership.rejectionReason || 'Your previous application did not meet verification requirements.'}
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => openRegisterModal(activeWorkspace)}
                  className="px-5 py-2.5 bg-[#163e35] text-white text-sm font-bold rounded-xl cursor-pointer"
                >
                  Update &amp; Re-apply
                </button>
                <button
                  type="button"
                  onClick={() => switchWorkspace('customer')}
                  className="px-5 py-2.5 bg-stone-100 text-stone-700 text-sm font-semibold rounded-xl cursor-pointer"
                >
                  Go to Customer Workspace
                </button>
              </div>
            </div>
            <RegistrationModal />
          </div>
        );
      }

      return (
        <div className="min-h-[75vh] bg-[#fafbfc] flex items-center justify-center p-4 sm:p-8">
          <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 text-center space-y-5 max-w-xl w-full shadow-sm">
            <h2 className="text-2xl font-bold text-stone-900">Workspace Access Required</h2>
            <p className="text-sm sm:text-base text-stone-600">
              Your account does not have an active <strong>{label}</strong> membership.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => openRegisterModal(activeWorkspace)}
                className="px-5 py-2.5 bg-[#163e35] text-white text-sm font-bold rounded-xl cursor-pointer"
              >
                Register for {label}
              </button>
              <button
                type="button"
                onClick={() => switchWorkspace('customer')}
                className="px-5 py-2.5 bg-stone-100 text-stone-700 text-sm font-semibold rounded-xl cursor-pointer"
              >
                Go to Customer Workspace
              </button>
            </div>
          </div>
          <RegistrationModal />
        </div>
      );
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
