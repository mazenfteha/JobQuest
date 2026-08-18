import { Injectable } from '@nestjs/common';
import type { ActivityType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AchievementsService } from '../achievements/achievements.service';
import { levelForXp } from '../common/leveling';
import { updateStreak } from '../common/streak';
import type { XpAwardResult } from './xp-award-result.interface';

@Injectable()
export class XpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly achievements: AchievementsService,
  ) {}

  async awardXP(
    userId: string,
    type: ActivityType,
    xp: number,
    meta: { applicationId?: string; questId?: string } = {},
  ): Promise<XpAwardResult> {
    const { user, leveledUp } = await this.prisma.$transaction(async (tx) => {
      const current = await tx.user.findUniqueOrThrow({
        where: { id: userId },
      });
      const level = levelForXp(current.xp + xp);
      const streak = updateStreak(
        current.currentStreak,
        current.longestStreak,
        current.lastActivityDate,
      );

      await tx.activity.create({
        data: {
          userId,
          type,
          xp,
          applicationId: meta.applicationId ?? null,
          questId: meta.questId ?? null,
        },
      });

      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xp },
          level,
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          lastActivityDate: streak.lastActivityDate,
        },
      });

      return { user: updated, leveledUp: level > current.level };
    });

    const newAchievements = await this.achievements.runChecks(userId, type);

    return {
      user: {
        id: user.id,
        xp: user.xp,
        level: user.level,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
      },
      xpGained: xp,
      leveledUp,
      newAchievements,
    };
  }
}
