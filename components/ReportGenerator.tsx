
import React, { useState } from 'react';
import { Correspondence, DocType } from '../types';
import { Calendar, FileBarChart, Download, Printer, Filter, Info } from 'lucide-react';

interface ReportGeneratorProps {
  docs: Correspondence[];
  settings: {
    orgName: string;
    logoUrl: string;
  };
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ docs, settings }) => {
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredDocs = docs.filter(doc => {
    const docTs = doc.docDate ? Date.parse(doc.docDate) : (doc.createdAt ? Date.parse(doc.createdAt as any) : NaN);
    if (Number.isNaN(docTs)) return false;
    const s = Date.parse(startDate);
    const e = Date.parse(endDate) + 24*60*60*1000 - 1; // include full end day
    return docTs >= s && docTs <= e;
  });

  const stats = {
    total: filteredDocs.length,
    incoming: filteredDocs.filter(d => d.type === DocType.INCOMING).length,
    outgoing: filteredDocs.filter(d => d.type === DocType.OUTGOING).length,
  };

  const [dateError, setDateError] = useState<string | null>(null);

  const handlePrintReport = () => {
    // Validate dates
    if (Date.parse(startDate) > Date.parse(endDate)) {
      setDateError('تاريخ البداية يجب أن يكون قبل أو مساوي لتاريخ النهاية');
      return;
    }
    setDateError(null);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const orgName = settings.orgName;
    const logoUrl = settings.logoUrl;

    const tableRows = filteredDocs.map(doc => `
      <tr>
        <td style="text-align: center; font-family: monospace; font-weight: bold;">${doc.barcodeId}</td>
        <td>${doc.title}</td>
        <td style="text-align: center;">${doc.type === DocType.INCOMING ? 'وارد' : 'صادر'}</td>
        <td>${doc.sender}</td>
        <td style="text-align: center;">${doc.docDate ? new Date(doc.docDate).toLocaleDateString('ar-SA') : ''}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>تقرير المعاملات - ${startDate} إلى ${endDate}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap');
            body { 
              font-family: 'Tajawal', sans-serif; 
              direction: rtl; 
              padding: 40px; 
              color: #0f172a;
              line-height: 1.6;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              border-bottom: 3px solid #0f172a; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .header-info h1 { margin: 0; font-size: 20px; font-weight: 900; }
            .header-info p { margin: 5px 0; font-size: 12px; color: #64748b; }
            
            .report-title { text-align: center; margin-bottom: 30px; }
            .report-title h2 { font-size: 24px; font-weight: 900; margin-bottom: 5px; }
            .report-title p { color: #64748b; font-weight: 700; }

            .stats-grid { 
              display: grid; 
              grid-template-cols: repeat(3, 1fr); 
              gap: 20px; 
              margin-bottom: 30px;
            }
            .stat-card { 
              border: 1px solid #e2e8f0; 
              padding: 15px; 
              border-radius: 15px; 
              text-align: center;
              background: #f8fafc;
            }
            .stat-value { font-size: 20px; font-weight: 900; display: block; }
            .stat-label { font-size: 12px; color: #64748b; font-weight: 700; }

            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th { background: #f1f5f9; padding: 12px; border: 1px solid #e2e8f0; font-weight: 900; }
            td { padding: 10px; border: 1px solid #e2e8f0; }

            .footer { 
              position: fixed; 
              bottom: 30px; 
              left: 40px; 
              right: 40px; 
              border-top: 1px solid #e2e8f0; 
              padding-top: 15px; 
              font-size: 10px; 
              text-align: center; 
              color: #94a3b8;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
             <img src="${logoUrl}" style="height: 70px;">
             <div class="header-info" style="text-align: center;">
                <h1>${orgName}</h1>
                <p>نظام ArchivX Enterprise - مركز التقارير</p>
             </div>
             <div style="width: 70px;"></div>
          </div>

          <div class="report-title">
            <h2>تقرير حركة الصادر والوارد</h2>
            <p>الفترة من ${startDate} إلى ${endDate}</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-value">${stats.total}</span>
              <span class="stat-label">إجمالي المعاملات</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">${stats.incoming}</span>
              <span class="stat-label">الوارد</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">${stats.outgoing}</span>
              <span class="stat-label">الصادر</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>المعرف الرقمي</th>
                <th>موضوع المعاملة</th>
                <th>النوع</th>
                <th>الجهة</th>
                <th>تاريخ القيد</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="footer">
            تم استخراج هذا التقرير آلياً بتاريخ ${new Date().toLocaleString('ar-SA')}. جميع البيانات موثقة ومعماة برمجياً.
          </div>

          <script>
            window.onload = function() {
              setTimeout(() => { window.print(); window.close(); }, 700);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-blue-700 p-4 rounded-3xl text-white shadow-lg shadow-blue-200">
            <FileBarChart size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 leading-tight">مركز توليد التقارير</h2>
            <p className="text-slate-700 font-medium">قم بتحديد النطاق الزمني لاستخراج تقرير مفصل بنسخة A4</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-widest">
              <Calendar size={14} /> تاريخ البداية
            </label>
            <input 
              aria-label="تاريخ البداية"
              type="date" 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-200 outline-none font-bold transition-all text-slate-800"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-widest">
              <Calendar size={14} /> تاريخ النهاية
            </label>
            <input 
              aria-label="تاريخ النهاية"
              type="date" 
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-200 outline-none font-bold transition-all text-slate-800"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي النتائج</p>
            <p className="text-4xl font-black text-slate-900">{stats.total}</p>
          </div>
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm text-center">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">الوارد</p>
            <p className="text-4xl font-black text-blue-600">{stats.incoming}</p>
          </div>
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm text-center">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">الصادر</p>
            <p className="text-4xl font-black text-indigo-600">{stats.outgoing}</p>
          </div>
        </div>

        {dateError && <div className="text-red-600 font-bold mb-4" role="alert">{dateError}</div>}
        <div className="flex gap-4">
          <button 
            onClick={handlePrintReport}
            disabled={filteredDocs.length === 0}
            aria-disabled={filteredDocs.length === 0}
            className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-5 rounded-3xl font-black text-lg shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer size={24} /> معالجة وطباعة التقرير A4
          </button>
        </div>
      </div>

      <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 flex gap-5">
        <div className="bg-white p-3 rounded-2xl shadow-sm h-fit text-blue-600"><Info size={24} /></div>
        <div className="space-y-1">
          <h4 className="font-black text-blue-900">حول التقارير الذكية</h4>
          <p className="text-blue-800 text-sm leading-relaxed font-medium">
            يتم استخراج البيانات مباشرة من الأرشيف الرقمي المشفر. تأكد من أن الطابعة مضبوطة على وضع <strong>Landscape</strong> إذا كانت قائمة المعاملات طويلة جداً لضمان ظهور كافة الأعمدة بوضوح.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
