
import React from 'react';
import { Correspondence, DocType, Priority, SecurityLevel, SystemSettings } from '../types';
import { Search, ArrowRightLeft, FileSpreadsheet, ShieldCheck, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import { exportToCSV } from '../services/barcodeService';
import BarcodePrinter from './BarcodePrinter';
import OfficialReceipt from './OfficialReceipt';

interface DocumentListProps {
  docs: Correspondence[];
  settings: SystemSettings;
}

const DocumentList: React.FC<DocumentListProps> = ({ docs, settings }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtered = docs.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.barcodeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
        <div className="relative flex-1 w-full max-w-2xl">
          <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="البحث في الأرشيف الهندسي (باركود، عنوان، موضوع)..." 
            className="w-full pr-16 pl-6 py-5 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm outline-none focus:border-slate-900 transition-all font-bold"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => exportToCSV(filtered, 'Zawaya_ArchivX')} className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-black text-sm flex items-center gap-3 shadow-xl hover:bg-slate-800 transition-all">
          <FileSpreadsheet size={18} /> تصدير السجل العام
        </button>
      </div>

      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-[0_40px_100px_rgba(0,0,0,0.02)] overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الباركود الرقمي</th>
              <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">تفاصيل المعاملة</th>
              <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">المستند الرقمي</th>
              <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">مسار التداول</th>
              <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">الأدوات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length > 0 ? filtered.map(doc => (
              <tr key={doc.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-10 py-10">
                   <div className="flex flex-col items-center gap-2">
                     <span className="font-mono text-[13px] font-black text-slate-900 bg-white border border-slate-200 px-5 py-2.5 rounded-2xl shadow-sm group-hover:border-slate-900 transition-all">{doc.barcodeId}</span>
                     <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter flex items-center gap-1"><ShieldCheck size={10} /> Verified ID</span>
                   </div>
                </td>
                <td className="px-10 py-10">
                   <div>
                      <div className="font-black text-slate-900 text-xl mb-1 truncate max-w-xs">{doc.title}</div>
                      <div className="flex items-center gap-3">
                         <span className={`text-[10px] font-black ${doc.security === SecurityLevel.TOP_SECRET ? 'text-red-500 underline' : 'text-slate-400'}`}>{doc.security}</span>
                         <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                         <span className="text-[10px] font-bold text-blue-500">{doc.category}</span>
                      </div>
                   </div>
                </td>
                <td className="px-10 py-10">
                   {doc.pdfFile ? (
                     <a href={doc.pdfFile.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-100 hover:bg-green-600 hover:text-white transition-all group/file shadow-sm">
                        <FileText size={16} />
                        <span className="text-xs font-black">فتح PDF</span>
                        <ExternalLink size={12} className="opacity-0 group-hover/file:opacity-100 transition-all" />
                     </a>
                   ) : (
                     <span className="text-[10px] font-bold text-slate-300">لا يوجد ملف مرفق</span>
                   )}
                </td>
                <td className="px-10 py-10">
                   <div className="flex items-center gap-3 text-xs font-bold text-slate-600 bg-slate-100/50 p-3 rounded-2xl border border-slate-50">
                      <span className="max-w-[100px] truncate">{doc.sender}</span>
                      <ArrowRightLeft size={12} className="text-slate-300 shrink-0" />
                      <span className="max-w-[100px] truncate">{doc.recipient}</span>
                   </div>
                </td>
                <td className="px-10 py-10">
                   <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-x-2">
                      <BarcodePrinter doc={doc} settings={settings} />
                      <OfficialReceipt doc={doc} settings={settings} />
                   </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="py-48 text-center">
                   <AlertCircle size={48} className="mx-auto text-slate-100 mb-4" />
                   <p className="text-2xl font-black text-slate-200">الأرشيف لا يحتوي على نتائج مطابقة</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentList;
