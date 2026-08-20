// Presentational XP toast content (spring/dismiss handled by RewardsProvider).
interface XPToastProps {
  xp: number
}

export default function XPToast({ xp }: XPToastProps) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 font-bold text-white shadow-card-hover">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-primary-300 to-primary-600 text-xs">
        ⚡
      </span>
      <span className="tabular text-sm">+{xp} XP</span>
    </div>
  )
}
