import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import AvatarTier from './AvatarTier'
import XPBar from './XPBar'
import { tierForLevel } from '../lib/tiers'
import { loadAvatarSeed } from '../lib/avatarConfig'

// Full-attention level-up moment (specs/ui-spec.md Global States). Scale+fade
// in; the avatar crossfades from the old tier to the new one when the tier
// changed. Dismiss on click/Esc or auto after a few seconds.

interface LevelUpModalProps {
  level: number
  fromLevel: number
  xp: number
  onDismiss: () => void
}

const AUTO_DISMISS_MS = 4200

export default function LevelUpModal({
  level,
  fromLevel,
  xp,
  onDismiss,
}: LevelUpModalProps) {
  const reduce = useReducedMotion()
  const seed = loadAvatarSeed('JobQuest')
  const tierChanged = tierForLevel(fromLevel).index !== tierForLevel(level).index
  const { title } = tierForLevel(level)

  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', onKey)
    }
  }, [onDismiss])

  return (
    <motion.div
      className="fixed inset-0 z-[70] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-label={`Level ${level} reached`}
    >
      <motion.div
        className="w-full max-w-sm rounded-card bg-base-card p-8 text-center shadow-card-hover"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 16 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
        transition={
          reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 260, damping: 20 }
        }
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-500">
          Level up
        </p>

        {/* Avatar tier crossfade */}
        <div className="relative mx-auto mt-4 h-[120px] w-[120px]">
          {tierChanged && !reduce ? (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <AvatarTier level={fromLevel} seed={seed} size={120} animated={false} />
            </motion.div>
          ) : null}
          <motion.div
            className="absolute inset-0"
            initial={
              tierChanged && !reduce ? { opacity: 0, scale: 0.9 } : { opacity: 1 }
            }
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: tierChanged && !reduce ? 0.4 : 0 }}
          >
            <AvatarTier level={level} seed={seed} size={120} />
          </motion.div>
        </div>

        <h2 className="mt-5 font-display text-3xl font-bold text-ink">
          Level {level}!
        </h2>
        <p className="mt-1 text-sm font-medium text-primary-600">
          {tierChanged ? `New tier — ${title}` : title}
        </p>

        <div className="mt-5">
          <XPBar xp={xp} level={level} />
        </div>

        <p className="mt-5 text-xs text-ink-muted">Tap anywhere to continue</p>
      </motion.div>
    </motion.div>
  )
}
