import { motion, useReducedMotion } from 'framer-motion'
import { levelProgress } from '../lib/xp'

interface XPBarProps {
  xp: number
  level: number
  /** Next-level XP target (dashboard's `xpForCurrentLevel`). */
  nextLevelXp?: number
  showLabel?: boolean
}

export default function XPBar({
  xp,
  level,
  nextLevelXp,
  showLabel = true,
}: XPBarProps) {
  const reduce = useReducedMotion()
  const { floor, ceiling, earnedInLevel, remaining, fraction } = levelProgress(
    xp,
    level,
    nextLevelXp,
  )
  const band = ceiling - floor
  const pct = Math.round(fraction * 100)

  return (
    <div className="w-full">
      {showLabel ? (
        <div className="mb-1.5 flex items-baseline justify-between text-xs">
          <span className="font-semibold text-ink-soft tabular">
            {earnedInLevel} / {band} XP
          </span>
          <span className="text-ink-muted tabular">
            {remaining} to Level {level + 1}
          </span>
        </div>
      ) : null}

      <div
        className="h-3 w-full overflow-hidden rounded-full bg-base-sunk"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary-300 to-primary-600"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={
            reduce ? { duration: 0 } : { type: 'spring', stiffness: 90, damping: 18 }
          }
        />
      </div>
    </div>
  )
}
