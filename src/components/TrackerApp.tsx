"use client";

import { useState, useCallback, useEffect } from "react";
import type { Session } from "@/lib/types";
import { Calendar } from "@/components/Calendar";
import { SessionModal } from "@/components/SessionModal";
import { StatsPanel } from "@/components/StatsPanel";

async function loadSessions(): Promise<Session[]> {
  try {
    const res = await fetch("/api/sessions");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function saveSessions(sessions: Session[]): Promise<void> {
  await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sessions),
  });
}

export function TrackerApp() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    loadSessions().then((data) => {
      setSessions(data);
      setLoading(false);
    });
  }, []);

  const handleDayClick = useCallback(
    (date: string) => {
      setSelectedDate(date);
      setSelectedSession(sessions.find((s) => s.date === date) || null);
    },
    [sessions]
  );

  const handleClose = useCallback(() => {
    setSelectedDate(null);
    setSelectedSession(null);
  }, []);

  const handleSave = useCallback(
    async (attended: number, isOff: number, isSwitched: number, notes: string) => {
      if (!selectedDate) return;

      const existing = sessions.findIndex((s) => s.date === selectedDate);
      const updated: Session = { date: selectedDate, attended, is_off: isOff, is_switched: isSwitched, notes };

      const newSessions =
        existing >= 0
          ? sessions.map((s, i) => (i === existing ? updated : s))
          : [...sessions, updated];

      setSessions(newSessions);
      await saveSessions(newSessions);
      handleClose();
    },
    [selectedDate, sessions, handleClose]
  );

  if (loading) {
    return (
      <div className="app">
        <header>
          <h1>English Learning Tracker</h1>
          <p className="subtitle">Ms. Jessica&apos;s Class</p>
        </header>
        <main>
          <p className="loading-text">Loading...</p>
        </main>
      </div>
    );
  }

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
        <StatsPanel sessions={sessions} />
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
