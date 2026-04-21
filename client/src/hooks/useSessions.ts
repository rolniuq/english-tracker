import { useState, useEffect, useCallback } from 'react';
import { Session } from '../types';

const API_BASE = 'https://english-tracker-api.fly.dev/api';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/sessions`);
      if (!res.ok) throw new Error('Failed to fetch sessions');
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const getSession = useCallback(async (date: string): Promise<Session | null> => {
    try {
      const res = await fetch(`${API_BASE}/sessions/${date}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch session');
      }
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  const saveSession = useCallback(async (date: string, attended: number, isOff: number, notes: string) => {
    const res = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, attended, is_off: isOff, notes })
    });
    if (!res.ok) throw new Error('Failed to save session');
    await fetchSessions();
    return res.json();
  }, [fetchSessions]);

  const deleteSession = useCallback(async (date: string) => {
    const res = await fetch(`${API_BASE}/sessions/${date}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete session');
    await fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    getSession,
    saveSession,
    deleteSession,
    uploadAttachment: async () => {},
    deleteAttachment: async () => {},
    refreshSessions: fetchSessions
  };
}