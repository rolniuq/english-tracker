# AGENTS.md - Jessica Project

## Project Overview

**English Learning Tracker** - A simple web app for tracking English learning sessions (study, rest, notes, attachments).

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **Data Storage**: JSON files (no database)

## Project Structure

```
jessica/
├── data/                        # All data stored here
│   ├── sessions.json            # All session records (keyed by date)
│   └── attachments/             # Uploaded files organized by date
│       └── YYYY-MM-DD/
│           ├── index.json       # Attachment metadata
│           └── <files>          # Actual uploaded files
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Main page
│   │   ├── globals.css          # Global styles
│   │   └── api/
│   │       ├── sessions/
│   │       │   ├── route.ts     # GET all, POST create/update
│   │       │   └── [date]/
│   │       │       └── route.ts # GET by date, DELETE
│   │       └── attachments/
│   │           ├── route.ts     # POST upload, DELETE
│   │           └── [id]/
│   │               └── route.ts # GET download, DELETE
│   ├── components/
│   │   ├── TrackerApp.tsx       # Main client component
│   │   ├── Calendar.tsx         # Calendar grid
│   │   ├── DayCell.tsx          # Individual day cell
│   │   └── SessionModal.tsx     # Modal for editing sessions
│   └── lib/
│       ├── types.ts             # TypeScript interfaces
│       └── storage.ts           # File-based data operations
├── package.json
├── tsconfig.json
└── AGENTS.md                    # This file
```

## Data Format

### sessions.json
```json
{
  "2024-01-15": {
    "date": "2024-01-15",
    "attended": 1,
    "is_off": 0,
    "notes": "Practiced vocabulary",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
  }
}
```

### Session Fields
- `date`: YYYY-MM-DD format
- `attended`: 1 = learned, 0 = not learned
- `is_off`: 1 = day off, 0 = not off
- `notes`: Free text notes
- `created_at` / `updated_at`: ISO timestamps

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions` | Get all sessions |
| POST | `/api/sessions` | Create or update session |
| GET | `/api/sessions/[date]` | Get session by date |
| DELETE | `/api/sessions/[date]` | Delete session |
| POST | `/api/attachments` | Upload file (FormData) |
| GET | `/api/attachments/[id]` | Download file |
| DELETE | `/api/attachments/[id]` | Delete file |

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Key Features

1. **Calendar View**: Monthly calendar with color-coded days
   - Green: Learned
   - Orange: Day off
   - Blue: Has notes

2. **Session Management**: Click any day to:
   - Mark as learned or day off
   - Add/edit notes
   - Upload/manage attachments

3. **File Attachments**: Upload files linked to specific dates

## Notes for Future Development

- All data is stored locally in `data/` folder
- No authentication required
- No backend server needed - runs as Next.js app
- Attachments are stored in `data/attachments/YYYY-MM-DD/`
- Sessions are stored in a single JSON file for simplicity
