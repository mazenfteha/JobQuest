import type { Achievement } from '../lib/api'

// Mock matching GET /achievements exactly (specs/api.md).
// The 6 achievements are the seeded set from specs/business-logic.md.

export const achievementsMock: Achievement[] = [
  {
    id: 'ach-1',
    key: 'first_hunt',
    title: 'First Hunt',
    description: 'Save your first job',
    icon: '🗺️',
    unlocked: true,
    unlockedAt: '2026-08-05T12:00:00.000Z',
  },
  {
    id: 'ach-2',
    key: 'first_blood',
    title: 'First Blood',
    description: 'Apply to your first job',
    icon: '⚔️',
    unlocked: true,
    unlockedAt: '2026-08-06T09:30:00.000Z',
  },
  {
    id: 'ach-3',
    key: 'on_fire',
    title: 'On Fire',
    description: 'Reach a 3-day streak',
    icon: '🔥',
    unlocked: true,
    unlockedAt: '2026-08-16T08:00:00.000Z',
  },
  {
    id: 'ach-4',
    key: 'interview_ready',
    title: 'Interview Ready',
    description: 'Land your first interview',
    icon: '🎯',
    unlocked: true,
    unlockedAt: '2026-08-14T15:00:00.000Z',
  },
  {
    id: 'ach-5',
    key: 'sharp_shooter',
    title: 'Sharp Shooter',
    description: 'Apply to 10 jobs',
    icon: '🏹',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach-6',
    key: 'boss_defeated',
    title: 'Boss Defeated',
    description: 'Receive your first offer',
    icon: '👑',
    unlocked: false,
    unlockedAt: null,
  },
]
