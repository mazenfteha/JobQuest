import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { AchievementSummary, XpAwardResult } from '../lib/api'
import XPToast from '../components/XPToast'
import AchievementToast from '../components/AchievementToast'
import LevelUpModal from '../components/LevelUpModal'

// Global celebration layer. Mutation call sites call celebrate(res.xpAward)
// on SUCCESS only, so nothing fires on a failed/errored action. From one
// award it can show: an XP toast (always), achievement toast(s) stacked with
// it, and a level-up modal on top.

type ToastItem =
  | { id: number; kind: 'xp'; xp: number }
  | { id: number; kind: 'achievement'; achievement: AchievementSummary }

interface LevelUpItem {
  id: number
  fromLevel: number
  level: number
  xp: number
}

interface RewardsContextValue {
  celebrate: (award: XpAwardResult) => void
}

const RewardsContext = createContext<RewardsContextValue | null>(null)

export function useRewards(): RewardsContextValue {
  const ctx = useContext(RewardsContext)
  if (!ctx) throw new Error('useRewards must be used within RewardsProvider')
  return ctx
}

const XP_TOAST_MS = 2200
const ACHIEVEMENT_TOAST_MS = 3600

export function RewardsProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [levelUps, setLevelUps] = useState<LevelUpItem[]>([])
  const idRef = useRef(0)
  const prevLevelRef = useRef<number | null>(null)

  const removeToast = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const dismissLevelUp = useCallback((id: number) => {
    setLevelUps((list) => list.filter((l) => l.id !== id))
  }, [])

  const celebrate = useCallback((award: XpAwardResult) => {
    const next: ToastItem[] = []
    if (award.xpGained > 0) {
      next.push({ id: ++idRef.current, kind: 'xp', xp: award.xpGained })
    }
    for (const achievement of award.newAchievements) {
      next.push({ id: ++idRef.current, kind: 'achievement', achievement })
    }
    if (next.length) setToasts((list) => [...list, ...next])

    if (award.leveledUp) {
      // prevLevel tracks the last-seen level this session; fall back to
      // (new - 1), which is correct for a single-level gain.
      const fromLevel = prevLevelRef.current ?? award.user.level - 1
      setLevelUps((list) => [
        ...list,
        {
          id: ++idRef.current,
          fromLevel,
          level: award.user.level,
          xp: award.user.xp,
        },
      ])
    }
    prevLevelRef.current = award.user.level
  }, [])

  return (
    <RewardsContext.Provider value={{ celebrate }}>
      {children}

      {/* Toast stack (top-center) — XP + achievement toasts stack together */}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastShell
              key={t.id}
              duration={t.kind === 'xp' ? XP_TOAST_MS : ACHIEVEMENT_TOAST_MS}
              onDone={() => removeToast(t.id)}
            >
              {t.kind === 'xp' ? (
                <XPToast xp={t.xp} />
              ) : (
                <AchievementToast achievement={t.achievement} />
              )}
            </ToastShell>
          ))}
        </AnimatePresence>
      </div>

      {/* Level-up modal (one at a time; oldest queued shown first) */}
      <AnimatePresence>
        {levelUps.length > 0 ? (
          <LevelUpModal
            key={levelUps[0].id}
            level={levelUps[0].level}
            fromLevel={levelUps[0].fromLevel}
            xp={levelUps[0].xp}
            onDismiss={() => dismissLevelUp(levelUps[0].id)}
          />
        ) : null}
      </AnimatePresence>
    </RewardsContext.Provider>
  )
}

function ToastShell({
  children,
  duration,
  onDone,
}: {
  children: ReactNode
  duration: number
  onDone: () => void
}) {
  const reduce = useReducedMotion()

  useEffect(() => {
    const t = setTimeout(onDone, duration)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      layout
      className="pointer-events-auto"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.9 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.9 }}
      transition={
        reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 420, damping: 24 }
      }
    >
      {children}
    </motion.div>
  )
}
