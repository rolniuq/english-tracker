# English Learning Tracker - Implementation Plan

## Project Overview
A personal tracker for English classes with Ms. Jessica. Track attendance (learned/off), add notes, and attach files for each session.

## Tech Stack
- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Node.js + Express
- **Database**: SQLite with better-sqlite3
- **File Storage**: Local filesystem (server/uploads folder)

---

## Database Schema

### Table: sessions
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-increment |
| date | TEXT UNIQUE | Date in YYYY-MM-DD format |
| attended | INTEGER | 1 = learned, 0 = not marked |
| is_off | INTEGER | 1 = off day, 0 = normal |
| notes | TEXT | Session notes (nullable) |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |

### Table: attachments
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-increment |
| session_id | INTEGER | Foreign key to sessions.id |
| filename | TEXT | Original filename |
| filepath | TEXT | Path to stored file |
| mimetype | TEXT | File MIME type |
| size | INTEGER | File size in bytes |
| uploaded_at | TEXT | ISO timestamp |

---

## API Endpoints

### Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/sessions | Get all sessions |
| GET | /api/sessions/:date | Get session for specific date |
| POST | /api/sessions | Create or update session |
| DELETE | /api/sessions/:date | Delete session |

### Attachments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/attachments/upload | Upload file (multipart/form-data) |
| GET | /api/attachments/:id/download | Download file |
| DELETE | /api/attachments/:id | Delete attachment |

---

## Frontend Pages & Components

### 1. Calendar Page (Main View)
- Monthly calendar grid showing current month
- Navigation: Previous/Next month buttons
- Day cells display:
  - Date number
  - Color coding: Green (attended), Orange (off), Gray (no class)
- Click on day to open session details

### 2. Session Detail Panel (Modal/Slide-out)
- Shows selected date at top
- Toggle buttons: "Learned" / "Off" / "Not Marked"
- Notes textarea (auto-save or save button)
- Attachments section:
  - List of uploaded files (filename, size, date)
  - Upload button to add new files
  - Delete button per file
  - Click to download

---

## Acceptance Criteria

### Must Have
1. Calendar displays current month with navigable prev/next
2. Clicking a day shows session details
3. Can mark a day as "Learned" (green) or "Off" (orange)
4. Can add text notes for each session
5. Can upload files (any type) to a session
6. Can download uploaded files
7. Can delete uploaded files
8. Data persists in SQLite database
9. Uploaded files stored in server/uploads

---

## Project Structure
```
english-tracker/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Calendar.tsx
│   │   │   ├── DayCell.tsx
│   │   │   ├── SessionModal.tsx
│   │   │   ├── hooks/
│   │   │   └── useSessions.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── server/                    # Express backend
│   ├── uploads/               # Uploaded files directory
│   ├── database.js            # SQLite setup & queries
│   ├── server.js              # Express app & routes
│   └── package.json
│
└── english-tracker.db         # SQLite database file
```

---

## Setup Instructions

### Backend (Terminal 1)
```bash
cd server
npm install
node server.js
```
Server runs on http://localhost:3001

### Frontend (Terminal 2)
```bash
cd client
npm install
npm run dev
```
Client runs on http://localhost:5173

---

## Key Implementation Notes

1. **Date Format**: Use YYYY-MM-DD consistently (e.g., "2026-04-21")
2. **File Upload**: Use multer middleware with storage to server/uploads/
3. **CORS**: Enable CORS on backend for frontend origin http://localhost:5173
4. **Auto-create**: Server creates uploads/ folder and database on startup
5. **Error Handling**: Return proper HTTP status codes (200, 201, 400, 404, 500)
6. **File Security**: Validate file types/sizes, sanitize filenames