import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.company.create({ data });
  }

  async findAll() {
    return this.prisma.company.findMany();
  }
}
