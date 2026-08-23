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
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateQuestDto } from './dto/create-quest.dto';
import { ListQuestsQueryDto } from './dto/list-quests-query.dto';
import { QuestsService } from './quests.service';

@Controller('quests')
export class QuestsController {
  constructor(private readonly quests: QuestsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateQuestDto) {
    return this.quests.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User, @Query() query: ListQuestsQueryDto) {
    return this.quests.findAll(user.id, query.status);
  }

  @Patch(':id/complete')
  complete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.quests.complete(user.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.quests.remove(user.id, id);
  }
}
