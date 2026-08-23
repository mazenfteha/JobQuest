# Business Logic — JobQuest

## Leveling formula

Rather than a hardcoded table, XP-to-level uses a closed-form formula so
it scales past whatever level you eventually reach:

    xpRequiredForLevel(n) = 50 * (n*(n+1)/2 - 1)   for n >= 2
    xpRequiredForLevel(1) = 0

Examples: L2=100, L3=250, L4=450, L5=700, L6=1000 — matches the original
MVP table, extends indefinitely without new hardcoded entries.

`User.level` is recalculated every time XP is awarded: loop while
`user.xp >= xpRequiredForLevel(user.level + 1)`, increment level. (Loop,
not a single `if`, in case a big XP award — e.g. an Offer at +500 —
jumps more than one level at once.)

## The single XP-award pipeline

Every source of XP (application status change, manual log, quest
completion) funnels through **one function** — do not duplicate this
logic per trigger:

    awardXP(userId, activityType, xp, { applicationId?, questId? })
          ↓
    1. Create Activity row (type, xp, applicationId?, questId?)
    2. user.xp += xp
    3. Recalculate level (loop, see above) → emit LEVEL_UP if changed
    4. Update streak (see below)
    5. Run achievement checks relevant to this activityType (see below)
    6. Return updated user + any newly unlocked achievements + level-up flag

Every endpoint that grants XP calls this — it never manipulates
`user.xp` directly.

## Streak logic

On every `awardXP` call:

    today = current UTC calendar date
    if user.lastActivityDate is null:
        currentStreak = 1
    else if user.lastActivityDate == today:
        currentStreak unchanged  (already logged something today)
    else if user.lastActivityDate == yesterday:
        currentStreak += 1
    else:
        currentStreak = 1        (streak broken, restart)

    longestStreak = max(longestStreak, currentStreak)
    lastActivityDate = today

UTC calendar day for v1 — no per-user timezone handling yet (flag as a
known simplification, not a bug, if it ever comes up).

## Application status flow

Status is a **one-way state machine** — this also prevents double-XP:

    SAVED → APPLIED → { INTERVIEW, REJECTED }
    INTERVIEW → { OFFER, REJECTED }
    OFFER, REJECTED = terminal (no further transitions)

Each *first-time* transition into a status calls `awardXP` with the
matching type:

    SAVED      → JOB_SAVED     +10
    APPLIED    → JOB_APPLIED   +50
    INTERVIEW  → INTERVIEW     +100
    OFFER      → OFFER         +500
    REJECTED   → REJECTED      +10   (never negative — this is a design
                                       principle, not just a default)

Attempting an invalid transition (e.g. SAVED → OFFER, or re-setting an
already-passed status) is rejected by the API with a 400 — this is the
mechanism that prevents double-awarding XP, not a separate idempotency
check.

## Manual-log activities

`NETWORKING`, `CV_TAILORED`, `COVER_LETTER` have no state machine — they
're just "I did this" logs, unlimited per day, each call directly invokes
`awardXP` with no `applicationId`.

## Quest completion flow

Side quests are intentionally generic (not tech-specific) and capped to
prevent abuse:

- Fixed reward: every quest completion awards exactly **5 XP** — not
  user-configurable, ignore any client-supplied value entirely
- Daily cap: **max 5 completed quests per user per day** (UTC calendar
  day, same definition used for streaks)

    User marks Quest DONE
          ↓
    Count today's SIDE_QUEST Activities for this user
          ↓
    >= 5 already today?
       YES → reject with 400, "Daily quest limit reached (5/5)"
       NO  → proceed
          ↓
    quest.status = DONE, quest.completedAt = now
          ↓
    awardXP(userId, SIDE_QUEST, xp = 5, { questId: quest.id })

`category` is free text the user enters when creating the quest — no
validation against a fixed list. This is what makes JobQuest usable for
any profession, not just software engineering.

## Achievement checks

Run only the checks relevant to the `activityType` just awarded (not all
achievements, every time):

| Achievement | Trigger condition | Checked on |
|---|---|---|
| First Hunt | First-ever `JOB_SAVED` activity | JOB_SAVED |
| First Blood | First-ever `JOB_APPLIED` activity | JOB_APPLIED |
| On Fire | `currentStreak >= 3` | any activity |
| Sharp Shooter | Total `JOB_APPLIED` activities >= 10 | JOB_APPLIED |
| Interview Ready | First-ever `INTERVIEW` activity | INTERVIEW |
| Boss Defeated | First-ever `OFFER` activity | OFFER |

Each check: if condition met AND no existing `UserAchievement` for that
`(userId, achievementId)`, create one. Achievements are seeded once via
a Prisma seed script (`key`, `title`, `description`, `icon`) — not
created dynamically.

## Leaderboard

`GET /leaderboard` returns the current user plus every User with an
ACCEPTED Friendship (either direction), sorted by `xp` descending. No
separate leaderboard table — it's a live query, not a cached/materialized
one, since friend-group sizes here are small (this isn't a global
leaderboard at scale).