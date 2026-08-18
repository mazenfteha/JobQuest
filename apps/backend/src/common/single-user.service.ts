import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SingleUserService {
  constructor(private readonly prisma: PrismaService) {}

  async getSingleUser(): Promise<User> {
    const user = await this.prisma.user.findFirst();
    if (user) return user;
    return this.prisma.user.create({ data: { name: 'Hunter' } });
  }
}
