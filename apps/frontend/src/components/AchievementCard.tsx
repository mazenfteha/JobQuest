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
      <div
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 shadow-card ${
          unlocked ? 'bg-base-card' : 'bg-base-sunk'
        }`}
      >
        <span className={`text-base ${unlocked ? '' : 'grayscale blur-[2px]'}`} aria-hidden>
          {icon}
        </span>
        <span className={`text-xs font-semibold ${unlocked ? 'text-ink' : 'text-ink-muted'}`}>
          {title}
        </span>
      </div>
    )
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-card p-5 text-center shadow-card transition-transform ${
        unlocked ? 'bg-base-card' : 'bg-base-sunk'
      }`}
    >
      {/* Locked silhouette overlay */}
      {!unlocked ? (
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-base-sunk/80 via-base-sunk/40 to-transparent" />
      ) : null}

      <div
        className={`relative mx-auto grid h-14 w-14 place-items-center rounded-2xl text-3xl transition-all ${
          unlocked
            ? 'bg-primary-50'
            : 'bg-ink/5 grayscale blur-[3px] saturate-0'
        }`}
        aria-hidden
      >
        {icon}
        {/* Lock overlay on icon */}
        {!unlocked ? (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-ink/30">
            <span className="text-lg">🔒</span>
          </div>
        ) : null}
      </div>

      <p
        className={`relative mt-3 font-display text-sm font-bold ${
          unlocked ? 'text-ink' : 'text-ink-muted'
        }`}
      >
        {title}
      </p>

      {description ? (
        <p className={`relative mt-1 text-xs ${unlocked ? 'text-ink-soft' : 'text-ink-muted/50'}`}>
          {unlocked ? description : '???'}
        </p>
      ) : null}

      {unlocked ? (
        unlockedAt ? (
          <p className="relative mt-2 text-[11px] font-medium text-primary-400">
            Unlocked {formatDate(unlockedAt)}
          </p>
        ) : null
      ) : (
        <p className="relative mt-2 text-[11px] font-medium text-ink-muted">Locked</p>
      )}
    </div>
  )
}
