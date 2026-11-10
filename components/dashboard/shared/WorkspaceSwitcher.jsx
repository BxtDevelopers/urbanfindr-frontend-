'use client';

import { useWorkspace } from '../WorkspaceContext';
import { useApp } from '../../providers';

export default function WorkspaceSwitcher({ compact = false }) {
  const { user } = useApp();
  const { activeWorkspace, currentConfig } = useWorkspace();

  const CurrentIcon = currentConfig.icon;

  const displayLabel =
    activeWorkspace === 'broker' || user?.role === 'broker'
      ? 'Agent'
      : activeWorkspace === 'owner' || user?.role === 'owner'
      ? (user?.name || 'Property Owner')
      : activeWorkspace === 'builder' || user?.role === 'builder'
      ? 'Builder'
      : activeWorkspace === 'provider'
      ? 'Service Provider'
      : activeWorkspace === 'customer'
      ? 'Customer'
      : currentConfig.shortLabel || currentConfig.label;

  return (
    <div className="w-full">
      <div
        className={`w-full flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl transition-all ${
          compact ? 'p-2' : 'p-3'
        }`}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
          style={{ backgroundColor: currentConfig.bgBadge, color: currentConfig.accentColor }}
        >
          <CurrentIcon size={18} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Active Workspace
          </div>
          <div className="font-bold text-stone-900 text-sm truncate">
            {displayLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
