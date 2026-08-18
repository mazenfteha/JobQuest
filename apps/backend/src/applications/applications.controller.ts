import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { SingleUserService } from '../common/single-user.service';
import { ApplicationsService } from './applications.service';
import { ListApplicationsQueryDto } from './dto/list-applications-query.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applications: ApplicationsService,
    private readonly users: SingleUserService,
  ) {}

  @Get()
  findAll(@Query() query: ListApplicationsQueryDto) {
    return this.users
      .getSingleUser()
      .then((user) => this.applications.findAll(user.id, query.status));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.users
      .getSingleUser()
      .then((user) => this.applications.findOne(user.id, id));
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.users
      .getSingleUser()
      .then((user) => this.applications.updateStatus(user.id, id, dto.status));
  }
}
