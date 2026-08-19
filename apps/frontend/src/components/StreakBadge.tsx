interface StreakBadgeProps {
  streak: number
  longest?: number
}

export default function StreakBadge({ streak, longest }: StreakBadgeProps) {
  const active = streak > 0
  return (
    <div
      className={
        active
          ? 'inline-flex items-center gap-1.5 rounded-full bg-streak-soft px-3 py-1.5 text-sm font-semibold text-streak-deep'
          : 'inline-flex items-center gap-1.5 rounded-full bg-base-sunk px-3 py-1.5 text-sm font-semibold text-ink-muted'
      }
      title={longest ? `Longest streak: ${longest} days` : undefined}
    >
      <span aria-hidden className={active ? '' : 'grayscale'}>
        🔥
      </span>
      <span className="tabular">{streak}</span>
      <span className="font-medium">
        day{streak === 1 ? '' : 's'}
      </span>
    </div>
  )
}
