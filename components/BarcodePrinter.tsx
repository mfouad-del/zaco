
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

  const handlePrint = () => {
    if (!previewUrl) return alert('لا يوجد معاينة');
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<img src="${previewUrl}" style="width:100%;height:auto;"/>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
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
                <button onClick={handleDownload} className="bg-slate-700 text-white px-3 py-2 rounded">تحميل</button>
                <button onClick={handleClose} className="p-2 rounded bg-slate-100">إغلاق</button>
              </div>
            </div>
            <div className="p-6 flex items-center justify-center">
              {imgLoading ? <div>جارٍ التحميل...</div> : <img src={previewUrl ?? ''} alt="barcode" className="w-full h-auto object-contain" />}
            </div>
            <div className="p-4 text-xs text-slate-500 text-center">{settings?.orgName || ''} {doc.title} — {doc.documentDate ? new Date(doc.documentDate).toLocaleDateString('ar-SA') : new Date(doc.createdAt).toLocaleDateString('ar-SA')}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default BarcodePrinter;
