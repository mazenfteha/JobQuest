# JobQuest Frontend

React 19 + Vite + Tailwind CSS single-page application. Gamified dashboard for tracking job applications, quests, achievements, and leaderboards.

## Scripts

Run from the repo root (npm workspace) or from this directory:

| Command | What it does |
|---|---|
| `npm run dev:frontend` | Start dev server (root) |
| `npm run dev` | Start dev server (this directory) — `http://localhost:5200` |
| `npm run build` | TypeScript compile + Vite production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Oxlint |

## Environment variables

| Variable | Value |
|---|---|
| `VITE_API_URL` | Backend URL — dev: `http://localhost:3000`, prod: `https://your-app.railway.app` |

That's the only env var. The frontend calls the backend directly via this URL (CORS + credentials enabled server-side).

## Specs that govern this app

| Spec | What it defines |
|---|---|
| [specs/ui-spec.md](../../specs/ui-spec.md) | Screens, components, animation guidelines, visual tone |
| [specs/api.md](../../specs/api.md) | Endpoint contracts, request/response shapes |
| [specs/business-logic.md](../../specs/business-logic.md) | XP values, leveling formula, achievement triggers (for display logic) |

## Source structure

```
src/
├── screens/          Route-level page components
│   ├── LandingPage.tsx     Public landing (unauthenticated)
│   ├── Dashboard.tsx       Home — avatar, XP, streak, activity feed
│   ├── Applications.tsx    Job board with status filters
│   ├── QuestBoard.tsx      Self-created quests, daily cap
│   ├── Achievements.tsx    Achievement grid
│   ├── Leaderboard.tsx     Friends ranked by XP
│   └── Join.tsx            Accept friend invite link
│
├── components/       Reusable UI components
│   ├── AvatarCard.tsx      Avatar + name + level badge
│   ├── AvatarTier.tsx      DiceBear avatar with tier frame
│   ├── AvatarPicker.tsx    Choose avatar name/seed
│   ├── XPBar.tsx           Animated XP progress bar
│   ├── StreakBadge.tsx     🔥 streak counter
│   ├── StatCard.tsx        Small stat display
│   ├── ApplicationCard.tsx Job card with status pill
│   ├── QuestCard.tsx       Quest with complete button
│   ├── AchievementCard.tsx Locked/unlocked achievement
│   ├── ActivityRow.tsx     Single activity feed item
│   ├── StatusPill.tsx      Application status badge
│   ├── LevelUpModal.tsx    Level-up celebration overlay
│   ├── XPToast.tsx         XP gain toast notification
│   ├── AchievementToast.tsx  Achievement unlock toast
│   ├── LeaderboardWidget.tsx  Compact leaderboard preview
│   ├── FriendCard.tsx      Friend row in leaderboard
│   ├── InviteFriendModal.tsx  Share invite link
│   └── AcceptFriendModal.tsx  Accept incoming invite
│
├── lib/              Utilities and providers
│   ├── api.ts              Typed API client (fetch wrapper)
│   ├── auth.tsx            AuthProvider + useAuth hook (Google OAuth)
│   ├── theme.tsx           ThemeProvider (dark/light mode)
│   ├── xp.ts               XP calculations (levelForXp, xpForNextLevel)
│   ├── tiers.ts            Avatar tier definitions (level ranges, titles)
│   ├── avatarConfig.ts     DiceBear Notionists avatar config
│   ├── format.ts           Date/number formatting helpers
│   └── useApi.ts           Generic data-fetching hook
│
├── layout/
│   └── AppLayout.tsx       Authenticated shell (sidebar + outlet)
│
├── rewards/
│   └── RewardsProvider.tsx  Global XP toast + level-up + achievement listeners
│
├── App.tsx           Root — ThemeProvider → AuthProvider → Gate → Routes
├── main.tsx          Entry point (StrictMode + BrowserRouter)
└── index.css         Tailwind directives + global styles
```

## Routes

| Path | Component | Auth required |
|---|---|---|
| `/` | Dashboard | Yes |
| `/applications` | Applications | Yes |
| `/quests` | QuestBoard | Yes |
| `/achievements` | Achievements | Yes |
| `/leaderboard` | Leaderboard | Yes |
| `/join` | Join (friend invite) | No |
| `/extension-setup` | Extension install guide | No |

Unauthenticated users see the `LandingPage`. The `Gate` component in `App.tsx` handles this check.

## Key libraries

| Library | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 8 | Dev server + bundler |
| Tailwind CSS 3 | Utility-first styling |
| Framer Motion 13 | XP gain, level-up, and achievement animations |
| react-router-dom 7 | Client-side routing |
| @dicebear/notionists | Generated avatar images (local, no network) |

## Deployment (Vercel)

1. Connect your GitHub repo to Vercel
2. Set **root directory** to `apps/frontend`
3. Set **build command** to `npm run build`
4. Set **output directory** to `dist`
5. Add environment variable: `VITE_API_URL` = `https://your-app.railway.app`
6. Deploy — Vercel auto-detects Vite

**After deploy:** Add your Vercel domain to the backend's `FRONTEND_URL` env var (Railway) so CORS allows requests from it.
