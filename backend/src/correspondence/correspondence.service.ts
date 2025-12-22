import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BarcodeService } from '../barcode/barcode.service';
import { CreateCorrespondenceDto } from './dto/create-correspondence.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class CorrespondenceService {
  constructor(
    private prisma: PrismaService,
    private barcodeService: BarcodeService,
    private auditLogService: AuditLogService,
  ) {}

  async create(userId: string, companyId: string, dto: CreateCorrespondenceDto, file?: Express.Multer.File) {
    const barcodeId = this.barcodeService.generateBusinessBarcode(dto.type);
    
    const correspondence = await this.prisma.correspondence.create({
      data: {
        ...dto,
        barcodeId,
        companyId,
        attachmentUrl: file ? file.path : null,
        internalRef: barcodeId, // Default internal ref to barcode
      },
    });

    await this.auditLogService.log(userId, 'CREATE_CORRESPONDENCE', { correspondenceId: correspondence.id, barcodeId });

    return correspondence;
  }

  async findAll(companyId: string, query: any) {
    const { type, startDate, endDate } = query;
    const where: any = { companyId };

    if (type) where.type = type;
    if (startDate && endDate) {
      where.docDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return this.prisma.correspondence.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const doc = await this.prisma.correspondence.findFirst({
      where: { id, companyId },
      include: { company: true }
    });
    if (!doc) throw new NotFoundException('Correspondence not found');
    return doc;
  }
}
