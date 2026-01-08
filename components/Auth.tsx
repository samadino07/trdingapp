import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, LogIn, UserPlus, Activity, CheckCircle2, AlertOctagon } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccess("تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني لتأكيد التسجيل (أو الدخول مباشرة إذا كان التأكيد معطلاً).");
      }
    } catch (err: any) {
      setError(err.message === "Invalid login credentials" ? "البريد الإلكتروني أو كلمة المرور غير صحيحة" : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-institutional-bg flex items-center justify-center p-4 font-sans" dir="rtl">
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
            onClick={() => { setIsLogin(true); setError(null); setSuccess(null); }}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${isLogin ? 'text-white bg-slate-700/30 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            تسجيل الدخول
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(null); setSuccess(null); }}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${!isLogin ? 'text-white bg-slate-700/30 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            حساب جديد
          </button>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs font-bold mb-4 text-center flex items-center justify-center gap-2">
              <AlertOctagon className="w-4 h-4" /> {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs font-bold mb-4 text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {success}
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Activity className="w-4 h-4 animate-spin" />
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4" /> دخول آمن
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> إنشاء حساب
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
             <p className="text-xs text-slate-500">
               جميع البيانات مشفرة ومحمية عبر خوادم آمنة.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;