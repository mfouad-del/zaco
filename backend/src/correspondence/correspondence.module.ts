import { Module } from '@nestjs/common';
import { CorrespondenceService } from './correspondence.service';
import { CorrespondenceController } from './correspondence.controller';
import { BarcodeService } from '../barcode/barcode.service';
import { PdfService } from '../pdf/pdf.service';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [AuditLogModule],
  controllers: [CorrespondenceController],
  providers: [CorrespondenceService, BarcodeService, PdfService],
})
export class CorrespondenceModule {}
