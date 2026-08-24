import type { Quest, QuestStatus } from '../lib/api'
import { QUEST_XP_REWARD } from '../lib/api'

// Accepts a full Quest (Quest Board) or the dashboard's preview subset
// (no status/completedAt) — treated as OPEN when status is absent.
type QuestCardQuest = Pick<Quest, 'id' | 'title' | 'category'> & {
  status?: QuestStatus
  completedAt?: string | null
}

interface QuestCardProps {
  quest: QuestCardQuest
  /** When provided and the quest is OPEN, renders a Complete action. */
  onComplete?: (id: string) => void
  /** Slimmer padding for dashboard preview. */
  compact?: boolean
}

export default function QuestCard({ quest, onComplete, compact }: QuestCardProps) {
  const done = quest.status === 'DONE'

  return (
    <div
      className={`flex items-center gap-3 rounded-card bg-base-card shadow-card ${
        compact ? 'p-3' : 'p-4'
      } ${done ? 'opacity-70' : ''}`}
    >
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-lg"
        aria-hidden
      >
        📜
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-semibold text-ink ${
            done ? 'line-through decoration-ink-muted' : ''
          }`}
        >
          {quest.title}
        </p>
        {quest.category ? (
          <p className="truncate text-xs text-ink-muted">{quest.category}</p>
        ) : null}
      </div>

      <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-600 tabular">
        +{QUEST_XP_REWARD} XP
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
