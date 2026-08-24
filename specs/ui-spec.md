# UI Spec — JobQuest

## Visual direction

Playful, game-like tone: bright accent colors, generous rounded corners
(cards, buttons, XP bars), and bouncy spring-based motion on anything
tied to progress (XP gain, level-up, achievement unlock) via Framer
Motion. Avatar is a simple flat illustration set — a handful of custom
SVGs, one per level tier, not photorealistic and not pixel-art. Base
layout (grid, spacing, typography) stays clean underneath the playful
accents — the game feel comes from color/motion/icons, not from a busy
layout.

## Avatar tiers

JobQuest is for **any** job seeker, so tier titles are job-agnostic (not
tech-specific).

| Levels | Title | Frame treatment |
|---|---|---|
| 1–4 | Newcomer | neutral slate ring |
| 5–9 | Contender | amber/gold ring |
| 10–14 | Pro | indigo ring |
| 15+ | Champion | gold ring + crown + glowing aura |

The avatar itself is a **DiceBear "Notionists"** avatar generated locally
(no network) and seeded by the user's name, so the identity is stable — it's
the *same person* leveling up. Progression is shown by the **tier frame**
around it (ring color by tier, plus a crown + aura at Champion), swapped based
on `user.level`. Implemented in `components/AvatarTier.tsx` — no static SVG
assets to maintain.

## Color palette (starting point, adjust once in Tailwind)

- Primary accent (XP, progress, CTAs): warm gold/amber
- Secondary accent (streak/fire): orange-red
- Success (offers, achievements): green
- Neutral base: off-white background, dark slate text
- Card backgrounds: white with soft shadow, rounded-2xl

## Screens

### 1. Dashboard (`/`)
The home screen — everything from `GET /dashboard` in one view.

Sections top to bottom:
- **Avatar card**: avatar SVG (by level tier), name, level, XP bar
  (current/needed for next level), streak badge (🔥 + currentStreak)
- **Today's progress**: 3 small stat cards — applications, interviews,
  XP earned today (derived from `recentActivities` filtered to today)
- **Open quests preview**: up to 3 open quests, "View all" link to
  Quest Board
- **Recent activity feed**: last 5–10 items from `recentActivities`,
  icon per `ActivityType`, XP shown per row
- **Recent achievements**: small row of unlocked achievement icons

**States:**
- Loading: skeleton cards (no spinner-only screen)
- Empty (brand new user, zero activity): avatar at Level 1, "Save your
  first job to get started" CTA instead of empty activity feed/quest list
- Error: simple retry state, no game styling needed here

### 2. Applications / Job Board (`/applications`)
List of all applications, grouped or filterable by status (Saved,
Applied, Interview, Offer, Rejected).

