import { Injectable } from '@nestjs/common';
import { ActivityType, QuestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { xpRequiredForLevel } from '../common/leveling';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const now = new Date();
    const todayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const [
      user,
      todayActivities,
      recentActivities,
      openQuests,
      recentUserAchievements,
    ] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      this.prisma.activity.findMany({
        where: { userId, createdAt: { gte: todayStart, lt: tomorrowStart } },
      }),
      this.prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.quest.findMany({
        where: { userId, status: QuestStatus.OPEN },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.userAchievement.findMany({
        where: { userId },
        orderBy: { unlockedAt: 'desc' },
        take: 3,
        include: { achievement: true },
      }),
    ]);

    return {
      user: {
        xp: user.xp,
        level: user.level,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
      },
      xpForCurrentLevel: xpRequiredForLevel(user.level),
      todayProgress: {
        applications: todayActivities.filter(
          (a) => a.type === ActivityType.JOB_APPLIED,
        ).length,
        interviews: todayActivities.filter(
          (a) => a.type === ActivityType.INTERVIEW,
        ).length,
        xpEarned: todayActivities.reduce((sum, a) => sum + a.xp, 0),
      },
      recentActivities: recentActivities.map((a) => ({
        type: a.type,
        xp: a.xp,
        createdAt: a.createdAt,
      })),
      openQuests: openQuests.map((q) => ({
        id: q.id,
        title: q.title,
        category: q.category,
        xpReward: q.xpReward,
      })),
      recentAchievements: recentUserAchievements.map((ua) => ({
        key: ua.achievement.key,
        title: ua.achievement.title,
        icon: ua.achievement.icon,
      })),
    };
  }
}
