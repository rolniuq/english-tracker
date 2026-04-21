import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'english-tracker.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE NOT NULL,
    attended INTEGER DEFAULT 0,
    is_off INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

export function getAllSessions() {
  return db.prepare('SELECT * FROM sessions ORDER BY date DESC').all();
}

export function getSessionByDate(date) {
  return db.prepare('SELECT * FROM sessions WHERE date = ?').get(date);
}

export function createOrUpdateSession(date, attended = 0, isOff = 0, notes = '') {
  const existing = getSessionByDate(date);
  if (existing) {
    db.prepare(`
      UPDATE sessions SET attended = ?, is_off = ?, notes = ?, updated_at = datetime('now')
      WHERE date = ?
    `).run(attended, isOff, notes, date);
    return getSessionByDate(date);
  }
  return db.prepare(`
    INSERT INTO sessions (date, attended, is_off, notes) VALUES (?, ?, ?, ?)
  `).run(date, attended, isOff, notes) && getSessionByDate(date);
}

export function deleteSession(date) {
  return db.prepare('DELETE FROM sessions WHERE date = ?').run(date);
}