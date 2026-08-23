import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { ApplicationsService } from './applications.service';
import { ListApplicationsQueryDto } from './dto/list-applications-query.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Get()
  findAll(@CurrentUser() user: User, @Query() query: ListApplicationsQueryDto) {
    return this.applications.findAll(user.id, query.status);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.applications.findOne(user.id, id);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.applications.updateStatus(user.id, id, dto.status);
  }
}
