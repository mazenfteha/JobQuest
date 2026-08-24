import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import type { LeaderboardEntry } from '../lib/api'
import AvatarTier from './AvatarTier'

interface LeaderboardWidgetProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

const RANK_MEDAL: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

export default function LeaderboardWidget({
  entries,
  currentUserId,
}: LeaderboardWidgetProps) {
  const reduce = useReducedMotion()
  const top3 = entries.slice(0, 3)
  const me = entries.find((e) => e.userId === currentUserId)

  return (
    <motion.section
      className="rounded-card bg-base-card p-5 shadow-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 20 }
      }
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-ink">
          🏆 Leaderboard
        </h2>
        <Link
          to="/leaderboard"
          className="text-xs font-semibold text-primary-600 hover:text-primary-500"
        >
          View all
        </Link>
      </div>

      {me ? (
        <div className="mb-3 rounded-xl bg-primary-50/60 px-3 py-2 text-xs font-medium text-primary-600">
          Your rank: <span className="font-bold tabular">#{me.rank}</span>
        </div>
      ) : null}

      {top3.length === 0 ? (
        <p className="py-2 text-center text-xs text-ink-muted">
          No friends on the board yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {top3.map((entry) => (
            <li
              key={entry.userId}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                entry.userId === currentUserId
                  ? 'bg-primary-50 ring-1 ring-primary-200'
                  : 'bg-base-sunk/50'
              }`}
            >
              <span className="w-6 text-center text-sm font-bold tabular">
                {RANK_MEDAL[entry.rank] ?? entry.rank}
              </span>
              <AvatarTier level={entry.level} seed={entry.name} size={32} animated={false} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                {entry.name}
                {entry.userId === currentUserId ? (
                  <span className="ml-1 text-xs text-ink-muted">(You)</span>
                ) : null}
              </span>
              <span className="shrink-0 text-xs font-bold tabular text-primary-600">
                {entry.xp.toLocaleString()} XP
              </span>
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  )
}
