
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


