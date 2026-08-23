import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { AUTH_LOGIN_URL } from '../lib/api'
import AcceptFriendModal from '../components/AcceptFriendModal'

export default function Join() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const code = searchParams.get('code')

  if (!code) {
    return (
      <div className="grid min-h-screen place-items-center bg-base px-4">
        <div className="w-full max-w-sm rounded-card bg-base-card p-8 text-center shadow-card">
          <div className="mb-3 text-4xl">🔗</div>
          <h1 className="font-display text-xl font-bold text-ink">Invalid Link</h1>
          <p className="mt-2 text-sm text-ink-soft">
            This invite link is missing a code. Ask your friend for a new one.
          </p>
          <a
            href="/"
            className="mt-4 inline-flex rounded-xl bg-primary-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }

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
    // Store the code so we can accept after login.
    // For simplicity, redirect to login — the join code will be in the URL.
    return (
      <div className="grid min-h-screen place-items-center bg-base px-4">
        <div className="w-full max-w-sm rounded-card bg-base-card p-8 text-center shadow-card">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-2xl shadow-glow">
            🎯
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">JobQuest</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-ink-soft">
            Sign in to accept your friend invite and start competing on the
            leaderboard.
          </p>
          <a
            href={`${AUTH_LOGIN_URL}&state=${encodeURIComponent(window.location.href)}`}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink/90"
          >
            <span aria-hidden>🔑</span> Sign in with Google
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-h-screen place-items-center bg-base">
      <AcceptFriendModal
        open={true}
        code={code}
        onClose={() => navigate('/', { replace: true })}
      />
    </div>
  )
}
