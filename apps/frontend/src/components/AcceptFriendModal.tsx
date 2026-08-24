import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api, ApiError } from '../lib/api'

interface AcceptFriendModalProps {
  open: boolean
  code: string
  onClose: () => void
}

export default function AcceptFriendModal({ open, code, onClose }: AcceptFriendModalProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleAccept() {
    setStatus('loading')
    setError(null)
    try {
      await api.acceptFriend(code)
      setStatus('success')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to accept invite')
      }
      setStatus('error')
    }
  }

  function handleClose() {
    setStatus('idle')
    setError(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-sm rounded-card bg-base-card p-6 shadow-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {status === 'success' ? (
              <>
                <div className="text-center">
                  <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-success-soft text-3xl">
                    🤝
                  </div>
                  <h2 className="font-display text-lg font-bold text-ink">
                    Friend Added!
                  </h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    You&apos;re now connected. Check the leaderboard to see your
                    friend&apos;s progress.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-4 w-full rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                >
                  Awesome!
                </button>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary-50 text-3xl">
                    👋
                  </div>
                  <h2 className="font-display text-lg font-bold text-ink">
                    Accept Friend Invite
                  </h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    Add this person as a friend to compete on the leaderboard.
                  </p>
                </div>

                {error ? (
                  <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                ) : null}

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-base-sunk"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAccept}
                    disabled={status === 'loading'}
                    className="flex-1 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                  >
                    {status === 'loading' ? 'Adding…' : 'Accept'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
