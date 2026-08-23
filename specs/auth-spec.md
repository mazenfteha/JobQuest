# Auth Spec — JobQuest v2

## Provider

Google OAuth 2.0 only — no email/password, no other providers in v2.
Use `passport-google-oauth20` in NestJS (standard, well-documented
pattern), session represented as a JWT issued after successful OAuth
callback, stored client-side (httpOnly cookie, not localStorage).

## Flow

\`\`\`
Frontend: "Sign in with Google" button
     ↓
GET /auth/google  → redirects to Google's consent screen
     ↓
Google redirects back to  GET /auth/google/callback?code=...
     ↓
Backend exchanges code for Google profile (email, googleId, name, avatarUrl)
     ↓
   ┌─────────────────────┴─────────────────────┐
   │                                           │
Existing User with this googleId          No User with this googleId
   ↓                                           ↓
Log them in                          ┌─────────┴─────────┐
   │                                 │                   │
   │                    Exactly ONE legacy User    Other case:
   │                    exists with no googleId     normal new signup
   │                    set (the original seed      ↓
   │                    user) AND no other real   Create new User row
   │                    Users exist yet            (googleId, email,
   │                    ↓                           name, avatarUrl set,
   │                    "CLAIM" flow:                xp/level/streak
   │                    attach googleId/email/       start at 0/1/0)
   │                    avatarUrl to that SAME
   │                    User row — same id, so
   │                    every existing Application/
   │                    Activity/Quest/UserAchievement
   │                    stays correctly linked
   │                    automatically. This is a
   │                    ONE-TIME path — once any
   │                    User has a googleId, this
   │                    branch never fires again.
   └─────────────────────┬─────────────────────┘
                          ↓
                 Issue JWT, set httpOnly cookie
                          ↓
                 Redirect to frontend dashboard
\`\`\`

## Migration note

No standalone migration script needed. The "claim" branch above IS the
migration — run it once, by logging in with your own Google account
first, before any friend does. After that, the legacy no-googleId user
state can never occur again (guard it in code: if a User already has a
googleId anywhere in the table, disable the claim branch entirely, even
if a new anonymous seed User somehow existed).

## Session handling

- JWT payload: `{ userId, email }`, short-ish expiry (e.g. 7 days),
  refreshed on activity — no separate refresh-token table for v2, that's
  more infrastructure than a friends-leaderboard side project needs
- `GET /auth/me` — returns current user's profile from the JWT, used by
  frontend on load to check auth state
- `POST /auth/logout` — clears the cookie
- All existing endpoints (jobs, applications, activities, quests,
  achievements, dashboard) drop the `getSingleUser()` helper and instead
  resolve the user from the JWT via a NestJS auth guard — this is the
  only change those modules need, business logic inside them is
  unaffected

## Extension + auth

The extension currently calls the backend directly with no auth header.
In v2 it needs the same JWT — simplest approach: after logging in on
the web frontend, generate a short extension-specific token via
`GET /auth/extension-token` (same JWT, just issued through a dedicated
endpoint so the extension doesn't need to do the OAuth redirect dance
itself), user pastes/syncs it into the extension once via the popup's
settings, stored in `chrome.storage`.

## Friends & Leaderboard

- `Friendship` model: `userId`, `friendId`, `status` (PENDING/ACCEPTED),
  `createdAt`
- Each `User` gets a unique `inviteCode` (short random string,
  generated on creation)
- `POST /friends/invite` — get your own invite link
  (`https://yourapp.com/join?code=XXXX`)
- `POST /friends/accept/:code` — the invited person, once logged in,
  hits this to create the Friendship (creates it ACCEPTED both
  directions, no separate approval step needed for v2 — simple, since
  these are people you're actively inviting)
- `GET /leaderboard` — current user + all ACCEPTED friends, ranked by
  `xp` descending