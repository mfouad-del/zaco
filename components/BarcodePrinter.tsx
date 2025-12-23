
import React, { useState } from 'react';
import { Correspondence } from '../types';
import { Printer, Tag } from 'lucide-react';

interface BarcodePrinterProps {
  doc: Correspondence;
  settings?: any;
}

const BarcodePrinter: React.FC<BarcodePrinterProps> = ({ doc, settings }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);

  const barcodeSrc = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(doc.barcodeId)}&scale=3&rotate=N&includetext=false`;

  const handlePreview = async () => {
    setImgLoading(true);
    try {
      const resp = await fetch(barcodeSrc);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setShowPreview(true);
    } catch (e) {
      console.error('Barcode preview failed', e);
      alert('فشل تحضير معاينة الملصق');
    } finally {
      setImgLoading(false);
    }
  };

  const handleClose = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setShowPreview(false);
  };

  const handleCopyImage = async () => {
    if (!previewUrl) return alert('لا يوجد معاينة');
    try {
      const resp = await fetch(previewUrl);
      const blob = await resp.blob();
      if (navigator.clipboard && (navigator as any).ClipboardItem) {
        // @ts-ignore
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        alert('تم نسخ الصورة إلى الحافظة');
        return;
      }
      // fallback: open image in new tab
      const w = window.open(previewUrl);
      if (!w) alert('تعذر فتح نافذة جديدة');
    } catch (e) {
      console.error(e);
      alert('فشل نسخ الصورة');
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return alert('لا يوجد معاينة');
    const link = document.createElement('a');
    link.href = previewUrl;
    link.setAttribute('download', `label-${doc.barcodeId}.png`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleSaveStyledPng = async () => {
    if (!previewUrl) return alert('لا يوجد معاينة');
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = previewUrl;
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error('Image load error'));
      });

      const width = 600;
      const height = 340;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      // background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // header: company name (RTL)
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.font = '700 22px Tajawal, Arial, sans-serif';
      const company = settings?.orgName || '';
      if (company) ctx.fillText(company, width / 2, 36);

      // title
      ctx.font = '600 16px Tajawal, Arial, sans-serif';
      if (doc.title) ctx.fillText(doc.title, width / 2, 60);

      // draw barcode image centered
      const maxImgW = width - 80;
      const imgW = Math.min(maxImgW, img.width);
      const imgH = (imgW / img.width) * img.height;
      const imgX = (width - imgW) / 2;
      const imgY = 80;
      ctx.drawImage(img, imgX, imgY, imgW, imgH);

      // barcode id with black pill
      ctx.font = '700 20px monospace';
      const idText = doc.barcodeId;
      const idMetrics = ctx.measureText(idText);
      const idW = Math.ceil(idMetrics.width) + 24;
      const idH = 32;
      const idX = (width - idW) / 2;
      const idY = imgY + imgH + 12;
      // pill background
      ctx.fillStyle = '#000000';
      const radius = 6;
      ctx.beginPath();
      ctx.moveTo(idX + radius, idY);
      ctx.lineTo(idX + idW - radius, idY);
      ctx.quadraticCurveTo(idX + idW, idY, idX + idW, idY + radius);
      ctx.lineTo(idX + idW, idY + idH - radius);
      ctx.quadraticCurveTo(idX + idW, idY + idH, idX + idW - radius, idY + idH);
      ctx.lineTo(idX + radius, idY + idH);
      ctx.quadraticCurveTo(idX, idY + idH, idX, idY + idH - radius);
      ctx.lineTo(idX, idY + radius);
      ctx.quadraticCurveTo(idX, idY, idX + radius, idY);
      ctx.closePath();
      ctx.fill();
      // id text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(idText, width / 2, idY + idH / 2);

      // date
      ctx.font = '400 14px Tajawal, Arial, sans-serif';
      const dateStr = doc.documentDate ? new Date(doc.documentDate).toLocaleDateString('ar-SA') : new Date(doc.createdAt).toLocaleDateString('ar-SA');
      ctx.textAlign = 'center';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(dateStr, width / 2, idY + idH + 20);

      // convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return alert('فشل إنشاء الصورة');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `label-${doc.barcodeId}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }, 'image/png', 0.95);
    } catch (e) {
      console.error('Save styled PNG failed', e);
      alert('فشل حفظ PNG');
    }
  };

  const handlePrint = () => {
    // open print window with same styled label and trigger print
    const barcode = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(doc.barcodeId)}&scale=3&rotate=N&includetext=false`;
    const dateStr = doc.documentDate ? new Date(doc.documentDate).toLocaleDateString('ar-SA') : new Date(doc.createdAt).toLocaleDateString('ar-SA');
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@700;900&display=swap');
            body { font-family: 'Tajawal', sans-serif; margin: 0; padding: 0; background: #fff; direction: rtl; }
            .label { width: 320px; padding: 16px; border: 1px solid #e5e7eb; text-align: center; }
            .org { font-size: 13px; font-weight: 900; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 6px; }
            .barcode-img { width: 100%; height: auto; image-rendering: pixelated; }
            .id-text { font-family: monospace; font-size: 18px; font-weight: 900; background: #000; color: #fff; padding: 6px 12px; margin-top: 8px; display: inline-block; border-radius: 6px; }
            .meta { font-size: 11px; color: #6b7280; margin-top: 8px; font-weight: 700; }
            @media print { body { padding: 5px; } }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="org">${settings?.orgName || 'نظام الأرشفة الموحد'}</div>
            <img class="barcode-img" src="${barcode}" />
            <div class="id-text">${doc.barcodeId}</div>
            <div class="meta">${doc.title || ''} · ${dateStr}</div>
          </div>
          <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 300); }</script>
        </body>
      </html>
    `;

    const w = window.open('', '_blank');
    if (!w) return alert('تعذر فتح نافذة الطباعة');
    w.document.write(html);
    w.document.close();
    w.focus();
  };

  return (
    <>
      <button onClick={handlePreview} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100 flex items-center gap-2 group" title="معاينة ملصق الباركود">
        <Printer size={18} className="group-hover:rotate-12 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-wider hidden lg:block">ملصق</span>
      </button>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="text-lg font-black">معاينة الملصق</div>
              <div className="flex items-center gap-2">
                <button onClick={handlePrint} className="bg-blue-600 text-white px-3 py-2 rounded">طباعة</button>
                <button onClick={handleCopyImage} className="bg-emerald-600 text-white px-3 py-2 rounded">نسخ كصورة</button>
                <button onClick={handleSaveStyledPng} className="bg-yellow-600 text-white px-3 py-2 rounded">حفظ PNG</button>
                <button onClick={handleDownload} className="bg-slate-700 text-white px-3 py-2 rounded">تحميل</button>
                <button onClick={handleClose} className="p-2 rounded bg-slate-100">إغلاق</button>
              </div>
            </div>
            <div className="p-6 flex items-center justify-center">
              {imgLoading ? (
                <div>جارٍ التحميل...</div>
              ) : (
                <div className="w-[320px] border rounded-lg p-4 text-center bg-white" dir="rtl">
                  <div className="org font-black text-sm border-b pb-2 mb-2">{settings?.orgName || 'نظام الأرشفة الموحد'}</div>
                  <img src={previewUrl ?? ''} alt="barcode" className="w-full h-auto image-rendering-pixelated" />
                  <div className="mt-3">
                    <div className="inline-block bg-black text-white font-mono text-lg font-black px-3 py-1 rounded">{doc.barcodeId}</div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 font-bold">{doc.title} · {doc.documentDate ? new Date(doc.documentDate).toLocaleDateString('ar-SA') : new Date(doc.createdAt).toLocaleDateString('ar-SA')}</div>
                </div>
              )}
            </div>
            <div className="p-4 text-xs text-slate-500 text-center">{settings?.orgName || ''} {doc.title} — {doc.documentDate ? new Date(doc.documentDate).toLocaleDateString('ar-SA') : new Date(doc.createdAt).toLocaleDateString('ar-SA')}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default BarcodePrinter;
