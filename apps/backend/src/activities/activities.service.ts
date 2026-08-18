import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { XpService } from '../xp/xp.service';
import { MANUAL_LOG_XP } from '../xp/xp.constants';
import { ManualLogDto } from './dto/manual-log.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xp: XpService,
  ) {}

  async manualLog(userId: string, dto: ManualLogDto) {
    if (dto.applicationId) {
      const application = await this.prisma.application.findFirst({
        where: { id: dto.applicationId, userId },
      });
      if (!application) {
        throw new BadRequestException('Application not found');
      }
    }

    return this.xp.awardXP(userId, dto.type, MANUAL_LOG_XP, {
      applicationId: dto.applicationId,
    });
  }

  async findAll(userId: string, limit = 10) {
    const activities = await this.prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return activities.map((a) => ({
      id: a.id,
      type: a.type,
      xp: a.xp,
      createdAt: a.createdAt,
    }));
  }
}
