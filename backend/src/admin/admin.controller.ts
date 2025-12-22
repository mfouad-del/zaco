import { Controller, Post, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Post('backup')
  async backup(@Req() req: any) {
    const user = req.user;
    if (user?.role !== 'ADMIN') throw new ForbiddenException('Admin access required');

    // Export core tables to JSON
    const companies = await this.prisma.company.findMany();
    const users = await this.prisma.user.findMany();
    const correspondences = await this.prisma.correspondence.findMany();

    return {
      timestamp: new Date().toISOString(),
      companies,
      users,
      correspondences,
    };
  }
}
