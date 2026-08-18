import { Achievement } from '@prisma/client';

export interface XpUserSummary {
  id: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
}

export interface XpAwardResult {
  user: XpUserSummary;
  xpGained: number;
  leveledUp: boolean;
  newAchievements: Achievement[];
}
