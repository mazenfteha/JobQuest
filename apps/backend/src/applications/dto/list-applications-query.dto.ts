import { IsEnum, IsOptional } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

export class ListApplicationsQueryDto {
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;
}
