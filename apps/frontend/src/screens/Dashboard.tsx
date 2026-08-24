import { useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import AvatarCard from '../components/AvatarCard'
import AvatarPicker from '../components/AvatarPicker'
import StatCard from '../components/StatCard'
import QuestCard from '../components/QuestCard'
import ActivityRow from '../components/ActivityRow'
import AchievementCard from '../components/AchievementCard'
import LeaderboardWidget from '../components/LeaderboardWidget'
import type { DashboardResponse, LeaderboardEntry } from '../lib/api'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { useAuth } from '../lib/auth'
import { useAvatarSeed } from '../lib/avatarConfig'

// Identity seed for the avatar (user-chosen, persisted in localStorage).
// The dashboard API has no user `name`, so this is not derived from it.
const DEFAULT_AVATAR_SEED = 'JobQuest'

function SectionTitle({
  children,
  action,
}: {
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-display text-base font-bold text-ink">{children}</h2>
      {action}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-40 rounded-card" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="skeleton h-28 rounded-card" />
        <div className="skeleton h-28 rounded-card" />
        <div className="skeleton h-28 rounded-card" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="skeleton h-64 rounded-card" />
        <div className="skeleton h-64 rounded-card" />
      </div>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-card bg-base-card p-10 text-center shadow-card">
      <div className="mb-3 text-4xl">⚠️</div>
      <h2 className="font-display text-lg font-bold text-ink">
        Couldn&apos;t load your dashboard
      </h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
        The server didn&apos;t respond. Check the backend is running, then try
        again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-primary-600"
      >
        Retry
      </button>
    </div>
  )
}

export default function Dashboard() {
  const { user: authUser } = useAuth()
  const [avatarSeed, setAvatarSeed] = useAvatarSeed(DEFAULT_AVATAR_SEED)
  const [showPicker, setShowPicker] = useState(false)
  const { data, error, loading, reload } = useApi<DashboardResponse>(
    () => api.getDashboard(),
    [],
  )
  const { data: leaderboard } = useApi<LeaderboardEntry[]>(
    () => api.getLeaderboard(),
    [],
  )

  const isEmpty =
    !!data &&
    data.user.xp === 0 &&
    data.recentActivities.length === 0 &&
    data.openQuests.length === 0

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-ink-soft">
          {data ? `Welcome back, ${data.user.name} 👋` : 'Welcome back 👋'}
        </p>
      </header>

      {loading && !data ? (
        <DashboardSkeleton />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : data ? (
        isEmpty ? (
          <div className="space-y-6">
            <AvatarCard
              name={data.user.name}
              level={data.user.level}
              xp={data.user.xp}
              currentLevelXp={data.xpForCurrentLevel}
              currentStreak={data.user.currentStreak}
              longestStreak={data.user.longestStreak}
              avatarSeed={avatarSeed}
              onEditAvatar={() => setShowPicker(true)}
            />
            <div className="rounded-card bg-base-card p-10 text-center shadow-card">
              <div className="mb-3 text-4xl">📜</div>
              <h2 className="font-display text-lg font-bold text-ink">
                Your quest begins here
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
                Save your first job to start earning XP, leveling up, and
                unlocking achievements.
              </p>
              <Link
                to="/applications"
                className="mt-5 inline-flex rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-primary-600"
              >
                Save your first job
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <AvatarCard
              name={data.user.name}
              level={data.user.level}
              xp={data.user.xp}
              currentLevelXp={data.xpForCurrentLevel}
              currentStreak={data.user.currentStreak}
              longestStreak={data.user.longestStreak}
              avatarSeed={avatarSeed}
              onEditAvatar={() => setShowPicker(true)}
            />

            {/* Today's progress */}
            <section>
              <SectionTitle>Today&apos;s progress</SectionTitle>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                  icon="💼"
                  label="Applications"
                  value={data.todayProgress.applications}
                  accent="primary"
                />
                <StatCard
                  icon="🎙️"
                  label="Interviews"
                  value={data.todayProgress.interviews}
                  accent="success"
                />
                <StatCard
                  icon="⚡"
                  label="XP earned"
                  value={data.todayProgress.xpEarned}
                  accent="streak"
                />
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Open quests preview */}
              <section>
                <SectionTitle
                  action={
                    <Link
                      to="/quests"
                      className="text-sm font-semibold text-primary-600 hover:text-primary-500"
                    >
                      View all
                    </Link>
                  }
                >
                  Open quests
                </SectionTitle>
                {data.openQuests.length === 0 ? (
                  <div className="rounded-card bg-base-card p-6 text-center text-sm text-ink-muted shadow-card">
                    No open quests right now.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.openQuests.slice(0, 3).map((quest) => (
                      <QuestCard key={quest.id} quest={quest} compact />
                    ))}
                  </div>
                )}

                <div className="mt-6">
                  <SectionTitle>Recent achievements</SectionTitle>
                  {data.recentAchievements.length === 0 ? (
                    <p className="text-sm text-ink-muted">
                      None unlocked yet — keep going.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {data.recentAchievements.map((a) => (
                        <AchievementCard
                          key={a.key}
                          icon={a.icon}
                          title={a.title}
                          compact
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Recent activity */}
              <section>
                <SectionTitle>Recent activity</SectionTitle>
                {data.recentActivities.length === 0 ? (
                  <div className="rounded-card bg-base-card p-6 text-center text-sm text-ink-muted shadow-card">
                    No activity yet.
                  </div>
                ) : (
                  <div className="rounded-card bg-base-card px-4 shadow-card">
                    <ul className="divide-y divide-black/5 dark:divide-white/5">
                      {data.recentActivities.map((activity) => (
                        <ActivityRow
                          key={`${activity.type}-${activity.createdAt}`}
                          activity={activity}
                        />
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            </div>

            {/* Leaderboard widget */}
            {leaderboard && leaderboard.length > 0 ? (
              <LeaderboardWidget
                entries={leaderboard}
                currentUserId={authUser?.id}
              />
            ) : null}
          </div>
        )
      ) : null}

      <AnimatePresence>
        {showPicker ? (
          <AvatarPicker
            level={data?.user.level ?? 1}
            selectedSeed={avatarSeed}
            onSelect={setAvatarSeed}
            onClose={() => setShowPicker(false)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}
