import { useState, useCallback } from 'react';
import { useSessions } from './hooks/useSessions';
import { Calendar } from './components/Calendar';
import { SessionModal } from './components/SessionModal';
import { Session } from './types';
import './App.css';

function App() {
  const { sessions, getSession, saveSession, refreshSessions } = useSessions();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const handleDayClick = useCallback(async (date: string) => {
    setSelectedDate(date);
    const session = await getSession(date);
    setSelectedSession(session);
  }, [getSession]);

  const handleClose = useCallback(() => {
    setSelectedDate(null);
    setSelectedSession(null);
  }, []);

  const handleSave = useCallback(async (attended: number, isOff: number, notes: string) => {
    if (!selectedDate) return;
    await saveSession(selectedDate, attended, isOff, notes);
    handleClose();
    refreshSessions();
  }, [selectedDate, saveSession, refreshSessions, handleClose]);

  return (
    <div className="app">
      <header>
        <h1>English Learning Tracker</h1>
        <p className="subtitle">Ms. Jessica's Class</p>
      </header>
      <main>
        <Calendar sessions={sessions} onDayClick={handleDayClick} />
      </main>

      {selectedDate && (
        <SessionModal
          date={selectedDate}
          session={selectedSession}
          onClose={handleClose}
          onSave={handleSave}
          onUpload={async () => {}}
          onDeleteAttachment={async () => {}}
        />
      )}
    </div>
  );
}

export default App;