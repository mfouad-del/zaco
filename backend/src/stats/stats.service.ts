import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocType } from '../correspondence/dto/create-correspondence.dto';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getStats(companyId: string) {
    const totalIncoming = await this.prisma.correspondence.count({
      where: { companyId, type: DocType.INCOMING },
    });

    const totalOutgoing = await this.prisma.correspondence.count({
      where: { companyId, type: DocType.OUTGOING },
    });

    const recentActivity = await this.prisma.auditLog.findMany({
      where: { user: { companyId } },
      orderBy: { timestamp: 'desc' },
      take: 5,
      include: { user: { select: { name: true } } }
    });

    return {
      totalIncoming,
      totalOutgoing,
      totalDocs: totalIncoming + totalOutgoing,
      recentActivity
    };
  }
}
