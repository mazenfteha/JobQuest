import { Injectable } from '@nestjs/common';
import { ActivityType, Achievement } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const TYPE_TO_KEYS: Partial<Record<ActivityType, string[]>> = {
  [ActivityType.JOB_SAVED]: ['first_hunt'],
  [ActivityType.JOB_APPLIED]: ['first_blood', 'sharp_shooter'],
  [ActivityType.INTERVIEW]: ['interview_ready'],
  [ActivityType.OFFER]: ['boss_defeated'],
};

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  async runChecks(userId: string, type: ActivityType): Promise<Achievement[]> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const keys = ['on_fire', ...(TYPE_TO_KEYS[type] ?? [])];
    const newlyUnlocked: Achievement[] = [];

    for (const key of keys) {
      if (!(await this.isMet(key, userId, user.currentStreak))) continue;

      const achievement = await this.prisma.achievement.findUnique({
        where: { key },
      });
      if (!achievement) continue;

      const existing = await this.prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: { userId, achievementId: achievement.id },
        },
      });
      if (existing) continue;

      await this.prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      });
      newlyUnlocked.push(achievement);
    }

    return newlyUnlocked;
  }

  async findAll(userId: string) {
    const [achievements, unlocked] = await Promise.all([
      this.prisma.achievement.findMany({ orderBy: { key: 'asc' } }),
      this.prisma.userAchievement.findMany({ where: { userId } }),
    ]);
    const unlockedMap = new Map(
      unlocked.map((ua) => [ua.achievementId, ua.unlockedAt]),
    );

    return achievements.map((a) => ({
      id: a.id,
      key: a.key,
      title: a.title,
      description: a.description,
      icon: a.icon,
      unlocked: unlockedMap.has(a.id),
      unlockedAt: unlockedMap.get(a.id) ?? null,
    }));
  }

  private async isMet(
    key: string,
    userId: string,
    currentStreak: number,
  ): Promise<boolean> {
    switch (key) {
      case 'on_fire':
        return currentStreak >= 3;
      case 'first_hunt':
      case 'first_blood':
      case 'interview_ready':
      case 'boss_defeated':
        return (await this.countActivities(userId, this.typeFor(key))) >= 1;
      case 'sharp_shooter':
        return (
          (await this.countActivities(userId, ActivityType.JOB_APPLIED)) >= 10
        );
      default:
        return false;
    }
  }

  private countActivities(userId: string, type: ActivityType): Promise<number> {
    return this.prisma.activity.count({ where: { userId, type } });
  }

  private typeFor(key: string): ActivityType {
    switch (key) {
      case 'first_hunt':
        return ActivityType.JOB_SAVED;
      case 'first_blood':
        return ActivityType.JOB_APPLIED;
      case 'interview_ready':
        return ActivityType.INTERVIEW;
      case 'boss_defeated':
        return ActivityType.OFFER;
      default:
        throw new Error(`Unknown achievement key: ${key}`);
    }
  }
}
