
import React, { useState } from 'react';
import { Correspondence, SystemSettings } from '../types';
import { FileText, ShieldCheck, Settings2, Layout, Printer } from 'lucide-react';
import { correspondence } from '../services/api';

interface OfficialReceiptProps {
  doc: Correspondence;
  settings: SystemSettings;
}

const OfficialReceipt: React.FC<OfficialReceiptProps> = ({ doc, settings }) => {
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    setLoading(true);
    try {
      const blob = await correspondence.print(doc.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${doc.barcodeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Print failed', error);
      alert('فشل طباعة الإيصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePrint} 
      disabled={loading}
      className="bg-slate-900 text-white px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
    >
      <Printer size={14} />
      {loading ? 'جاري التحميل...' : 'طباعة الإيصال'}
    </button>
  );
};

export default OfficialReceipt;


