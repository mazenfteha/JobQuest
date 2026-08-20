# API Contract — JobQuest

## No-auth convention (v1)

Every endpoint operates against a single seeded user — no `userId` in
paths, params, or bodies. The backend resolves "the current user" via
a helper (`getSingleUser()`) that fetches (or seeds on first boot) the
one `User` row. When real auth is added later, this helper becomes
"resolve user from JWT" and every endpoint below is otherwise unchanged.

## Shared response shape: XpAwardResult

Any endpoint that triggers `awardXP` (see business-logic.md) returns
this envelope, so the frontend/extension always knows exactly what
happened and can animate accordingly:

\`\`\`json
{
  "user": {
    "id": "uuid",
    "xp": 470,
    "level": 4,
    "currentStreak": 3,
    "longestStreak": 5
  },
  "xpGained": 50,
  "leveledUp": false,
  "newAchievements": [
    { "id": "uuid", "key": "first_blood", "title": "First Blood", "description": "...", "icon": "⚔" }
  ]
}
\`\`\`

`leveledUp: true` and/or a non-empty `newAchievements` array is the
frontend's signal to show the level-up modal / achievement toast on
top of the normal XP toast.

---

## Jobs & Applications

### `POST /jobs`
Saves a job and creates its Application in one step (status `SAVED`).
Used by both the extension ("Save Job" button) and the frontend
(manual add). Triggers `awardXP` with `JOB_SAVED`.

Request:
\`\`\`json
{
  "title": "Backend Developer",
  "company": "Company X",
  "location": "Remote",
  "url": "https://...",
  "description": "...",
  "source": "linkedin"
}
\`\`\`

Response: `201`
\`\`\`json
{
  "application": {
    "id": "uuid",
    "status": "SAVED",
    "job": { "id": "uuid", "title": "...", "company": "...", "url": "..." }
  },
  "xpAward": { ...XpAwardResult }
}
\`\`\`
If `url` already exists as a `Job` AND an `Application` already exists
for it → `409 Conflict` (no duplicate saves, no double XP).

### `GET /applications`
List applications, optionally filtered.

Query params: `?status=APPLIED` (optional)

Response: `200`
\`\`\`json
[
  {
    "id": "uuid",
    "status": "APPLIED",
    "appliedAt": "2026-08-16T...",
    "job": { "id": "uuid", "title": "...", "company": "...", "url": "..." }
  }
]
\`\`\`

### `GET /applications/:id`
Single application detail (job + status + timestamps).

### `PATCH /applications/:id/status`
Transitions status per the state machine in business-logic.md.
Triggers `awardXP` with the matching `ActivityType`.

Request: `{ "status": "APPLIED" }`

Response: `200`
\`\`\`json
{
  "application": { "id": "uuid", "status": "APPLIED", "appliedAt": "..." },
  "xpAward": { ...XpAwardResult }
}
\`\`\`
Invalid transition (e.g. skipping a state, or re-setting a terminal
status) → `400` with `{ "message": "Invalid status transition: SAVED -> OFFER" }`.

---

## Activities

### `POST /activities/manual-log`
For `NETWORKING`, `CV_TAILORED`, `COVER_LETTER` — one-off logs, no
state machine, unlimited per day.

Request:
\`\`\`json
{ "type": "NETWORKING", "applicationId": "uuid-or-null" }
\`\`\`

Response: `201` → `{ ...XpAwardResult }`

### `GET /activities`
Recent activity feed, newest first, for the dashboard's "Recent
Quests"-style list.

Query params: `?limit=10` (default 10)

Response: `200`
\`\`\`json
[
  { "id": "uuid", "type": "JOB_APPLIED", "xp": 50, "createdAt": "..." }
]
\`\`\`

---

## Quests (self-created Engineering Growth tasks)

### `POST /quests`
Request:
\`\`\`json
{ "title": "Solve 2 LeetCode mediums", "category": "LEETCODE", "xpReward": 20 }
\`\`\`
Response: `201` → the created Quest, `status: "OPEN"`.

### `GET /quests`
Query params: `?status=OPEN` (optional)
Response: `200` → array of Quest objects.

### `PATCH /quests/:id/complete`
Marks Quest `DONE`, sets `completedAt`, triggers `awardXP` with
`ActivityType` matching the quest's `category`.

Response: `200`
\`\`\`json
{
  "quest": { "id": "uuid", "status": "DONE", "completedAt": "..." },
  "xpAward": { ...XpAwardResult }
}
\`\`\`
Already-`DONE` quest → `400` (no double XP, same principle as
Application transitions).

### `DELETE /quests/:id`
Delete an open quest you no longer want to pursue. Only allowed while
`status: OPEN` — a `DONE` quest is historical record, not deletable
(its Activity already exists).

---

## Achievements

### `GET /achievements`
Full achievement list with unlock status, for the Achievements screen.

Response: `200`
\`\`\`json
[
  {
    "id": "uuid", "key": "first_blood", "title": "First Blood",
    "description": "Apply to your first job", "icon": "⚔",
    "unlocked": true, "unlockedAt": "2026-08-16T..."
  }
]
\`\`\`

---

## Dashboard

### `GET /dashboard`
One call powering the whole dashboard screen — avoids the frontend
making 4–5 requests on load.

Response: `200`
\`\`\`json
{
  "user": { "name": "Hunter", "xp": 420, "level": 4, "currentStreak": 4, "longestStreak": 6 },
  "xpForCurrentLevel": 450,
  "todayProgress": { "applications": 2, "interviews": 1, "xpEarned": 140 },
  "recentActivities": [ { "type": "JOB_APPLIED", "xp": 50, "createdAt": "..." } ],
  "openQuests": [ { "id": "uuid", "title": "...", "category": "LEETCODE", "xpReward": 20 } ],
  "recentAchievements": [ { "key": "on_fire", "title": "On Fire", "icon": "🔥" } ]
}
\`\`\`

---

## Errors

Standard NestJS exception shape throughout:
\`\`\`json
{ "statusCode": 400, "message": "...", "error": "Bad Request" }
\`\`\`