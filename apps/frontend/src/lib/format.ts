import type { ActivityType, ApplicationStatus, QuestCategory } from './api'

// Presentation metadata + formatting shared across components.

interface Meta {
  label: string
  icon: string
}

const ACTIVITY_META: Record<ActivityType, Meta> = {
  JOB_SAVED: { label: 'Saved a job', icon: '🔖' },
  JOB_APPLIED: { label: 'Applied to a job', icon: '📮' },
  INTERVIEW: { label: 'Interview', icon: '🎙️' },
  OFFER: { label: 'Offer received', icon: '🏆' },
  REJECTED: { label: 'Rejection logged', icon: '📪' },
  NETWORKING: { label: 'Networking', icon: '🤝' },
  CV_TAILORED: { label: 'Tailored a CV', icon: '📝' },
  COVER_LETTER: { label: 'Cover letter', icon: '✉️' },
  LEETCODE: { label: 'LeetCode', icon: '🧩' },
  SYSTEM_DESIGN: { label: 'System design', icon: '🏗️' },
  BACKEND_PRACTICE: { label: 'Backend practice', icon: '🛠️' },
  READING: { label: 'Reading', icon: '📚' },
  SIDE_PROJECT: { label: 'Side project', icon: '🚀' },
}

const CATEGORY_META: Record<QuestCategory, Meta> = {
  LEETCODE: { label: 'LeetCode', icon: '🧩' },
  SYSTEM_DESIGN: { label: 'System Design', icon: '🏗️' },
  BACKEND_PRACTICE: { label: 'Backend Practice', icon: '🛠️' },
  READING: { label: 'Reading', icon: '📚' },
  SIDE_PROJECT: { label: 'Side Project', icon: '🚀' },
}

export const STATUS_ORDER: ApplicationStatus[] = [
  'SAVED',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
]

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
}

export function activityMeta(type: ActivityType): Meta {
  return ACTIVITY_META[type]
}

export function categoryMeta(category: QuestCategory): Meta {
  return CATEGORY_META[category]
}

/** Compact relative time, e.g. "just now", "3h ago", "Aug 14". */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const diffMs = Date.now() - then
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

/** Absolute date, e.g. "Aug 14, 2026". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
