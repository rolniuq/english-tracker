# English Learning Tracker - Deployment Guide

## Frontend (Vercel) ✅ DONE

Frontend is deployed at: **https://client-lovat-phi-40.vercel.app**

---

## STEP 1: Deploy Backend (Render) - DO THIS NOW

1. Go to https://render.com → Sign in with GitHub
2. **New Web Service** → Select `english-tracker` repo
3. Settings:
   - Name: `english-tracker-api`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment: `Node`
4. Add Environment Variable:
   - Key: `PORT` → Value: `3001`
5. Click **Create Web Service**
6. Wait ~3 min for deployment
7. **COPY YOUR BACKEND URL** (e.g., `english-tracker-api.onrender.com`)

---

## STEP 2: Update Frontend Code

After Render deploys, open `client/src/hooks/useSessions.ts` and change line 5:

```javascript
// From:
const API_BASE = 'https://YOUR-RENDER-URL.onrender.com';

// To your actual URL, e.g.:
const API_BASE = 'https://english-tracker-api.onrender.com';
```

---

## STEP 3: Push Updated Code

```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```

Vercel will auto-redeploy!

---

## DONE! 🚀

Your app will be live at the Vercel URL.

---

## Important: SQLite on Render

⚠️ **Render's free tier sleeps after 15 min!**

Data will reset when service sleeps. This is a free tier limitation.