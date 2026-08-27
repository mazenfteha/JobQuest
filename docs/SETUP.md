# Local Development Setup

Step-by-step guide to run JobQuest on your machine.

## Prerequisites

- **Node.js** 20.x (check with `node -v`)
- **npm** 10.x (check with `npm -v`)
- A **Neon** account (free tier works) for PostgreSQL
- A **Google Cloud** project with OAuth 2.0 credentials

## 1. Clone & install

```bash
git clone https://github.com/your-username/jobquest.git
cd jobquest
npm install
```

This installs all workspace dependencies (backend, frontend, extension, shared package) in one go.

## 2. Set up environment files

### Backend

```bash
cp apps/backend/.env.example apps/backend/.env
```

Fill in every variable. The backend validates all of them at startup and will refuse to start if any are missing.

| Variable | Where to get it |
|---|---|
| `NODE_ENV` | Set to `development` |
| `DATABASE_URL` | Neon dashboard → Connection string (use the pooled URL) |
| `DIRECT_DATABASE_URL` | Neon dashboard → Connection string (use the direct/non-pooled URL — needed by Prisma Migrate) |
| `JWT_SECRET` | Run `openssl rand -hex 32` and paste the output |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → APIs & Credentials → OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | Same page as above |
| `GOOGLE_CALLBACK_URL` | Set to `http://localhost:3000/auth/google/callback` for local dev |
| `FRONTEND_URL` | Set to `http://localhost:5200` |

### Frontend

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

| Variable | Value |
|---|---|
| `VITE_API_URL` | `http://localhost:3000` |

That's the only variable the frontend needs.

## 3. Run database migrations

```bash
npm run prisma:migrate -w apps/backend
```

This creates all tables (User, Job, Application, Quest, Activity, Achievement, Friendship, etc.) in your Neon database.

## 4. Seed achievements

```bash
npm run prisma:seed -w apps/backend
```

Populates the `Achievement` table with the 6 achievements: First Hunt, First Blood, On Fire, Sharp Shooter, Interview Ready, Boss Defeated.

> **Note:** No placeholder user is seeded. Users are created on first Google sign-in.

## 5. Start the apps

In two terminals:

```bash
# Terminal 1 — Backend
npm run dev:backend
# Starts on http://localhost:3000

# Terminal 2 — Frontend
npm run dev:frontend
# Starts on http://localhost:5200
```

Open `http://localhost:5200` in your browser.

## 6. Register localhost OAuth redirect

Google blocks `localhost` redirect URIs by default. You need to add it:

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click your **OAuth 2.0 Client ID**
3. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:3000/auth/google/callback
   ```
4. Click **Save**

> **Tip:** If you see "redirect_uri_mismatch" when signing in, this step was missed or the URI has a typo.

## 7. Sign in

1. Open `http://localhost:5200`
2. Click **Sign in with Google**
3. Authorize the app in the Google consent screen
4. You'll be redirected to the Dashboard — your user is created automatically on first sign-in

## Verify everything works

- Dashboard loads (shows your avatar, Level 1, 0 XP)
- Save a job via the extension or manually — XP toast appears
- Complete a quest — XP awarded, streak updates
- Sign out and back in — data persists

## Running Prisma Studio (optional)

Browse your database visually:

```bash
npm run prisma:studio -w apps/backend
# Opens http://localhost:5555
```

## Troubleshooting

| Problem | Fix |
|---|---|
| Backend won't start with env validation error | Check all 8 required vars in `.env` — even one missing kills the process |
| "redirect_uri_mismatch" on Google sign-in | The callback URL in Google Console must exactly match `http://localhost:3000/auth/google/callback` |
| `DIRECT_DATABASE_URL` vs `DATABASE_URL` | Migrate uses `DIRECT_DATABASE_URL` (no pooler); runtime uses `DATABASE_URL` (pooled). Both are required. |
| Port 3000 already in use | Change the port with `PORT=3001 npm run dev:backend` (update `GOOGLE_CALLBACK_URL` accordingly) |
