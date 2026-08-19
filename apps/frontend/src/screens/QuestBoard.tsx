import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Quest, QuestCategory } from '../lib/api'
import { categoryMeta } from '../lib/format'
import QuestCard from '../components/QuestCard'
import { questsMock } from '../mocks/quests'

// Phase 3: local state seeded from mock. New Quest / Complete update client
// state only — Phase 4 wires POST /quests, PATCH /quests/:id/complete (+ XP).

const CATEGORIES: QuestCategory[] = [
  'LEETCODE',
  'SYSTEM_DESIGN',
  'BACKEND_PRACTICE',
  'READING',
  'SIDE_PROJECT',
]

export default function QuestBoard() {
  const [quests, setQuests] = useState<Quest[]>(questsMock)
  const [showForm, setShowForm] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)

  const open = useMemo(() => quests.filter((q) => q.status === 'OPEN'), [quests])
  const done = useMemo(() => quests.filter((q) => q.status === 'DONE'), [quests])

  function addQuest(input: {
    title: string
    category: QuestCategory
    xpReward: number
  }) {
    setQuests((prev) => [
      {
        id: `local-${crypto.randomUUID()}`,
        title: input.title,
        category: input.category,
        xpReward: input.xpReward,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
      ...prev,
    ])
    setShowForm(false)
  }

  function completeQuest(id: string) {
    setQuests((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, status: 'DONE', completedAt: new Date().toISOString() }
          : q,
      ),
    )
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

      <AnimatePresence initial={false}>
        {showForm ? (
          <NewQuestForm onAdd={addQuest} onCancel={() => setShowForm(false)} />
        ) : null}
      </AnimatePresence>

      {/* Open quests */}
      {open.length === 0 ? (
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
  onAdd,
  onCancel,
}: {
  onAdd: (input: { title: string; category: QuestCategory; xpReward: number }) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<QuestCategory>('LEETCODE')
  const [xpRaw, setXpRaw] = useState('20')
  const [submitted, setSubmitted] = useState(false)

  const titleError = title.trim().length === 0 ? 'Give your quest a name.' : null
  const xpError = validateXp(xpRaw)
  const valid = !titleError && !xpError

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (!valid) return
    onAdd({ title: title.trim(), category, xpReward: Number(xpRaw) })
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
              aria-disabled={!valid}
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors ${
                valid
                  ? 'bg-primary-500 hover:bg-primary-600'
                  : 'bg-primary-300'
              }`}
            >
              Add quest
            </button>
          </div>
        </div>
      </div>
    </motion.form>
  )
}
