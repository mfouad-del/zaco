import { writeFileSync } from 'fs';
import { PdfService } from '../src/pdf/pdf.service';

async function run() {
  const pdf = new PdfService();
  const sample = {
    barcodeId: 'ABC123456',
    title: 'مستند هام: تأكيد الاستلام',
    sender: 'مدير المشروع',
    recipient: 'قسم المراسلات',
    docDate: new Date().toISOString(),
    priority: 'عاجل'
  };
  const company = { nameAr: 'شركة الاختبار', nameEn: 'TestCo Ltd' };

  const buf = await pdf.generateReceipt(sample, company);
  writeFileSync('test-receipt.pdf', buf);
  console.log('Wrote test-receipt.pdf');
}

run().catch(e => { console.error(e); process.exit(1); });
