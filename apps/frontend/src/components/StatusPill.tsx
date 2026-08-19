import type { ApplicationStatus } from '../lib/api'
import { STATUS_LABEL } from '../lib/format'

// Colored status badge for an application (Saved/Applied/Interview/Offer/Rejected).

const STYLES: Record<ApplicationStatus, string> = {
  SAVED: 'bg-base-sunk text-ink-soft',
  APPLIED: 'bg-blue-50 text-blue-700',
  INTERVIEW: 'bg-primary-50 text-primary-600',
  OFFER: 'bg-success-soft text-success-deep',
  REJECTED: 'bg-rose-50 text-rose-600',
}

interface StatusPillProps {
  status: ApplicationStatus
  className?: string
}

export default function StatusPill({ status, className = '' }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status]} ${className}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
