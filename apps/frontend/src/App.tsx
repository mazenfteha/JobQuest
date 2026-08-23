import { Routes, Route } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import Dashboard from './screens/Dashboard'
import Applications from './screens/Applications'
import QuestBoard from './screens/QuestBoard'
import Achievements from './screens/Achievements'
import Leaderboard from './screens/Leaderboard'
import Join from './screens/Join'
import { RewardsProvider } from './rewards/RewardsProvider'
import { AuthProvider, useAuth } from './lib/auth'
import { AUTH_LOGIN_URL } from './lib/api'

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}

function Gate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-base">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-base-sunk border-t-primary-500"
          aria-label="Loading"
        />
      </div>
    )
  }

  if (!user) return <LoginScreen />

  return (
    <RewardsProvider>
      <Routes>
        <Route path="/join" element={<Join />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/quests" element={<QuestBoard />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Route>
      </Routes>
    </RewardsProvider>
  )
}

function LoginScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-base px-4">
      <div className="w-full max-w-sm rounded-card bg-base-card p-8 text-center shadow-card">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-2xl shadow-glow">
          🎯
        </div>
        <h1 className="font-display text-2xl font-bold text-ink">JobQuest</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-ink-soft">
          Turn your job hunt into a game. Sign in to track applications, earn XP,
          and level up.
        </p>
        <a
          href={AUTH_LOGIN_URL}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink/90"
        >
          <span aria-hidden>🔑</span> Sign in with Google
        </a>
      </div>
    </div>
  )
}
