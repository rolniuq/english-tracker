import { useState, useEffect } from 'react';
import { Session } from '../types';

interface SessionModalProps {
  date: string;
  session: Session | null;
  onClose: () => void;
  onSave: (attended: number, isOff: number, notes: string) => void;
  onUpload?: (file: File) => void;
  onDeleteAttachment?: (id: number) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function SessionModal({
  date,
  session,
  onClose,
  onSave
}: SessionModalProps) {
  const [attended, setAttended] = useState(session?.attended === 1);
  const [isOff, setIsOff] = useState(session?.is_off === 1);
  const [notes, setNotes] = useState(session?.notes || '');

  useEffect(() => {
    setAttended(session?.attended === 1);
    setIsOff(session?.is_off === 1);
    setNotes(session?.notes || '');
  }, [session]);

  const handleSave = () => {
    onSave(attended ? 1 : 0, isOff ? 1 : 0, notes);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{formatDate(date)}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="attendance-section">
            <label>Status:</label>
            <div className="attendance-buttons">
              <button
                className={`attended-btn ${attended ? 'active' : ''}`}
                onClick={() => { setAttended(!attended); if (!attended) setIsOff(false); }}
              >
                Learned
              </button>
              <button
                className={`off-btn ${isOff ? 'active' : ''}`}
                onClick={() => { setIsOff(!isOff); if (!isOff) setAttended(false); }}
              >
                Off
              </button>
            </div>
          </div>

          <div className="notes-section">
            <label>Notes:</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Write your notes here..."
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}