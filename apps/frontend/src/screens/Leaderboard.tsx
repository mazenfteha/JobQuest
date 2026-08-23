import { useState } from 'react'
import type { LeaderboardEntry } from '../lib/api'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { useAuth } from '../lib/auth'
import FriendCard from '../components/FriendCard'
import InviteFriendModal from '../components/InviteFriendModal'

export default function Leaderboard() {
  const { user } = useAuth()
  const { data, error, loading, reload } = useApi<LeaderboardEntry[]>(
    () => api.getLeaderboard(),
    [],
  )
  const [inviteOpen, setInviteOpen] = useState(false)

  const entries = data ?? []

  return (
    <div>
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Leaderboard</h1>
          <p className="text-sm text-ink-soft">
            {loading && !data
              ? 'Loading…'
              : entries.length === 1
                ? 'Add friends to compete!'
                : `Your rank among ${entries.length} friends`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          <span aria-hidden>+</span>
          Invite Friend
        </button>
      </header>

      {loading && !data ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : entries.length === 0 ? (
        <EmptyState onInvite={() => setInviteOpen(true)} />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <FriendCard
              key={entry.userId}
              rank={entry.rank}
              name={entry.name}
              avatarUrl={entry.avatarUrl}
              xp={entry.xp}
              level={entry.level}
              streak={entry.streak}
              isCurrentUser={entry.userId === user?.id}
            />
          ))}
        </div>
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
