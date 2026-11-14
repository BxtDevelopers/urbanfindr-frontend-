'use client';

// Lightweight, resilient native WebSocket client for UrbanFinder Real-Time Chat & Notifications
class RealtimeClient {
  constructor() {
    this.ws = null;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.maxReconnectDelay = 10000;
    this.activeSubscriptions = new Set();
    this.listeners = new Map(); // event -> Set of callbacks
    this.currentUserId = null;
    this.currentThreadId = null;
  }

  getWsUrl() {
    if (typeof window === 'undefined') return '';
    if (process.env.NEXT_PUBLIC_WS_URL) {
      return process.env.NEXT_PUBLIC_WS_URL;
    }
    const loc = window.location;
    const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
    // If running with Express backend on 5000, fallback to port 5000; otherwise use host
    const port = loc.port === '3000' ? '5000' : (loc.port ? loc.port : (protocol === 'wss:' ? '443' : '80'));
    return `${protocol}//${loc.hostname}:${port}`;
  }

  connect(userId) {
    if (typeof window === 'undefined') return;
    if (userId) this.currentUserId = userId;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const url = this.getWsUrl();
      if (!url) return;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        // Re-join rooms
        if (this.currentUserId) {
          this.send({ type: 'join_user', userId: this.currentUserId });
        }
        if (this.currentThreadId) {
          this.send({ type: 'join_thread', threadId: this.currentThreadId });
        }
        this.emit('connected', { ok: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.type) {
            this.emit(data.type, data.payload || data);
          }
        } catch (err) {
          console.warn('[WS] Parse message error:', err);
        }
      };

      this.ws.onclose = () => {
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        // Ignored; onclose will handle reconnect
      };
    } catch (err) {
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), this.maxReconnectDelay);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  joinThread(threadId) {
    this.currentThreadId = threadId;
    if (threadId) {
      this.send({ type: 'join_thread', threadId });
    }
  }

  leaveThread(threadId) {
    if (this.currentThreadId === threadId) {
      this.currentThreadId = null;
    }
    if (threadId) {
      this.send({ type: 'leave_thread', threadId });
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback);
      if (set.size === 0) this.listeners.delete(event);
    }
  }

  emit(event, data) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error('[WS] Listener error:', e);
        }
      });
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const realtime = new RealtimeClient();
