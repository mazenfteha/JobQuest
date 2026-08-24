import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api, ApiError } from '../lib/api'

interface InviteFriendModalProps {
  open: boolean
  onClose: () => void
}

export default function InviteFriendModal({ open, onClose }: InviteFriendModalProps) {
  const [link, setLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleInvite() {
    setLoading(true)
    setError(null)
    try {
      const res = await api.inviteFriend()
      setLink(res.inviteLink)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to generate invite link')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select text
      const el = document.getElementById('invite-link')
      if (el) {
        ;(el as HTMLInputElement).select()
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  function handleClose() {
    setLink(null)
    setCopied(false)
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
          onClick={handleClose}
        >
          <motion.div
            className="w-full max-w-sm rounded-card bg-base-card p-6 shadow-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-lg font-bold text-ink">
              Invite a Friend
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Share this link to add a friend. You&apos;ll both appear on each
              other&apos;s leaderboard.
            </p>

            {error ? (
              <p className="mt-3 rounded-xl bg-streak/10 px-3 py-2 text-sm text-streak">
                {error}
              </p>
            ) : null}

            {link ? (
              <div className="mt-4">
                <input
                  id="invite-link"
                  type="text"
                  readOnly
                  value={link}
                  className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-base-sunk px-3 py-2 text-sm text-ink font-mono"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="mt-3 w-full rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                >
                  {copied ? '✓ Copied!' : 'Copy Link'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInvite}
                disabled={loading}
                className="mt-4 w-full rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
              >
                {loading ? 'Generating…' : 'Generate Invite Link'}
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="mt-3 w-full rounded-xl px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-base-sunk"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
