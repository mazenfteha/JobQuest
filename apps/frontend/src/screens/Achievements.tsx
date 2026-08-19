import { useMemo } from 'react'
import AchievementCard from '../components/AchievementCard'
import { achievementsMock } from '../mocks/achievements'

// Phase 3: renders MOCK data (GET /achievements shape). Phase 4 wires the
// real endpoint + unlock toasts.

export default function Achievements() {
  const { ordered, unlockedCount, total, pct } = useMemo(() => {
    // Unlocked first, then locked — keeps earned badges up top.
    const ordered = [...achievementsMock].sort(
      (a, b) => Number(b.unlocked) - Number(a.unlocked),
    )
    const unlockedCount = achievementsMock.filter((a) => a.unlocked).length
    const total = achievementsMock.length
    const pct = total ? Math.round((unlockedCount / total) * 100) : 0
    return { ordered, unlockedCount, total, pct }
  }, [])

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Achievements</h1>
        <p className="text-sm text-ink-soft">
          {unlockedCount} of {total} unlocked
        </p>
        <div className="mt-3 h-2.5 max-w-xs overflow-hidden rounded-full bg-base-sunk">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-300 to-primary-600"
            style={{ width: `${pct}%` }}
          />
        </div>
      </header>

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
    </div>
  )
}
