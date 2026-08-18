import { IsEnum, IsOptional } from 'class-validator';
import { QuestStatus } from '@prisma/client';

export class ListQuestsQueryDto {
  @IsOptional()
  @IsEnum(QuestStatus)
  status?: QuestStatus;
}
