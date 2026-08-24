import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { LeaderboardEntry } from '../lib/api'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { useAuth } from '../lib/auth'
import AvatarTier from '../components/AvatarTier'
import InviteFriendModal from '../components/InviteFriendModal'

const RANK_MEDAL: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

export default function Leaderboard() {
  const { user } = useAuth()
  const { data, error, loading, reload } = useApi<LeaderboardEntry[]>(
    () => api.getLeaderboard(),
    [],
  )
  const [inviteOpen, setInviteOpen] = useState(false)
  const reduce = useReducedMotion()

  const entries = data ?? []
  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)
  const me = entries.find((e) => e.userId === user?.id)

  return (
    <div>
      {/* Invite banner */}
      <motion.div
        className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-card bg-gradient-to-r from-primary-500/15 via-primary-500/10 to-transparent p-5 shadow-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 20 }}
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Leaderboard</h1>
          <p className="text-sm text-ink-soft">
            {loading && !data
              ? 'Loading…'
              : me
                ? `You're ranked #${me.rank} among ${entries.length} friends`
                : entries.length === 0
                  ? 'Invite friends to compete!'
                  : `Your rank among ${entries.length} friends`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-primary-600"
        >
          <span aria-hidden>+</span>
          Invite Friend
        </button>
      </motion.div>

      {loading && !data ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : entries.length === 0 ? (
        <EmptyState onInvite={() => setInviteOpen(true)} />
      ) : (
        <>
          {/* Top 3 podium */}
          {top3.length > 0 ? (
            <div className="mb-6 grid grid-cols-3 gap-3">
              {top3.map((entry, i) => (
                <motion.div
                  key={entry.userId}
                  className={`relative flex flex-col items-center rounded-card p-4 text-center shadow-card ${
                    entry.userId === user?.id
                      ? 'bg-primary-50 ring-2 ring-primary-400'
                      : 'bg-base-card'
                  } ${i === 0 ? 'md:-mt-2' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 120, damping: 20, delay: i * 0.1 }
                  }
                >
                  <span className="text-2xl" aria-hidden>{RANK_MEDAL[entry.rank]}</span>
                  <AvatarTier level={entry.level} seed={entry.name} size={56} animated={false} />
                  <p className="mt-2 truncate text-sm font-bold text-ink">{entry.name}</p>
                  <p className="text-xs text-ink-soft">Lv {entry.level}</p>
                  <p className="mt-1 text-xs font-bold tabular text-primary-400">
                    {entry.xp.toLocaleString()} XP
                  </p>
                </motion.div>
              ))}
            </div>
          ) : null}

          {/* Remaining ranks */}
          {rest.length > 0 ? (
            <div className="space-y-2">
              {rest.map((entry) => (
                <motion.div
                  key={entry.userId}
                  className={`flex items-center gap-4 rounded-card p-4 shadow-card transition-transform ${
                    entry.userId === user?.id
                      ? 'bg-primary-50/80 ring-1 ring-primary-400/30'
                      : 'bg-base-card'
                  }`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 150, damping: 20 }}
                >
                  <span className="w-8 text-center font-display text-lg font-bold text-ink-muted tabular">
                    {entry.rank}
                  </span>
                  <AvatarTier level={entry.level} seed={entry.name} size={40} animated={false} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {entry.name}
                      {entry.userId === user?.id ? (
                        <span className="ml-1.5 text-xs text-primary-400">(You)</span>
                      ) : null}
                    </p>
                    <p className="text-xs text-ink-soft">Level {entry.level}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold tabular text-primary-400">
                      {entry.xp.toLocaleString()} XP
                    </p>
                    {entry.streak > 0 ? (
                      <p className="text-xs text-ink-soft">🔥 {entry.streak}</p>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : null}
        </>
      )}

      <InviteFriendModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton h-20 rounded-card" />
      ))}
    </div>
  )
}

function EmptyState({ onInvite }: { onInvite: () => void }) {
  return (
    <div className="rounded-card bg-base-card p-10 text-center shadow-card">
      <div className="mb-3 text-4xl">👥</div>
      <p className="mx-auto max-w-sm text-sm text-ink-soft">
        No friends yet. Invite someone to compete on the leaderboard!
      </p>
      <button
        type="button"
        onClick={onInvite}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
      >
        <span aria-hidden>+</span>
        Invite Friend
      </button>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-card bg-base-card p-10 text-center shadow-card">
      <div className="mb-3 text-4xl">⚠️</div>
      <p className="mx-auto max-w-sm text-sm text-ink-soft">
        Couldn&apos;t load the leaderboard.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex rounded-xl bg-primary-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
      >
        Retry
      </button>
    </div>
  )
}
