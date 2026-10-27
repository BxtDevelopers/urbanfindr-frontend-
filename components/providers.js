'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export async function api(url, options = {}) {
  let response;
  try {
    response = await fetch(`/api/${url}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      body:
        options.body && !(options.body instanceof FormData) && typeof options.body !== 'string'
          ? JSON.stringify(options.body)
          : options.body,
    });
  } catch {
    throw new Error('The server could not be reached. Check that the backend server is running and try again.');
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`The server returned an unexpected response (${response.status}). Please retry.`);
  }
  if (!response.ok) {
    throw new Error([data.error || 'The request could not be completed.', ...(data.details || [])].join('\n'));
  }
  return data;
}

// Helper to get structured badge info for any account role
export function getRoleMeta(role = 'customer') {
  const normalized = role === 'user' ? 'customer' : role;
  switch (normalized) {
    case 'owner':
      return {
        key: 'owner',
        label: 'Property Owner',
        shortLabel: 'Owner',
        color: '#163e35',
        bgColor: '#e8f5e9',
        borderColor: '#a5d6a7',
        description: 'Direct property owner managing listings & tenant visits',
      };
    case 'broker':
      return {
        key: 'broker',
        label: 'Certified Broker / Agent',
        shortLabel: 'Broker',
        color: '#075985',
        bgColor: '#e0f2fe',
        borderColor: '#7dd3fc',
        description: 'Licensed real estate broker managing multiple property portfolios',
      };
    case 'builder':
      return {
        key: 'builder',
        label: 'Builder / Developer',
        shortLabel: 'Builder',
        color: '#854d0e',
        bgColor: '#fef9c3',
        borderColor: '#fde047',
        description: 'Real estate developer managing projects, configurations & brochures',
      };
    case 'service_provider':
    case 'service-provider':
      return {
        key: 'service_provider',
        label: 'Service Professional',
        shortLabel: 'Service Pro',
        color: '#6b21a8',
        bgColor: '#f3e8ff',
        borderColor: '#d8b4fe',
        description: 'Verified home service & interior design professional',
      };
    case 'admin':
      return {
        key: 'admin',
        label: 'Platform Administrator',
        shortLabel: 'Admin',
        color: '#991b1b',
        bgColor: '#fee2e2',
        borderColor: '#fca5a5',
        description: 'System administrator with platform oversight & review authority',
      };
    case 'customer':
    default:
      return {
        key: 'customer',
        label: 'Customer / Home Seeker',
        shortLabel: 'Customer',
        color: '#374151',
        bgColor: '#f3f4f6',
        borderColor: '#e5e7eb',
        description: 'Looking to buy, rent, book visits or explore home services',
      };
  }
}

const Context = createContext(null);

export function Providers({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState(null);
  const [compare, setCompare] = useState([]);

  const refresh = useCallback(async () => {
    try {
      const data = await api('auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
    try {
      const saved = JSON.parse(localStorage.getItem('urban_compare') || '[]');
      if (Array.isArray(saved)) {
        setCompare(saved.filter((x) => typeof x === 'string' && /^[a-f0-9]{24}$/.test(x)).slice(0, 4));
      }
    } catch {}
  }, [refresh]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  function toggleCompare(id) {
    setCompare((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev;
      if (next === prev) setToast('Compare up to four homes at a time.');
      try {
        localStorage.setItem('urban_compare', JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  // Unified logout action
  const logout = useCallback(async () => {
    try {
      await api('auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout API warning:', e.message);
    } finally {
      setUser(null);
      setToast('You have been logged out.');
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  }, []);

  // Role booleans & helpers
  const role = user?.role || 'guest';
  const isCustomer = !user || role === 'customer' || role === 'user';
  const isOwner = role === 'owner';
  const isBroker = role === 'broker';
  const isBuilder = role === 'builder';
  const isServiceProvider = role === 'service_provider' || role === 'service-provider';
  const isAdmin = role === 'admin';

  // Permission helpers
  const canPostProperty = ['owner', 'broker', 'admin'].includes(role);
  const canPostProject = ['builder', 'admin'].includes(role);
  const canOfferServices = ['service_provider', 'service-provider', 'admin'].includes(role);
  const canManageAll = role === 'admin';

  const hasRole = useCallback(
    (allowedRoles) => {
      if (!user) return false;
      const list = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      // Normalize 'user' and 'customer' as interchangeable
      return list.some((r) => r === role || (r === 'user' && role === 'customer') || (r === 'customer' && role === 'user'));
    },
    [user, role]
  );

  const roleMeta = getRoleMeta(role);

  return (
    <Context.Provider
      value={{
        user,
        ready,
        refresh,
        setUser,
        toast: setToast,
        compare,
        toggleCompare,
        logout,
        role,
        roleMeta,
        isCustomer,
        isOwner,
        isBroker,
        isBuilder,
        isServiceProvider,
        isAdmin,
        canPostProperty,
        canPostProject,
        canOfferServices,
        canManageAll,
        hasRole,
      }}
    >
      {children}
      {toast && (
        <div role="status" className="toast">
          <span className="whitespace-pre-line">{toast}</span>
          <button aria-label="Dismiss message" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      )}
    </Context.Provider>
  );
}

export const useApp = () => useContext(Context);

export function useData(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    if (!url) {
      setData(null);
      setLoading(false);
      return;
    }
    api(url)
      .then((v) => {
        if (active) setData(v);
      })
      .catch((e) => {
        if (active) {
          setData(null);
          setError(e.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [url, version]);

  return { data, error, loading, reload: () => setVersion((v) => v + 1) };
}
