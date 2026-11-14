'use client';

import { User } from 'lucide-react';
import { useApp } from '../../providers';

export default function WorkspaceSwitcher({ compact = false, onSelectProfile }) {
  const { user } = useApp();
  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : '';

  const content = (
    <div
      className={`w-full flex items-center gap-3 bg-[#163e35] border border-[#163e35] rounded-xl shadow-xs transition-all ${
        onSelectProfile ? 'hover:bg-[#1f5247] cursor-pointer' : ''
      } ${compact ? 'p-2' : 'p-3'}`}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#24564a] text-[#d8edb3] border border-[#d8edb3]/20 font-bold text-sm">
        {initial || <User size={18} />}
      </div>
      <div className="min-w-0 text-left">
        <div className="font-bold text-white text-sm truncate">
          My Profile
        </div>
        {user?.name && (
          <div className="text-xs font-medium text-[#d8edb3] truncate">
            {user.name}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {onSelectProfile ? (
        <button type="button" onClick={onSelectProfile} className="w-full text-left">
          {content}
        </button>
      ) : (
        content
      )}
    </div>
  );
}
