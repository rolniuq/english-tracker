import express from 'express';
import cors from 'cors';
import * as db from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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
    res.json(session);
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});