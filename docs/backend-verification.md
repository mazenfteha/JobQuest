# Backend Verification & Review Plan

Living checklist for verifying and reviewing the JobQuest backend. It
replaces the one-off curl testing done during Phase 2 and is meant to be
re-run whenever the backend changes. Source-of-truth specs:
`specs/data-model.md`, `specs/business-logic.md`, `specs/api.md`.

## 1. How to run the backend

```bash
# from apps/backend
npm run start:dev          # or: node dist/main.js after a build
npm run build
npm run lint
npx prisma validate
npx prisma migrate status  # should print "up to date"
npx prisma db seed         # idempotent; restores the 6 achievements + User
```

Environment: `.env` must contain `DATABASE_URL` pointing at local Postgres
(already committed as `apps/backend/.env`, gitignored at the root).

## 2. Pre-flight checklist

- [ ] `npm run build` exits 0 (output lands in `dist/main.js`)
- [ ] `npm run lint` exits 0 (no errors, ideally no warnings)
- [ ] `npx prisma validate` reports a valid schema
- [ ] `npx prisma migrate status` reports the DB is up to date
- [ ] Server boots with no red logs; `GET /` returns `Hello World!`
- [ ] `GET /dashboard` returns 200 with the expected shape

## 3. Data-model review (schema.prisma vs specs/data-model.md)

Verify the schema matches the spec exactly:

- [ ] 6 models: `User`, `Job`, `Application`, `Quest`, `Activity`,
      `Achievement`, `UserAchievement` (7 total — one join table)
- [ ] 4 enums: `ApplicationStatus`, `ActivityType`, `QuestCategory`,
      `QuestStatus` with the exact member names from the spec
- [ ] All ids are `String @id @default(uuid())` (no autoincrement ints)
- [ ] `Job.url` is `@unique`
- [ ] `Application` has `@@unique([userId, jobId])`
- [ ] `Activity` holds `applicationId?` and `questId?` (nullable, traceability)
- [ ] `UserAchievement` has `@@unique([userId, achievementId])`
- [ ] `User` fields: `xp`, `level`, `currentStreak`, `longestStreak`,
      `lastActivityDate?` with the spec defaults
- [ ] FK semantics: `Activity` FKs to Application/Quest are `ON DELETE SET NULL`

## 4. Business-logic conformance review

### 4.1 Leveling formula (`src/common/leveling.ts`)
`xpRequiredForLevel(n) = 50 * (n*(n+1)/2 - 1)` for `n >= 2`, else `0`.
Spot-check the canonical values:

- [ ] L2 = 100, L3 = 250, L4 = 450, L5 = 700, L6 = 1000
- [ ] `levelForXp` uses a loop (handles multi-level jumps), e.g.
      xp 700 → level 5, xp 1000 → level 6

### 4.2 awardXP pipeline (`src/xp/xp.service.ts`)
Every XP source must call `XpService.awardXP` — never mutate `user.xp`
directly. The one function must, atomically:

- [ ] Create an `Activity` row (type + xp + optional application/quest id)
- [ ] Increment `user.xp`
- [ ] Recalculate `user.level` via the loop
- [ ] Update streak (`src/common/streak.ts`)
- [ ] Run achievement checks relevant to the activity type
- [ ] Return `XpAwardResult { user, xpGained, leveledUp, newAchievements }`

### 4.3 XP values (must match business-logic.md)
| Trigger | ActivityType | XP |
|---|---|---|
| Save job | JOB_SAVED | 10 |
| Status → APPLIED | JOB_APPLIED | 50 |
| Status → INTERVIEW | INTERVIEW | 100 |
| Status → OFFER | OFFER | 500 |
| Status → REJECTED | REJECTED | 10 |
| Manual log | NETWORKING / CV_TAILORED / COVER_LETTER | 10 (decided) |
| Quest complete | = quest.category | quest.xpReward |

### 4.4 Application state machine (`src/applications/applications.service.ts`)
One-way transitions only; everything else is a 400 (this is what prevents
double-XP):

- [ ] `SAVED → APPLIED` (+50), sets `appliedAt`
- [ ] `APPLIED → {INTERVIEW, REJECTED}`
- [ ] `INTERVIEW → {OFFER, REJECTED}`
- [ ] `OFFER`, `REJECTED` are terminal
- [ ] Skipping states (e.g. SAVED→OFFER) → 400
- [ ] Re-setting a passed/terminal status → 400
- [ ] Error message shape: `Invalid status transition: SAVED -> OFFER`

### 4.5 Streak logic (`src/common/streak.ts`, UTC calendar day)
- [ ] No `lastActivityDate` → streak = 1
- [ ] Same UTC day → unchanged
- [ ] Yesterday → +1
- [ ] Older gap → reset to 1
- [ ] `longestStreak = max(longestStreak, currentStreak)`

