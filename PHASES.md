# PHASES.md — JobQuest Build Roadmap

Update the corresponding Notion project page's Status property when a
phase completes: https://app.notion.com/p/3be8e377fd61813e94a6cf4e0b5d2a43

## Phase 0 — Specs & Scaffolding ✅
- [x] Monorepo scaffolded (npm workspaces: apps/backend, apps/frontend, apps/extension, packages/shared)
- [x] AGENTS.md / CLAUDE.md set up
- [x] specs/data-model.md
- [x] specs/business-logic.md
- [x] specs/api.md
- [ ] specs/ui-spec.md (write before Phase 3)
- [ ] specs/extension-spec.md (write before Phase 5)

## Phase 1 — Backend Foundation
- [x] Prisma schema implemented from specs/data-model.md
- [x] Initial migration run against local Postgres
- [x] Prisma seed script (Achievements table populated, single User row seeded)
- [x] Base NestJS module structure (Jobs, Applications, Activities, Quests, Achievements, Dashboard)
- [x] `getSingleUser()` helper in place (no-auth convention from api.md)

## Phase 2 — Backend Core Logic
- [x] `awardXP` pipeline implemented (single function, per business-logic.md)
- [x] Leveling formula + level-up detection
- [x] Streak logic
- [x] `POST /jobs` (save job + create Application, JOB_SAVED XP)
- [x] `GET /applications`, `GET /applications/:id`
- [x] `PATCH /applications/:id/status` (state machine + XP per transition)
- [x] `POST /activities/manual-log`, `GET /activities`
- [x] `POST /quests`, `GET /quests`, `PATCH /quests/:id/complete`, `DELETE /quests/:id`
- [x] `GET /achievements`
- [x] `GET /dashboard`
- [x] Achievement-check logic wired into `awardXP`
- [x] Manual verification of every endpoint (curl/Postman) against api.md contracts

## Phase 3 — Frontend Foundation
- [x] specs/ui-spec.md written
- [x] API client set up (typed against api.md responses)
- [x] Dashboard shell with mock data
- [x] Job list / application board shell
- [x] Quest board shell
- [x] Achievements screen shell

## Phase 4 — Frontend Live + Polish
- [ ] Dashboard wired to real `GET /dashboard`
- [ ] Application status changes wired to `PATCH /applications/:id/status`
- [ ] Quest create/complete wired to real endpoints
- [ ] XP-gain toast animation (Framer Motion)
- [ ] Level-up modal
- [ ] Achievement-unlock toast
- [ ] Avatar reflects current level

## Phase 5 — Browser Extension
- [ ] specs/extension-spec.md written (target sites, field extraction, fallback behavior)
- [ ] Manifest (MV3) + permissions
- [ ] Popup UI ("Save Job" button)
- [ ] Field extraction per target site
- [ ] POST to `/jobs`, handle 409 (already saved) gracefully
- [ ] Loaded unpacked locally, tested against at least LinkedIn + one other site

## Phase 6 — Deploy & Wire Up
- [ ] Backend deployed to Railway (Postgres plugin, env vars, root dir set)
- [ ] Frontend deployed to Vercel (root dir set, VITE_API_URL configured)
- [ ] CORS allow-list: Vercel domain + extension origin
- [ ] Extension pointed at deployed backend URL
- [ ] Full loop tested end-to-end against deployed infra: save → apply → status change → XP/level/achievement all correct