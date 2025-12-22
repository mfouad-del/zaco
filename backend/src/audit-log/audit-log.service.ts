import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(userId: string, action: string, metadata: any = {}) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        metadata: JSON.stringify(metadata),
      },
    });
  }
}
