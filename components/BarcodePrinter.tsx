
import React from 'react';
import { Correspondence } from '../types';
import { Printer, Tag } from 'lucide-react';

interface BarcodePrinterProps {
  doc: Correspondence;
  settings?: any;
}

const BarcodePrinter: React.FC<BarcodePrinterProps> = ({ doc, settings }) => {
  const handlePrint = () => {
    const p = window.open('', '_blank');
    if (!p) return;
    const barcode = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${doc.barcodeId}&scale=3&rotate=N&includetext=false`;

    p.document.write(`
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@700;900&display=swap');
            body { font-family: 'Tajawal', sans-serif; margin: 0; padding: 0; background: #fff; direction: rtl; }
            .label { width: 300px; padding: 15px; border: 1px solid #000; text-align: center; }
            .org { font-size: 13px; font-weight: 900; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .barcode-img { width: 100%; height: auto; image-rendering: pixelated; }
            .id-text { font-family: monospace; font-size: 18px; font-weight: 900; background: #000; color: #fff; padding: 4px 10px; margin-top: 8px; display: inline-block; border-radius: 4px; }
            .meta { font-size: 9px; color: #555; margin-top: 8px; font-weight: 700; }
            @media print { body { padding: 5px; } }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="org">${settings?.orgName || 'نظام الأرشفة الموحد'}</div>
            <img class="barcode-img" src="${barcode}">
            <div class="id-text">${doc.barcodeId}</div>
            <div class="meta">الموضوع: ${doc.title} | التاريخ: ${doc.date}</div>
          </div>
          <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }</script>
        </body>
      </html>
    `);
    p.document.close();
  };

  return (
    <button onClick={handlePrint} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100 flex items-center gap-2 group" title="طباعة ملصق الباركود">
      <Printer size={18} className="group-hover:rotate-12 transition-transform" />
      <span className="text-[10px] font-black uppercase tracking-wider hidden lg:block">ملصق</span>
    </button>
  );
};

export default BarcodePrinter;
