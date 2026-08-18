import { ConflictException, Injectable } from '@nestjs/common';
import { ActivityType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { XpService } from '../xp/xp.service';
import { XP_FOR_STATUS } from '../xp/xp.constants';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xp: XpService,
  ) {}

  async create(userId: string, dto: CreateJobDto) {
    const { application } = await this.prisma.$transaction(async (tx) => {
      const existingJob = await tx.job.findUnique({ where: { url: dto.url } });

      if (existingJob) {
        const existingApplication = await tx.application.findUnique({
          where: { userId_jobId: { userId, jobId: existingJob.id } },
        });
        if (existingApplication) {
          throw new ConflictException('Job already saved');
        }
        const created = await tx.application.create({
          data: { userId, jobId: existingJob.id },
          include: { job: true },
        });
        return { application: created };
      }

      const job = await tx.job.create({
        data: {
          title: dto.title,
          company: dto.company,
          location: dto.location,
          url: dto.url,
          description: dto.description,
          source: dto.source,
        },
      });
      const created = await tx.application.create({
        data: { userId, jobId: job.id },
        include: { job: true },
      });
      return { application: created };
    });

    const xpAward = await this.xp.awardXP(
      userId,
      ActivityType.JOB_SAVED,
      XP_FOR_STATUS.SAVED,
    );

    return {
      application: {
        id: application.id,
        status: application.status,
        job: {
          id: application.job.id,
          title: application.job.title,
          company: application.job.company,
          url: application.job.url,
        },
      },
      xpAward,
    };
  }
}
