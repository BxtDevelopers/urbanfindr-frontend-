'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useApp, useData, api } from '../../providers';
import { date, money } from '@/lib/format';
import { propertyImages } from '@/lib/media';
import { realtime } from '@/lib/socket';
import {
  Send,
  MessageSquare,
  Search,
  RefreshCw,
  User,
  Building2,
  Phone,
  Mail,
  Clock,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trash2
} from 'lucide-react';

export default function MessageCenter({
  initialThreadId = '',
  title = 'Direct Conversations',
  subtitle = 'Direct message inquiries with property owners, channel partners, and prospective buyers'
}) {
  const { user, toast } = useApp();
  const { data: threadData, reload: reloadThreads, loading: threadsLoading } = useData('threads?limit=50');
  const threads = threadData?.items || [];

  const [selectedThreadId, setSelectedThreadId] = useState(initialThreadId);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // Sync initialThreadId if passed from outside
  useEffect(() => {
    if (initialThreadId) {
      setSelectedThreadId(initialThreadId);
      setMobileView('chat');
    }
  }, [initialThreadId]);

  // Default to first thread if none selected and threads exist
  useEffect(() => {
    if (!selectedThreadId && threads.length > 0) {
      setSelectedThreadId(threads[0]._id);
    }
  }, [threads, selectedThreadId]);

  // Load messages whenever selectedThreadId changes
  async function fetchMessages(showLoader = true) {
    if (!selectedThreadId) {
      setMessages([]);
      return;
    }
    if (showLoader) setLoadingMessages(true);
    try {
      const res = await api(`threads/${selectedThreadId}/messages?limit=100`);
      // API returns paginated items sorted createdAt:-1 (newest first); reverse to chronological
      const items = res?.items || [];
      const chronological = [...items].reverse();
      setMessages(chronological);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('urbanfindr:notifications-updated'));
      }
    } catch (err) {
      console.warn('Failed to fetch messages for thread:', err);
    } finally {
      if (showLoader) setLoadingMessages(false);
    }
  }

  useEffect(() => {
    fetchMessages(true);
  }, [selectedThreadId]);

  // WebSocket real-time updates for messages and thread deletion
  useEffect(() => {
    if (user?._id) {
      realtime.connect(user._id);
    }
  }, [user?._id]);

  useEffect(() => {
    if (!selectedThreadId) return;

    realtime.joinThread(selectedThreadId);

    const unsubMsg = realtime.on('new_message', (payload) => {
      const msg = payload?.message || payload;
      const tid = payload?.threadId || msg?.thread;
      if (!tid || String(tid) === String(selectedThreadId)) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
      reloadThreads();
    });

    const unsubDel = realtime.on('thread_deleted', (payload) => {
      const deletedId = payload?.threadId || payload?.id;
      if (String(deletedId) === String(selectedThreadId)) {
        setSelectedThreadId('');
      }
      reloadThreads();
    });

    return () => {
      unsubMsg();
      unsubDel();
      realtime.leaveThread(selectedThreadId);
    };
  }, [selectedThreadId]);

  // Scroll only the chat container to bottom (never scrolling the outer page window)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Find currently active thread object
  const activeThread = useMemo(() => {
    return threads.find((t) => t._id === selectedThreadId) || null;
  }, [threads, selectedThreadId]);

  // Find the other participant in the active conversation
  const otherParticipant = useMemo(() => {
    if (!activeThread?.participants) return null;
    return activeThread.participants.find((p) => String(p._id || p) !== String(user?._id)) || activeThread.participants[0];
  }, [activeThread, user]);

  // Filtered threads list based on search query
  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads;
    const q = searchQuery.toLowerCase();
    return threads.filter((t) => {
      const subject = (t.subject || '').toLowerCase();
      const propTitle = (t.property?.title || t.project?.title || '').toLowerCase();
      const partNames = (t.participants || []).map((p) => (p.name || '').toLowerCase()).join(' ');
      return subject.includes(q) || propTitle.includes(q) || partNames.includes(q);
    });
  }, [threads, searchQuery]);

  // Send reply handler
  async function handleSendReply(e) {
    if (e) e.preventDefault();
    const textToSend = replyText.trim();
    if (!textToSend || !selectedThreadId || sending) return;

    setSending(true);
    try {
      const newMsg = await api(`threads/${selectedThreadId}/messages`, {
        method: 'POST',
        body: { text: textToSend }
      });
      // Append optimistically or with returned message
      const msgItem = {
        _id: newMsg?._id || `temp-${Date.now()}`,
        text: textToSend,
        sender: { _id: user?._id, name: user?.name || 'You', role: user?.role },
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, msgItem]);
      setReplyText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      reloadThreads();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('urbanfindr:notifications-updated'));
      }
    } catch (err) {
      toast(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }

  // Handle enter key to send
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  }

  // Handle delete conversation thread
  async function handleDeleteThread(threadId) {
    if (!threadId) return;
    if (!window.confirm('Delete this conversation thread? All message history will be permanently deleted.')) return;
    try {
      await api(`threads/${threadId}`, { method: 'DELETE' });
      toast('Conversation deleted.');
      if (selectedThreadId === threadId) {
        setSelectedThreadId('');
        setMessages([]);
        setMobileView('list');
      }
      reloadThreads();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('urbanfindr:notifications-updated'));
      }
    } catch (err) {
      toast(err.message || 'Failed to delete conversation.');
    }
  }

  const listingTarget = activeThread?.property || activeThread?.project;
  const listingTitle = activeThread?.property?.title || activeThread?.project?.title || activeThread?.subject || 'Property Inquiry';
  const listingPrice = activeThread?.property?.price || activeThread?.project?.priceMin;
  const listingLocality = [activeThread?.property?.locality, activeThread?.property?.city].filter(Boolean).join(', ');
  const listingUrl = activeThread?.property?._id
    ? `/buy/${activeThread.property._id}`
    : activeThread?.project?._id
    ? `/project/${activeThread.project._id}`
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 flex items-center gap-2">
            <MessageSquare size={22} className="text-[#163e35]" />
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              reloadThreads();
              fetchMessages(false);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 hover:border-stone-300 text-stone-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw size={13} className={threadsLoading ? 'animate-spin text-[#163e35]' : 'text-stone-400'} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Container */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px] max-h-[760px]">
        {/* Left Pane: Threads Sidebar */}
        <div
          className={`md:col-span-5 lg:col-span-4 border-r border-stone-200 flex flex-col bg-stone-50/50 ${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search Bar */}
          <div className="p-3.5 border-b border-stone-200 bg-white">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#163e35] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {threadsLoading && threads.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">Loading conversations…</div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <MessageSquare size={28} className="mx-auto text-stone-300" />
                <p className="text-xs font-semibold text-stone-600">No conversations found</p>
                <p className="text-[11px] text-stone-400 max-w-[200px] mx-auto">
                  When you send or receive a message on a listing, it will be listed here.
                </p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = thread._id === selectedThreadId;
                const other = thread.participants?.find((p) => String(p._id || p) !== String(user?._id)) || thread.participants?.[0];
                const prop = thread.property || thread.project;
                const propThumb = propertyImages(prop)[0];

                return (
                  <div
                    key={thread._id}
                    onClick={() => {
                      setSelectedThreadId(thread._id);
                      setMobileView('chat');
                    }}
                    className={`group w-full text-left p-3.5 transition-all flex items-start gap-3 cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#163e35]/5 border-l-4 border-l-[#163e35]'
                        : 'hover:bg-white bg-transparent border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* Thumbnail or Avatar */}
                    {propThumb ? (
                      <img
                        src={propThumb}
                        alt="Listing"
                        className="w-11 h-11 rounded-xl object-cover shrink-0 border border-stone-200/80 mt-0.5"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        <Building2 size={18} />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-stone-900 truncate">
                          {other?.name || 'Property Contact'}
                        </span>
                        <span className="text-[10px] text-stone-400 shrink-0">
                          {date(thread.updatedAt || thread.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-stone-700 truncate mt-0.5">
                        {thread.property?.title || thread.project?.title || thread.subject || 'Direct Inquiry'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {other?.role && (
                          <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.2 rounded-md bg-stone-200/80 text-stone-600">
                            {other.role.replace('_', ' ')}
                          </span>
                        )}
                        {thread.property?.price ? (
                          <span className="text-[10px] font-semibold text-emerald-800">
                            {money(thread.property.price)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      title="Delete conversation"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteThread(thread._id);
                      }}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0 opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Conversation & Reply Interface */}
        <div
          className={`md:col-span-7 lg:col-span-8 flex flex-col bg-stone-50/20 ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeThread ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 sm:p-4 border-b border-stone-200 bg-white flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setMobileView('list')}
                    className="md:hidden p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                  </button>

                  <div className="w-10 h-10 rounded-full bg-[#ecf2e4] text-[#163e35] flex items-center justify-center font-bold text-xs shrink-0">
                    <User size={18} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-stone-900 truncate">
                        {otherParticipant?.name || 'Discussion'}
                      </h3>
                      {otherParticipant?.role && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#163e35]/10 text-[#163e35] uppercase tracking-wider">
                          {otherParticipant.role.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 truncate flex items-center gap-1.5">
                      <span className="font-semibold text-stone-700">{listingTitle}</span>
                      {listingLocality && <span>• {listingLocality}</span>}
                    </p>
                  </div>
                </div>

                {/* Actions: View Listing & Delete Thread */}
                <div className="flex items-center gap-2 shrink-0">
                  {listingUrl && (
                    <Link
                      href={listingUrl}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <span>View Listing</span>
                      <ExternalLink size={12} />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteThread(activeThread._id)}
                    title="Delete Conversation"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages Feed */}
              <div
                ref={chatContainerRef}
                className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-gradient-to-b from-stone-50/50 to-white"
              >
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center text-xs text-stone-400">
                    <RefreshCw size={16} className="animate-spin text-[#163e35] mr-2" />
                    Loading message history…
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-2">
                    <MessageSquare size={32} className="text-stone-300" />
                    <p className="text-xs font-semibold text-stone-600">No messages in this conversation yet</p>
                    <p className="text-[11px] text-stone-400 max-w-xs">
                      Type your message below to begin the discussion. Both of you will see replies in your dashboards.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = String(msg.sender?._id || msg.sender) === String(user?._id);
                    return (
                      <div
                        key={msg._id || idx}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[10px] font-semibold text-stone-500">
                            {isMe ? 'You' : msg.sender?.name || 'Host'}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {date(msg.createdAt)}
                          </span>
                        </div>
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed break-words shadow-2xs ${
                            isMe
                              ? 'bg-[#163e35] text-white rounded-tr-xs'
                              : 'bg-white text-stone-800 border border-stone-200/80 rounded-tl-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <div className="p-3.5 sm:p-4 border-t border-stone-200 bg-white">
                <form onSubmit={handleSendReply} className="flex items-end gap-2">
                  <div className="relative flex-1">
                    <textarea
                      ref={textareaRef}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      placeholder={`Message ${otherParticipant?.name || 'recipient'}… (Press Enter to send)`}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#163e35] focus:bg-white resize-none max-h-32 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!replyText.trim() || sending}
                    className="h-10 px-4 bg-[#163e35] hover:bg-[#12332c] disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
                  >
                    <Send size={14} className={sending ? 'animate-pulse' : ''} />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-400 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center">
                <MessageSquare size={26} />
              </div>
              <h3 className="text-sm font-bold text-stone-700">Select a conversation</h3>
              <p className="text-xs text-stone-400 max-w-sm">
                Choose a conversation from the left to view messages and reply to buyers, owners, or channel partners.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
