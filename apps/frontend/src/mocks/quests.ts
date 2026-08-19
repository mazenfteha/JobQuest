import type { Quest } from '../lib/api'

// Mock matching GET /quests exactly (specs/api.md).

export const questsMock: Quest[] = [
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
  {
    id: 'quest-4',
    title: 'Build a rate limiter in NestJS',
    category: 'BACKEND_PRACTICE',
    xpReward: 30,
    status: 'OPEN',
    createdAt: '2026-08-15T10:00:00.000Z',
    completedAt: null,
  },
  {
    id: 'quest-5',
    title: 'Ship the JobQuest extension MVP',
    category: 'SIDE_PROJECT',
    xpReward: 50,
    status: 'DONE',
    createdAt: '2026-08-10T10:00:00.000Z',
    completedAt: '2026-08-13T16:20:00.000Z',
  },
  {
    id: 'quest-6',
    title: 'Grind 5 easy array problems',
    category: 'LEETCODE',
    xpReward: 15,
    status: 'DONE',
    createdAt: '2026-08-09T10:00:00.000Z',
    completedAt: '2026-08-11T19:00:00.000Z',
  },
]
