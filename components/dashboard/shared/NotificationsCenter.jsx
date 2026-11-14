'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp, useData, api } from '../../providers';
import { date } from '@/lib/format';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  MessageSquare,
  MessageCircle,
  Calendar,
  ClipboardList,
  Wrench,
  Clock,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';

export default function NotificationsCenter({
  onSelectSection,
  title = 'Notifications & Alerts',
  subtitle = 'Real-time updates, client inquiries, site visits, and booking notifications'
}) {
  const router = useRouter();
  const { user, toast } = useApp();
  const { data, reload, loading } = useData('notifications?limit=50');
  const items = data?.items || [];
  const unreadCount = data?.unread || 0;

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'messages'
  const [searchQuery, setSearchQuery] = useState('');
  const [busyAction, setBusyAction] = useState('');

  // Filter notifications
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeFilter === 'unread' && item.read) return false;
      if (activeFilter === 'messages') {
        const isMsg =
          item.title?.toLowerCase().includes('message') ||
          item.title?.toLowerCase().includes('enquiry') ||
          item.link?.includes('thread=') ||
          item.link?.includes('messages');
        if (!isMsg) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesBody = item.body?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesBody) return false;
      }
      return true;
    });
  }, [items, activeFilter, searchQuery]);

  // Mark all notifications read
  async function handleMarkAllRead() {
    setBusyAction('read_all');
    try {
      await api('notifications', { method: 'PATCH' });
      reload();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('urbanfindr:notifications-updated'));
      }
      toast('All notifications marked as read.');
    } catch (err) {
      toast(err.message || 'Failed to update notifications.');
    } finally {
      setBusyAction('');
    }
  }

  // Clear / Delete all notifications
  async function handleClearAll() {
    if (!window.confirm('Clear all notifications in your inbox?')) return;
    setBusyAction('clear_all');
    try {
      await api('notifications', { method: 'DELETE' });
      reload();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('urbanfindr:notifications-updated'));
      }
      toast('Notifications cleared.');
    } catch (err) {
      toast(err.message || 'Failed to clear notifications.');
    } finally {
      setBusyAction('');
    }
  }

  // Mark single item read
  async function handleMarkRead(id) {
    try {
      await api(`notifications/${id}`, { method: 'PATCH' });
      reload();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('urbanfindr:notifications-updated'));
      }
    } catch (err) {
      console.warn('Failed to mark read:', err);
    }
  }

  // Delete single notification
  async function handleDeleteNotification(id) {
    try {
      await api(`notifications/${id}`, { method: 'DELETE' });
      reload();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('urbanfindr:notifications-updated'));
      }
      toast('Notification removed.');
    } catch (err) {
      toast(err.message || 'Failed to delete notification.');
    }
  }

  // Handle Chat / Reply action for a notification
  async function handleChatReply(item) {
    if (!item.read) {
      await handleMarkRead(item._id);
    }

    // Extract thread ID if present in link
    const threadMatch = item.link?.match(/thread=([a-f0-9]+)/i);
    const threadId = threadMatch ? threadMatch[1] : '';

    if (onSelectSection) {
      if (threadId && typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('section', 'messages');
        url.searchParams.set('thread', threadId);
        window.history.pushState(null, '', url.toString());
      }
      onSelectSection('messages');
    } else if (item.link) {
      router.push(item.link);
    } else {
      router.push('/dashboard/messages');
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 flex items-center gap-2">
              <Bell size={22} className="text-[#163e35]" />
              {title}
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-2xs">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          {items.length > 0 && unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={busyAction === 'read_all'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <CheckCheck size={14} className="text-emerald-700" />
              <span>Mark All Read</span>
            </button>
          )}

          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              disabled={busyAction === 'clear_all'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 size={13} className="text-stone-500" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Alerts', count: items.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
            {
              id: 'messages',
              label: 'Direct Messages & Inquiries',
              count: items.filter(
                (i) =>
                  i.title?.toLowerCase().includes('message') ||
                  i.title?.toLowerCase().includes('enquiry') ||
                  i.link?.includes('thread=')
              ).length
            }
          ].map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#163e35] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search alerts…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#163e35] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Notifications Cards Feed */}
      <div className="space-y-3">
        {loading && items.length === 0 ? (
          <div className="p-12 text-center bg-white border border-stone-200 rounded-2xl text-xs text-stone-400">
            Loading notifications…
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white border border-stone-200 rounded-2xl space-y-2">
            <Bell size={32} className="mx-auto text-stone-300" />
            <h3 className="text-sm font-bold text-stone-800">No notifications</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              {activeFilter === 'unread'
                ? 'You are all caught up! No unread notifications.'
                : activeFilter === 'messages'
                ? 'No direct message inquiries in this filter.'
                : 'Alerts and customer message inquiries will appear here.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isMessage =
              item.title?.toLowerCase().includes('message') ||
              item.title?.toLowerCase().includes('enquiry') ||
              item.link?.includes('thread=') ||
              item.link?.includes('messages');
            const isVisit = item.title?.toLowerCase().includes('visit');
            const isRequest = item.title?.toLowerCase().includes('service') || item.title?.toLowerCase().includes('booking');

            return (
              <div
                key={item._id}
                className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !item.read ? 'border-[#163e35]/30 bg-[#163e35]/[0.02]' : 'border-stone-200'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Type Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isMessage
                        ? 'bg-emerald-100 text-emerald-800'
                        : isVisit
                        ? 'bg-purple-100 text-purple-800'
                        : isRequest
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {isMessage ? (
                      <MessageSquare size={18} />
                    ) : isVisit ? (
                      <Calendar size={18} />
                    ) : isRequest ? (
                      <Wrench size={18} />
                    ) : (
                      <Bell size={18} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-stone-900">{item.title}</h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      )}
                      <span className="text-[11px] text-stone-400">
                        {date(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
                      {item.body}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Chat-able Action Button for Direct Messages / Inquiries */}
                  {isMessage ? (
                    <button
                      type="button"
                      onClick={() => handleChatReply(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#163e35] hover:bg-[#12332c] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <MessageSquare size={14} className="text-[#d8edb3]" />
                      <span>Chat &amp; Reply</span>
                    </button>
                  ) : item.link ? (
                    <Link
                      href={item.link}
                      onClick={() => {
                        if (!item.read) handleMarkRead(item._id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <span>Open Link</span>
                      <ExternalLink size={13} className="text-stone-500" />
                    </Link>
                  ) : null}

                  {/* Mark Read Toggle */}
                  {!item.read && (
                    <button
                      type="button"
                      title="Mark as read"
                      onClick={() => handleMarkRead(item._id)}
                      className="p-2 text-stone-400 hover:text-emerald-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                    >
                      <Check size={16} />
                    </button>
                  )}

                  {/* Delete Notification */}
                  <button
                    type="button"
                    title="Delete notification"
                    onClick={() => handleDeleteNotification(item._id)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
