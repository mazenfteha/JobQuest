import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { ActivitiesService } from './activities.service';
import { ListActivitiesQueryDto } from './dto/list-activities-query.dto';
import { ManualLogDto } from './dto/manual-log.dto';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activities: ActivitiesService) {}

  @Post('manual-log')
  manualLog(@CurrentUser() user: User, @Body() dto: ManualLogDto) {
    return this.activities.manualLog(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User, @Query() query: ListActivitiesQueryDto) {
    return this.activities.findAll(user.id, query.limit ?? 10);
  }
}
