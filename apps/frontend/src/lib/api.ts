// Typed API client for JobQuest.
//
// Types mirror specs/api.md response shapes exactly. The client methods are
// defined and ready for Phase 4 wiring — screens in Phase 3 render from mock
// data (src/mocks/*) and do NOT call these yet.

// ---------------------------------------------------------------------------
// Enums (string-literal unions — tsconfig has erasableSyntaxOnly, no `enum`)
// ---------------------------------------------------------------------------

export type ApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'

export type ActivityType =
  | 'JOB_SAVED'
  | 'JOB_APPLIED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'NETWORKING'
  | 'CV_TAILORED'
  | 'COVER_LETTER'
  | 'SIDE_QUEST'

export type QuestStatus = 'OPEN' | 'DONE'

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface JobSummary {
  id: string
  title: string
  company: string
  url: string
  location?: string | null
}

export interface Activity {
  // `id` is present on GET /activities but omitted from the dashboard's
  // recentActivities (per api.md) — hence optional.
  id?: string
  type: ActivityType
  xp: number
  createdAt: string
}

/** Compact quest as embedded in the dashboard's openQuests (subset of Quest). */
export type QuestPreview = Pick<Quest, 'id' | 'title' | 'category'>

export interface Quest {
  id: string
  title: string
  /** Free text (any profession) — no fixed category list. */
  category: string
  status: QuestStatus
  createdAt: string
  completedAt: string | null
}

/** Every quest completion awards a fixed reward (specs/business-logic.md). */
export const QUEST_XP_REWARD = 5

export interface Achievement {
  id: string
  key: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt: string | null
}

/** Compact achievement, as embedded in XpAwardResult / dashboard. */
export interface AchievementSummary {
  id?: string
  key: string
  title: string
  description?: string
  icon: string
}

export interface ApplicationListItem {
  id: string
  status: ApplicationStatus
  appliedAt: string | null
  job: JobSummary
}

export interface ApplicationDetail {
  id: string
  status: ApplicationStatus
  appliedAt: string | null
  createdAt: string
  updatedAt: string
  job: JobSummary & { description?: string | null }
}

// ---------------------------------------------------------------------------
// Response envelopes
// ---------------------------------------------------------------------------

/** Shared envelope returned by any endpoint that triggers awardXP. */
export interface XpAwardResult {
  user: {
    id: string
    xp: number
    level: number
    currentStreak: number
    longestStreak: number
  }
  xpGained: number
  leveledUp: boolean
  newAchievements: AchievementSummary[]
}

export interface DashboardResponse {
  user: {
    name: string
    xp: number
    level: number
    currentStreak: number
    longestStreak: number
  }
  /**
   * XP required to reach the current level (the level's floor) —
   * `xpRequiredForLevel(user.level)`, per the backend. NOT the next-level
   * target. The next-level target is derived client-side (see lib/xp.ts).
   */
  xpForCurrentLevel: number
  todayProgress: {
    applications: number
    interviews: number
    xpEarned: number
  }
  recentActivities: Activity[]
  openQuests: QuestPreview[]
  recentAchievements: Array<Pick<Achievement, 'key' | 'title' | 'icon'>>
}

export interface SaveJobResponse {
  application: {
    id: string
    status: ApplicationStatus
    job: JobSummary
  }
  xpAward: XpAwardResult
}

export interface StatusChangeResponse {
  application: {
    id: string
    status: ApplicationStatus
    appliedAt?: string | null
  }
  xpAward: XpAwardResult
}

export interface QuestCompleteResponse {
  quest: {
    id: string
    status: QuestStatus
    completedAt: string
  }
  xpAward: XpAwardResult
}

// ---------------------------------------------------------------------------
// Friends & Leaderboard
// ---------------------------------------------------------------------------

export interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  avatarUrl: string | null
  xp: number
  level: number
  streak: number
}

export interface FriendProfile {
  id: string
  name: string
  avatarUrl: string | null
  xp: number
  level: number
}

// ---------------------------------------------------------------------------
// Request payloads
// ---------------------------------------------------------------------------

export interface SaveJobPayload {
  title: string
  company: string
  location?: string
  url: string
  description?: string
  source?: string
}

export interface CreateQuestPayload {
  title: string
  category: string
}

export interface ManualLogPayload {
  type: Extract<ActivityType, 'NETWORKING' | 'CV_TAILORED' | 'COVER_LETTER'>
  applicationId: string | null
}

// ---------------------------------------------------------------------------
// Fetch wrapper + client
// ---------------------------------------------------------------------------

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

/** Full URL that starts the Google sign-in flow (a top-level navigation). */
export const AUTH_LOGIN_URL = `${BASE_URL}/auth/google`

/** Authenticated user profile from GET /auth/me. */
export interface AuthUser {
  id: string
  name: string
  email: string | null
  avatarUrl: string | null
  xp: number
  level: number
  currentStreak: number
  longestStreak: number
  inviteCode: string
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    // Send the auth cookie cross-origin (backend CORS allows credentials).
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

  if (!res.ok) {
    let message = res.statusText
    try {
      const body = (await res.json()) as { message?: string }
      if (body?.message) message = body.message
    } catch {
      // non-JSON error body; keep statusText
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

function withStatus(path: string, status?: string): string {
  return status ? `${path}?status=${status}` : path
}

export const api = {
  // Auth
  getMe: () => request<AuthUser>('/auth/me'),
  logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),

  // Dashboard
  getDashboard: () => request<DashboardResponse>('/dashboard'),

  // Jobs & Applications
  saveJob: (payload: SaveJobPayload) =>
    request<SaveJobResponse>('/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getApplications: (status?: ApplicationStatus) =>
    request<ApplicationListItem[]>(withStatus('/applications', status)),
  getApplication: (id: string) =>
    request<ApplicationDetail>(`/applications/${id}`),
  updateApplicationStatus: (id: string, status: ApplicationStatus) =>
    request<StatusChangeResponse>(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Activities
  logActivity: (payload: ManualLogPayload) =>
    request<XpAwardResult>('/activities/manual-log', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getActivities: (limit = 10) =>
    request<Activity[]>(`/activities?limit=${limit}`),

  // Quests
  getQuests: (status?: QuestStatus) =>
    request<Quest[]>(withStatus('/quests', status)),
  createQuest: (payload: CreateQuestPayload) =>
    request<Quest>('/quests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  completeQuest: (id: string) =>
    request<QuestCompleteResponse>(`/quests/${id}/complete`, {
      method: 'PATCH',
    }),
  deleteQuest: (id: string) =>
    request<void>(`/quests/${id}`, { method: 'DELETE' }),

  // Achievements
  getAchievements: () => request<Achievement[]>('/achievements'),

  // Friends & Leaderboard
  inviteFriend: () =>
    request<{ inviteLink: string }>('/friends/invite', { method: 'POST' }),
  acceptFriend: (code: string) =>
    request<{ friendship: { id: string; userId: string; friendId: string; status: string } }>(
      `/friends/accept/${code}`,
      { method: 'POST' },
    ),
  getFriends: () => request<FriendProfile[]>('/friends'),
  getLeaderboard: () => request<LeaderboardEntry[]>('/leaderboard'),
}
