import { useEffect } from 'react'
import { motion } from 'framer-motion'
import AvatarTier from './AvatarTier'
import { AVATAR_OPTIONS } from '../lib/avatarConfig'

// Gallery avatar picker (Phase 3: selection persists to localStorage via the
// caller). Previews render at the user's current level so the tier frame
// matches. Selection is live — clicking updates the avatar immediately.

interface AvatarPickerProps {
  level: number
  selectedSeed: string
  onSelect: (seed: string) => void
  onClose: () => void
}

export default function AvatarPicker({
  level,
  selectedSeed,
  onSelect,
  onClose,
}: AvatarPickerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Choose your avatar"
    >
      <motion.div
        className="w-full max-w-lg rounded-card bg-base-card p-6 shadow-card-hover"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">
              Choose your avatar
            </h2>
            <p className="text-sm text-ink-soft">
              Your level frame stays the same — pick the character inside it.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-muted hover:bg-base-sunk"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {AVATAR_OPTIONS.map((opt) => {
            const active = opt.seed === selectedSeed
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelect(opt.seed)}
                aria-pressed={active}
                className={`flex items-center justify-center rounded-2xl p-2 transition-colors ${
                  active
                    ? 'bg-primary-50 ring-2 ring-primary-400'
                    : 'hover:bg-base-sunk'
                }`}
              >
                <AvatarTier level={level} seed={opt.seed} size={72} animated={false} />
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
