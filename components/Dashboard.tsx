
import React from 'react';
import { Correspondence, DocType } from '../types';
import { FilePlus, FileMinus, Layers, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  docs: Correspondence[];
}

const Dashboard: React.FC<DashboardProps> = ({ docs }) => {
  const incoming = docs.filter(d => d.type === DocType.INCOMING).length;
  const outgoing = docs.filter(d => d.type === DocType.OUTGOING).length;
  const total = docs.length;

  const data = [
    { name: 'الوارد', value: incoming, color: '#3b82f6' },
    { name: 'الصادر', value: outgoing, color: '#6366f1' }
  ];

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">نظرة عامة</h1>
          <p className="text-slate-400 font-medium mt-1">حالة الأرشيف والنشاط الرقمي الحالي</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
           <Calendar size={16} className="text-blue-500" />
           {new Date().toLocaleDateString('ar-SA')}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
           <div className="text-[11px] font-bold text-muted uppercase tracking-[0.2em] mb-4">إجمالي المعاملات</div>
           <div className="flex items-center justify-between">
              <div className="text-6xl font-black text-slate-900 leading-none">{total}</div>
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><Layers size={32} /></div>
           </div>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
           <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">الوارد المسجل</div>
           <div className="flex items-center justify-between">
              <div className="text-6xl font-black text-blue-600 leading-none">{incoming}</div>
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-300"><FilePlus size={32} /></div>
           </div>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
           <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">الصادر المسجل</div>
           <div className="flex items-center justify-between">
              <div className="text-6xl font-black text-indigo-600 leading-none">{outgoing}</div>
              <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-300"><FileMinus size={32} /></div>
           </div>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold mb-10 text-slate-900">توزيع الحركة</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 'bold'}} dy={10} />
              <YAxis hide />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}} />
              <Bar dataKey="value" radius={[12, 12, 4, 4]} barSize={50}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
