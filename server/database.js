import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Use persistent volume if available
const dataDir = process.env.VOLUME_DATA || process.cwd();
const dbPath = path.join(dataDir, 'english-tracker.db');
const backupPath = path.join(dataDir, 'english-tracker-backup.json');

// Create data directory if not exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log('[DB] Using database at:', dbPath);

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

function backupToJson() {
  try {
    const sessions = db.prepare('SELECT * FROM sessions').all();
    const attachments = db.prepare('SELECT * FROM attachments').all();
    const backup = { sessions, attachments, timestamp: new Date().toISOString() };
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    console.log('[BACKUP] Data backed up');
  } catch (err) {
    console.error('[BACKUP] Failed:', err.message);
  }
}

function restoreFromJson() {
  try {
    if (fs.existsSync(backupPath)) {
      const backup = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
      
      if (backup.sessions && backup.sessions.length > 0) {
        const insertSession = db.prepare(`
          INSERT OR REPLACE INTO sessions (date, attended, is_off, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        for (const s of backup.sessions) {
          insertSession.run(s.date, s.attended, s.is_off, s.notes, s.created_at, s.updated_at);
        }
        console.log('[RESTORE] Restored', backup.sessions.length, 'sessions');
      }

      if (backup.attachments && backup.attachments.length > 0) {
        const insertAttachment = db.prepare(`
          INSERT OR REPLACE INTO attachments (session_id, filename, filepath, mimetype, size, uploaded_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        for (const a of backup.attachments) {
          insertAttachment.run(a.session_id, a.filename, a.filepath, a.mimetype, a.size, a.uploaded_at);
        }
        console.log('[RESTORE] Restored', backup.attachments.length, 'attachments');
      }
    }
  } catch (err) {
    console.error('[RESTORE] Failed:', err.message);
  }
}

// Auto-backup every 30 seconds
setInterval(backupToJson, 30000);

// Try to restore on startup
restoreFromJson();

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
    backupToJson();
    return getSessionByDate(date);
  }
  db.prepare(`
    INSERT INTO sessions (date, attended, is_off, notes) VALUES (?, ?, ?, ?)
  `).run(date, attended, isOff, notes);
  backupToJson();
  return getSessionByDate(date);
}

export function deleteSession(date) {
  db.prepare('DELETE FROM sessions WHERE date = ?').run(date);
  backupToJson();
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
  backupToJson();
  return db.prepare('SELECT * FROM attachments WHERE id = ?').get(result.lastInsertRowid);
}

export function getAttachmentById(id) {
  return db.prepare('SELECT * FROM attachments WHERE id = ?').get(id);
}

export function deleteAttachment(id) {
  db.prepare('DELETE FROM attachments WHERE id = ?').run(id);
  backupToJson();
}