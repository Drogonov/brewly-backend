import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService {
  constructor(private readonly client: PrismaClient) { }

  async deleteUser(id: number) {
    return this.client.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getUserById(id: number) {
    return this.client.user.findUnique({ where: { id } });
  }
}