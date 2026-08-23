import { Controller, Get, Param, Post } from '@nestjs/common';
import type { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { FriendsService } from './friends.service';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friends: FriendsService) {}

  @Post('invite')
  invite(@CurrentUser() user: User) {
    return this.friends.getInviteLink(user.id);
  }

  @Post('accept/:code')
  accept(@CurrentUser() user: User, @Param('code') code: string) {
    return this.friends.acceptInvite(user.id, code);
  }

  @Get()
  list(@CurrentUser() user: User) {
    return this.friends.getFriends(user.id);
  }
}
