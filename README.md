# English Learning Tracker

A personal tracker for English classes with Ms. Jessica. Track attendance, take notes, and attach files for each session.

## Features

- 📅 **Calendar View** - See your learning schedule at a glance
- ✅ **Attendance Tracking** - Mark days as "Learned" or "Off"
- 📝 **Notes** - Write notes for each session
- 📎 **Attachments** - Upload files (images, PDFs, documents)
- 💾 **Persistent Storage** - All data saved in database

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite
- **Deployment**: Vercel + Render (free tiers)

## Local Development

### Prerequisites
- Node.js 18+

### Setup

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Run

```bash
# Terminal 1 - Start backend
cd server
node server.js
# → Server runs on http://localhost:3001

# Terminal 2 - Start frontend
cd client
npm run dev
# → Client runs on http://localhost:5173
```

## Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

### Quick Steps

1. **Backend** → Deploy to [Render](https://render.com)
2. **Frontend** → Deploy to [Vercel](https://vercel.com)
3. Update `client/src/hooks/useSessions.ts` with your Render URL

## Project Structure

```
english-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── hooks/         # Custom hooks
│   │   └── types/        # TypeScript types
│   └── dist/             # Production build
├── server/                # Express backend
│   ├── uploads/          # Uploaded files
│   ├── database.js       # SQLite setup
│   └── server.js         # API routes
└── DEPLOY.md            # Deployment guide
```

## License

MIT