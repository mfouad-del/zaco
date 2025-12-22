
import React, { useState, useRef } from 'react';
import { DocType, Correspondence, SecurityLevel, Priority, DocStatus } from '../types';
import { FilePlus, Send, Shield, MapPin, Paperclip, UserCheck, FileUp, X, CheckCircle2 } from 'lucide-react';

interface DocumentFormProps {
  type: DocType;
  onSave: (doc: Partial<Correspondence>) => void;
}

const DocumentForm: React.FC<DocumentFormProps> = ({ type, onSave }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileObj, setFileObj] = useState<File | undefined>(undefined);
  const [file, setFile] = useState<Correspondence['pdfFile'] | undefined>(undefined);
  const [formData, setFormData] = useState<Partial<Correspondence>>({
    title: '',
    sender: '',
    recipient: '',
    referenceNumber: '',
    documentDate: new Date().toISOString().split('T')[0],
    description: '',
    security: SecurityLevel.PUBLIC,
    priority: Priority.NORMAL,
    physicalLocation: '',
    attachmentCount: 0,
    signatory: '',
    tags: []
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        alert("يرجى رفع ملفات بصيغة PDF فقط");
        return;
      }
      setFileObj(selectedFile);
      setFile({
        name: selectedFile.name,
        size: (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB',
        url: URL.createObjectURL(selectedFile)
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // @ts-ignore
    onSave({ ...formData, type, pdfFile: { ...file, file: fileObj } });
    setFormData({ title: '', sender: '', recipient: '', referenceNumber: '', documentDate: new Date().toISOString().split('T')[0], description: '', security: SecurityLevel.PUBLIC, priority: Priority.NORMAL, physicalLocation: '', attachmentCount: 0, signatory: '', tags: [] });
    setFile(undefined);
    setFileObj(undefined);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white p-12 lg:p-16 rounded-[4rem] border border-slate-100 shadow-[0_30px_100px_rgba(0,0,0,0.03)]">
        <header className="flex items-center gap-8 mb-16">
           <div className="p-6 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl">
             {type === DocType.INCOMING ? <FilePlus size={40} /> : <Send size={40} />}
           </div>
           <div>
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter">قيد جديد {type === DocType.INCOMING ? 'وارد' : 'صادر'}</h2>
             <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Zawaya Albina Archiving Engine v5.0</p>
           </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* PDF Upload Section - New Feature */}
          <div className="p-8 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
             <div className="flex flex-col items-center justify-center text-center gap-4">
                {!file ? (
                  <>
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm border border-slate-100">
                      <FileUp size={32} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">إرفاق المستند الرقمي (PDF)</h4>
                      <p className="text-xs text-slate-400 mt-1">سيتم إصدار الباركود وربطه بهذا الملف تلقائياً</p>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white border border-slate-200 px-8 py-3 rounded-2xl font-black text-sm hover:bg-slate-900 hover:text-white transition-all shadow-sm">اختيار ملف</button>
                  </>
                ) : (
                  <div className="flex items-center gap-6 w-full bg-white p-6 rounded-[2rem] border border-green-100 shadow-sm">
                    <div className="bg-green-50 p-4 rounded-2xl text-green-600"><CheckCircle2 size={32} /></div>
                    <div className="flex-1 text-right">
                      <div className="font-black text-slate-900 text-lg truncate max-w-xs">{file.name}</div>
                      <div className="text-xs font-bold text-slate-400">{file.size} - جاهز للأرشفة</div>
                    </div>
                    <button type="button" onClick={() => setFile(undefined)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-all"><X size={20} /></button>
                  </div>
                )}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">موضوع المعاملة</label>
              <input required className="w-full p-5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-900 font-bold text-xl transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">من الجهة</label>
              <input required className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-900 font-bold" value={formData.sender} onChange={e => setFormData({...formData, sender: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">إلى الجهة</label>
              <input required className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-900 font-bold" value={formData.recipient} onChange={e => setFormData({...formData, recipient: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">رقم المرجع الخارجي</label>
              <input className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white font-bold" value={formData.referenceNumber} onChange={e => setFormData({...formData, referenceNumber: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">درجة السرية</label>
              <select className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white font-bold" value={formData.security} onChange={e => setFormData({...formData, security: e.target.value as SecurityLevel})}>
                <option value={SecurityLevel.PUBLIC}>عام / هندسي</option>
                <option value={SecurityLevel.CONFIDENTIAL}>سري</option>
                <option value={SecurityLevel.TOP_SECRET}>سري للغاية</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">الأولوية</label>
              <select className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white font-bold" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as Priority})}>
                <option value={Priority.NORMAL}>عادي</option>
                <option value={Priority.HIGH}>عاجل</option>
                <option value={Priority.IMMEDIATE}>فوري</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white py-8 rounded-[2.5rem] font-black text-xl shadow-2xl hover:scale-[1.01] transition-all active:scale-95 flex items-center justify-center gap-4">
             توليد الباركود وتعميد الأرشفة
             <Shield size={24} className="opacity-50" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default DocumentForm;
