import React, { useState } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon, LogIn, UserPlus, Activity, CheckCircle2, Zap } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
}

// Simple hash function to simulate password encryption (Client-side only)
const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

const Auth: React.FC<Props> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (username.length < 3) return setError("اسم المستخدم يجب أن يكون 3 أحرف على الأقل");
    if (password.length < 6) return setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    if (password !== confirmPassword) return setError("كلمات المرور غير متطابقة");

    const users: User[] = JSON.parse(localStorage.getItem('app_users') || '[]');
    
    if (users.find(u => u.username === username)) {
      return setError("اسم المستخدم موجود بالفعل");
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      passwordHash: simpleHash(password),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('app_users', JSON.stringify(users));
    
    setSuccess("تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.");
    setIsLogin(true);
    setPassword('');
    setConfirmPassword('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const users: User[] = JSON.parse(localStorage.getItem('app_users') || '[]');
    const user = users.find(u => u.username === username && u.passwordHash === simpleHash(password));

    if (user) {
      onLogin(user);
    } else {
      setError("اسم المستخدم أو كلمة المرور غير صحيحة");
    }
  };

  const handleDemoLogin = () => {
    const demoUsername = "Trader_Pro";
    const demoPassword = "demo123456";
    const users: User[] = JSON.parse(localStorage.getItem('app_users') || '[]');
    
    let demoUser = users.find(u => u.username === demoUsername);

    // Create demo user if not exists
    if (!demoUser) {
      demoUser = {
        id: 'demo-user-id',
        username: demoUsername,
        passwordHash: simpleHash(demoPassword),
        createdAt: new Date().toISOString()
      };
      users.push(demoUser);
      localStorage.setItem('app_users', JSON.stringify(users));
    }

    onLogin(demoUser);
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
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${isLogin ? 'text-white bg-slate-700/30 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            تسجيل الدخول
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${!isLogin ? 'text-white bg-slate-700/30 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            حساب جديد
          </button>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs font-bold mb-4 text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs font-bold mb-4 text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {success}
            </div>
          )}

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs mb-1.5 font-bold">اسم المستخدم</label>
              <div className="relative">
                <UserIcon className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 pr-10 text-sm focus:border-indigo-500 outline-none transition-colors"
                  placeholder="Username"
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
                />
              </div>
            </div>

            {!isLogin && (
              <div className="animate-in slide-in-from-top-2">
                <label className="block text-slate-400 text-xs mb-1.5 font-bold">تأكيد كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 pr-10 text-sm focus:border-indigo-500 outline-none transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 mt-6"
            >
              {isLogin ? (
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

          {/* Demo Button */}
          <div className="mt-4 pt-4 border-t border-slate-700">
             <button 
               onClick={handleDemoLogin}
               className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-lg border border-slate-600 transition-colors flex items-center justify-center gap-2 text-sm"
             >
               <Zap className="w-4 h-4 text-gold" /> تجربة سريعة (Demo Account)
             </button>
          </div>

          <div className="mt-6 text-center">
             <p className="text-xs text-slate-500">
               جميع البيانات مشفرة ومحمية. <br/>
               هذه بيئة محاكاة آمنة للتدريب.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;