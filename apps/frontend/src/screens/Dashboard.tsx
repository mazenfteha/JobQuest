import { useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import AvatarCard from '../components/AvatarCard'
import AvatarTier from '../components/AvatarTier'
import AvatarPicker from '../components/AvatarPicker'
import { tierForLevel } from '../lib/tiers'
import { useAvatarSeed } from '../lib/avatarConfig'
import StatCard from '../components/StatCard'
import QuestCard from '../components/QuestCard'
import ActivityRow from '../components/ActivityRow'
import AchievementCard from '../components/AchievementCard'
import { dashboardMock, emptyDashboardMock } from '../mocks/dashboard'

// Phase 3: renders MOCK data. Phase 4 swaps `data` for GET /dashboard.
type View = 'loaded' | 'loading' | 'empty' | 'avatars'

const USER_NAME = 'Mazen'

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

function EmptyDashboard({
  avatarSeed,
  onEditAvatar,
}: {
  avatarSeed: string
  onEditAvatar: () => void
}) {
  const { user } = emptyDashboardMock
  return (
    <div className="space-y-6">
      <AvatarCard
        name={USER_NAME}
        level={user.level}
        xp={user.xp}
        nextLevelXp={emptyDashboardMock.xpForCurrentLevel}
        currentStreak={user.currentStreak}
        longestStreak={user.longestStreak}
        avatarSeed={avatarSeed}
        onEditAvatar={onEditAvatar}
      />
      <div className="rounded-card bg-base-card p-10 text-center shadow-card">
        <div className="mb-3 text-4xl">🗺️</div>
        <h2 className="font-display text-lg font-bold text-ink">
          Your quest begins here
        </h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-ink-soft">
          Save your first job to start earning XP, leveling up, and unlocking
          achievements.
        </p>
        <Link
          to="/applications"
          className="mt-5 inline-flex rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-primary-600"
        >
          Save your first job
        </Link>
      </div>
    </div>
  )
}

// Dev-only: preview all four avatar tiers at once.
function AvatarTierPreview() {
  const sample = [2, 6, 12, 16]
  return (
    <div className="rounded-card bg-base-card p-6 shadow-card">
      <h2 className="mb-1 font-display text-base font-bold text-ink">
        Avatar tiers
      </h2>
      <p className="mb-6 text-sm text-ink-soft">
        Swapped by <code className="rounded bg-base-sunk px-1">user.level</code>{' '}
        — dev preview, removed in Phase 4.
      </p>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {sample.map((lvl) => {
          const { title, band } = tierForLevel(lvl)
          return (
            <div key={lvl} className="text-center">
              <div className="mx-auto w-fit">
                <AvatarTier level={lvl} seed={USER_NAME} size={120} />
              </div>
              <p className="mt-4 font-display text-sm font-bold text-ink">
                {title}
              </p>
              <p className="text-xs text-ink-muted">Level {band}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [view, setView] = useState<View>('loaded')
  const [avatarSeed, setAvatarSeed] = useAvatarSeed(USER_NAME)
  const [showPicker, setShowPicker] = useState(false)
  const data = dashboardMock

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
          <p className="text-sm text-ink-soft">Welcome back, {USER_NAME} 👋</p>
        </div>
        <StateToggle view={view} onChange={setView} />
      </header>

      {view === 'loading' ? (
        <DashboardSkeleton />
      ) : view === 'empty' ? (
        <EmptyDashboard
          avatarSeed={avatarSeed}
          onEditAvatar={() => setShowPicker(true)}
        />
      ) : view === 'avatars' ? (
        <AvatarTierPreview />
      ) : (
        <div className="space-y-6">
          <AvatarCard
            name={USER_NAME}
            level={data.user.level}
            xp={data.user.xp}
            nextLevelXp={data.xpForCurrentLevel}
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
              <div className="space-y-3">
                {data.openQuests.slice(0, 3).map((quest) => (
                  <QuestCard key={quest.id} quest={quest} compact />
                ))}
              </div>

              <div className="mt-6">
                <SectionTitle>Recent achievements</SectionTitle>
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
              </div>
            </section>

            {/* Recent activity */}
            <section>
              <SectionTitle>Recent activity</SectionTitle>
              <div className="rounded-card bg-base-card px-4 shadow-card">
                <ul className="divide-y divide-black/5">
                  {data.recentActivities.map((activity) => (
                    <ActivityRow key={activity.id} activity={activity} />
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showPicker ? (
          <AvatarPicker
            level={
              view === 'empty' ? emptyDashboardMock.user.level : data.user.level
            }
            selectedSeed={avatarSeed}
            onSelect={setAvatarSeed}
            onClose={() => setShowPicker(false)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

// --- Dev-only affordance to preview screen states during Phase 3 review ---
function StateToggle({
  view,
  onChange,
}: {
  view: View
  onChange: (v: View) => void
}) {
  const options: View[] = ['loaded', 'loading', 'empty', 'avatars']
  return (
    <div className="inline-flex rounded-xl bg-base-sunk p-1 text-xs font-semibold">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-lg px-3 py-1.5 capitalize transition-colors ${
            view === opt ? 'bg-base-card text-ink shadow-card' : 'text-ink-muted'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
