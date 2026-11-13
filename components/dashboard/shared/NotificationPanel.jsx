'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApp, useData, api } from '../../providers';
import { Bell, Check, ExternalLink, X, Clock } from 'lucide-react';
import { date } from '@/lib/format';

export default function NotificationPanel({ isOpen, onClose, onUpdated }) {
  const { toast } = useApp();
  const { data, reload } = useData('notifications?limit=15');
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      reload();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
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

  const items = data?.items || [];
  const unreadCount = data?.unread ?? items.filter((i) => !i.read).length;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 z-[9999] w-80 sm:w-96 bg-white border border-stone-200/90 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Header bar matching user's design */}
      <div className="p-3.5 sm:p-4 bg-white border-b border-stone-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Bell size={16} className="text-stone-800 shrink-0" />
          <h3 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider">
            NOTIFICATIONS
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 shrink-0">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          {items.length > 0 && (
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

      {/* Notifications List */}
      <div className="max-h-84 overflow-y-auto divide-y divide-stone-100">
        {items.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400 space-y-2">
            <Bell size={24} className="mx-auto text-stone-300" />
            <p>No notifications yet.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className={`p-3.5 sm:p-4 transition-colors ${
                !item.read ? 'bg-[#fafaf7]' : 'hover:bg-stone-50/80'
              }`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <Link
                  href={item.link || '/dashboard'}
                  onClick={() => {
                    if (!item.read) markRead(item._id);
                    onClose();
                  }}
                  className="font-bold text-xs sm:text-sm text-stone-900 hover:text-emerald-800 transition-colors leading-snug"
                >
                  {item.title}
                </Link>
                {!item.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 mt-1" />
                )}
              </div>

              {item.body && (
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  {item.body}
                </p>
              )}

              <div className="mt-2.5 flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1.5 text-stone-400">
                  <Clock size={12} className="text-stone-400" />
                  <span>{item.createdAt ? date(item.createdAt) : 'Just now'}</span>
                </span>
                {!item.read && (
                  <button
                    type="button"
                    onClick={() => markRead(item._id)}
                    className="text-stone-400 hover:text-stone-700 transition-colors cursor-pointer text-xs font-medium"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="py-2.5 px-4 bg-white border-t border-stone-100 text-center">
        <Link
          href="/dashboard/notifications"
          onClick={onClose}
          className="text-xs font-bold text-stone-700 hover:text-stone-900 transition-colors inline-block"
        >
          View all notifications →
        </Link>
      </div>
    </div>
  );
}
