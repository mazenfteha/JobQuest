import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AchievementsModule } from './achievements/achievements.module';
import { XpModule } from './xp/xp.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { ActivitiesModule } from './activities/activities.module';
import { QuestsModule } from './quests/quests.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FriendsModule } from './friends/friends.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [
    PrismaModule,
    CommonModule,
    AuthModule,
    AchievementsModule,
    XpModule,
    JobsModule,
    ApplicationsModule,
    ActivitiesModule,
    QuestsModule,
    DashboardModule,
    FriendsModule,
    LeaderboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Protect every route by default; @Public() opts out (OAuth entry points).
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
