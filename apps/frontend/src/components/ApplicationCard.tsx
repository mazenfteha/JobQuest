import type { ApplicationListItem } from '../lib/api'
import { relativeTime } from '../lib/format'
import StatusPill from './StatusPill'

// A single application row (Applications screen). Subtle hover lift per
// ui-spec animation guidance. Clickable when onClick is provided.

const MONOGRAM_COLORS = [
  'bg-primary-100 text-primary-600',
  'bg-blue-100 text-blue-700',
  'bg-success-soft text-success-deep',
  'bg-streak-soft text-streak-deep',
  'bg-indigo-100 text-indigo-700',
]

function monogram(company: string): { initials: string; color: string } {
  const initials = company
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  let hash = 0
  for (let i = 0; i < company.length; i++) hash = (hash + company.charCodeAt(i)) % MONOGRAM_COLORS.length
  return { initials, color: MONOGRAM_COLORS[hash] }
}

interface ApplicationCardProps {
  application: ApplicationListItem
  onClick?: (application: ApplicationListItem) => void
}

export default function ApplicationCard({ application, onClick }: ApplicationCardProps) {
  const { job, status, appliedAt } = application
  const { initials, color } = monogram(job.company)

  return (
    <button
      type="button"
      onClick={onClick ? () => onClick(application) : undefined}
      className="flex w-full items-center gap-4 rounded-card bg-base-card p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-bold ${color}`}
        aria-hidden
      >
        {initials}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">{job.title}</p>
        <p className="truncate text-xs text-ink-muted">
          {job.company}
          {job.location ? ` · ${job.location}` : ''}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <StatusPill status={status} />
        <span className="text-xs text-ink-muted">
          {appliedAt ? `Applied ${relativeTime(appliedAt)}` : 'Not applied'}
        </span>
      </div>
    </button>
  )
}
