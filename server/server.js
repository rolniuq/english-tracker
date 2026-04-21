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

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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

app.get('/api/sessions', (req, res) => {
  try {
    const sessions = db.getAllSessions();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sessions/:date', (req, res) => {
  try {
    const session = db.getSessionByDate(req.params.date);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const attachments = db.getAttachmentsBySessionId(session.id);
    res.json({ ...session, attachments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sessions', (req, res) => {
  try {
    const { date, attended, is_off, notes } = req.body;
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    const session = db.createOrUpdateSession(date, attended || 0, is_off || 0, notes || '');
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/sessions/:date', (req, res) => {
  try {
    db.deleteSession(req.params.date);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/attachments/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const { date } = req.body;
    if (!date) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Date is required' });
    }
    let session = db.getSessionByDate(date);
    if (!session) {
      session = db.createOrUpdateSession(date, 0, 0, '');
    }
    const attachment = db.createAttachment(
      session.id,
      req.file.originalname,
      req.file.filename,
      req.file.mimetype,
      req.file.size
    );
    res.status(201).json(attachment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/attachments/:id/download', (req, res) => {
  try {
    const attachment = db.getAttachmentById(req.params.id);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    const filePath = path.join(uploadsDir, attachment.filepath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }
    res.download(filePath, attachment.filename);
  } catch (error) {
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
      }
      db.deleteAttachment(req.params.id);
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});