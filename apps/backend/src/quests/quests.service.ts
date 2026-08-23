import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActivityType, QuestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { XpService } from '../xp/xp.service';
import { CreateQuestDto } from './dto/create-quest.dto';

// Quest completion rules (specs/business-logic.md): fixed reward, daily cap.
const QUEST_XP = 5;
const DAILY_QUEST_LIMIT = 5;

@Injectable()
export class QuestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xp: XpService,
  ) {}

  async create(userId: string, dto: CreateQuestDto) {
    return this.prisma.quest.create({
      data: {
        userId,
        title: dto.title,
        category: dto.category,
      },
    });
  }

  async findAll(userId: string, status?: QuestStatus) {
    return this.prisma.quest.findMany({
      where: { userId, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async complete(userId: string, id: string) {
    const quest = await this.prisma.quest.findFirst({ where: { id, userId } });
    if (!quest) {
      throw new NotFoundException('Quest not found');
    }
    if (quest.status === QuestStatus.DONE) {
      throw new BadRequestException('Quest already completed');
    }

    // Daily cap: max 5 quest completions per user per UTC day (same day
    // boundary used for streaks / dashboard "today").
    const now = new Date();
    const todayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const completedToday = await this.prisma.activity.count({
      where: {
        userId,
        type: ActivityType.SIDE_QUEST,
        createdAt: { gte: todayStart },
      },
    });
    if (completedToday >= DAILY_QUEST_LIMIT) {
      throw new BadRequestException(
        `Daily quest limit reached (${DAILY_QUEST_LIMIT}/${DAILY_QUEST_LIMIT})`,
      );
    }

    const updated = await this.prisma.quest.update({
      where: { id },
      data: { status: QuestStatus.DONE, completedAt: new Date() },
    });

    const xpAward = await this.xp.awardXP(
      userId,
      ActivityType.SIDE_QUEST,
      QUEST_XP,
      { questId: quest.id },
    );

    return {
      quest: {
        id: updated.id,
        status: updated.status,
        completedAt: updated.completedAt,
      },
      xpAward,
    };
  }

  async remove(userId: string, id: string) {
    const quest = await this.prisma.quest.findFirst({ where: { id, userId } });
    if (!quest) {
      throw new NotFoundException('Quest not found');
    }
    if (quest.status === QuestStatus.DONE) {
      throw new BadRequestException('Completed quests cannot be deleted');
    }

    await this.prisma.quest.delete({ where: { id } });
  }
}
