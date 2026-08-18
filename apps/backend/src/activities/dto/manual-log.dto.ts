import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { ActivityType } from '@prisma/client';

const MANUAL_LOG_TYPES = [
  ActivityType.NETWORKING,
  ActivityType.CV_TAILORED,
  ActivityType.COVER_LETTER,
];

export class ManualLogDto {
  @IsIn(MANUAL_LOG_TYPES)
  type: ActivityType;

  @IsOptional()
  @IsUUID()
  applicationId?: string;
}
