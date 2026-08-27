# Architecture — JobQuest

## System diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Chrome Extension                             │
│  popup.ts → extract job details → POST /jobs → backend             │
│  Stores JWT from extension-token endpoint in chrome.storage        │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Backend (NestJS)                              │
│                                                                     │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────────┐ │
│  │   Auth    │  │  Jobs/Apps   │  │  Quests    │  │ Activities   │ │
│  │Controller │  │  Controller  │  │ Controller │  │ Controller   │ │
│  └────┬─────┘  └──────┬───────┘  └─────┬──────┘  └──────┬───────┘ │
│       │               │                │                 │          │
│       │               └────────┬───────┘                 │          │
│       │                        │                         │          │
│       │                 ┌──────▼──────┐                  │          │
│       │                 │  XpService   │◄─────────────────┘          │
│       │                 │  awardXP()  │                             │
│       │                 └──────┬──────┘                             │
│       │                        │                                    │
│       │                 ┌──────▼──────────┐                         │
│       │                 │ AchievementsSvc  │                        │
│       │                 │ streak + level   │                        │
│       │                 └──────┬──────────┘                         │
│       │                        │                                    │
│       ▼                        ▼                                    │
│  ┌─────────────────────────────────────┐                           │
│  │         Prisma Client               │                           │
│  └──────────────────┬──────────────────┘                           │
└─────────────────────┼───────────────────────────────────────────────┘
                      │
                      ▼
           ┌─────────────────────┐
           │   PostgreSQL (Neon)  │
           │   Connection pooler  │
           │   + direct connect   │
           └─────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        Frontend (React/Vite)                         │
│                                                                     │
│  LandingPage ──(unauthenticated)──► Google OAuth ──► Dashboard     │
│  AppLayout routes:                                                  │
│    /             Dashboard (avatar, XP, streak, activity feed)      │
│    /applications Application board (status transitions)             │
│    /quests       Quest board (create, complete)                     │
│    /achievements Achievement grid                                   │
│    /leaderboard  Ranked friends list                                │
│    /extension-setup  Install guide for the extension                │
│                                                                     │
│  All API calls include credentials (cookie or Bearer token)         │
└─────────────────────────────────────────────────────────────────────┘
                      │
                      │  GET /auth/google → redirect to Google
                      │  GET /auth/google/callback → JWT cookie
                      ▼
              ┌───────────────┐
              │  Google OAuth  │
              │  (consent)     │
              └───────────────┘
```

## Request flow: Applying to a job

This walks through the full cycle — from the extension's "Save Job" button to the frontend showing the XP gain.

### Step 1: Extension saves the job

1. User clicks the extension popup on a LinkedIn/Wuzzuf job page
2. `popup.ts` calls `extract.ts` to pull title, company, location, URL, description
3. Popup sends `POST /jobs` with the extracted data, including the JWT in `Authorization: Bearer` header

### Step 2: Backend processes the save

1. `JobsController.create()` validates the DTO, resolves the user from the JWT
2. `JobsService.create()` checks if a `Job` with this URL already exists
   - If yes: links to the existing job
   - If no: creates a new `Job` row
3. Creates an `Application` row with status `SAVED` (unique per user + job)
4. If the URL already has an `Application` for this user → returns `409 Conflict`
5. Otherwise, calls `XpService.awardXP(userId, JOB_SAVED, 10, { applicationId })`

### Step 3: The awardXP pipeline runs

`awardXP` is the single funnel for all XP. Every trigger goes through it — never directly mutating `user.xp`:

```
awardXP(userId, type, xp, { applicationId?, questId? })
  │
  ├─ 1. Create Activity row (type=JOB_SAVED, xp=10, applicationId)
  │
  ├─ 2. user.xp += 10
  │
  ├─ 3. Recalculate level:
  │     while (user.xp >= xpRequiredForLevel(user.level + 1))
  │       user.level++
  │     → emits leveledUp: true if level changed
  │
  ├─ 4. Update streak:
  │     today = UTC date
  │     if lastActivityDate == today → no change
  │     if lastActivityDate == yesterday → currentStreak++
  │     else → currentStreak = 1 (broken streak restart)
  │     longestStreak = max(longestStreak, currentStreak)
  │
  ├─ 5. Run achievement checks for this activityType:
  │     JOB_SAVED → check "First Hunt" (first-ever save)
  │     → creates UserAchievement if condition met
  │
  └─ 6. Return XpAwardResult:
        { user, xpGained, leveledUp, newAchievements }