- Filter tabs/pills by status (matches `?status=` query param)
- Each row = Application Card (see components below)
- Clicking a card opens a detail view/modal with job description,
  status history, and the status-transition action (e.g. "Mark as
  Applied" button that calls `PATCH .../status`)

**States:**
- Empty (no applications yet, filtered or overall): "No jobs saved yet"
  / "No applications in this status"
- Invalid transition attempt: inline error near the action button, not
  a blocking modal (matches the 400 response from api.md)

### 3. Quest Board (`/quests`)
Self-created Engineering Growth quests.

- "New Quest" button → simple form (title, category dropdown, XP
  reward input)
- Open quests list, each a Quest Card with a "Complete" button
- Completed quests shown separately (collapsed section or toggle),
  read-only

**States:**
- Empty: "No quests yet — add one to start earning Engineering Growth
  XP"

### 4. Achievements (`/achievements`)
Grid of all achievements from `GET /achievements`.

- Unlocked: full color, icon, unlock date
- Locked: greyed out silhouette, title visible, description hidden or
  shown as a hint (avoid spoiling exact trigger conditions if it's
  more fun that way — your call when building)

## Global states (not tied to one screen)

### XP Toast
Appears bottom-right or top-center on any `awardXP`-triggering action.
Slides/bounces in, auto-dismisses after ~2s.

⚔ +50 XP

### Level-Up Modal
Triggered when `xpAward.leveledUp === true`. Full-attention moment —
modal overlay, avatar tier transition if the tier changed, "Level 5!"
big text, dismiss on click/auto after a few seconds.

### Achievement Unlock Toast
Triggered when `xpAward.newAchievements` is non-empty. Similar to XP
toast but distinct styling (icon + title), can stack with XP toast if
both fire from the same action.

## Component inventory

Reusable across screens — define once, reuse everywhere so Claude Code
doesn't reinvent slightly different versions per page:

| Component | Used on |
|---|---|
| `AvatarCard` | Dashboard |
| `XPBar` | Dashboard, Level-Up Modal |
| `StreakBadge` | Dashboard |
| `StatCard` | Dashboard (today's progress) |
| `ApplicationCard` | Applications, Dashboard (recent activity references) |
| `QuestCard` | Quest Board, Dashboard (preview) |
| `AchievementCard` | Achievements, Dashboard (recent achievements) |
| `ActivityRow` | Dashboard (recent activity feed) |
| `XPToast` | global |
| `LevelUpModal` | global |
| `AchievementToast` | global |
| `StatusPill` | Applications (Saved/Applied/Interview/Offer/Rejected badge) |

## Animation guidance (Framer Motion)

- XP bar fill: animate `width` on change, not instant jump
- Toasts: spring in (slight overshoot/bounce), not linear ease
- Level-up modal: scale + fade in, avatar tier swap can crossfade
- Card hover (Applications/Quests): subtle lift (translateY + shadow),
  not required but fits the playful tone


  # UI Overhaul Addendum — v2 Gamification Pass

## Why this pass exists

Feedback after Phase 4: the app functions but visually reads as a
tracker with game *labels* on it, not a game. This pass targets the
gap between "XP number exists" and "this feels like a game."

## Changes, by screen

### Dashboard
- AvatarCard becomes the visual anchor of the page — larger, top-left
  or top-center, not a small corner element. Logo badge motif (gold
  gradient, dark outline) should visually echo in the avatar card's
  border treatment for brand consistency
- XP bar gets a visible "fill" animation on load (not just on gain) —
  bar animates from 0 to current value once on page mount, reinforcing
  progress every time you open the app
- Streak badge (🔥) gets a subtle pulse/glow when `currentStreak >= 3`
  — visually distinguishes an active streak from a cold one
- Leaderboard widget (new, from v2 friends feature) — compact card
  showing your rank + top 3 friends by XP, links to a full
  `/leaderboard` page

### Applications / Job Board
- Reframe as a "quest board" visually: StatusPill per application
  becomes more game-styled (e.g. Interview = shield icon + color,
  Offer = trophy icon + gold, Rejected = stays neutral/calm tone, NOT
  a red "failure" color — matches the "rejection = XP, not loss"
  principle from business-logic.md)
- Application cards get slightly more presence — icon per job source
  (LinkedIn/Wuzzuf icon badge), not just plain text rows

### Quest Board
- Since quests are now free-text/user-defined (any profession, not
  just tech), the UI shouldn't visually imply "coding tasks" anymore —
  use a generic "quest scroll" or "task" icon motif, not code-bracket
  icons
- Daily cap (5/day) shown as a small progress indicator ("3/5 quests
  today") near the "New Quest" button, so the limit is visible before
  someone hits the 400 error

### Achievements
- Locked achievements get a more game-appropriate treatment: greyscale
  + slight blur or "silhouette" fill, not just dimmed opacity — should
  read as "mystery to unlock," not "disabled button"

### New: Leaderboard page (`/leaderboard`)
- Ranked list, avatar thumbnail + name + level + XP per row
- Current user's row visually highlighted (border/background tint)
- "Invite a friend" CTA at the top (surfaces the invite-link flow from
  auth-spec.md)

## Global
- Favicon + browser tab icon: Concept A badge, simplified/flattened
  for small-size legibility (drop fine details like the star's inner
  stroke at 16–32px)
- Extension popup header gets the badge logo too, for brand consistency
  across all three surfaces (web, extension, and eventually the
  landing page)