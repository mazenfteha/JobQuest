import type { AchievementSummary } from '../lib/api'

// Presentational achievement-unlock toast (distinct from XPToast; spring/dismiss
// handled by RewardsProvider). Stacks alongside the XP toast.
interface AchievementToastProps {
  achievement: AchievementSummary
}

export default function AchievementToast({ achievement }: AchievementToastProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-base-card px-4 py-2.5 shadow-card-hover ring-1 ring-primary-200">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-50 text-xl">
        {achievement.icon}
      </span>
      <div className="pr-1">
        <p className="text-[10px] font-bold uppercase tracking-wide text-primary-500">
          Achievement unlocked
        </p>
        <p className="text-sm font-bold text-ink">{achievement.title}</p>
      </div>
    </div>
  )
}
