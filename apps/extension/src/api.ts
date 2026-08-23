// Minimal API client for the extension. Types mirror specs/api.md POST /jobs.
// The popup fetches the backend directly; host_permissions for the backend
// origin lets this bypass CORS.

export type ApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'

export interface AchievementSummary {
  key: string
  title: string
  icon: string
  description?: string
}

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

export interface SaveJobPayload {
  title: string
  company: string
  url: string
  location?: string
  description?: string
  source?: string
}

export interface SaveJobResponse {
  application: {
    id: string
    status: ApplicationStatus
    job: { id: string; title: string; company: string; url: string }
  }
  xpAward: XpAwardResult
}

export const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
export const APP_URL = (import.meta.env.VITE_APP_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function saveJob(
  payload: SaveJobPayload,
  token: string,
): Promise<SaveJobResponse> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
  } catch {
    // Network / DNS / CORS-block failure — no response at all.
    throw new ApiError(0, 'Network error — is the JobQuest backend running?')
  }

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

  return (await res.json()) as SaveJobResponse
}