### 4.6 Achievements (`src/achievements/achievements.service.ts`)
Only checks relevant to the awarded type run (plus `on_fire` always):

- [ ] `first_hunt` on JOB_SAVED, `first_blood` + `sharp_shooter` on
      JOB_APPLIED, `interview_ready` on INTERVIEW, `boss_defeated` on OFFER
- [ ] `on_fire` when `currentStreak >= 3`
- [ ] `sharp_shooter` when JOB_APPLIED count >= 10
- [ ] No duplicate `UserAchievement` rows (unique guard)
- [ ] Achievements are seeded (not created dynamically)

## 5. API contract verification

### 5.1 Automated script (recommended)
A repeatable assertion script lives at
`apps/backend/scripts/verify-api.mjs`. It starts its own HTTP checks
against a running server on `localhost:3000`, asserts status codes + key
fields + running XP totals, and exits non-zero on any failure.

```bash
# terminal 1
npm run start:dev
# terminal 2
node scripts/verify-api.mjs
```

> It creates jobs/applications/quests/activities (dirtying the dev DB).
> Reset after with `npx prisma migrate reset --force`.

### 5.2 Manual endpoint checklist (when reviewing diffs)
| Endpoint | Expect |
|---|---|
| `POST /jobs` (new url) | 201, application SAVED, `xpAward.xpGained: 10` |
| `POST /jobs` (existing url) | 409 `Job already saved` |
| `GET /applications` (+ `?status=`) | 200 array with `job` |
| `GET /applications/:id` | 200 detail incl. job |
| `PATCH /applications/:id/status` | 200 `{ application, xpAward }` |
| `POST /activities/manual-log` | 201 `XpAwardResult`, +10 |
| `POST /activities/manual-log` (bad type) | 400 |
| `GET /activities?limit=N` | 200 newest-first |
| `POST /quests` | 201, status OPEN |
| `GET /quests` (+ `?status=`) | 200 array |
| `PATCH /quests/:id/complete` | 200 `{ quest, xpAward }` (+xpReward) |
| `PATCH /quests/:id/complete` (again) | 400 |
| `DELETE /quests/:id` (OPEN) | 204 |
| `DELETE /quests/:id` (DONE) | 400 |
| `GET /achievements` | 200, `unlocked`/`unlockedAt` per row |
| `GET /dashboard` | 200, all sections present |

### 5.3 Error shape
All errors use the standard NestJS envelope:
`{ "statusCode", "message", "error" }` (message may be an array for
validation errors).

## 6. Code review checklist (NestJS best practices)

- [ ] Feature modules (Jobs/Applications/Activities/Quests/Achievements/
      Dashboard) — no god services
- [ ] Single source of XP: `XpService.awardXP`; `xp.constants.ts` holds
      the only XP numbers
- [ ] DTOs validated with class-validator on every body/query/param; global
      `ValidationPipe({ whitelist: true, transform: true })` in `main.ts`
- [ ] Interactive `prisma.$transaction` used where multiple writes must be
      atomic (awardXP, POST /jobs)
- [ ] No N+1: relations loaded with `include`, `findFirst` scoped by
      `userId` on multi-tenant-prone queries
- [ ] No circular module imports (XpModule → AchievementsModule is the only
      cross-module dependency)
- [ ] `SingleUserService.getSingleUser()` is the only user-resolution path
      (swap point for real auth later)
- [ ] HTTP exceptions (`BadRequest/NotFound/Conflict`) instead of raw
      Prisma errors; `findFirst` + explicit 404 rather than leaking throws
- [ ] No hardcoded XP/level numbers outside `xp.constants.ts` / specs

## 7. Known simplifications & open items

- [ ] No automated unit/e2e tests yet — `*.spec.ts` files only cover the
      scaffolded `AppController`. Add service-level unit tests (leveling,
      streak, state machine) and e2e `supertest` tests against a test DB.
- [ ] Node v20.16.0 → Prisma pinned to 6.x (skill's 7.x workflow needs
      Node >= 20.19). Upgrade Node and migrate to Prisma 7 when convenient.
- [ ] `package.json#prisma.seed` is deprecated in Prisma 6.19 (works until
      v7); consider moving to `prisma.config.ts` when upgrading.
- [ ] Streak uses UTC calendar day only (per spec, no per-user timezone).
- [ ] Manual-log XP (+10) was decided during build; business-logic.md does
      not state a value — confirm it belongs there.

## 8. Full cleanup / reset

```bash
npx prisma migrate reset --force   # drops schema, replays migrations, reseeds
```
Leaves exactly: 1 User (xp 0, level 1), 6 Achievements, no jobs/
applications/quests/activities.