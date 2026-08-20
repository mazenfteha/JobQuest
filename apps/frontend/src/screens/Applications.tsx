import { useMemo, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ApplicationListItem, ApplicationStatus } from '../lib/api'
import { api, ApiError } from '../lib/api'
import { useApi } from '../lib/useApi'
import { useRewards } from '../rewards/RewardsProvider'
import { STATUS_LABEL, STATUS_ORDER } from '../lib/format'
import ApplicationCard from '../components/ApplicationCard'
import StatusPill from '../components/StatusPill'

// Phase 4: live data. GET /applications (client-side filter + counts),
// GET /applications/:id for detail, PATCH /applications/:id/status for
// transitions with inline 400 handling.

type Filter = 'ALL' | ApplicationStatus

// Valid one-way transitions from specs/business-logic.md.
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
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const { data, error, loading, reload } = useApi<ApplicationListItem[]>(
    () => api.getApplications(),
    [],
  )

  const apps = data ?? []

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: apps.length }
    for (const s of STATUS_ORDER) c[s] = 0
    for (const a of apps) c[a.status]++
    return c
  }, [apps])

  const visible = useMemo(
    () => (filter === 'ALL' ? apps : apps.filter((a) => a.status === filter)),
    [apps, filter],
  )

  const selected = selectedId
    ? apps.find((a) => a.id === selectedId) ?? null
    : null

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Applications
          </h1>
          <p className="text-sm text-ink-soft">
            {apps.length} tracked across your job hunt
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-primary-600"
        >
          + Add job
        </button>
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

      {loading && !data ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : visible.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="space-y-3">
          {visible.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onClick={() => setSelectedId(app.id)}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected ? (
          <DetailModal
            application={selected}
            onClose={() => setSelectedId(null)}
            onChanged={reload}
          />
        ) : null}
        {showAdd ? (
          <AddJobModal
            onClose={() => setShowAdd(false)}
            onAdded={() => {
              setShowAdd(false)
              reload()
            }}
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

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="skeleton h-[76px] rounded-card" />
      ))}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-card bg-base-card p-10 text-center shadow-card">
      <div className="mb-3 text-4xl">⚠️</div>
      <p className="mx-auto max-w-sm text-sm text-ink-soft">
        Couldn&apos;t load your applications.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex rounded-xl bg-primary-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
      >
        Retry
      </button>
    </div>
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

function AddJobModal({
  onClose,
  onAdded,
}: {
  onClose: () => void
  onAdded: () => void
}) {
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [url, setUrl] = useState('')
  const [location, setLocation] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const { celebrate } = useRewards()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const titleError = title.trim() ? null : 'Required.'
  const companyError = company.trim() ? null : 'Required.'
  const urlError = url.trim() ? null : 'Required.'
  const valid = !titleError && !companyError && !urlError

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setFormError(null)
    if (!valid) return
    setSubmitting(true)
    try {
      const res = await api.saveJob({
        title: title.trim(),
        company: company.trim(),
        url: url.trim(),
        location: location.trim() || undefined,
        source: 'manual',
      })
      celebrate(res.xpAward)
      onAdded()
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFormError('This job is already saved.')
      } else {
        setFormError(
          err instanceof ApiError ? err.message : 'Something went wrong. Try again.',
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (invalid: boolean) =>
    `w-full rounded-xl border bg-base px-3 py-2 text-sm text-ink outline-none focus:ring-2 ${
      invalid
        ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100'
        : 'border-black/10 focus:border-primary-400 focus:ring-primary-100'
    }`

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Add a job"
    >
      <motion.form
        onSubmit={submit}
        className="w-full max-w-lg rounded-card bg-base-card p-6 shadow-card-hover"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Add a job</h2>
            <p className="text-sm text-ink-soft">
              Saves it to your board (+10 XP) as a new SAVED application.
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

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-soft" htmlFor="j-title">
              Title
            </label>
            <input
              id="j-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Backend Engineer"
              autoFocus
              className={inputClass(submitted && !!titleError)}
            />
            {submitted && titleError ? (
              <p className="mt-1 text-xs font-medium text-rose-600">{titleError}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-soft" htmlFor="j-company">
                Company
              </label>
              <input
                id="j-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme"
                className={inputClass(submitted && !!companyError)}
              />
              {submitted && companyError ? (
                <p className="mt-1 text-xs font-medium text-rose-600">
                  {companyError}
                </p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-soft" htmlFor="j-loc">
                Location{' '}
                <span className="font-normal text-ink-muted">(optional)</span>
              </label>
              <input
                id="j-loc"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote"
                className={inputClass(false)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-soft" htmlFor="j-url">
              Job URL
            </label>
            <input
              id="j-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className={inputClass(submitted && !!urlError)}
            />
            {submitted && urlError ? (
              <p className="mt-1 text-xs font-medium text-rose-600">{urlError}</p>
            ) : null}
          </div>
        </div>

        {formError ? (
          <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
            {formError}
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-base-sunk"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            aria-disabled={!valid}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
              valid ? 'bg-primary-500 hover:bg-primary-600' : 'bg-primary-300'
            }`}
          >
            {submitting ? 'Saving…' : 'Save job'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  )
}

function DetailModal({
  application,
  onClose,
  onChanged,
}: {
  application: ApplicationListItem
  onClose: () => void
  onChanged: () => void
}) {
  const { job } = application
  // Live status starts from the list item; PATCH responses update it.
  const [status, setStatus] = useState<ApplicationStatus>(application.status)
  const [submitting, setSubmitting] = useState<ApplicationStatus | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const { celebrate } = useRewards()

  // Detail fetch for description + timestamps (GET /applications/:id).
  const detail = useApi(() => api.getApplication(application.id), [
    application.id,
  ])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function transition(next: ApplicationStatus) {
    setActionError(null)
    setSubmitting(next)
    try {
      const res = await api.updateApplicationStatus(application.id, next)
      setStatus(res.application.status)
      celebrate(res.xpAward)
      onChanged() // refetch the board list
      detail.reload() // refresh timestamps
    } catch (e) {
      // Inline error, not a blocking modal (per ui-spec).
      setActionError(
        e instanceof ApiError ? e.message : 'Something went wrong. Try again.',
      )
    } finally {
      setSubmitting(null)
    }
  }

  const currentIdx = PIPELINE.indexOf(status)
  const nexts = NEXT_STATUSES[status]
  const description = detail.data?.job.description

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
            <h2 className="font-display text-lg font-bold text-ink">
              {job.title}
            </h2>
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
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            className="ml-auto text-sm font-semibold text-primary-600 hover:text-primary-500"
          >
            View posting ↗
          </a>
        </div>

        {/* Description (from detail fetch) */}
        <div className="mt-4">
          {detail.loading ? (
            <div className="skeleton h-4 w-2/3 rounded" />
          ) : description ? (
            <p className="text-sm text-ink-soft">{description}</p>
          ) : (
            <p className="text-sm text-ink-muted">No description saved.</p>
          )}
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

        {/* Transition actions (live PATCH) */}
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
                  disabled={submitting !== null}
                  onClick={() => transition(s)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
                    s === 'REJECTED'
                      ? 'bg-rose-500 hover:bg-rose-600'
                      : 'bg-primary-500 hover:bg-primary-600'
                  }`}
                >
                  {submitting === s ? 'Saving…' : `Mark as ${STATUS_LABEL[s]}`}
                </button>
              ))}
            </div>
          )}
          {actionError ? (
            <p className="mt-2 text-sm font-medium text-rose-600">
              {actionError}
            </p>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  )
}
