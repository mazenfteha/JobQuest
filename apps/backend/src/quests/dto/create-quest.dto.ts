import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQuestDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  // Free text (any profession) — no fixed category list. Reward is a fixed
  // 5 XP set server-side, so this DTO no longer accepts `xpReward`; sending it
  // is rejected by the global forbidNonWhitelisted ValidationPipe.
  @IsString()
  @IsNotEmpty()
  category: string;
}
