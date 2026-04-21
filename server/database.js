import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

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

  CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    mimetype TEXT DEFAULT '',
    size INTEGER DEFAULT 0,
    uploaded_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );
`);

export function getSessionByDate(date) {
  return db.prepare('SELECT * FROM sessions WHERE date = ?').get(date);
}

export function getAllSessions() {
  return db.prepare('SELECT * FROM sessions ORDER BY date DESC').all();
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

export function getAttachmentsBySessionId(sessionId) {
  return db.prepare('SELECT * FROM attachments WHERE session_id = ? ORDER BY uploaded_at DESC').all(sessionId);
}

export function createAttachment(sessionId, filename, filepath, mimetype, size) {
  const stmt = db.prepare(`
    INSERT INTO attachments (session_id, filename, filepath, mimetype, size)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(sessionId, filename, filepath, mimetype, size);
  return db.prepare('SELECT * FROM attachments WHERE id = ?').get(result.lastInsertRowid);
}

export function getAttachmentById(id) {
  return db.prepare('SELECT * FROM attachments WHERE id = ?').get(id);
}

export function deleteAttachment(id) {
  return db.prepare('DELETE FROM attachments WHERE id = ?').run(id);
}

export function getSessionIdByDate(date) {
  const session = getSessionByDate(date);
  return session ? session.id : null;
}