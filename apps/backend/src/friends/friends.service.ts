import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getInviteLink(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { inviteCode: true },
    });

    const frontendUrl = this.config.get<string>('FRONTEND_URL');
    return { inviteLink: `${frontendUrl}/join?code=${user.inviteCode}` };
  }

  async acceptInvite(userId: string, code: string) {
    const targetUser = await this.prisma.user.findUnique({
      where: { inviteCode: code },
    });
    if (!targetUser) {
      throw new NotFoundException('Invalid invite code');
    }
    if (targetUser.id === userId) {
      throw new BadRequestException('Cannot add yourself as a friend');
    }

    // Check if friendship already exists (either direction).
    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId: targetUser.id },
          { userId: targetUser.id, friendId: userId },
        ],
      },
    });
    if (existing) {
      throw new BadRequestException('Already friends');
    }

    // Create双向 friendship (both directions) as ACCEPTED.
    const [friendship] = await this.prisma.$transaction([
      this.prisma.friendship.create({
        data: { userId, friendId: targetUser.id, status: 'ACCEPTED' },
      }),
      this.prisma.friendship.create({
        data: { userId: targetUser.id, friendId: userId, status: 'ACCEPTED' },
      }),
    ]);

    return {
      friendship: {
        id: friendship.id,
        userId: friendship.userId,
        friendId: friendship.friendId,
        status: friendship.status,
      },
    };
  }

  async getFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { userId, status: 'ACCEPTED' },
          { friendId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            xp: true,
            level: true,
          },
        },
        friend: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            xp: true,
            level: true,
          },
        },
      },
    });

    // Return the other user's profile for each friendship.
    return friendships.map((f) => (f.userId === userId ? f.friend : f.user));
  }
}
