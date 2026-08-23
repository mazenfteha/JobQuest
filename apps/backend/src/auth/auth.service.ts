import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface GoogleProfileData {
  googleId: string;
  email?: string;
  name: string;
  avatarUrl?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /** Find by googleId (or link an existing email), else create. */
  async upsertGoogleUser(data: GoogleProfileData): Promise<User> {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { googleId: data.googleId },
          ...(data.email ? [{ email: data.email }] : []),
        ],
      },
    });

    if (existing) {
      return this.prisma.user.update({
        where: { id: existing.id },
        data: {
          googleId: data.googleId,
          email: data.email,
          name: data.name,
          avatarUrl: data.avatarUrl,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        googleId: data.googleId,
        email: data.email,
        name: data.name,
        avatarUrl: data.avatarUrl,
      },
    });
  }

  signToken(user: User): string {
    return this.jwt.sign({ sub: user.id });
  }
}
