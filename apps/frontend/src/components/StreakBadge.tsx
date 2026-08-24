import { motion, useReducedMotion } from 'framer-motion'

interface StreakBadgeProps {
  streak: number
  longest?: number
}

export default function StreakBadge({ streak, longest }: StreakBadgeProps) {
  const active = streak > 0
  const blazing = streak >= 3
  const reduce = useReducedMotion()

  return (
    <div className="relative inline-flex">
      {/* Pulse glow behind the badge when streak >= 3 */}
      {blazing ? (
        <motion.div
          className="absolute inset-0 rounded-full bg-streak/20"
          animate={reduce ? undefined : { scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : null}
      <div
        className={
          active
            ? `relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
                blazing
                  ? 'bg-streak/10 text-streak-deep ring-1 ring-streak/20'
                  : 'bg-streak-soft text-streak-deep'
              }`
            : 'relative inline-flex items-center gap-1.5 rounded-full bg-base-sunk px-3 py-1.5 text-sm font-semibold text-ink-muted'
        }
        title={longest ? `Longest streak: ${longest} days` : undefined}
      >
        <motion.span
          aria-hidden
          className={active ? '' : 'grayscale'}
          animate={
            blazing && !reduce
              ? { scale: [1, 1.2, 1] }
              : undefined
          }
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          🔥
        </motion.span>
        <span className="tabular">{streak}</span>
        <span className="font-medium">
          day{streak === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  )
}
