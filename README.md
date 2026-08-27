# JobQuest

Gamified job search tracker. Turn your job hunt into an RPG — earn XP for every application, level up, unlock achievements, and compete with friends.

## What it does

- **Save & track jobs** from LinkedIn and Wuzzuf via a Chrome extension, or manually in the web app
- **Log activities** — applications, interviews, networking, CV tailoring — each earns XP
- **Level up** with a scaling XP curve (L2 = 100 XP, L10 = 2 750 XP, scales forever)
- **Complete quests** you create yourself (daily cap: 5)
- **Unlock achievements** for milestones like your first application or a 3-day streak
- **Compete on a leaderboard** with friends via invite links
- **Browser extension** extracts job details with one click — no copy-pasting

## Repo structure

```
jobquest/
├── apps/
│   ├── backend/        NestJS API + Prisma ORM → PostgreSQL (Neon)
│   ├── frontend/       React + Vite + Tailwind CSS
│   └── extension/      Chrome MV3 extension (Vite + @crxjs)
├── packages/
│   └── shared/         Shared types & constants
├── specs/              Design documents (source of truth)
│   ├── data-model.md   Prisma schema & ERD
│   ├── business-logic.md  XP, leveling, streaks, achievements
│   ├── api.md          Endpoint contracts
│   └── ui-spec.md      Screens, components, animations
├── docs/               Architecture & setup guides
│   ├── ARCHITECTURE.md
│   └── SETUP.md
└── AGENTS.md           AI agent conventions
```

## Quick start

```bash
# 1. Clone
git clone https://github.com/your-username/jobquest.git
cd jobquest

# 2. Install (npm workspaces)
npm install

# 3. Set up env files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
# Fill in real values — see docs/SETUP.md

# 4. Run migrations + seed
npm run prisma:migrate -w apps/backend
npm run prisma:seed -w apps/backend

# 5. Start both apps
npm run dev:backend   # → http://localhost:3000
npm run dev:frontend  # → http://localhost:5200
```

Full setup walkthrough: [docs/SETUP.md](docs/SETUP.md)

## Docs

| Document | What it covers |
|---|---|
| [specs/data-model.md](specs/data-model.md) | Prisma schema, enums, relations |
| [specs/business-logic.md](specs/business-logic.md) | XP awards, leveling formula, streaks, achievements |
| [specs/api.md](specs/api.md) | All endpoint contracts & response shapes |
| [specs/ui-spec.md](specs/ui-spec.md) | Screens, components, animation guidelines |
| [specs/extension-spec.md](specs/extension-spec.md) | Extension extraction strategy & popup states |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System diagram, request flow, auth model |
| [docs/SETUP.md](docs/SETUP.md) | Local dev environment setup |

## Deployed URLs

| App | URL |
|---|---|
| Frontend | [https://job-quest-frontend-pi.vercel.app/](https://your-app.vercel.app) |
|
| Extension | [Extension Setup Guide](/extension-setup) |

## App-specific READMEs

- [Backend](apps/backend/README.md) — API scripts, env vars, deployment to Railway
- [Frontend](apps/frontend/README.md) — UI scripts, env vars, deployment to Vercel
- [Extension](apps/extension/README.md) — Build from source, install for end users

## Tech stack

- **Backend:** NestJS, Prisma, PostgreSQL (Neon), Passport (Google OAuth + JWT)
- **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion, react-router-dom
- **Extension:** Chrome MV3, TypeScript, @crxjs/vite-plugin
- **Monorepo:** npm workspaces

## License

ISC
