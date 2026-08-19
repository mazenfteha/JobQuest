import AvatarTier from './AvatarTier'
import XPBar from './XPBar'
import StreakBadge from './StreakBadge'
import { tierForLevel } from '../lib/tiers'

interface AvatarCardProps {
  name: string
  level: number
  xp: number
  nextLevelXp?: number
  currentStreak: number
  longestStreak?: number
  /** Seed for the avatar identity (defaults to name). */
  avatarSeed?: string
  /** When provided, shows an "Edit" button to customize the avatar. */
  onEditAvatar?: () => void
}

export default function AvatarCard({
  name,
  level,
  xp,
  nextLevelXp,
  currentStreak,
  longestStreak,
  avatarSeed,
  onEditAvatar,
}: AvatarCardProps) {
  const { title } = tierForLevel(level)

  return (
    <section className="rounded-card bg-base-card p-6 shadow-card">
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        <div className="relative shrink-0 pt-2">
          <AvatarTier level={level} seed={avatarSeed ?? name} size={104} />
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
              <h1 className="font-display text-xl font-bold text-ink">{name}</h1>
              <p className="text-sm font-medium text-primary-600">{title}</p>
            </div>
            <StreakBadge streak={currentStreak} longest={longestStreak} />
          </div>

          <div className="mt-4">
            <XPBar xp={xp} level={level} nextLevelXp={nextLevelXp} />
          </div>
        </div>
      </div>
    </section>
  )
}
