"use client";

import { useState, useCallback, useEffect } from "react";
import { Calendar } from "@/components/Calendar";
import { SessionModal } from "@/components/SessionModal";
import type { Session, SessionWithAttachments } from "@/lib/types";

export function TrackerApp() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] =
    useState<SessionWithAttachments | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchSessions() {
      try {
        const res = await fetch("/api/sessions");
        if (!res.ok) throw new Error("Failed to fetch sessions");
        const data = await res.json();
        if (!cancelled) setSessions(data);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchSessions();
    return () => { cancelled = true; };
  }, [fetchTrigger]);

  const refreshSessions = useCallback(() => {
    setFetchTrigger((t) => t + 1);
  }, []);

  const handleDayClick = useCallback(async (date: string) => {
    setSelectedDate(date);
    try {
      const res = await fetch(`/api/sessions/${date}`);
      if (res.ok) {
        const session = await res.json();
        setSelectedSession(session);
      } else {
        setSelectedSession(null);
      }
    } catch {
      setSelectedSession(null);
    }
  }, []);

  const handleClose = useCallback(() => {
    setSelectedDate(null);
    setSelectedSession(null);
  }, []);

  const handleSave = useCallback(
    async (attended: number, isOff: number, notes: string) => {
      if (!selectedDate) return;

      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: selectedDate, attended, is_off: isOff, notes }),
        });

        if (!res.ok) throw new Error("Failed to save session");

        handleClose();
        refreshSessions();
      } catch (error) {
        console.error("Failed to save session:", error);
      }
    },
    [selectedDate, handleClose, refreshSessions]
  );

  if (loading) {
    return (
      <div className="app">
        <header>
          <h1>English Learning Tracker</h1>
          <p className="subtitle">Ms. Jessica&apos;s Class</p>
        </header>
        <main>
          <p style={{ textAlign: "center", padding: "40px" }}>Loading...</p>
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
      </main>

      {selectedDate && (
        <SessionModal
          date={selectedDate}
          session={selectedSession}
          onClose={handleClose}
          onSave={handleSave}
          onRefresh={refreshSessions}
        />
      )}
    </div>
  );
}
