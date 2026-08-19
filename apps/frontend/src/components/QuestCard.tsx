import type { Quest } from '../lib/api'
import { categoryMeta } from '../lib/format'

interface QuestCardProps {
  quest: Quest
  /** When provided and the quest is OPEN, renders a Complete action. */
  onComplete?: (id: string) => void
  /** Slimmer padding for dashboard preview. */
  compact?: boolean
}

export default function QuestCard({ quest, onComplete, compact }: QuestCardProps) {
  const { label, icon } = categoryMeta(quest.category)
  const done = quest.status === 'DONE'

  return (
    <div
      className={`flex items-center gap-3 rounded-card bg-base-card shadow-card ${
        compact ? 'p-3' : 'p-4'
      } ${done ? 'opacity-70' : ''}`}
    >
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-base-sunk text-lg"
        aria-hidden
      >
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-semibold text-ink ${
            done ? 'line-through decoration-ink-muted' : ''
          }`}
        >
          {quest.title}
        </p>
        <p className="text-xs text-ink-muted">{label}</p>
      </div>

      <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-600 tabular">
        +{quest.xpReward} XP
      </span>

      {done ? (
        <span className="shrink-0 text-success" aria-label="Completed">
          ✓
        </span>
      ) : onComplete ? (
        <button
          type="button"
          onClick={() => onComplete(quest.id)}
          className="shrink-0 rounded-xl bg-success px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-success-deep"
        >
          Complete
        </button>
      ) : null}
    </div>
  )
}
