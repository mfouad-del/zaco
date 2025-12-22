import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as bwipjs from 'bwip-js';

@Injectable()
export class PdfService {
  
  async generateReceipt(data: any, company: any): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // 1. Header & Logo
      if (company.logoUrl) {
        // In real app, fetch image buffer from URL. For now, we skip or use placeholder
        // doc.image(logoBuffer, 50, 45, { width: 50 });
      }
      
      doc.fontSize(20).text(company.nameAr, { align: 'center' });
      doc.fontSize(10).text(company.nameEn, { align: 'center' });
      doc.moveDown();

      // 2. Barcode Generation
      try {
        const png = await bwipjs.toBuffer({
          bcid: 'code128',       // Barcode type
          text: data.barcodeId,  // Text to encode
          scale: 3,              // 3x scaling factor
          height: 10,            // Bar height, in millimeters
          includetext: true,     // Show human-readable text
          textxalign: 'center',  // Always good to set this
        });
        doc.image(png, 400, 50, { width: 150 });
      } catch (e) {
        console.error('Barcode error', e);
      }

      doc.moveDown(2);
      
      // 3. Content
      doc.fontSize(16).text('إيصال استلام معاملة', { align: 'center', underline: true });
      doc.moveDown();

      const fields = [
        { label: 'رقم المعاملة', value: data.barcodeId },
        { label: 'العنوان', value: data.title },
        { label: 'المرسل', value: data.sender },
        { label: 'المستلم', value: data.recipient },
        { label: 'التاريخ', value: data.docDate ? new Date(data.docDate).toLocaleDateString('ar-SA') : (data.documentDate ? new Date(data.documentDate).toLocaleDateString('ar-SA') : '—') },
        { label: 'الأهمية', value: data.priority },
      ];

      doc.fontSize(12);
      let y = doc.y;
      
      fields.forEach(field => {
        doc.font('Helvetica-Bold').text(`${field.label}:`, 400, y, { align: 'right', width: 100 });
        doc.font('Helvetica').text(field.value, 50, y, { align: 'right', width: 340 });
        y += 25;
      });

      // 4. Footer
      doc.fontSize(10).text('تم إصدار هذا المستند إلكترونياً من نظام ArchivX', 50, 750, { align: 'center', width: 500 });

      doc.end();
    });
  }
}
