import { Body, Controller, Post } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateJobDto } from './dto/create-job.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateJobDto) {
    return this.jobs.create(user.id, dto);
  }
}
