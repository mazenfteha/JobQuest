import { Controller, Get } from '@nestjs/common';
import { SingleUserService } from '../common/single-user.service';
import { AchievementsService } from './achievements.service';

@Controller('achievements')
export class AchievementsController {
  constructor(
    private readonly achievements: AchievementsService,
    private readonly users: SingleUserService,
  ) {}

  @Get()
  findAll() {
    return this.users
      .getSingleUser()
      .then((user) => this.achievements.findAll(user.id));
  }
}
