import { AnimatePresence, motion } from 'framer-motion'
import AvatarTier from './AvatarTier'
import XPBar from './XPBar'
import StreakBadge from './StreakBadge'
import { tierForLevel } from '../lib/tiers'

interface AvatarCardProps {
  /** Optional personal name. Falls back to the tier title (API has no name). */
  name?: string
  level: number
  xp: number
  currentLevelXp?: number
  currentStreak: number
  longestStreak?: number
  /** Seed for the avatar identity (defaults to name/tier). */
  avatarSeed?: string
  /** When provided, shows an "Edit" button to customize the avatar. */
  onEditAvatar?: () => void
}

export default function AvatarCard({
  name,
  level,
  xp,
  currentLevelXp,
  currentStreak,
  longestStreak,
  avatarSeed,
  onEditAvatar,
}: AvatarCardProps) {
  const { title, index: tierIndex } = tierForLevel(level)
  const headline = name ?? title

  return (
    <section className="relative overflow-hidden rounded-card bg-base-card p-6 shadow-card sm:p-8">
      {/* Gold gradient border accent — echoes the badge motif */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-card bg-gradient-to-r from-primary-300 via-primary-400 to-primary-600" />

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div className="relative shrink-0 pt-2">
          {/* Crossfade old→new tier on tier change (not an instant swap).
              Keyed by tier index: a same-tier level-up updates in place. */}
          <div className="relative h-[128px] w-[128px]">
            <AnimatePresence initial={false}>
              <motion.div
                key={tierIndex}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <AvatarTier level={level} seed={avatarSeed ?? name} size={128} />
              </motion.div>
            </AnimatePresence>
          </div>
          {onEditAvatar ? (
            <button
              type="button"
              onClick={onEditAvatar}
              aria-label="Change avatar"
              className="absolute right-0 top-1 grid h-8 w-8 place-items-center rounded-full bg-base-card text-sm shadow-card transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              ✏️
            </button>
          ) : null}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">
                {headline}
              </h1>
              {name ? (
                <p className="text-sm font-medium text-primary-600">{title}</p>
              ) : (
                <p className="text-sm font-medium text-primary-600">
                  Level {level}
                </p>
              )}
            </div>
            <StreakBadge streak={currentStreak} longest={longestStreak} />
          </div>

          <div className="mt-4">
            <XPBar xp={xp} level={level} currentLevelXp={currentLevelXp} />
          </div>
        </div>
      </div>
    </section>
  )
}
