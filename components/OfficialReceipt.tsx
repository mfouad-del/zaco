
import React, { useState } from 'react';
import { Correspondence, SystemSettings } from '../types';
import { FileText, ShieldCheck, Settings2, Layout, Printer, X } from 'lucide-react';
import { correspondence } from '../services/api';

interface OfficialReceiptProps {
  doc: Correspondence;
  settings: SystemSettings;
}

const OfficialReceipt: React.FC<OfficialReceiptProps> = ({ doc, settings }) => {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(false);

  const handlePreview = async () => {
    setLoading(true);
    try {
      const blob = await correspondence.print(doc.id);
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Preview failed', error);
      alert('فشل تحضير معاينة الإيصال');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
      setImageDataUrl(null);
    }
  };

  const handlePrintFromPreview = () => {
    if (!pdfUrl) return;
    const iframe = document.getElementById('receipt-preview-iframe') as HTMLIFrameElement | null;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } else {
      // fallback to download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', `receipt-${doc.barcodeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const renderPdfToDataUrl = async (blob: Blob) => {
    // Dynamically import PDF.js
    try {
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf');
      // Use CDN worker as fallback for simplicity
      // If offline bundling is preferred, configure worker via pdfjs-dist entry
      // @ts-ignore
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

      const arrayBuffer = await blob.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');
      await page.render({ canvasContext: ctx, viewport }).promise;
      return canvas.toDataURL('image/png');
    } catch (e) {
      console.error('renderPdfToDataUrl error', e);
      throw e;
    }
  };

  const handleCopyAsImage = async () => {
    if (!pdfUrl) return alert('لا يوجد ملف للمعاينة');
    setImgLoading(true);
    try {
      const resp = await fetch(pdfUrl);
      const blob = await resp.blob();
      const dataUrl = await renderPdfToDataUrl(blob);
      setImageDataUrl(dataUrl);

      // Convert dataUrl to blob
      const res = await fetch(dataUrl);
      const imgBlob = await res.blob();

      // Copy to clipboard if supported
      if (navigator.clipboard && (navigator as any).ClipboardItem) {
        try {
          // @ts-ignore
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': imgBlob })]);
          alert('تم نسخ الصورة إلى الحافظة');
          setImgLoading(false);
          return;
        } catch (err) {
          console.warn('Clipboard write failed', err);
        }
      }

      // Fallback: open image in new tab so user can copy/save
      const w = window.open();
      if (w) {
        w.document.body.style.margin = '0';
        const img = w.document.createElement('img');
        img.src = dataUrl;
        img.style.maxWidth = '100%';
        w.document.body.appendChild(img);
      } else {
        alert('تعذر فتح نافذة جديدة لعرض الصورة. يمكنك تحميلها بدلاً من ذلك.');
      }
    } catch (e) {
      console.error(e);
      alert('فشل تحويل الإيصال إلى صورة');
    } finally {
      setImgLoading(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!pdfUrl) return alert('لا يوجد ملف للمعاينة');
    try {
      const resp = await fetch(pdfUrl);
      const blob = await resp.blob();
      const dataUrl = await renderPdfToDataUrl(blob);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.setAttribute('download', `receipt-${doc.barcodeId}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error(e);
      alert('فشل تحميل الصورة');
    }
  };

  return (
    <>
      <button 
        onClick={handlePreview} 
        disabled={loading}
        className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
        aria-label="معاينة الإيصال"
      >
        <Printer size={14} />
        {loading ? 'جاري التحميل...' : 'معاينة الإيصال'}
      </button>

      {pdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="bg-white w-full max-w-4xl rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="text-lg font-black">معاينة الإيصال</div>
              <div className="flex items-center gap-2">
                <button onClick={handlePrintFromPreview} className="bg-blue-600 text-white px-4 py-2 rounded">طباعة</button>
                <button onClick={handleCopyAsImage} disabled={imgLoading} className="bg-emerald-600 text-white px-4 py-2 rounded">{imgLoading ? 'جارٍ...' : 'نسخ كصورة'}</button>
                <button onClick={handleDownloadImage} className="bg-slate-700 text-white px-4 py-2 rounded">تحميل صورة</button>
                <button onClick={handleClose} className="p-2 rounded bg-slate-100"><X size={18} /></button>
              </div>
            </div>
            <div className="h-[80vh]">
              <iframe id="receipt-preview-iframe" src={pdfUrl} title="Receipt Preview" className="w-full h-full" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OfficialReceipt;


