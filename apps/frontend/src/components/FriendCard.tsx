import AvatarTier from './AvatarTier'

interface FriendCardProps {
  rank: number
  name: string
  avatarUrl: string | null
  xp: number
  level: number
  streak: number
  isCurrentUser?: boolean
}

const RANK_EMOJI: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

export default function FriendCard({
  rank,
  name,
  xp,
  level,
  streak,
  isCurrentUser,
}: FriendCardProps) {
  return (
    <div
      className={`flex items-center gap-4 rounded-card p-4 shadow-card transition-transform ${
        isCurrentUser ? 'bg-primary-50 ring-2 ring-primary-300' : 'bg-base-card'
      }`}
    >
      {/* Rank */}
      <span className="w-8 text-center font-display text-lg font-bold text-ink-muted tabular">
        {RANK_EMOJI[rank] ?? rank}
      </span>

      {/* Avatar */}
      <AvatarTier level={level} seed={name} size={44} animated={false} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-ink">
          {name} {isCurrentUser ? '(You)' : ''}
        </p>
        <p className="text-xs text-ink-soft">Level {level}</p>
      </div>

      {/* Stats */}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold tabular text-primary-600">
          {xp.toLocaleString()} XP
        </p>
        {streak > 0 ? (
          <p className="text-xs text-ink-soft">🔥 {streak}</p>
        ) : null}
      </div>
    </div>
  )
}
