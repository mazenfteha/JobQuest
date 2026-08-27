# JobQuest Backend

NestJS API server with Prisma ORM, PostgreSQL (Neon), Google OAuth, and JWT authentication.

## Scripts

Run from the repo root (npm workspace) or from this directory:

| Command | What it does |
|---|---|
| `npm run dev:backend` | Start in watch mode (root) |
| `npm run start:dev` | Start in watch mode (this directory) |
| `npm run start:prod` | Start compiled production build |
| `npm run build` | `prisma generate` + `nest build` |
| `npm run prisma:migrate` | Run Prisma migrations against dev database |
| `npm run prisma:seed` | Seed achievements table |
| `npm run prisma:studio` | Open Prisma Studio (visual DB browser) |
| `npm run lint` | ESLint + Prettier |
| `npm run test` | Unit tests (Jest) |
| `npm run test:e2e` | End-to-end tests |

## Environment variables

All required — backend refuses to start if any are missing. See `.env.example` for the full template.

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `DATABASE_URL` | Neon pooled connection string (runtime queries) |
| `DIRECT_DATABASE_URL` | Neon direct connection string (Prisma Migrate only) |
| `JWT_SECRET` | Random hex for signing JWTs (`openssl rand -hex 32`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL (dev: `http://localhost:3000/auth/google/callback`) |
| `FRONTEND_URL` | Frontend origin for CORS (dev: `http://localhost:5200`) |
| `PORT` | Server port (default: `3000`) |

## Specs that govern this app

| Spec | What it defines |
|---|---|
| [specs/data-model.md](../../specs/data-model.md) | Prisma schema, enums, relations |
| [specs/business-logic.md](../../specs/business-logic.md) | XP awards, leveling formula, streak logic, achievement triggers |
| [specs/api.md](../../specs/api.md) | All endpoint contracts, request/response shapes |

## Source structure

```
src/
├── auth/           Google OAuth + JWT guards, strategy, controller
├── jobs/           POST /jobs — save job + create application
├── applications/   GET/PATCH applications, status transitions
├── activities/     Manual activity logging
├── quests/         CRUD + completion for self-created quests
├── achievements/   Achievement checks and listing
├── dashboard/      GET /dashboard — aggregated view
├── friends/        Invite/accept friend links
├── leaderboard/    Ranked friend list by XP
├── xp/             awardXP pipeline — single funnel for all XP
├── prisma/         PrismaService (global module)
├── config/         Env validation (class-validator)
└── common/         getSingleUser() helper, shared utilities
```

## Deployment (Railway)

1. Create a new Railway project
2. Add a **PostgreSQL** plugin (or connect your Neon database)
3. Set all environment variables in Railway's dashboard
4. Set the **root directory** to `apps/backend`
5. Railway auto-detects NestJS and runs `npm run build && npm run start:prod`

**Prisma migrations in production:**

Add a build step or post-deploy hook:

```bash
npx prisma migrate deploy
npx prisma db seed
```

Or run `prisma migrate deploy` as a one-off Railway job.

**CORS:** Set `FRONTEND_URL` to your Vercel domain (e.g. `https://your-app.vercel.app`).

## API overview

| Method | Path | Description |
|---|---|---|
| `GET` | `/auth/google` | Redirect to Google OAuth |
| `GET` | `/auth/google/callback` | OAuth callback, sets JWT cookie |
| `GET` | `/auth/me` | Current user profile |
| `POST` | `/auth/logout` | Clear session |
| `GET` | `/auth/extension-token` | JWT for browser extension |
| `POST` | `/jobs` | Save a job + create application |
| `GET` | `/applications` | List applications (optional `?status=` filter) |
| `GET` | `/applications/:id` | Single application detail |
| `PATCH` | `/applications/:id/status` | Transition application status |
| `POST` | `/activities/manual-log` | Log networking, CV, cover letter |
| `GET` | `/activities` | Recent activity feed |
| `POST` | `/quests` | Create a quest |
| `GET` | `/quests` | List quests (optional `?status=` filter) |
| `PATCH` | `/quests/:id/complete` | Complete a quest |
| `DELETE` | `/quests/:id` | Delete an open quest |
| `GET` | `/achievements` | All achievements with unlock status |
| `GET` | `/dashboard` | Aggregated dashboard data |
| `POST` | `/friends/invite` | Generate invite link |
| `POST` | `/friends/accept/:code` | Accept friend invite |
| `GET` | `/leaderboard` | Friends ranked by XP |
