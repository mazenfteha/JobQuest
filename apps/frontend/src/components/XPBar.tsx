import { motion, useReducedMotion } from 'framer-motion'
import { levelProgress } from '../lib/xp'

interface XPBarProps {
  xp: number
  level: number
  /** Current-level XP floor (dashboard's `xpForCurrentLevel`). */
  currentLevelXp?: number
  showLabel?: boolean
}

export default function XPBar({
  xp,
  level,
  currentLevelXp,
  showLabel = true,
}: XPBarProps) {
  const reduce = useReducedMotion()
  const { floor, ceiling, earnedInLevel, remaining, fraction } = levelProgress(
    xp,
    level,
    currentLevelXp,
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
        className="relative h-3.5 w-full overflow-hidden rounded-full bg-base-sunk"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        {/* Glow under the fill */}
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: pct > 0 ? 1 : 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          style={{
            background: `linear-gradient(90deg, transparent ${Math.max(pct - 8, 0)}%, rgba(245,166,35,0.25) ${pct}%, transparent ${Math.min(pct + 4, 100)}%)`,
          }}
        />

        {/* Main fill bar */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary-300 via-primary-400 to-primary-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: 'spring', stiffness: 60, damping: 14, mass: 1 }
          }
        />

        {/* Shimmer sweep — runs once after fill completes */}
        {!reduce && pct > 0 ? (
          <motion.div
            className="absolute inset-y-0 w-1/3 rounded-full"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            }}
            initial={{ left: '-33%' }}
            animate={{ left: '130%' }}
            transition={{ delay: 0.8, duration: 0.7, ease: 'easeInOut' }}
          />
        ) : null}
      </div>
    </div>
  )
}