```

### Step 4: Response flows back

1. `JobsService` wraps the result into `{ application, xpAward }`
2. Backend returns `201` to the extension
3. Extension shows success state ("Saved!" with the XP gained)
4. Next time the user opens the frontend dashboard, `GET /dashboard` returns the updated user data, recent activities, and new achievements

### Step 5: Frontend animates the gain

If the user has the frontend open when an XP-gain action happens (e.g. status change via the app):
- `xpAward.xpGained` → XP toast slides in ("⚔ +50 XP")
- `xpAward.leveledUp === true` → Level-up modal with avatar tier transition
- `xpAward.newAchievements.length > 0` → Achievement unlock toast

## Auth model

### v1: No-auth convention

Every endpoint operates against a single seeded user. The backend resolves "the current user" via `getSingleUser()` which fetches the one `User` row. No JWT, no user ID in paths.

### Current: Google OAuth + JWT

| Component | Detail |
|---|---|
| Provider | Google OAuth 2.0 via `passport-google-oauth20` |
| Flow | `GET /auth/google` → Google consent → callback issues JWT |
| Token storage | `jq_token` cookie (30-day expiry) for web; `Authorization: Bearer` header for extension |
| JWT payload | `{ sub: user.id }` signed with `JWT_SECRET` |
| User lookup | `jwt.strategy.ts` decodes token, looks up `User` by `id` |
| New users | `authService.upsertGoogleUser()` — finds by `googleId`, links by email, or creates new |
| Extension auth | `GET /auth/extension-token` issues a token the extension stores in `chrome.storage` |

### Auth guards

- `@Public()` decorator → skips auth check (used on OAuth routes)
- `@UseGuards(JwtAuthGuard)` → requires valid JWT (default on all other routes)
- `@UseGuards(GoogleOAuthGuard)` → triggers Google OAuth flow

## Dev vs Production

| Aspect | Development | Production |
|---|---|---|
| **Database** | Neon Postgres (same in both — no local DB) | Neon Postgres |
| **Backend URL** | `http://localhost:3000` | Railway (`https://your-app.railway.app`) |
| **Frontend URL** | `http://localhost:5200` | Vercel (`https://your-app.vercel.app`) |
| **API calls** | Frontend → `VITE_API_URL=http://localhost:3000` | Frontend → `VITE_API_URL=https://your-app.railway.app` |
| **CORS** | `FRONTEND_URL=http://localhost:5200` | `FRONTEND_URL=https://your-app.vercel.app` |
| **Google OAuth redirect** | `http://localhost:3000/auth/google/callback` | `https://your-app.railway.app/auth/google/callback` |
| **Cookie domain** | `localhost` (implicit) | `.your-app.railway.app` |
| **Extension API URL** | `VITE_API_URL=http://localhost:3000` | `VITE_API_URL=https://your-app.railway.app` |
| **Extension auth** | `GET /auth/extension-token` (same endpoint) | Same endpoint, token stored in `chrome.storage` |
| **JWT secret** | `JWT_SECRET` in `.env` (dev value) | `JWT_SECRET` in Railway env vars (strong random) |
| **NODE_ENV** | `development` | `production` |
| **Prisma migrations** | `prisma migrate dev` (local) | `prisma migrate deploy` (Railway build or CI) |
| **Seed data** | `prisma db seed` (manual) | Seed runs in CI or Railway post-deploy hook |
