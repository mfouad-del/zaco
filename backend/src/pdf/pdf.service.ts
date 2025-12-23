import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as bwipjs from 'bwip-js';
import * as path from 'path';

// Arabic shaping & bidi
const ArabicReshaper = require('arabic-reshaper');
const bidiFactory = require('bidi-js')();

@Injectable()
export class PdfService {
  
  private shapeAndReorder(text: string): string {
    if (!text || typeof text !== 'string') return text || '';

    // Quick check: if there's no Arabic letters, return as-is
    if (!/[\u0600-\u06FF]/.test(text)) return text;

    // 1. Shape Arabic letters (presentation forms)
    let shaped = ArabicReshaper.convertArabic(text);

    // 2. Apply bidi reordering
    const embedding = bidiFactory.getEmbeddingLevels(shaped, 'auto');
    const flips = bidiFactory.getReorderSegments(shaped, embedding);

    // convert to array for in-place reversal operations
    let chars = Array.from(shaped);
    flips.forEach(([start, end]) => {
      let i = start, j = end;
      while (i < j) {
        const tmp = chars[i];
        chars[i] = chars[j];
        chars[j] = tmp;
        i++; j--;
      }
    });

    // 3. Mirror bracket-like characters where needed
    const mirrored = bidiFactory.getMirroredCharactersMap(shaped, embedding);
    for (const [idx, ch] of mirrored.entries()) {
      if (idx >= 0 && idx < chars.length) {
        chars[idx] = ch;
      }
    }

    return chars.join('');
  }

  async generateReceipt(data: any, company: any): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // Register Tajawal font (woff/woff2 from @fontsource)
      try {
        const tajawalPath = path.join(__dirname, '..', '..', 'node_modules', '@fontsource', 'tajawal', 'files', 'tajawal-arabic-400-normal.woff');
        doc.registerFont('Tajawal', tajawalPath);
      } catch (e) {
        console.warn('Could not register Tajawal font, falling back to Helvetica', e);
      }

      // 1. Header & Logo
      if (company.logoUrl) {
        // In real app, fetch image buffer from URL. For now, we skip or use placeholder
        // doc.image(logoBuffer, 50, 45, { width: 50 });
      }
      
      // Use Tajawal if registered
      try { doc.font('Tajawal'); } catch (e) { /* ignore */ }
      doc.fontSize(20).text(this.shapeAndReorder(company.nameAr || ''), { align: 'center' });
      doc.fontSize(10).text(company.nameEn || '', { align: 'center' });
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
      doc.fontSize(16).text(this.shapeAndReorder('إيصال استلام معاملة'), { align: 'center', underline: true });
      doc.moveDown();

      const resolveDate = (d: any) => {
        if (!d) return null;
        if (typeof d === 'string' && d.toLowerCase() === 'undefined') return null;
        try {
          const dt = new Date(d);
          return isNaN(dt.getTime()) ? null : dt;
        } catch (e) {
          return null;
        }
      };

      const theDate = resolveDate(data.docDate) || resolveDate(data.documentDate) || resolveDate(data.createdAt) || null;

      const fields = [
        { label: 'رقم المعاملة', value: data.barcodeId },
        { label: 'العنوان', value: data.title },
        { label: 'المرسل', value: data.sender },
        { label: 'المستلم', value: data.recipient },
        { label: 'التاريخ', value: theDate ? theDate.toLocaleDateString('ar-SA') : '—' },
        { label: 'الأهمية', value: data.priority },
      ];

      doc.fontSize(12);
      let y = doc.y;
      
      fields.forEach(field => {
        const label = this.shapeAndReorder(field.label + ':');
        const value = this.shapeAndReorder(String(field.value ?? '—'));

        doc.font('Tajawal').font('Tajawal').fontSize(12).text(label, 400, y, { align: 'right', width: 100 });
        doc.font('Tajawal').fontSize(12).text(value, 50, y, { align: 'right', width: 340 });
        y += 25;
      });

      // 4. Footer
      doc.fontSize(10).text(this.shapeAndReorder('تم إصدار هذا المستند إلكترونياً'), 50, 750, { align: 'center', width: 500 });

      doc.end();
    });
  }
}
