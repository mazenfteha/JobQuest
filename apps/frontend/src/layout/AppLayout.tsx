import { NavLink, Outlet } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

interface NavItem {
  to: string
  label: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/applications', label: 'Applications', icon: '💼' },
  { to: '/quests', label: 'Quest Board', icon: '🗡️' },
  { to: '/achievements', label: 'Achievements', icon: '🏅' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
]

function linkClass({ isActive }: { isActive: boolean }): string {
  const base =
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors'
  return isActive
    ? `${base} bg-primary-50 text-primary-600`
    : `${base} text-ink-soft hover:bg-base-sunk hover:text-ink`
}

async function handleLogout() {
  try {
    await api.logout()
  } finally {
    window.location.reload()
  }
}

export default function AppLayout() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar */}
      <aside className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-black/5 bg-base-card/90 px-4 backdrop-blur md:h-screen md:w-64 md:flex-col md:items-stretch md:gap-0 md:border-b-0 md:border-r md:px-4 md:py-6">
        <div className="flex items-center gap-2.5 md:px-2 md:pb-8">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-lg shadow-glow">
            🎯
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            JobQuest
          </span>
        </div>

        <nav className="flex flex-1 items-center gap-1 md:flex-col md:items-stretch md:gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
              <span className="text-base" aria-hidden>
                {item.icon}
              </span>
              <span className="hidden sm:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0 md:mt-2 md:flex-col md:items-stretch md:gap-2 md:border-t md:border-black/5 md:pt-4">
          <div className="hidden items-center gap-2 md:flex md:px-2">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="h-7 w-7 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : null}
            <span className="truncate text-sm font-medium text-ink">
              {user?.name}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-base-sunk hover:text-ink"
          >
            <span aria-hidden>↩</span>
            <span className="ml-2 hidden sm:inline">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
