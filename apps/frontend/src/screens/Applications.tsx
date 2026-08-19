import { useMemo, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ApplicationListItem, ApplicationStatus } from '../lib/api'
import { STATUS_LABEL, STATUS_ORDER, relativeTime } from '../lib/format'
import ApplicationCard from '../components/ApplicationCard'
import StatusPill from '../components/StatusPill'
import { applicationsMock } from '../mocks/applications'

// Phase 3: renders MOCK data. Status transitions are visual stubs — Phase 4
// wires them to PATCH /applications/:id/status.

type Filter = 'ALL' | ApplicationStatus

// Valid one-way transitions from specs/business-logic.md (prevents double-XP).
const NEXT_STATUSES: Record<ApplicationStatus, ApplicationStatus[]> = {
  SAVED: ['APPLIED'],
  APPLIED: ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['OFFER', 'REJECTED'],
  OFFER: [],
  REJECTED: [],
}

const PIPELINE: ApplicationStatus[] = ['SAVED', 'APPLIED', 'INTERVIEW', 'OFFER']

export default function Applications() {
  const [filter, setFilter] = useState<Filter>('ALL')
  const [selected, setSelected] = useState<ApplicationListItem | null>(null)

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: applicationsMock.length }
    for (const s of STATUS_ORDER) c[s] = 0
    for (const a of applicationsMock) c[a.status]++
    return c
  }, [])

  const visible = useMemo(
    () =>
      filter === 'ALL'
        ? applicationsMock
        : applicationsMock.filter((a) => a.status === filter),
    [filter],
  )

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Applications</h1>
        <p className="text-sm text-ink-soft">
          {applicationsMock.length} tracked across your job hunt
        </p>
      </header>

      {/* Status filter pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        <FilterPill
          label="All"
          count={counts.ALL}
          active={filter === 'ALL'}
          onClick={() => setFilter('ALL')}
        />
        {STATUS_ORDER.map((s) => (
          <FilterPill
            key={s}
            label={STATUS_LABEL[s]}
            count={counts[s]}
            active={filter === s}
            onClick={() => setFilter(s)}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="space-y-3">
          {visible.map((app) => (
            <ApplicationCard key={app.id} application={app} onClick={setSelected} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected ? (
          <DetailModal
            application={selected}
            onClose={() => setSelected(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? 'bg-ink text-white'
          : 'bg-base-card text-ink-soft shadow-card hover:text-ink'
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 text-xs tabular ${
          active ? 'bg-white/20' : 'bg-base-sunk text-ink-muted'
        }`}
      >
        {count}
      </span>
    </button>
  )
}

function EmptyState({ filter }: { filter: Filter }) {
  const msg =
    filter === 'ALL'
      ? 'No jobs saved yet. Save one from the extension or add it manually to start earning XP.'
      : `No applications in "${STATUS_LABEL[filter as ApplicationStatus]}".`
  return (
    <div className="rounded-card bg-base-card p-10 text-center shadow-card">
      <div className="mb-3 text-4xl">📭</div>
      <p className="mx-auto max-w-sm text-sm text-ink-soft">{msg}</p>
    </div>
  )
}

function DetailModal({
  application,
  onClose,
}: {
  application: ApplicationListItem
  onClose: () => void
}) {
  const { job, status, appliedAt } = application

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const currentIdx = PIPELINE.indexOf(status)
  const nexts = NEXT_STATUSES[status]

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${job.title} at ${job.company}`}
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
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold text-ink">{job.title}</h2>
            <p className="text-sm text-ink-soft">
              {job.company}
              {job.location ? ` · ${job.location}` : ''}
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

        <div className="mt-4 flex items-center gap-3">
          <StatusPill status={status} />
          <span className="text-xs text-ink-muted">
            {appliedAt ? `Applied ${relativeTime(appliedAt)}` : 'Not applied yet'}
          </span>
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            className="ml-auto text-sm font-semibold text-primary-600 hover:text-primary-500"
          >
            View posting ↗
          </a>
        </div>

        {/* Status pipeline */}
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Progress
          </p>
          {status === 'REJECTED' ? (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              Marked as rejected — every attempt still counts. Onwards.
            </div>
          ) : (
            <ol className="flex items-center gap-2">
              {PIPELINE.map((s, i) => {
                const reached = i <= currentIdx
                return (
                  <li key={s} className="flex flex-1 items-center gap-2">
                    <div className="flex flex-col items-center">
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                          reached
                            ? 'bg-primary-500 text-white'
                            : 'bg-base-sunk text-ink-muted'
                        }`}
                      >
                        {reached ? '✓' : i + 1}
                      </span>
                      <span className="mt-1 text-[10px] font-medium text-ink-muted">
                        {STATUS_LABEL[s]}
                      </span>
                    </div>
                    {i < PIPELINE.length - 1 ? (
                      <span
                        className={`h-0.5 flex-1 rounded ${
                          i < currentIdx ? 'bg-primary-500' : 'bg-base-sunk'
                        }`}
                      />
                    ) : null}
                  </li>
                )
              })}
            </ol>
          )}
        </div>

        {/* Transition actions (stubbed in Phase 3) */}
        <div className="mt-6">
          {nexts.length === 0 ? (
            <p className="text-sm text-ink-muted">
              {status === 'OFFER'
                ? '🏆 Terminal status — you got the offer!'
                : 'Terminal status — no further changes.'}
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {nexts.map((s) => (
                <button
                  key={s}
                  type="button"
                  title="Wired to PATCH /applications/:id/status in Phase 4"
                  className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors ${
                    s === 'REJECTED'
                      ? 'bg-rose-500 hover:bg-rose-600'
                      : 'bg-primary-500 hover:bg-primary-600'
                  }`}
                >
                  Mark as {STATUS_LABEL[s]}
                </button>
              ))}
              <span className="text-xs text-ink-muted">Wired in Phase 4</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
