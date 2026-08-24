import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import Dashboard from './screens/Dashboard'
import Applications from './screens/Applications'
import QuestBoard from './screens/QuestBoard'
import Achievements from './screens/Achievements'
import Leaderboard from './screens/Leaderboard'
import Join from './screens/Join'
import LandingPage from './screens/LandingPage'
import { RewardsProvider } from './rewards/RewardsProvider'
import { AuthProvider, useAuth } from './lib/auth'
import { ThemeProvider } from './lib/theme'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GameBackground />
        <Gate />
      </AuthProvider>
    </ThemeProvider>
  )
}

/** Animated background — floating gradient orbs + drifting particles. */
function GameBackground() {
  return (
    <div className="game-bg" aria-hidden>
      <div className="game-bg__orb game-bg__orb--1" />
      <div className="game-bg__orb game-bg__orb--2" />
      <div className="game-bg__orb game-bg__orb--3" />
      <div className="game-bg__particle" />
      <div className="game-bg__particle" />
      <div className="game-bg__particle" />
      <div className="game-bg__particle" />
      <div className="game-bg__particle" />
      <div className="game-bg__particle" />
      <div className="game-bg__particle" />
      <div className="game-bg__particle" />
      <div className="game-bg__particle" />
      <div className="game-bg__particle" />
      <div className="game-bg__particle" />
    </div>
  )
}

function Gate() {
  const { user, loading } = useAuth()
  const [params] = useSearchParams()
  const authError = params.get('error')

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

  if (!user) {
    return (
      <>
        {authError ? (
          <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 py-3">
            <div className="rounded-xl bg-streak/15 px-4 py-2.5 text-sm font-medium text-streak shadow-card">
              Sign-in didn&apos;t complete — try again.
            </div>
          </div>
        ) : null}
        <LandingPage />
      </>
    )
  }

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
