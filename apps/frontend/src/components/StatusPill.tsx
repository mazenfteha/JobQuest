import type { ApplicationStatus } from '../lib/api'
import { STATUS_LABEL } from '../lib/format'

// Game-styled status badge per ui-spec addendum.
// Interview = shield, Offer = trophy, Rejected = calm neutral (not failure-coded).

const STYLES: Record<ApplicationStatus, { className: string; icon: string }> = {
  SAVED: { className: 'bg-base-sunk text-ink-soft', icon: '🔖' },
  APPLIED: { className: 'bg-blue-500/15 text-blue-400', icon: '📤' },
  INTERVIEW: { className: 'bg-primary-50 text-primary-400 ring-1 ring-primary-400/20', icon: '🛡️' },
  OFFER: { className: 'bg-success-soft text-success ring-1 ring-success/20', icon: '🏆' },
  REJECTED: { className: 'bg-ink-muted/10 text-ink-muted', icon: '📋' },
}

interface StatusPillProps {
  status: ApplicationStatus
  className?: string
}

export default function StatusPill({ status, className = '' }: StatusPillProps) {
  const { className: style, icon } = STYLES[status]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${style} ${className}`}
    >
      <span aria-hidden className="text-[10px] leading-none">{icon}</span>
      {STATUS_LABEL[status]}
    </span>
  )
}
