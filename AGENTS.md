# AGENTS.md - Jessica Project

## Project Overview

**English Learning Tracker** - A simple web app for tracking English learning sessions.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **Data Storage**: Upstash Redis (via `@vercel/kv`)

## Project Structure

```
jessica/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Main page
│   │   ├── globals.css          # Global styles
│   │   └── api/
│   │       └── sessions/
│   │           └── route.ts     # GET all, POST save
│   └── components/
│       ├── TrackerApp.tsx       # Main client component + API calls
│       ├── Calendar.tsx         # Calendar grid
│       ├── DayCell.tsx          # Individual day cell
│       └── SessionModal.tsx     # Modal for editing sessions
├── package.json
├── tsconfig.json
└── AGENTS.md                    # This file
```

## Data Format

Stored in Upstash Redis under key `sessions`:
```json
[
  {
    "date": "2024-01-15",
    "attended": 1,
    "is_off": 0,
    "notes": "Practiced vocabulary"
  }
]
```

### Session Fields
- `date`: YYYY-MM-DD format
- `attended`: 1 = learned, 0 = not learned
- `is_off`: 1 = day off, 0 = not off
- `notes`: Free text notes

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions` | Get all sessions |
| POST | `/api/sessions` | Save all sessions |

## Environment Variables

Required (from Upstash Redis integration):
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

These are auto-injected by Vercel when the Upstash Redis integration is installed.

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

## Notes for Future Development

- Data stored in Upstash Redis via `@vercel/kv`
- Works both locally and on Vercel
- No authentication required
