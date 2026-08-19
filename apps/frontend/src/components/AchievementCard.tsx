import { formatDate } from '../lib/format'

interface AchievementCardProps {
  icon: string
  title: string
  description?: string
  unlocked?: boolean
  unlockedAt?: string | null
  /** Small badge form (dashboard recent row) vs full grid card. */
  compact?: boolean
}

export default function AchievementCard({
  icon,
  title,
  description,
  unlocked = true,
  unlockedAt,
  compact,
}: AchievementCardProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-base-card px-3 py-1.5 shadow-card">
        <span className="text-base" aria-hidden>
          {icon}
        </span>
        <span className="text-xs font-semibold text-ink">{title}</span>
      </div>
    )
  }

  return (
    <div
      className={`rounded-card p-5 text-center shadow-card transition-transform ${
        unlocked ? 'bg-base-card' : 'bg-base-sunk'
      }`}
    >
      <div
        className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl text-3xl ${
          unlocked ? 'bg-primary-50' : 'bg-black/5 opacity-40 grayscale'
        }`}
        aria-hidden
      >
        {icon}
      </div>
      <p
        className={`mt-3 font-display text-sm font-bold ${
          unlocked ? 'text-ink' : 'text-ink-muted'
        }`}
      >
        {title}
      </p>
      {description ? (
        <p className="mt-1 text-xs text-ink-soft">{description}</p>
      ) : null}
      {unlocked ? (
        unlockedAt ? (
          <p className="mt-2 text-[11px] font-medium text-primary-600">
            Unlocked {formatDate(unlockedAt)}
          </p>
        ) : null
      ) : (
        <p className="mt-2 text-[11px] font-medium text-ink-muted">🔒 Locked</p>
      )}
    </div>
  )
}
