import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import * as db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;
  fs.appendFileSync(logFile, logEntry);
  console.log(logEntry.trim());
}

const dataDir = process.env.VOLUME_DATA || __dirname;
const uploadsDir = path.join(dataDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  log('INFO', 'Created uploads directory');
}

log('INFO', 'Server starting...');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

const clients = new Set();

function broadcast(event, data) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    res.write(message);
  }
  log('INFO', `Broadcast event: ${event}`, data);
}

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.add(res);
  log('INFO', 'New SSE client connected', { totalClients: clients.size });

  req.on('close', () => {
    clients.delete(res);
    log('INFO', 'SSE client disconnected', { totalClients: clients.size });
  });
});

app.get('/api/sessions', (req, res) => {
  try {
    const sessions = db.getAllSessions();
    log('INFO', 'Fetched all sessions', { count: sessions.length });
    res.json(sessions);
  } catch (error) {
    log('ERROR', 'Failed to fetch sessions', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sessions/:date', (req, res) => {
  try {
    const session = db.getSessionByDate(req.params.date);
    if (!session) {
      log('INFO', 'Session not found', { date: req.params.date });
      return res.status(404).json({ error: 'Session not found' });
    }
    const attachments = db.getAttachmentsBySessionId(session.id);
    log('INFO', 'Fetched session', { date: req.params.date, hasAttachments: attachments.length > 0 });
    res.json({ ...session, attachments });
  } catch (error) {
    log('ERROR', 'Failed to fetch session', { date: req.params.date, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sessions', (req, res) => {
  try {
    const { date, attended, is_off, notes } = req.body;
    if (!date) {
      log('WARN', 'Missing date in request');
      return res.status(400).json({ error: 'Date is required' });
    }
    const session = db.createOrUpdateSession(date, attended || 0, is_off || 0, notes || '');
    log('INFO', 'Session saved', { date, attended, is_off, hasNotes: !!notes });
    broadcast('session-updated', session);
    res.status(201).json(session);
  } catch (error) {
    log('ERROR', 'Failed to save session', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/sessions/:date', (req, res) => {
  try {
    log('INFO', 'Deleting session', { date: req.params.date });
    db.deleteSession(req.params.date);
    broadcast('session-deleted', { date: req.params.date });
    res.status(204).send();
  } catch (error) {
    log('ERROR', 'Failed to delete session', { date: req.params.date, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/attachments/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      log('WARN', 'No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const { date } = req.body;
    if (!date) {
      fs.unlinkSync(req.file.path);
      log('WARN', 'No date provided for attachment');
      return res.status(400).json({ error: 'Date is required' });
    }
    let session = db.getSessionByDate(date);
    if (!session) {
      session = db.createOrUpdateSession(date, 0, 0, '');
      log('INFO', 'Created new session for attachment', { date });
    }
    const attachment = db.createAttachment(
      session.id,
      req.file.originalname,
      req.file.filename,
      req.file.mimetype,
      req.file.size
    );
    log('INFO', 'Attachment uploaded', { date, filename: req.file.originalname, size: req.file.size });
    broadcast('attachment-added', { date, attachment });
    res.status(201).json(attachment);
  } catch (error) {
    log('ERROR', 'Failed to upload attachment', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/attachments/:id/download', (req, res) => {
  try {
    const attachment = db.getAttachmentById(req.params.id);
    if (!attachment) {
      log('WARN', 'Attachment not found', { id: req.params.id });
      return res.status(404).json({ error: 'Attachment not found' });
    }
    const filePath = path.join(uploadsDir, attachment.filepath);
    if (!fs.existsSync(filePath)) {
      log('ERROR', 'File not found on disk', { filepath: attachment.filepath });
      return res.status(404).json({ error: 'File not found on disk' });
    }
    log('INFO', 'Downloading attachment', { id: req.params.id, filename: attachment.filename });
    res.download(filePath, attachment.filename);
  } catch (error) {
    log('ERROR', 'Failed to download attachment', { id: req.params.id, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/attachments/:id', (req, res) => {
  try {
    const attachment = db.getAttachmentById(req.params.id);
    if (attachment) {
      const filePath = path.join(uploadsDir, attachment.filepath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        log('INFO', 'Deleted file from disk', { filepath: attachment.filepath });
      }
      db.deleteAttachment(req.params.id);
      log('INFO', 'Deleted attachment', { id: req.params.id, filename: attachment.filename });
      broadcast('attachment-deleted', { id: parseInt(req.params.id) });
    }
    res.status(204).send();
  } catch (error) {
    log('ERROR', 'Failed to delete attachment', { id: req.params.id, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  log('INFO', `Server running on http://localhost:${PORT}`);
});