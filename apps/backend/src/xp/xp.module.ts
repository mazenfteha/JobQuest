import { Global, Module } from '@nestjs/common';
import { AchievementsModule } from '../achievements/achievements.module';
import { XpService } from './xp.service';

@Global()
@Module({
  imports: [AchievementsModule],
  providers: [XpService],
  exports: [XpService],
})
export class XpModule {}
