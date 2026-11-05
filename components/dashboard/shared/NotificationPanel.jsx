'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApp, useData, api } from '../../providers';
import { Bell, Check, ExternalLink, X, Clock } from 'lucide-react';
import { date } from '@/lib/format';

export default function NotificationPanel({ isOpen, onClose }) {
  const { toast } = useApp();
  const { data, reload } = useData('notifications?limit=15');
  const panelRef = useRef(null);

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
      toast('All notifications marked as read.');
    } catch (e) {
      toast(e.message);
    }
  }

  async function markRead(id) {
    try {
      await api(`notifications/${id}`, { method: 'PATCH' });
      reload();
    } catch (e) {
      // non-blocking
    }
  }

  const items = data?.items || [];
  const unreadCount = data?.unread || items.filter((i) => !i.read).length;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-stone-700" />
          <h3 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-md"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
        {items.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400">
            <Bell size={24} className="mx-auto text-stone-300 mb-2" />
            No notifications yet.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className={`p-3.5 transition-colors ${
                !item.read ? 'bg-amber-50/40' : 'hover:bg-stone-50/80'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={item.link || '/dashboard'}
                  onClick={() => {
                    markRead(item._id);
                    onClose();
                  }}
                  className="font-semibold text-xs text-stone-900 hover:text-emerald-700 transition-colors"
                >
                  {item.title}
                </Link>
                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1" />
                )}
              </div>
              <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                {item.body}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {date(item.createdAt)}
                </span>
                {!item.read && (
                  <button
                    type="button"
                    onClick={() => markRead(item._id)}
                    className="text-stone-500 hover:text-stone-800"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2.5 bg-stone-50 border-t border-stone-100 text-center">
        <Link
          href="/dashboard/notifications"
          onClick={onClose}
          className="text-xs font-semibold text-stone-600 hover:text-stone-900"
        >
          View all notifications →
        </Link>
      </div>
    </div>
  );
}

