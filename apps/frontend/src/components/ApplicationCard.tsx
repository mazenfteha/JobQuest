import type { ApplicationListItem } from '../lib/api'
import { relativeTime } from '../lib/format'
import StatusPill from './StatusPill'

// A single application row (Applications screen). Subtle hover lift per
// ui-spec animation guidance. Clickable when onClick is provided.

const MONOGRAM_COLORS = [
  'bg-primary-50 text-primary-400',
  'bg-blue-500/15 text-blue-400',
  'bg-success-soft text-success',
  'bg-streak-soft text-streak',
  'bg-indigo-500/15 text-indigo-400',
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

function sourceBadge(url: string): { icon: string; label: string } | null {
  try {
    const host = new URL(url).hostname
    if (host.includes('linkedin')) return { icon: '💼', label: 'LinkedIn' }
    if (host.includes('wuzzuf')) return { icon: '🌐', label: 'Wuzzuf' }
  } catch {}
  return null
}

interface ApplicationCardProps {
  application: ApplicationListItem
  onClick?: (application: ApplicationListItem) => void
}

export default function ApplicationCard({ application, onClick }: ApplicationCardProps) {
  const { job, status, appliedAt } = application
  const { initials, color } = monogram(job.company)
  const source = sourceBadge(job.url)

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
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-ink">{job.title}</p>
          {source ? (
            <span
              className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-base-sunk px-1.5 py-0.5 text-[10px] font-medium text-ink-muted"
              title={source.label}
            >
              <span aria-hidden>{source.icon}</span>
              <span className="hidden sm:inline">{source.label}</span>
            </span>
          ) : null}
        </div>
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
