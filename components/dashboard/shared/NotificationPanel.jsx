'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApp, useData, api } from '../../providers';
import { Bell, Check, ExternalLink, X, Clock } from 'lucide-react';
import { date, money } from '@/lib/format';

export default function NotificationPanel({ isOpen, onClose, onUpdated }) {
  const { user, toast } = useApp();
  // Only query when panel is open
  const { data, reload } = useData(user && isOpen ? 'notifications?limit=15' : null);
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose?.();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function markAllRead() {
    try {
      await api('notifications', { method: 'PATCH' });
      reload();
      onUpdated?.();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('urbanfindr:notifications-updated'));
      toast('All notifications marked as read.');
    } catch (e) {
      toast(e.message);
    }
  }

  async function markRead(id) {
    try {
      await api(`notifications/${id}`, { method: 'PATCH' });
      reload();
      onUpdated?.();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('urbanfindr:notifications-updated'));
    } catch (e) {
      // non-blocking
    }
  }

  function getDestination(item) {
    if (item.link) {
      if (user?.role === 'admin' && item.link.startsWith('/dashboard')) {
        return item.link.replace('/dashboard', '/admin');
      }
      return item.link;
    }
    return user?.role === 'admin' ? '/admin?tab=notifications' : '/dashboard?section=notifications';
  }

  const items = data?.items || [];
  const unreadCount = data?.unread ?? items.filter((i) => !i.read).length;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 z-[9999] w-80 sm:w-96 max-h-[500px] flex flex-col bg-white border border-stone-200/90 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Header bar matching user's design */}
      <div className="p-3.5 sm:p-4 bg-white border-b border-stone-100 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Bell size={16} className="text-[#163e35] shrink-0" />
          <h3 className="font-extrabold text-xs text-stone-900 tracking-tight">
            Notifications &amp; Alerts
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shrink-0">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          {items.length > 0 && unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors cursor-pointer"
            >
              Mark all read
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-md transition-colors cursor-pointer"
            aria-label="Close notifications"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Notifications List - Small Scrollable Cards */}
      <div className="flex-1 overflow-y-auto max-h-[360px] p-2.5 sm:p-3 space-y-2 bg-stone-50/70">
        {items.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400 space-y-2 bg-white rounded-xl border border-dashed border-stone-200">
            <Bell size={24} className="mx-auto text-stone-300" />
            <p className="font-medium">No notifications yet.</p>
          </div>
        ) : (
          items.map((item) => {
            const dest = getDestination(item);
            return (
              <div
                key={item._id}
                className={`group relative bg-white rounded-xl p-3 border transition-all duration-150 hover:shadow-xs ${
                  !item.read
                    ? 'border-emerald-200/80 bg-white ring-1 ring-emerald-500/10'
                    : 'border-stone-200/70 hover:border-stone-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={dest}
                    onClick={() => {
                      if (!item.read) markRead(item._id);
                      onClose();
                    }}
                    className="font-bold text-xs text-stone-900 group-hover:text-emerald-900 transition-colors leading-snug line-clamp-1"
                  >
                    {item.title}
                  </Link>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1" title="Unread" />
                  )}
                </div>

                {item.body && (
                  <p className="text-[11px] text-stone-500 mt-1 leading-relaxed line-clamp-2">
                    {item.body}
                  </p>
                )}

                {item.metadata?.type === 'property_alert' && (
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-200/80 my-2">
                    {item.metadata.thumbnail && (
                      <img
                        src={item.metadata.thumbnail}
                        alt={item.metadata.title || 'Property'}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-xs text-stone-900 block truncate">
                        {item.metadata.title}
                      </span>
                      <span className="text-[10px] font-semibold text-[#163e35] block truncate">
                        {item.metadata.price ? money(item.metadata.price) : ''}
                        {item.metadata.bhk ? ` • ${item.metadata.bhk} BHK` : ''}
                        {item.metadata.locality ? ` • ${item.metadata.locality}` : ''}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-2 pt-1.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                  <span className="flex items-center gap-1">
                    <Clock size={11} className="text-stone-400" />
                    <span>{item.createdAt ? date(item.createdAt) : 'Just now'}</span>
                  </span>
                  {!item.read && (
                    <button
                      type="button"
                      onClick={() => markRead(item._id)}
                      className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors cursor-pointer"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="py-2.5 px-4 bg-white border-t border-stone-100 text-center shrink-0">
        <Link
          href={user?.role === 'admin' ? '/admin?tab=notifications' : '/dashboard?section=notifications'}
          onClick={() => {
            onClose?.();
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('urbanfindr:navigate-section', { detail: 'notifications' }));
            }
          }}
          className="text-xs font-bold text-[#163e35] hover:text-[#24564a] transition-colors inline-block cursor-pointer"
        >
          View all notifications →
        </Link>
      </div>
    </div>
  );
}
