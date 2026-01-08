import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, LogIn, UserPlus, Activity, AlertOctagon, ShieldAlert, X, CheckCircle2 } from 'lucide-react';

interface Props {
  onAdminLogin?: () => void;
}

const Auth: React.FC<Props> = ({ onAdminLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Admin State
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [adminError, setAdminError] = useState('');

  // Helper to fetch IP and Device Info
  const captureUserInfo = async () => {
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      const ip = ipData.ip;
      const userAgent = navigator.userAgent;
      return { ip, userAgent };
    } catch (e) {
      return { ip: 'Unknown', userAgent: navigator.userAgent };
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Basic Validation
    if (!isLogin && password !== confirmPassword) {
      setError("كلمة المرور غير متطابقة");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // --- LOGIN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;

        // Capture IP & Update Profile on Login
        if (data.user) {
          const { ip, userAgent } = await captureUserInfo();
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username: email.split('@')[0], // Use part of email as username
            ip_address: ip,
            device_info: userAgent,
            last_login: new Date().toISOString(),
          }, { onConflict: 'id' });
        }

      } else {
        // --- SIGN UP ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;

        // Check if session is null (means email confirmation is required)
        if (data.user && !data.session) {
          setSuccessMessage("تم إنشاء الحساب بنجاح! يرجى مراجعة بريدك الإلكتروني لتفعيل الحساب قبل تسجيل الدخول.");
          setIsLogin(true); // Switch back to login view
        } else if (data.session) {
          // If confirmation is disabled in Supabase, login immediately
          const { ip, userAgent } = await captureUserInfo();
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username: email.split('@')[0],
            ip_address: ip,
            device_info: userAgent,
            last_login: new Date().toISOString(),
          });
        }
      }
    } catch (err: any) {
      if (err.message.includes("Invalid login")) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else if (err.message.includes("already registered")) {
        setError("هذا البريد الإلكتروني مسجل بالفعل");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCode === '19901115') {
      if (onAdminLogin) onAdminLogin();
    } else {
      setAdminError("رمز الدخول غير صحيح");
    }
  };

  return (
    <div className="min-h-screen bg-institutional-bg flex items-center justify-center p-4 font-sans relative" dir="rtl">
      
      {/* Admin Button - VISIBLE AND CLEAR */}
      <button 
        onClick={() => setShowAdminInput(true)}
        className="fixed bottom-6 left-6 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-4 py-2 rounded-full border border-slate-700 shadow-xl flex items-center gap-2 transition-all z-50 group"
      >
        <ShieldAlert className="w-4 h-4 group-hover:text-rose-500 transition-colors" />
        <span className="text-xs font-bold">Admin</span>
      </button>

      {/* Admin Modal */}
      {showAdminInput && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-2xl p-6 relative animate-in zoom-in-95">
             <button 
               onClick={() => { setShowAdminInput(false); setAdminCode(''); setAdminError(''); }}
               className="absolute top-4 left-4 text-slate-500 hover:text-white"
             >
               <X className="w-5 h-5" />
             </button>
             
             <div className="text-center mb-6">
                <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">لوحة التحكم (Admin)</h3>
             </div>

             <form onSubmit={handleAdminCheck} className="space-y-4">
                <input 
                  type="password" 
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="أدخل رمز المرور"
                  className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 text-center tracking-widest font-mono text-lg focus:border-rose-500 outline-none"
                  autoFocus
                />
                {adminError && <p className="text-rose-400 text-xs text-center font-bold">{adminError}</p>}
                
                <button 
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  دخول
                </button>
             </form>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-institutional-card border border-slate-700 shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-800/50 p-8 text-center border-b border-slate-700">
           <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-900/50">
              <Activity className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-2xl font-bold text-white mb-2">AL-MOHALIL <span className="text-indigo-400">PRO</span></h1>
           <p className="text-slate-400 text-sm">منصة التداول المؤسساتي الذكية</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button 
            onClick={() => { setIsLogin(true); setError(null); setSuccessMessage(null); }}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${isLogin ? 'text-white bg-slate-700/30 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            تسجيل الدخول
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(null); setSuccessMessage(null); }}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${!isLogin ? 'text-white bg-slate-700/30 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            حساب جديد
          </button>
        </div>

        {/* Form */}
        <div className="p-8">
          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg text-sm font-bold mb-6 text-center">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
              {successMessage}
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs font-bold mb-4 text-center flex items-center justify-center gap-2">
              <AlertOctagon className="w-4 h-4" /> {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs mb-1.5 font-bold">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 pr-10 text-sm focus:border-indigo-500 outline-none transition-colors"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1.5 font-bold">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 pr-10 text-sm focus:border-indigo-500 outline-none transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-slate-400 text-xs mb-1.5 font-bold">تأكيد كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 w-4 h-4 text-emerald-500" />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-slate-900 border text-white rounded-lg p-2.5 pr-10 text-sm focus:border-emerald-500 outline-none transition-colors ${
                      confirmPassword && password === confirmPassword ? 'border-emerald-500/50' : 'border-slate-700'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Activity className="w-4 h-4 animate-spin" />
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4" /> دخول
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> إنشاء حساب
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
             <p className="text-[10px] text-slate-500">
               {isLogin ? "لا تمتلك حساباً؟ قم بإنشاء حساب جديد مجاناً" : "سيتم إرسال رابط تفعيل إلى بريدك الإلكتروني"}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;