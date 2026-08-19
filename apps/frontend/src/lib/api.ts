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
  | 'LEETCODE'
  | 'SYSTEM_DESIGN'
  | 'BACKEND_PRACTICE'
  | 'READING'
  | 'SIDE_PROJECT'

export type QuestCategory =
  | 'LEETCODE'
  | 'SYSTEM_DESIGN'
  | 'BACKEND_PRACTICE'
  | 'READING'
  | 'SIDE_PROJECT'

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
  id: string
  type: ActivityType
  xp: number
  createdAt: string
}

export interface Quest {
  id: string
  title: string
  category: QuestCategory
  xpReward: number
  status: QuestStatus
  createdAt: string
  completedAt: string | null
}

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
    xp: number
    level: number
    currentStreak: number
    longestStreak: number
  }
  /** XP target for the next level (see specs/api.md GET /dashboard). */
  xpForCurrentLevel: number
  todayProgress: {
    applications: number
    interviews: number
    xpEarned: number
  }
  recentActivities: Activity[]
  openQuests: Quest[]
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
  category: QuestCategory
  xpReward: number
}

export interface ManualLogPayload {
  type: Extract<ActivityType, 'NETWORKING' | 'CV_TAILORED' | 'COVER_LETTER'>
  applicationId: string | null
}

// ---------------------------------------------------------------------------
// Fetch wrapper + client
// ---------------------------------------------------------------------------

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

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
}
