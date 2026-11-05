'use client';

import { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import RegistrationModal from './RegistrationModal';
import { useWorkspace } from '../WorkspaceContext';

export default function DashboardLayout({
  activeSection = 'overview',
  onSelectSection,
  onActionClick,
  children
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentConfig } = useWorkspace();

  return (
    <div className="min-h-screen bg-[#fafbfc] text-stone-900 flex flex-col lg:flex-row font-sans antialiased">
      {/* Sidebar */}
      <DashboardSidebar
        activeSection={activeSection}
        onSelectSection={onSelectSection}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <DashboardHeader
          activeSection={activeSection}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onActionClick={onActionClick}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          {children}
        </main>
      </div>

      {/* Global Workspace Registration Modal */}
      <RegistrationModal />
    </div>
  );
}

