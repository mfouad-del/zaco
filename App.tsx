
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FilePlus, FileMinus, Search, Scan, FileText, Settings, History, ShieldCheck, Building2, Lock, FileUp, LogOut, KeyRound, Plus, Trash2, Globe, Users } from 'lucide-react';
import { DocType, Correspondence, DocStatus, AuditLog, SecurityLevel, Priority, SystemSettings, Company, User } from './types';
import { generateUUIDv7, generateBusinessBarcode } from './services/barcodeService';
import Dashboard from './components/Dashboard';
import DocumentForm from './components/DocumentForm';
import DocumentList from './components/DocumentList';
import BarcodeScanner from './components/BarcodeScanner';
import AuditLogs from './components/AuditLogs';
import ReportGenerator from './components/ReportGenerator';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import { correspondence, companies, stats } from './services/api';

console.log('[ARCHIVX] App component loaded');

const App: React.FC = () => {
  console.log('[ARCHIVX] App component rendering...');
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [docs, setDocs] = useState<Correspondence[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [settings, setSettings] = useState<SystemSettings>({
    primaryColor: '#1a1a1a',
    footerText: 'نظام الأرشفة الموحد - الإصدار المؤسسي 5.0',
    showStamp: true,
    autoArchive: false,
    companies: []
  });

  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [newCompany, setNewCompany] = useState({ nameAr: '', nameEn: '', logoUrl: '' });

  useEffect(() => {
    const savedUser = localStorage.getItem('archivx_current_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setSelectedCompanyId(user.companyId);
    }
  }, []);

  useEffect(() => {
    if (currentUser && selectedCompanyId) {
      fetchData();
    }
  }, [currentUser, selectedCompanyId]);

  // Poll for updates and refresh on window focus so UI reflects real-time changes
  useEffect(() => {
    if (!currentUser || !selectedCompanyId) return;
    const interval = setInterval(() => {
      fetchData();
    }, 15000); // every 15s

    const onFocus = () => fetchData();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [currentUser, selectedCompanyId]);

  const fetchData = async () => {
    try {
      const [docsData, companiesData, statsData] = await Promise.all([
        correspondence.getAll(),
        companies.getAll(),
        stats.get()
      ]);
      setDocs(docsData);
      setSettings(prev => ({ ...prev, companies: companiesData }));
      // setStats(statsData); // If we had a stats state
    } catch (error) {
      console.error('Failed to fetch data', error);
      if (error.response?.status === 401) handleLogout();
    }
  };

  const baseUrl = '/zaco/';
  const currentCompany = settings.companies.find(c => c.id === selectedCompanyId) || settings.companies[0] || {
    id: 'default',
    nameAr: 'جاري التحميل...',
    nameEn: 'Loading...',
    logoUrl: `${baseUrl}logo.png`
  };
  
  const filteredDocs = docs; // Backend filters by company automatically

  const handleUpdateUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    // API call to update users would go here
  };

  const handleLogout = () => {
    localStorage.removeItem('archivx_token');
    localStorage.removeItem('archivx_current_user');
    setCurrentUser(null);
  };

  const addLog = (action: string, targetId: string) => {
    // Logs are handled by backend now
  };

  const handleSave = async (data: Partial<Correspondence>) => {
    try {
      const formData = new FormData();
      formData.append('type', data.type || DocType.INCOMING);
      formData.append('title', data.title || '');
      formData.append('sender', data.sender || '');
      formData.append('recipient', data.recipient || '');
      formData.append('docDate', data.documentDate ? new Date(data.documentDate).toISOString() : new Date().toISOString());
      formData.append('priority', data.priority || Priority.NORMAL);
      formData.append('securityLevel', data.security || SecurityLevel.PUBLIC);
      if (data.pdfFile && data.pdfFile.file) {
        formData.append('file', data.pdfFile.file);
      }

      await correspondence.create(formData);
      
      setNotification(`تم الحفظ بنجاح للمنشأة: ${currentCompany.nameAr}`);
      setTimeout(() => setNotification(null), 4000);
      fetchData(); // Refresh list
      setActiveTab('list');
    } catch (error) {
      console.error('Save failed', error);
      setNotification('فشل الحفظ');
    }
  };

  if (!currentUser) return <Login onLogin={setCurrentUser} logoUrl={`https://www.zaco.sa/logo2.png`} />;

  const NavItem = ({ id, label, icon: Icon, adminOnly = false }: { id: string, label: string, icon: any, adminOnly?: boolean }) => {
    if (adminOnly && currentUser.role !== 'ADMIN') return null;
    return (
      <button onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === id ? 'bg-slate-900 text-white shadow-xl translate-x-1' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}><Icon size={18} /><span>{label}</span></button>
    );
  };

  return (
    <div className="flex h-screen bg-[#FDFDFD] text-slate-900 font-sans overflow-hidden">
      <aside className="w-80 bg-white border-l border-slate-100 flex flex-col shrink-0 z-10 no-print">
        <div className="p-10 mb-2">
           <img src={currentCompany.logoUrl} className="h-16 w-auto mb-4 object-contain" alt="Logo" />
           <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{currentCompany.nameEn}</div>
           <div className="mt-8 space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">تبديل المنشأة</label>
              <select className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black outline-none focus:border-slate-900 transition-all cursor-pointer" value={selectedCompanyId} onChange={(e) => setSelectedCompanyId(e.target.value)}>
                {settings.companies.map(c => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
              </select>
           </div>
        </div>

        <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <NavItem id="dashboard" label="لوحة التحكم" icon={LayoutDashboard} />
          <div className="h-px bg-slate-50 my-6 mx-4"></div>
          <NavItem id="incoming" label="تسجيل وارد" icon={FilePlus} />
          <NavItem id="outgoing" label="تسجيل صادر" icon={FileMinus} />
          <NavItem id="list" label="الأرشيف المؤسسي" icon={Search} />
          <div className="h-px bg-slate-50 my-6 mx-4"></div>
          <NavItem id="scanner" label="ماسح الباركود" icon={Scan} />
          <NavItem id="reports" label="التقارير" icon={FileText} />
          <NavItem id="users" label="إدارة المستخدمين" icon={Users} adminOnly />
          <NavItem id="audit" label="سجلات الرقابة" icon={History} adminOnly />
        </nav>

        <div className="p-8 border-t border-slate-50">
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all mb-2 ${activeTab === 'settings' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-900'}`}><Settings size={18} /> الإعدادات</button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-50 transition-all mb-4"><LogOut size={18} /> خروج</button>
          <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
             <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">{currentUser.name.substring(0, 2).toUpperCase()}</div>
             <div className="overflow-hidden">
               <div className="text-[11px] font-black text-slate-900 truncate">{currentUser.name}</div>
               <div className="text-[9px] font-bold text-slate-400 uppercase">{currentUser.role === 'ADMIN' ? 'مدير نظام' : 'مستخدم'}</div>
             </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto flex flex-col relative">
        {notification && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-10 py-5 rounded-full shadow-2xl flex items-center gap-4 animate-bounce border border-white/10">
            <ShieldCheck size={20} className="text-green-400" />
            <span className="font-black text-sm">{notification}</span>
          </div>
        )}

        <div className="p-12 lg:p-16 max-w-[1600px] mx-auto w-full">
          {activeTab === 'dashboard' && <Dashboard docs={filteredDocs} />}
          {activeTab === 'incoming' && <DocumentForm type={DocType.INCOMING} onSave={handleSave} />}
          {activeTab === 'outgoing' && <DocumentForm type={DocType.OUTGOING} onSave={handleSave} />}
          {activeTab === 'list' && <DocumentList docs={filteredDocs} settings={{...settings, orgName: currentCompany.nameAr, logoUrl: currentCompany.logoUrl, orgNameEn: currentCompany.nameEn}} />}
          {activeTab === 'scanner' && <BarcodeScanner docs={docs} />}
          {activeTab === 'reports' && <ReportGenerator docs={filteredDocs} settings={{orgName: currentCompany.nameAr, logoUrl: currentCompany.logoUrl}} />}
          {activeTab === 'audit' && <AuditLogs logs={logs} />}
          {activeTab === 'users' && <UserManagement users={users} onUpdateUsers={handleUpdateUsers} currentUserEmail={currentUser.email} />}
          {activeTab === 'settings' && (
            <div className="max-w-4xl space-y-12 animate-in zoom-in-95">
              <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
                <h2 className="text-3xl font-black mb-10 flex items-center gap-4"><Globe size={24} /> إدارة الكيانات</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <input type="text" placeholder="اسم الشركة بالعربي" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={newCompany.nameAr} onChange={e => setNewCompany({...newCompany, nameAr: e.target.value})} />
                      <input type="text" placeholder="Company Name (English)" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={newCompany.nameEn} onChange={e => setNewCompany({...newCompany, nameEn: e.target.value})} />
                      <input type="text" placeholder="رابط الشعار (URL)" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-mono text-xs" value={newCompany.logoUrl} onChange={e => setNewCompany({...newCompany, logoUrl: e.target.value})} />
                      <button onClick={() => { 
                         if (!newCompany.nameAr) return;
                         const updated = {...settings, companies: [...settings.companies, {id: 'c'+Date.now(), ...newCompany}]};
                         setSettings(updated);
                         localStorage.setItem('archivx_settings_v5_multi', JSON.stringify(updated));
                         setNewCompany({nameAr:'', nameEn:'', logoUrl:''});
                      }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2">إضافة شركة للمنظومة</button>
                   </div>
                   <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 overflow-y-auto max-h-[300px]">
                      <div className="space-y-3">
                         {settings.companies.map(c => (
                           <div key={c.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100 group">
                              <div className="flex items-center gap-3">
                                 <img src={c.logoUrl} className="w-8 h-8 object-contain rounded" alt="logo" />
                                 <span className="text-xs font-black">{c.nameAr}</span>
                              </div>
                              <button onClick={() => {
                                 if (settings.companies.length <= 1) return;
                                 const updated = {...settings, companies: settings.companies.filter(x => x.id !== c.id)};
                                 setSettings(updated);
                                 localStorage.setItem('archivx_settings_v5_multi', JSON.stringify(updated));
                              }} className="text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
