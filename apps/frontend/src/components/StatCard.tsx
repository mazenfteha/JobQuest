type Accent = 'primary' | 'streak' | 'success'

interface StatCardProps {
  label: string
  value: string | number
  icon: string
  accent?: Accent
}

const ACCENT: Record<Accent, string> = {
  primary: 'bg-primary-50 text-primary-600',
  streak: 'bg-streak-soft text-streak-deep',
  success: 'bg-success-soft text-success-deep',
}

export default function StatCard({
  label,
  value,
  icon,
  accent = 'primary',
}: StatCardProps) {
  return (
    <div className="rounded-card bg-base-card p-4 shadow-card">
      <span
        className={`grid h-9 w-9 place-items-center rounded-xl text-lg ${ACCENT[accent]}`}
        aria-hidden
      >
        {icon}
      </span>
      <p className="mt-3 font-display text-2xl font-bold tabular text-ink">
        {value}
      </p>
      <p className="text-sm text-ink-soft">{label}</p>
    </div>
  )
}
