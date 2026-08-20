import { useMemo } from 'react'
import type { Achievement } from '../lib/api'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import AchievementCard from '../components/AchievementCard'

// Phase 4: live data. GET /achievements, unlocked vs locked per `unlocked`.

export default function Achievements() {
  const { data, error, loading, reload } = useApi<Achievement[]>(
    () => api.getAchievements(),
    [],
  )

  const achievements = data ?? []
  const { ordered, unlockedCount, total, pct } = useMemo(() => {
    // Unlocked first, then locked — keeps earned badges up top.
    const ordered = [...achievements].sort(
      (a, b) => Number(b.unlocked) - Number(a.unlocked),
    )
    const unlockedCount = achievements.filter((a) => a.unlocked).length
    const total = achievements.length
    const pct = total ? Math.round((unlockedCount / total) * 100) : 0
    return { ordered, unlockedCount, total, pct }
  }, [achievements])

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Achievements</h1>
        <p className="text-sm text-ink-soft">
          {loading && !data
            ? 'Loading…'
            : `${unlockedCount} of ${total} unlocked`}
        </p>
        {!loading || data ? (
          <div className="mt-3 h-2.5 max-w-xs overflow-hidden rounded-full bg-base-sunk">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-300 to-primary-600"
              style={{ width: `${pct}%` }}
            />
          </div>
        ) : null}
      </header>

      {loading && !data ? (
        <GridSkeleton />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {ordered.map((a) => (
            <AchievementCard
              key={a.key}
              icon={a.icon}
              title={a.title}
              description={a.description}
              unlocked={a.unlocked}
              unlockedAt={a.unlockedAt}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="skeleton h-40 rounded-card" />
      ))}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-card bg-base-card p-10 text-center shadow-card">
      <div className="mb-3 text-4xl">⚠️</div>
      <p className="mx-auto max-w-sm text-sm text-ink-soft">
        Couldn&apos;t load your achievements.
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
