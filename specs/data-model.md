# Data Model — JobQuest

## Design notes

- No auth in v1: a single `User` row is seeded on first run. All other
  tables reference `userId` from day one, so adding real auth later means
  adding `email`/`passwordHash` columns and a login flow — not restructuring
  relations.
- IDs use UUIDs (`@default(uuid())`) rather than autoincrement ints, so
  swapping storage or merging data later doesn't require ID remapping.
- `Job` is a shared table keyed by unique `url` — if the same posting is
  saved twice, it points at the same Job row. Matters more once real auth
  exists and multiple users could save the same posting.
- `Application` is unique per `(userId, jobId)` — prevents duplicate
  "Saved" entries for a job you already tracked.
- `Activity` is the immutable log: every XP-earning action creates one row.
  It optionally links back to the `Application` or `Quest` that caused it,
  for traceability (e.g. "this Activity was created because Quest X was
  completed").
- `Quest` is the only "intent" object — it sits `OPEN` until you mark it
  `DONE`, at which point business logic (see business-logic.md) creates
  the corresponding `Activity`.

## Schema

\`\`\`prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ApplicationStatus {
  SAVED
  APPLIED
  INTERVIEW
  OFFER
  REJECTED
}

enum ActivityType {
  JOB_SAVED
  JOB_APPLIED
  INTERVIEW
  OFFER
  REJECTED
  NETWORKING
  CV_TAILORED
  COVER_LETTER
  SIDE_QUEST        // replaces LEETCODE/SYSTEM_DESIGN/BACKEND_PRACTICE/READING/SIDE_PROJECT
}


enum QuestStatus {
  OPEN
  DONE
}

model User {
  id               String    @id @default(uuid())
  name             String
  xp               Int       @default(0)
  level            Int       @default(1)
  currentStreak    Int       @default(0)
  longestStreak    Int       @default(0)
  lastActivityDate DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
   // ...existing fields...
  googleId    String?  @unique
  email       String?  @unique
  avatarUrl   String?
  inviteCode  String   @unique @default(cuid())

  friendships       Friendship[] @relation("UserFriendships")
  friendOf          Friendship[] @relation("FriendOfUser")

  applications Application[]
  activities   Activity[]
  quests       Quest[]
  achievements UserAchievement[]
}

model Friendship {
  id        String           @id @default(uuid())
  userId    String
  friendId  String
  status    FriendshipStatus @default(PENDING)
  createdAt DateTime         @default(now())

  user   User @relation("UserFriendships", fields: [userId], references: [id])
  friend User @relation("FriendOfUser", fields: [friendId], references: [id])

  @@unique([userId, friendId])
}

enum FriendshipStatus {
  PENDING
  ACCEPTED
}

model Job {
  id          String   @id @default(uuid())
  title       String
  company     String
  location    String?
  url         String   @unique
  description String?
  source      String?
  createdAt   DateTime @default(now())

  applications Application[]
}

model Application {
  id        String            @id @default(uuid())
  userId    String
  jobId     String
  status    ApplicationStatus @default(SAVED)
  appliedAt DateTime?
  createdAt DateTime          @default(now())
  updatedAt DateTime          @updatedAt

  user       User       @relation(fields: [userId], references: [id])
  job        Job        @relation(fields: [jobId], references: [id])
  activities Activity[]

  @@unique([userId, jobId])
}

model Quest {
  id          String      @id @default(uuid())
  userId      String
  title       String
  category    String      // free text (any profession); reward is fixed 5 XP
  status      QuestStatus @default(OPEN)
  createdAt   DateTime    @default(now())
  completedAt DateTime?

  user       User       @relation(fields: [userId], references: [id])
  activities Activity[]
}

model Activity {
  id            String       @id @default(uuid())
  userId        String
  type          ActivityType
  xp            Int
  applicationId String?
  questId       String?
  createdAt     DateTime     @default(now())

  user        User         @relation(fields: [userId], references: [id])
  application Application? @relation(fields: [applicationId], references: [id])
  quest       Quest?       @relation(fields: [questId], references: [id])
}

model Achievement {
  id          String @id @default(uuid())
  key         String @unique
  title       String
  description String
  icon        String

  users UserAchievement[]
}

model UserAchievement {
  id            String   @id @default(uuid())
  userId        String
  achievementId String
  unlockedAt    DateTime @default(now())

  user        User        @relation(fields: [userId], references: [id])
  achievement Achievement @relation(fields: [achievementId], references: [id])

  @@unique([userId, achievementId])
}
\`\`\`

## Open questions for later (not blocking v1)

- When auth is added: does `email` go on `User` directly, or does a
  separate `Credential` table make more sense (mirrors your e-commerce
  project's separated role-table pattern)? Decide when you get there.
- `lastActivityDate` + `currentStreak`/`longestStreak` are enough for a
  simple daily streak, but the exact calculation (timezone handling, what
  counts as "a day") belongs in business-logic.md, not here.