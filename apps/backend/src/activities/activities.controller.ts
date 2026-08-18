import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SingleUserService } from '../common/single-user.service';
import { ActivitiesService } from './activities.service';
import { ListActivitiesQueryDto } from './dto/list-activities-query.dto';
import { ManualLogDto } from './dto/manual-log.dto';

@Controller('activities')
export class ActivitiesController {
  constructor(
    private readonly activities: ActivitiesService,
    private readonly users: SingleUserService,
  ) {}

  @Post('manual-log')
  manualLog(@Body() dto: ManualLogDto) {
    return this.users
      .getSingleUser()
      .then((user) => this.activities.manualLog(user.id, dto));
  }

  @Get()
  findAll(@Query() query: ListActivitiesQueryDto) {
    return this.users
      .getSingleUser()
      .then((user) => this.activities.findAll(user.id, query.limit ?? 10));
  }
}
