import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Quest, QuestCategory } from '../lib/api'
import { api, ApiError } from '../lib/api'
import { useApi } from '../lib/useApi'
import { useRewards } from '../rewards/RewardsProvider'
import { categoryMeta } from '../lib/format'
import QuestCard from '../components/QuestCard'

// Phase 4: live data. GET /quests, POST /quests, PATCH /quests/:id/complete.
// 400 "already completed" is handled gracefully (notice + refetch).

const CATEGORIES: QuestCategory[] = [
  'LEETCODE',
  'SYSTEM_DESIGN',
  'BACKEND_PRACTICE',
  'READING',
  'SIDE_PROJECT',
]

export default function QuestBoard() {
  const [showForm, setShowForm] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const { celebrate } = useRewards()
  const { data, error, loading, reload } = useApi<Quest[]>(
    () => api.getQuests(),
    [],
  )

  const quests = data ?? []
  const open = useMemo(() => quests.filter((q) => q.status === 'OPEN'), [quests])
  const done = useMemo(() => quests.filter((q) => q.status === 'DONE'), [quests])

  async function addQuest(input: {
    title: string
    category: QuestCategory
    xpReward: number
  }) {
    // Throws on failure → NewQuestForm shows the server error inline.
    await api.createQuest(input)
    setShowForm(false)
    reload()
  }

  async function completeQuest(id: string) {
    setNotice(null)
    try {
      const res = await api.completeQuest(id)
      celebrate(res.xpAward)
      reload()
    } catch (e) {
      // e.g. 400 "Quest already completed" — resync rather than error out.
      setNotice(
        e instanceof ApiError ? e.message : 'Could not complete that quest.',
      )
      reload()
    }
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Quest Board</h1>
          <p className="text-sm text-ink-soft">
            Set your own growth quests and earn XP for finishing them.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-primary-600"
        >
          {showForm ? 'Cancel' : '+ New Quest'}
        </button>
      </header>

      {notice ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-primary-50 px-4 py-2.5 text-sm font-medium text-primary-600">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss"
            className="text-primary-600/70 hover:text-primary-600"
          >
            ✕
          </button>
        </div>
      ) : null}

      <AnimatePresence initial={false}>
        {showForm ? (
          <NewQuestForm onSubmit={addQuest} onCancel={() => setShowForm(false)} />
        ) : null}
      </AnimatePresence>

      {loading && !data ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : open.length === 0 ? (
        <div className="rounded-card bg-base-card p-10 text-center shadow-card">
          <div className="mb-3 text-4xl">🗺️</div>
          <p className="mx-auto max-w-sm text-sm text-ink-soft">
            No open quests — add one to start earning growth XP.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {open.map((quest) => (
            <QuestCard key={quest.id} quest={quest} onComplete={completeQuest} />
          ))}
        </div>
      )}

      {/* Completed (collapsible, read-only) */}
      {done.length > 0 ? (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setShowCompleted((s) => !s)}
            className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink"
          >
            <span
              className={`transition-transform ${showCompleted ? 'rotate-90' : ''}`}
              aria-hidden
            >
              ▶
            </span>
            Completed
            <span className="rounded-full bg-base-sunk px-2 text-xs text-ink-muted tabular">
              {done.length}
            </span>
          </button>
          <AnimatePresence initial={false}>
            {showCompleted ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {done.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton h-[72px] rounded-card" />
      ))}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-card bg-base-card p-10 text-center shadow-card">
      <div className="mb-3 text-4xl">⚠️</div>
      <p className="mx-auto max-w-sm text-sm text-ink-soft">
        Couldn&apos;t load your quests.
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

const XP_MIN = 1
const XP_MAX = 500

function validateXp(raw: string): string | null {
  const trimmed = raw.trim()
  if (trimmed === '') return 'Enter an XP reward.'
  const n = Number(trimmed)
  if (!Number.isFinite(n)) return 'Numbers only.'
  if (!Number.isInteger(n)) return 'Whole numbers only.'
  if (n < XP_MIN) return `XP must be at least ${XP_MIN}.`
  if (n > XP_MAX) return `Keep it ${XP_MAX} XP or under.`
  return null
}

function NewQuestForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (input: {
    title: string
    category: QuestCategory
    xpReward: number
  }) => Promise<void>
  onCancel: () => void
}) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<QuestCategory>('LEETCODE')
  const [xpRaw, setXpRaw] = useState('20')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const titleError = title.trim().length === 0 ? 'Give your quest a name.' : null
  const xpError = validateXp(xpRaw)
  const valid = !titleError && !xpError

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setServerError(null)
    if (!valid) return
    setSubmitting(true)
    try {
      await onSubmit({ title: title.trim(), category, xpReward: Number(xpRaw) })
    } catch (err) {
      setServerError(
        err instanceof ApiError ? err.message : 'Could not create quest.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="mb-5 overflow-hidden"
    >
      <div className="rounded-card bg-base-card p-5 shadow-card">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-soft" htmlFor="q-title">
              Quest
            </label>
            <input
              id="q-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Solve 2 LeetCode mediums"
              autoFocus
              aria-invalid={submitted && !!titleError}
              className={`w-full rounded-xl border bg-base px-3 py-2 text-sm text-ink outline-none focus:ring-2 ${
                submitted && titleError
                  ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100'
                  : 'border-black/10 focus:border-primary-400 focus:ring-primary-100'
              }`}
            />
            {submitted && titleError ? (
              <p className="mt-1 text-xs font-medium text-rose-600">{titleError}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-soft" htmlFor="q-cat">
                Category
              </label>
              <select
                id="q-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as QuestCategory)}
                className="w-full rounded-xl border border-black/10 bg-base px-3 py-2 text-sm text-ink outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              >
                {CATEGORIES.map((c) => {
                  const { label, icon } = categoryMeta(c)
                  return (
                    <option key={c} value={c}>
                      {icon} {label}
                    </option>
                  )
                })}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-soft" htmlFor="q-xp">
                XP reward{' '}
                <span className="font-normal text-ink-muted">
                  ({XP_MIN}–{XP_MAX})
                </span>
              </label>
              <input
                id="q-xp"
                type="number"
                inputMode="numeric"
                min={XP_MIN}
                max={XP_MAX}
                step={1}
                value={xpRaw}
                onChange={(e) => setXpRaw(e.target.value)}
                aria-invalid={submitted && !!xpError}
                className={`w-full rounded-xl border bg-base px-3 py-2 text-sm text-ink outline-none focus:ring-2 ${
                  submitted && xpError
                    ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100'
                    : 'border-black/10 focus:border-primary-400 focus:ring-primary-100'
                }`}
              />
              {submitted && xpError ? (
                <p className="mt-1 text-xs font-medium text-rose-600">{xpError}</p>
              ) : null}
            </div>
          </div>

          {serverError ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
              {serverError}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
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
              {submitting ? 'Adding…' : 'Add quest'}
            </button>
          </div>
        </div>
      </div>
    </motion.form>
  )
}
