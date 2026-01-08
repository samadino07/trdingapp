import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { Shield, LogOut, Search, MapPin, Smartphone, Database, AlertCircle, RefreshCw, Terminal, Activity, X, Copy, Check } from 'lucide-react';

interface Props {
  onLogout: () => void;
}

interface LogEntry {
  id: string;
  time: string;
  message: string;
  type: 'login' | 'update' | 'new_user';
}

const SQL_FIX_CODE = `
-- قم بنسخ هذا الكود وتشغيله في Supabase SQL Editor
-- هذا يسمح بقراءة بيانات المستخدمين للوحة التحكم

-- تفعيل RLS (إذا لم يكن مفعلاً)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- السماح للجميع (بما فيهم الزوار) بقراءة البيانات
-- تحذير: هذا يجعل بيانات المستخدمين عامة (لأغراض التطوير)
CREATE POLICY "Allow Public Read Access" 
ON profiles FOR SELECT 
TO anon, authenticated 
USING (true);

-- السماح للمستخدمين بتحديث بياناتهم الخاصة فقط
CREATE POLICY "Allow Individual Update" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- السماح بإدخال بيانات جديدة
CREATE POLICY "Allow Insert" 
ON profiles FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);
`;

const AdminPanel: React.FC<Props> = ({ onLogout }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showFixModal, setShowFixModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message: string, type: 'login' | 'update' | 'new_user' = 'update') => {
    const now = new Date();
    setLogs(prev => [...prev, {
      id: crypto.randomUUID(),
      time: now.toLocaleTimeString('en-GB'),
      message,
      type
    }]);
  };

  useEffect(() => {
    fetchUsers();

    const subscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
         console.log('Realtime update:', payload);
         
         if (payload.eventType === 'INSERT') {
            addLog(`New User Registered: ${payload.new.email || payload.new.id.slice(0,6)}`, 'new_user');
         } else if (payload.eventType === 'UPDATE') {
            if (payload.old.last_login !== payload.new.last_login) {
               addLog(`User Login: ${payload.new.email || payload.new.username}`, 'login');
            } else {
               addLog(`Profile Updated: ${payload.new.email || payload.new.username}`, 'update');
            }
         }
         fetchUsers(false); 
      })
      .subscribe((status) => {
         if (status === 'SUBSCRIBED') {
            addLog('Realtime Connection Established', 'update');
         }
      });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchUsers = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setErrorMsg(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('last_login', { ascending: false });

      if (error) throw error;
      
      if (data) setUsers(data);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setErrorMsg("تنبيه: لا يمكن جلب البيانات. تأكد من إعداد سياسات الأمان (RLS) في Supabase.");
      setUsers([]); // Ensure clean state, NO MOCK DATA
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.ip_address || '').includes(searchTerm)
  );

  const isOnline = (dateString?: string) => {
    if (!dateString) return false;
    const lastLogin = new Date(dateString).getTime();
    const now = new Date().getTime();
    // Consider online if active in last 10 minutes
    return (now - lastLogin) < 10 * 60 * 1000;
  };

  const copySQL = () => {
    navigator.clipboard.writeText(SQL_FIX_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col md:flex-row" dir="rtl">
      
      {/* Sidebar / Logs Panel (Right on Desktop) */}
      <aside className="w-full md:w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-[300px] md:h-screen sticky top-0 md:fixed md:right-0 z-20 shadow-2xl">
         <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
             <div className="flex items-center gap-2">
                 <Terminal className="w-4 h-4 text-emerald-400" />
                 <h2 className="text-sm font-bold text-white uppercase tracking-wider">Live Activity Log</h2>
             </div>
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
         </div>
         
         <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs custom-scrollbar bg-black/20">
             {logs.length === 0 && (
                <div className="text-slate-600 text-center mt-10">Waiting for events...</div>
             )}
             {logs.map((log) => (
                <div key={log.id} className="flex gap-2 animate-in slide-in-from-right-2">
                   <span className="text-slate-500 shrink-0">[{log.time}]</span>
                   <span className={`${
                      log.type === 'login' ? 'text-blue-400' : 
                      log.type === 'new_user' ? 'text-emerald-400' : 
                      'text-slate-300'
                   }`}>
                      {log.type === 'login' && '>> '}
                      {log.type === 'new_user' && '++ '}
                      {log.message}
                   </span>
                </div>
             ))}
             <div ref={logsEndRef} />
         </div>

         <div className="p-4 border-t border-slate-800 bg-slate-900">
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-sm transition-colors border border-slate-700">
               <LogOut className="w-4 h-4" /> خروج من النظام
            </button>
         </div>
      </aside>

      {/* Main Content (Left on Desktop) */}
      <main className="flex-1 p-4 md:p-8 md:mr-80 bg-slate-950">
        
         {/* Top Stats */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
               <div className="absolute top-0 left-0 p-2 opacity-10"><Database className="w-16 h-16" /></div>
               <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Total Users</div>
               <div className="text-2xl font-mono font-bold text-white">{users.length}</div>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
               <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Online Now</div>
               <div className="text-2xl font-mono font-bold text-emerald-400 flex items-center gap-2">
                  {users.filter(u => isOnline(u.last_login)).length}
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
               </div>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
               <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Total Capital</div>
               <div className="text-2xl font-mono font-bold text-blue-400">
                 {users.reduce((acc, u) => acc + (u.capital || 0), 0).toLocaleString()} <span className="text-sm">DH</span>
               </div>
            </div>
         </div>

         {/* Search & Refresh */}
         <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
               <Shield className="w-6 h-6 text-rose-500" />
               قاعدة بيانات المشتركين
            </h1>
            <div className="flex items-center gap-2 w-full md:w-auto">
               <button onClick={() => fetchUsers(true)} className="p-2.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 transition-colors shadow-lg">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
               </button>
               <div className="relative flex-1 md:w-72">
                  <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input 
                     type="text" 
                     placeholder="بحث بالبريد، الاسم، أو IP..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pr-10 pl-4 text-sm text-white focus:border-indigo-500 outline-none shadow-sm"
                  />
               </div>
            </div>
         </div>

         {/* Error Banner with Fix Button */}
         {errorMsg && (
             <div className="bg-rose-950/30 border border-rose-500/20 p-4 rounded-xl flex items-center justify-between gap-3 mb-6 animate-in slide-in-from-top-2">
               <div className="flex items-center gap-3 text-rose-400">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div className="text-xs font-bold">{errorMsg}</div>
               </div>
               <button 
                 onClick={() => setShowFixModal(true)}
                 className="text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-3 py-1.5 rounded border border-rose-500/30 transition-colors"
               >
                 طريقة الإصلاح (SQL)
               </button>
             </div>
         )}

         {/* Data Table */}
         <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
               <table className="w-full text-right text-sm text-slate-400">
                  <thead className="bg-slate-950 text-xs uppercase font-medium text-slate-500 border-b border-slate-800">
                     <tr>
                        <th className="px-6 py-4 w-10">#</th>
                        <th className="px-6 py-4">المستخدم (User Identity)</th>
                        <th className="px-6 py-4">الاتصال (Network)</th>
                        <th className="px-6 py-4">آخر نشاط (Last Seen)</th>
                        <th className="px-6 py-4 text-left">الرصيد (Capital)</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                     {loading ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500"><RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2"/>جاري تحميل البيانات...</td></tr>
                     ) : filteredUsers.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                           {errorMsg ? "لا يمكن عرض البيانات بسبب قيود الأمان" : "لا توجد نتائج مطابقة"}
                        </td></tr>
                     ) : (
                        filteredUsers.map((user, idx) => {
                           const online = isOnline(user.last_login);
                           return (
                              <tr key={user.id} className={`hover:bg-slate-800/50 transition-colors ${online ? 'bg-emerald-900/5' : ''}`}>
                                 <td className="px-6 py-4 font-mono text-xs text-slate-600">{idx + 1}</td>
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                       <div className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                                       <div>
                                          <div className="font-bold text-white flex items-center gap-2">
                                             {user.email || 'No Email'}
                                          </div>
                                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{user.username}</div>
                                          <div className="text-[9px] text-slate-600 font-mono mt-0.5">ID: {user.id.slice(0, 8)}...</div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 mb-1.5">
                                       <MapPin className="w-3 h-3 text-indigo-400" />
                                       <span className="font-mono text-xs text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">{user.ip_address || '---.---.---.---'}</span>
                                    </div>
                                    <div className="flex items-center gap-2" title={user.device_info}>
                                       <Smartphone className="w-3 h-3 text-slate-500" />
                                       <span className="text-[10px] text-slate-500 truncate max-w-[150px]">{user.device_info?.split(')')[0] + ')' || 'Unknown'}</span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                       <div className={`flex items-center gap-2 text-xs font-bold ${online ? 'text-emerald-400' : 'text-slate-400'}`}>
                                          <Activity className="w-3 h-3" />
                                          {online ? 'Online Now' : 'Offline'}
                                       </div>
                                       <span className="text-[10px] text-slate-600 mt-1 font-mono">
                                          {user.last_login ? new Date(user.last_login).toLocaleString('en-GB') : 'Never'}
                                       </span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 text-left">
                                    <span className="font-mono font-bold text-white text-sm bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                       {user.capital?.toFixed(2)} <span className="text-slate-500 text-[10px]">DH</span>
                                    </span>
                                 </td>
                              </tr>
                           );
                        })
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </main>

      {/* SQL Fix Modal */}
      {showFixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative">
              <button 
                onClick={() => setShowFixModal(false)}
                className="absolute top-4 left-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-6">
                 <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-400" />
                    إصلاح صلاحيات قاعدة البيانات
                 </h3>
                 <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    منصة Supabase تمنع قراءة البيانات افتراضياً للحماية (RLS). لتفعيل لوحة التحكم، يجب تنفيذ كود SQL التالي في لوحة تحكم Supabase (SQL Editor).
                 </p>
                 
                 <div className="bg-black/50 border border-slate-700 rounded-lg p-4 relative group">
                    <pre className="text-[10px] font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                       {SQL_FIX_CODE}
                    </pre>
                    <button 
                      onClick={copySQL}
                      className="absolute top-2 left-2 bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-colors border border-slate-600"
                      title="نسخ الكود"
                    >
                       {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                 </div>
              </div>
              
              <div className="p-4 bg-slate-800/50 text-center border-t border-slate-800">
                 <button 
                   onClick={() => setShowFixModal(false)}
                   className="text-sm font-bold text-slate-300 hover:text-white"
                 >
                    إغلاق
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;