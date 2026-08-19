import type { DashboardResponse } from '../lib/api'

// Mock matching GET /dashboard exactly (specs/api.md).
// XP math is internally consistent with specs/business-logic.md:
//   L4 floor = 450, L5 target = 700. xp 520 → 28% into level 4.

export const dashboardMock: DashboardResponse = {
  user: {
    xp: 520,
    level: 4,
    currentStreak: 4,
    longestStreak: 6,
  },
  xpForCurrentLevel: 700,
  todayProgress: {
    applications: 2,
    interviews: 1,
    xpEarned: 140,
  },
  recentActivities: [
    {
      id: 'act-1',
      type: 'INTERVIEW',
      xp: 100,
      createdAt: '2026-08-19T09:12:00.000Z',
    },
    {
      id: 'act-2',
      type: 'JOB_APPLIED',
      xp: 50,
      createdAt: '2026-08-19T08:40:00.000Z',
    },
    {
      id: 'act-3',
      type: 'LEETCODE',
      xp: 20,
      createdAt: '2026-08-18T20:05:00.000Z',
    },
    {
      id: 'act-4',
      type: 'JOB_SAVED',
      xp: 10,
      createdAt: '2026-08-18T18:22:00.000Z',
    },
    {
      id: 'act-5',
      type: 'NETWORKING',
      xp: 15,
      createdAt: '2026-08-18T14:30:00.000Z',
    },
    {
      id: 'act-6',
      type: 'CV_TAILORED',
      xp: 15,
      createdAt: '2026-08-17T11:10:00.000Z',
    },
  ],
  openQuests: [
    {
      id: 'quest-1',
      title: 'Solve 2 LeetCode mediums',
      category: 'LEETCODE',
      xpReward: 20,
      status: 'OPEN',
      createdAt: '2026-08-18T10:00:00.000Z',
      completedAt: null,
    },
    {
      id: 'quest-2',
      title: 'Design a URL shortener',
      category: 'SYSTEM_DESIGN',
      xpReward: 40,
      status: 'OPEN',
      createdAt: '2026-08-17T10:00:00.000Z',
      completedAt: null,
    },
    {
      id: 'quest-3',
      title: 'Read one chapter of DDIA',
      category: 'READING',
      xpReward: 15,
      status: 'OPEN',
      createdAt: '2026-08-16T10:00:00.000Z',
      completedAt: null,
    },
  ],
  recentAchievements: [
    { key: 'first_blood', title: 'First Blood', icon: '⚔️' },
    { key: 'on_fire', title: 'On Fire', icon: '🔥' },
    { key: 'interview_ready', title: 'Interview Ready', icon: '🎯' },
  ],
}

// Brand-new user, zero activity (empty-state variant).
export const emptyDashboardMock: DashboardResponse = {
  user: { xp: 0, level: 1, currentStreak: 0, longestStreak: 0 },
  xpForCurrentLevel: 100,
  todayProgress: { applications: 0, interviews: 0, xpEarned: 0 },
  recentActivities: [],
  openQuests: [],
  recentAchievements: [],
}
