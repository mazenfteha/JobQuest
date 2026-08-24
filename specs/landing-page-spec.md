# Landing Page Spec — JobQuest

## Purpose

Public-facing page at the root domain, shown to anyone not logged in.
Its only job: explain the product fast enough that a friend you send
the invite link to understands it in 10 seconds and wants to sign in.
Not a marketing funnel with pricing tiers — this is a personal/friends
tool, keep the copy honest and low-key rather than SaaS-startup voice.

## Sections (single scrolling page, no multi-page nav)

### 1. Hero
- Logo (Concept A badge) + wordmark text "JobQuest"
- Headline: something like "Job hunting, gamified." (exact copy — your
  call when building, keep it short)
- Subheadline: one sentence — turn applications, interviews, and
  rejections into XP instead of a spreadsheet
- Primary CTA: "Sign in with Google" button (this IS the signup flow —
  no separate signup form, OAuth handles both)
- Background: subtle avatar/XP-bar illustration, matching the playful
  tone from ui-spec.md — not a busy hero image, keep it light

### 2. The core loop (visual, not paragraphs)
Reuse the loop diagram concept from the PRD:
`Save → Apply → Interview → Offer/Rejected → XP → Level Up`
Rendered as a simple horizontal step illustration with icons, not text
blocks — this is the single best "get it instantly" visual on the page

### 3. Feature highlights (3–4 cards, icon + one line each)
- XP & Levels — "Every action earns experience, even rejections"
- Streaks — "Stay consistent, build momentum"
- Side Quests — "Track growth beyond applications — LeetCode, reading,
  side projects, whatever you're working on"
- Leaderboard — "Invite friends, see who's grinding hardest this week"

### 4. Screenshot / product preview
Real screenshot of the Dashboard (once the gamified UI pass is done —
don't screenshot the old plain-tracker look). Single image, no
carousel needed for this scale of page.

### 5. Final CTA
Repeat "Sign in with Google" button, short reassurance line (e.g. "Free,
no ads, just for tracking your own search")

## States

- Already logged in → skip this page entirely, redirect straight to
  `/dashboard`
- Google OAuth error/cancelled → return to landing page with a small
  inline "Sign-in didn't complete, try again" message, not a scary
  error page

## Technical notes

- Static page, no data fetching except the auth-check redirect above
- Same Tailwind/Framer Motion stack as the app — reuse `AvatarCard` and
  `XPBar` components from ui-spec.md's inventory for the hero/loop
  illustration rather than building new one-off graphics
- Route: `/` when logged out. `/` when logged in redirects to
  `/dashboard` (handled by the same auth-check every protected route
  already needs per auth-spec.md)