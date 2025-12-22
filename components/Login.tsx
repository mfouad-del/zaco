
import React, { useState, useEffect } from 'react';
import { Lock, Mail, ShieldCheck, RefreshCw, LogIn, UserCircle } from 'lucide-react';
import { User } from '../types';
import { auth } from '../services/api';

interface LoginProps {
  onLogin: (user: User) => void;
  logoUrl: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, logoUrl }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState({ q: '', a: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ q: `${n1} + ${n2}`, a: n1 + n2 });
    setUserAnswer('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (parseInt(userAnswer) !== captcha.a) {
      setError('حل الكابتشا غير صحيح');
      generateCaptcha();
      return;
    }

    setLoading(true);
    try {
      const response = await auth.login(email, password);
      localStorage.setItem('archivx_token', response.access_token);
      localStorage.setItem('archivx_current_user', JSON.stringify(response.user));
      onLogin(response.user);
    } catch (err) {
      setError('خطأ في البريد الإلكتروني أو كلمة المرور');
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.05)] border border-slate-100 p-12 lg:p-16">
          <header className="text-center mb-12">
            <img src={logoUrl} className="h-20 mx-auto mb-8 object-contain" alt="Logo" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">بوابة الأرشفة الموحدة</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Enterprise Access Gateway</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required
                  type="email"
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 font-bold transition-all"
                  placeholder="name@company.sa"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  required
                  type="password"
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-slate-900 font-bold transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black text-slate-500">تحقق الأمان</span>
                  <button type="button" onClick={generateCaptcha} className="text-slate-300 hover:text-slate-900 transition-colors">
                    <RefreshCw size={16} />
                  </button>
               </div>
               <div className="flex items-center gap-4">
                  <div className="flex-1 bg-white border border-slate-200 py-3 text-center rounded-xl font-black text-xl">
                    {captcha.q} = ?
                  </div>
                  <input required type="number" placeholder="الحل" className="w-24 p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-900 font-black text-center" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} />
               </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold text-center border border-red-100 animate-pulse">{error}</div>}

            <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-lg shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95">
              <LogIn size={20} /> دخول آمن للنظام
            </button>
          </form>

          <footer className="mt-12 text-center">
             <div className="flex items-center justify-center gap-2 text-slate-300">
                <ShieldCheck size={14} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">End-to-End Encrypted Session</span>
             </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;
