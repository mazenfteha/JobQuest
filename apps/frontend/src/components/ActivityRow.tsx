import type { Activity } from '../lib/api'
import { activityMeta, relativeTime } from '../lib/format'

interface ActivityRowProps {
  activity: Activity
}

export default function ActivityRow({ activity }: ActivityRowProps) {
  const { label, icon } = activityMeta(activity.type)

  return (
    <li className="flex items-center gap-3 py-2.5">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-base-sunk text-base"
        aria-hidden
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-ink-muted">{relativeTime(activity.createdAt)}</p>
      </div>
      <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-600 tabular">
        +{activity.xp} XP
      </span>
    </li>
  )
}
