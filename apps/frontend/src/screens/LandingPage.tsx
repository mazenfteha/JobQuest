import { motion, useReducedMotion } from 'framer-motion'
import { AUTH_LOGIN_URL } from '../lib/api'

const FEATURES = [
  {
    icon: '⚡',
    title: 'XP & Levels',
    desc: 'Every action earns experience, even rejections.',
  },
  {
    icon: '🔥',
    title: 'Streaks',
    desc: 'Stay consistent, build momentum.',
  },
  {
    icon: '📜',
    title: 'Side Quests',
    desc: "Track growth beyond applications — reading, networking, whatever you're working on.",
  },
  {
    icon: '🏆',
    title: 'Leaderboard',
    desc: "Invite friends, see who's grinding hardest this week.",
  },
]

const LOOP_STEPS = [
  { icon: '🔖', label: 'Save' },
  { icon: '📤', label: 'Apply' },
  { icon: '🛡️', label: 'Interview' },
  { icon: '🏆', label: 'Offer' },
  { icon: '⚡', label: 'XP' },
  { icon: '📈', label: 'Level Up' },
]

export default function LandingPage() {
  const reduce = useReducedMotion()

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center px-4 pb-16 pt-20 text-center sm:pt-28">
        {/* Badge logo + wordmark */}
        <motion.div
          className="mb-6 flex items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 100, damping: 18 }}
        >
          <img
            src="/brand/logo-concept-a-badge.svg"
            alt=""
            className="h-14 w-14 sm:h-16 sm:w-16"
          />
          <span className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            JobQuest
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-display text-3xl font-bold text-ink sm:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: 'spring', stiffness: 100, damping: 18, delay: 0.1 }
          }
        >
          Job hunting, gamified.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="mx-auto mt-4 max-w-md text-base text-ink-soft sm:text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: 'spring', stiffness: 100, damping: 18, delay: 0.2 }
          }
        >
          Turn applications, interviews, and rejections into XP instead of a spreadsheet.
        </motion.p>

        {/* CTA */}
        <motion.a
          href={AUTH_LOGIN_URL}
          className="mt-8 inline-flex items-center gap-2.5 rounded-2xl bg-primary-500 px-7 py-3.5 text-base font-bold text-white shadow-card transition-colors hover:bg-primary-600 sm:text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: 'spring', stiffness: 100, damping: 18, delay: 0.3 }
          }
        >
          <span aria-hidden>🔑</span>
          Sign in with Google
        </motion.a>

        {/* Subtle decorative XP bar */}
        <motion.div
          className="mt-10 h-2 w-64 max-w-full overflow-hidden rounded-full bg-base-sunk sm:w-80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary-300 via-primary-400 to-primary-500"
            initial={{ width: 0 }}
            animate={{ width: '65%' }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: 'spring', stiffness: 60, damping: 14, delay: 0.8 }
            }
          />
        </motion.div>
      </section>

      {/* ── Core Loop ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <motion.h2
          className="mb-10 text-center font-display text-xl font-bold text-ink sm:text-2xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={reduce ? { duration: 0 } : { duration: 0.5 }}
        >
          The core loop
        </motion.h2>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {LOOP_STEPS.map((step, i) => (
            <motion.div
              key={step.label}
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 120, damping: 18, delay: i * 0.08 }
              }
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-base-card text-2xl shadow-card sm:h-16 sm:w-16 sm:text-3xl">
                {step.icon}
              </div>
              <span className="text-xs font-semibold text-ink-soft">{step.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Feature Cards ─────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="rounded-card bg-base-card p-6 text-center shadow-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 120, damping: 18, delay: i * 0.08 }
              }
            >
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-2xl">
                {f.icon}
              </div>
              <h3 className="font-display text-sm font-bold text-ink">{f.title}</h3>
              <p className="mt-1 text-xs text-ink-soft">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Screenshot Placeholder ────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <motion.div
          className="overflow-hidden rounded-card bg-base-card shadow-card-hover"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={reduce ? { duration: 0 } : { duration: 0.6 }}
        >
          <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-streak/60" />
            <span className="h-3 w-3 rounded-full bg-primary-400/60" />
            <span className="h-3 w-3 rounded-full bg-success/60" />
            <span className="ml-2 text-xs text-ink-muted">Dashboard preview</span>
          </div>
          <div className="flex flex-col items-center gap-4 bg-base-sunk/50 px-6 py-10 sm:py-14">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-xl">⚡</div>
              <div>
                <div className="h-4 w-24 rounded bg-ink/10" />
                <div className="mt-1.5 h-3 w-16 rounded bg-ink/5" />
              </div>
            </div>
            <div className="h-3 w-full max-w-xs overflow-hidden rounded-full bg-base-sunk">
              <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-primary-300 to-primary-500" />
            </div>
            <div className="grid w-full grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-base-card shadow-card" />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="flex flex-col items-center px-4 py-20 text-center">
        <motion.h2
          className="font-display text-2xl font-bold text-ink sm:text-3xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={reduce ? { duration: 0 } : { duration: 0.5 }}
        >
          Ready to level up your job search?
        </motion.h2>
        <motion.p
          className="mt-3 max-w-sm text-sm text-ink-soft"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          Free, no ads, just for tracking your own search.
        </motion.p>
        <motion.a
          href={AUTH_LOGIN_URL}
          className="mt-6 inline-flex items-center gap-2.5 rounded-2xl bg-primary-500 px-7 py-3.5 text-base font-bold text-white shadow-card transition-colors hover:bg-primary-600 sm:text-lg"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: 'spring', stiffness: 100, damping: 18, delay: 0.2 }
          }
        >
          <span aria-hidden>🔑</span>
          Sign in with Google
        </motion.a>
      </section>
    </div>
  )
}
