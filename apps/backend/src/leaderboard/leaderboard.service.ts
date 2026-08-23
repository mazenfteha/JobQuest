import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderboard(userId: string) {
    // Get accepted friend IDs (both directions).
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { userId, status: 'ACCEPTED' },
          { friendId: userId, status: 'ACCEPTED' },
        ],
      },
      select: { userId: true, friendId: true },
    });

    const friendIds = new Set<string>();
    for (const f of friendships) {
      if (f.userId !== userId) friendIds.add(f.userId);
      if (f.friendId !== userId) friendIds.add(f.friendId);
    }

    // Include self + all friends.
    const userIds = [userId, ...friendIds];

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        xp: true,
        level: true,
        currentStreak: true,
      },
      orderBy: { xp: 'desc' },
    });

    return users.map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      name: u.name,
      avatarUrl: u.avatarUrl,
      xp: u.xp,
      level: u.level,
      streak: u.currentStreak,
    }));
  }
}
