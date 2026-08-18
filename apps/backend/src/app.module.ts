import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AchievementsModule } from './achievements/achievements.module';
import { XpModule } from './xp/xp.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { ActivitiesModule } from './activities/activities.module';
import { QuestsModule } from './quests/quests.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    PrismaModule,
    CommonModule,
    AchievementsModule,
    XpModule,
    JobsModule,
    ApplicationsModule,
    ActivitiesModule,
    QuestsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
