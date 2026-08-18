import { Body, Controller, Post } from '@nestjs/common';
import { SingleUserService } from '../common/single-user.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobs: JobsService,
    private readonly users: SingleUserService,
  ) {}

  @Post()
  create(@Body() dto: CreateJobDto) {
    return this.users
      .getSingleUser()
      .then((user) => this.jobs.create(user.id, dto));
  }
}
