'use client';

import { useState, useRef, useEffect } from 'react';
import { useWorkspace, WORKSPACE_CONFIG } from '../WorkspaceContext';
import { useApp } from '../../providers';
import {
  ChevronDown,
  Check,
  PlusCircle,
  Sparkles,
  ShieldCheck,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function WorkspaceSwitcher({ compact = false }) {
  const { user } = useApp();
  const {
    activeWorkspace,
    currentConfig,
    availableWorkspaces,
    upgradeOptions,
    switchWorkspace,
    openRegisterModal
  } = useWorkspace();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const CurrentIcon = currentConfig.icon;

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-3 text-left bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-all duration-150 ${
          compact ? 'p-2' : 'p-3'
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
            style={{ backgroundColor: currentConfig.bgBadge, color: currentConfig.accentColor }}
          >
            <CurrentIcon size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <span>{user?.name ? user.name.split(' ')[0] : 'Your'} Workspace</span>
            </div>
            <div className="font-bold text-stone-900 text-sm truncate">
              {currentConfig.shortLabel}
            </div>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-stone-400 transition-transform duration-200 shrink-0 ${
            open ? 'rotate-180 text-stone-700' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1.5 z-50 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Switch Workspace
              </p>
              <p className="text-xs font-semibold text-stone-800 truncate">
                {user?.name || 'Authorized Workspaces'}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ecf2e4] text-[#163e35]">
              {availableWorkspaces.length} Active
            </span>
          </div>

          {/* Active / Authorized Workspaces list */}
          <div className="p-1.5 space-y-1 max-h-64 overflow-y-auto">
            {availableWorkspaces.map((ws) => {
              const Icon = ws.icon;
              const isSelected = ws.id === activeWorkspace;
              return (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => {
                    switchWorkspace(ws.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-[#ecf2e4]/70 text-[#163e35] font-semibold'
                      : 'hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: ws.bgBadge, color: ws.accentColor }}
                    >
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{ws.label}</div>
                      <div className="text-[11px] text-stone-400 truncate">{ws.description}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <Check size={16} className="text-[#163e35] shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Upgrade / Register for new workspace */}
          {upgradeOptions.length > 0 && (
            <div className="p-2 border-t border-stone-100 bg-[#f7f8f3]/60">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2 mb-1.5">
                Add Business Workspaces
              </p>
              <div className="space-y-1">
                {upgradeOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        openRegisterModal(opt.id);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg text-left hover:bg-white border border-transparent hover:border-[#e6e8e1] transition-all text-stone-600 hover:text-[#163e35] text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="text-stone-400" />
                        <span>Become {opt.shortLabel}</span>
                      </div>
                      <PlusCircle size={14} className="text-stone-400 hover:text-[#163e35]" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

