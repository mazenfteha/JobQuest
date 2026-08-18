import { Controller, Get } from '@nestjs/common';
import { SingleUserService } from '../common/single-user.service';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboard: DashboardService,
    private readonly users: SingleUserService,
  ) {}

  @Get()
  getDashboard() {
    return this.users
      .getSingleUser()
      .then((user) => this.dashboard.getDashboard(user.id));
  }
}
