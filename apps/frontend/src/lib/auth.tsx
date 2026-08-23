import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthUser } from './api'
import { api } from './api'

// Auth state: resolves the current user from GET /auth/me on load. A 401
// (not signed in) resolves to user=null, which the app renders as the login
// screen.

interface AuthState {
  user: AuthUser | null
  loading: boolean
  reload: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .getMe()
      .then((u) => {
        if (!cancelled) {
          setUser(u)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [tick])

  const reload = () => setTick((t) => t + 1)

  return (
    <AuthContext.Provider value={{ user, loading, reload }}>
      {children}
    </AuthContext.Provider>
  )
}
