import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { XpService } from '../xp/xp.service';
import { STATUS_TO_ACTIVITY_TYPE, XP_FOR_STATUS } from '../xp/xp.constants';

const TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.SAVED]: [ApplicationStatus.APPLIED],
  [ApplicationStatus.APPLIED]: [
    ApplicationStatus.INTERVIEW,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.INTERVIEW]: [
    ApplicationStatus.OFFER,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.OFFER]: [],
  [ApplicationStatus.REJECTED]: [],
};

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly xp: XpService,
  ) {}

  async findAll(userId: string, status?: ApplicationStatus) {
    const applications = await this.prisma.application.findMany({
      where: { userId, ...(status ? { status } : {}) },
      include: { job: true },
      orderBy: { createdAt: 'desc' },
    });

    return applications.map((a) => ({
      id: a.id,
      status: a.status,
      appliedAt: a.appliedAt,
      job: {
        id: a.job.id,
        title: a.job.title,
        company: a.job.company,
        url: a.job.url,
      },
    }));
  }

  async findOne(userId: string, id: string) {
    const application = await this.prisma.application.findFirst({
      where: { id, userId },
      include: { job: true },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return {
      id: application.id,
      status: application.status,
      appliedAt: application.appliedAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      job: {
        id: application.job.id,
        title: application.job.title,
        company: application.job.company,
        url: application.job.url,
        location: application.job.location,
        description: application.job.description,
        source: application.job.source,
      },
    };
  }

  async updateStatus(userId: string, id: string, next: ApplicationStatus) {
    const application = await this.prisma.application.findFirst({
      where: { id, userId },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const allowed = TRANSITIONS[application.status];
    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Invalid status transition: ${application.status} -> ${next}`,
      );
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: {
        status: next,
        appliedAt:
          next === ApplicationStatus.APPLIED
            ? new Date()
            : application.appliedAt,
      },
    });

    const xpAward = await this.xp.awardXP(
      userId,
      STATUS_TO_ACTIVITY_TYPE[next],
      XP_FOR_STATUS[next],
      { applicationId: updated.id },
    );

    return {
      application: {
        id: updated.id,
        status: updated.status,
        appliedAt: updated.appliedAt,
      },
      xpAward,
    };
  }
}
