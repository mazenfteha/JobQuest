import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { XpService } from '../xp/xp.service';
import { CreateQuestDto } from './dto/create-quest.dto';

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
        xpReward: dto.xpReward,
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

    const updated = await this.prisma.quest.update({
      where: { id },
      data: { status: QuestStatus.DONE, completedAt: new Date() },
    });

    const xpAward = await this.xp.awardXP(
      userId,
      quest.category,
      quest.xpReward,
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
