# English Learning Tracker

A calendar-based web app for tracking English learning sessions. Built with Next.js and Upstash Redis.

## Features

- **Calendar View** — Monthly calendar with color-coded days:
  - Green: Learned
  - Orange: Day off
  - Purple: Scheduled study day
  - Blue: Has notes

- **Session Management** — Click any day to mark as learned, day off, or add notes.

- **Study Days Config** — Configure recurring study days in `src/lib/config.ts` (default: Monday, Friday, Saturday).

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **Data Storage**: Upstash Redis (via `@vercel/kv`)

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

Required (from Upstash Redis):

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`
