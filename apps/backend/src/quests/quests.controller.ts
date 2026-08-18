import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SingleUserService } from '../common/single-user.service';
import { CreateQuestDto } from './dto/create-quest.dto';
import { ListQuestsQueryDto } from './dto/list-quests-query.dto';
import { QuestsService } from './quests.service';

@Controller('quests')
export class QuestsController {
  constructor(
    private readonly quests: QuestsService,
    private readonly users: SingleUserService,
  ) {}

  @Post()
  create(@Body() dto: CreateQuestDto) {
    return this.users
      .getSingleUser()
      .then((user) => this.quests.create(user.id, dto));
  }

  @Get()
  findAll(@Query() query: ListQuestsQueryDto) {
    return this.users
      .getSingleUser()
      .then((user) => this.quests.findAll(user.id, query.status));
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.users
      .getSingleUser()
      .then((user) => this.quests.complete(user.id, id));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.users
      .getSingleUser()
      .then((user) => this.quests.remove(user.id, id));
  }
}
