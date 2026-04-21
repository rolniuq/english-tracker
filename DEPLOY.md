# English Learning Tracker - Deployment Guide

## STEP 1: Deploy Backend (Render)

1. Go to https://render.com and sign in with GitHub
2. New Web Service → Select `english-tracker` repo
3. Settings:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment: `Node`
4. Add Environment Variable:
   - Key: `PORT`
   - Value: `3001`
5. Click "Create Web Service"
6. Wait 2-3 minutes for deployment
7. **COPY YOUR BACKEND URL** (e.g., `english-tracker-api.onrender.com`)

## STEP 2: Update Frontend Code

Open `client/src/hooks/useSessions.ts` and change line 5:

```javascript
const API_BASE = 'https://YOUR-RENDER-URL.onrender.com';
```

Replace `YOUR-RENDER-URL.onrender.com` with your actual Render URL.

## STEP 3: Commit and Push

```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```

## STEP 4: Deploy Frontend (Vercel)

1. Go to https://vercel.com and sign in with GitHub
2. New Project → Import `english-tracker`
3. Settings (should auto-detect):
   - Framework Preset: `Vite`
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Click "Deploy"

## DONE!

Your English Learning Tracker will be live at your Vercel URL.

---

## Important: SQLite Persistence on Render

⚠️ **Render's free tier sleeps after 15 min of inactivity!**

The database (`english-tracker.db`) will reset when the service sleeps.

**To fix this:**
1. Upgrade to Render paid plan, OR
2. Use a persistent database like Supabase PostgreSQL

For now, if data resets, just re-enter your sessions. This is a known free tier limitation.