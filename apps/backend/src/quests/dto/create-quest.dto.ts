import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { QuestCategory } from '@prisma/client';

export class CreateQuestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(QuestCategory)
  category: QuestCategory;

  @IsInt()
  @Min(1)
  xpReward: number;
}
