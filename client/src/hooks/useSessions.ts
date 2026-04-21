import { useState, useEffect, useCallback } from 'react';
import { Session, Attachment } from '../types';

interface SessionData extends Session {
  attachments: Attachment[];
}

const STORAGE_KEY = 'english_tracker_sessions';

function loadFromStorage(): SessionData[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage(sessions: SessionData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const data = loadFromStorage();
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

  const getSession = useCallback(async (date: string): Promise<SessionData | null> => {
    const all = loadFromStorage();
    return all.find(s => s.date === date) || null;
  }, []);

  const saveSession = useCallback(async (date: string, attended: number, isOff: number, notes: string) => {
    const all = loadFromStorage();
    const existingIndex = all.findIndex(s => s.date === date);
    
    const now = new Date().toISOString();
    if (existingIndex >= 0) {
      all[existingIndex] = { ...all[existingIndex], attended, is_off: isOff, notes, updated_at: now };
    } else {
      all.push({
        id: Date.now(),
        date,
        attended,
        is_off: isOff,
        notes,
        created_at: now,
        updated_at: now,
        attachments: []
      });
    }
    
    saveToStorage(all);
    setSessions(all);
    return all[existingIndex >= 0 ? existingIndex : all.length - 1];
  }, []);

  const deleteSession = useCallback(async (date: string) => {
    const all = loadFromStorage().filter(s => s.date !== date);
    saveToStorage(all);
    setSessions(all);
  }, []);

  const uploadAttachment = useCallback(async (date: string, file: File) => {
    const all = loadFromStorage();
    const existingIndex = all.findIndex(s => s.date === date);
    
    const attachment: Attachment = {
      id: Date.now(),
      session_id: existingIndex >= 0 ? all[existingIndex].id : 0,
      filename: file.name,
      filepath: '', // In localStorage mode, we'd need to store file data
      mimetype: file.type,
      size: file.size,
      uploaded_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      if (!all[existingIndex].attachments) all[existingIndex].attachments = [];
      all[existingIndex].attachments.push(attachment);
    } else {
      all.push({
        id: Date.now(),
        date,
        attended: 0,
        is_off: 0,
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        attachments: [attachment]
      });
    }
    
    saveToStorage(all);
    setSessions(all);
    return attachment;
  }, []);

  const deleteAttachment = useCallback(async (id: number) => {
    const all = loadFromStorage();
    for (const session of all) {
      if (session.attachments) {
        session.attachments = session.attachments.filter(a => a.id !== id);
      }
    }
    saveToStorage(all);
    setSessions(all);
  }, []);

  return {
    sessions,
    loading,
    error,
    getSession,
    saveSession,
    deleteSession,
    uploadAttachment,
    deleteAttachment,
    refreshSessions: fetchSessions
  };
}