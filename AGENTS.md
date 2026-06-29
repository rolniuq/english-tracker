# AGENTS.md - Jessica Project

## Project Overview

**English Learning Tracker** - A calendar-based web app for tracking English learning sessions (Ms. Jessica's Class).

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4 + Custom CSS (globals.css)
- **Data Storage**: Upstash Redis (via `@vercel/kv` v3)
- **Fonts**: Geist Sans + Geist Mono (via next/font)
- **Linting**: ESLint v9 with eslint-config-next

## Project Structure

```
jessica/
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (imports Geist fonts, globals.css)
│   │   ├── page.tsx               # Entry page → renders <TrackerApp />
│   │   ├── globals.css            # All styles (no Tailwind utils used in components)
│   │   └── api/sessions/route.ts  # GET (read all), POST (replace all)
│   ├── components/
│   │   ├── TrackerApp.tsx         # Root client component — owns state, API calls
│   │   ├── Calendar.tsx           # Calendar grid with prev/next/today nav
│   │   ├── DayCell.tsx            # Individual day cell with color logic
│   │   ├── SessionModal.tsx       # Modal popup for editing a day's session
│   │   └── StatsPanel.tsx         # Stats panel (learned/switched/off counts)
│   └── lib/
│       ├── config.ts              # Config: STUDY_DAYS (getDay() integers)
│       └── types.ts               # Shared Session interface
├── docs/superpowers/              # Design specs & implementation plans
├── AGENTS.md
├── RULES.md                       # Coding conventions & patterns
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── README.md
└── .env.local                     # KV_REST_API_URL, KV_REST_API_TOKEN, etc.
```

## Component Architecture & Data Flow

```
page.tsx
  └── TrackerApp (use client)
        ├── useState: sessions[], currentDate, selectedDate, selectedSession
        ├── useEffect → fetch("/api/sessions") on mount
        ├── Calendar
        │     ├── props: sessions, currentDate, onDateChange, onDayClick
        │     ├── builds day grid (prev month padding + current month + next month padding = 42 cells)
        │     ├── creates sessionMap (Map<string, Session>) for O(1) lookup
        │     └── DayCell × 42
        │           ├── props: date, day, session|null, isCurrentMonth, onClick
        │           ├── reads STUDY_DAYS from config to determine study-day class
        │           └── CSS class priority: other-month > learned > switched > off > has-data > study-day
        ├── StatsPanel
        │     └── props: sessions[]
        │     └── computes learned/switched/off counts
        └── SessionModal (when selectedDate is set)
              ├── props: date, session|null, onClose, onSave
              ├── local state: attended, isSwitched, isOff, notes
              ├── all three statuses are mutually exclusive (toggling one disables the others)
              └── onSave → TrackerApp updates sessions[] + POST /api/sessions
```

### CSS Class Priority (DayCell, in order)

```js
!isCurrentMonth → "other-month"     (grayed out, opacity 0.35)
isLearned       → "learned"         (green)
isSwitched      → "switched"        (amber)
isOff           → "off"             (orange)
hasData (notes) → "has-data"        (blue)
isStudyDay      → "study-day"       (purple)
```

## Session Data Model

```typescript
interface Session {
  date: string;      // "YYYY-MM-DD"
  attended: number;  // 1 = learned, 0 = not learned
  is_off: number;    // 1 = day off, 0 = not off
  is_switched: number; // 1 = switched (study day moved to another day), 0 = not switched
  notes: string;     // free text
}
```

- Stored in Upstash Redis under key `sessions` as a JSON array
- API replaces the entire array on POST (no partial updates)
- `attended=1`, `is_switched=1`, and `is_off=1` are mutually exclusive (enforced in SessionModal)

## API

| Method | Endpoint | Request Body | Response |
|--------|----------|-------------|----------|
| GET | `/api/sessions` | — | `Session[]` |
| POST | `/api/sessions` | `Session[]` | `{ success: true }` |

Both endpoints have error handling (return `[]` on GET failure, no throw on POST).

## Configuration

File: `src/lib/config.ts`
- `STUDY_DAYS`: number[] — array of `getDay()` integers (0=Sun, 1=Mon, ..., 6=Sat)
- Controls which days show purple "study-day" background
- Currently: `[3, 5, 6]` (Wed, Fri, Sat)

## Styling Notes

- No Tailwind CSS utility classes are used directly in components
- All styling via CSS classes in `src/app/globals.css`
- Tailwind v4 is imported via `@import "tailwindcss"` at the top of globals.css
- CSS uses CSS variables (`--background`, `--foreground`) for theming
- Responsive breakpoint at 600px

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

## Environment Variables

| Variable | Source |
|----------|--------|
| `KV_REST_API_URL` | Upstash Redis (Vercel integration auto-injects) |
| `KV_REST_API_TOKEN` | Upstash Redis |
| `KV_REST_API_READ_ONLY_TOKEN` | Upstash Redis |

For local dev, set these in `.env.local`.

## Key Behaviors

1. **Loading state**: TrackerApp shows "Loading..." until data arrives from KV
2. **Empty state**: No special handling — calendar renders with all default colors
3. **Error handling**: Silent catch on both GET and POST (returns `[]` on failure)
4. **Navigation**: Prev/Next buttons + "Today" button in calendar header
5. **SessionModal key prop**: Uses `key={selectedDate}` to force remount on date change
6. **Date handling**: All dates use `"YYYY-MM-DDT00:00:00"` convention to avoid timezone issues
