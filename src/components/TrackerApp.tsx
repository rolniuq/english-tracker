"use client";

import { useState, useCallback } from "react";
import { Calendar } from "@/components/Calendar";
import { SessionModal } from "@/components/SessionModal";

export interface Session {
  date: string;
  attended: number;
  is_off: number;
  notes: string;
}

const STORAGE_KEY = "english-tracker-sessions";

function loadSessions(): Session[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : Object.values(parsed);
  } catch {
    return [];
  }
}

function saveSessions(sessions: Session[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function TrackerApp() {
  const [sessions, setSessions] = useState<Session[]>(() => loadSessions());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const refreshSessions = useCallback(() => {
    setSessions(loadSessions());
  }, []);

  const handleDayClick = useCallback((date: string) => {
    setSelectedDate(date);
    const all = loadSessions();
    setSelectedSession(all.find((s) => s.date === date) || null);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedDate(null);
    setSelectedSession(null);
  }, []);

  const handleSave = useCallback(
    (attended: number, isOff: number, notes: string) => {
      if (!selectedDate) return;

      const all = loadSessions();
      const existing = all.findIndex((s) => s.date === selectedDate);
      const updated: Session = { date: selectedDate, attended, is_off: isOff, notes };

      if (existing >= 0) {
        all[existing] = updated;
      } else {
        all.push(updated);
      }
      saveSessions(all);

      handleClose();
      refreshSessions();
    },
    [selectedDate, handleClose, refreshSessions]
  );

  return (
    <div className="app">
      <header>
        <h1>English Learning Tracker</h1>
        <p className="subtitle">Ms. Jessica&apos;s Class</p>
      </header>
      <main>
        <Calendar
          sessions={sessions}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onDayClick={handleDayClick}
        />
      </main>

      {selectedDate && (
        <SessionModal
          key={selectedDate}
          date={selectedDate}
          session={selectedSession}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
