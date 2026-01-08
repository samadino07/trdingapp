
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { Shield, LogOut, Search, MapPin, Smartphone, Clock, Database, EyeOff } from 'lucide-react';

interface Props {
  onLogout: () => void;
}

const AdminPanel: React.FC<Props> = ({ onLogout }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch data from 'profiles' table which contains the custom data we saved (IP, Username)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('last_login', { ascending: false });

      if (error) throw error;
      if (data) setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.ip_address || '').includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans" dir="rtl">
      
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="bg-rose-600 p-2 rounded-lg shadow-lg shadow-rose-900/20">
                 <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-white">لوحة التحكم (Admin Panel)</h1>
           </div>
           
           <button 
             onClick={onLogout}
             className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
           >
             <LogOut className="w-4 h-4" /> خروج
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
           <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm">
              <div className="text-slate-400 text-xs font-bold uppercase mb-1">إجمالي المستخدمين</div>
              <div className="text-3xl font-mono font-bold text-white">{users.length}</div>
           </div>
           <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm">
              <div className="text-slate-400 text-xs font-bold uppercase mb-1">متصلون اليوم</div>
              <div className="text-3xl font-mono font-bold text-emerald-400">
                {users.filter(u => u.last_login && new Date(u.last_login).toDateString() === new Date().toDateString()).length}
              </div>
           </div>
           <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm">
              <div className="text-slate-400 text-xs font-bold uppercase mb-1">إجمالي رأس المال</div>
              <div className="text-3xl font-mono font-bold text-blue-400">
                {users.reduce((acc, u) => acc + (u.capital || 0), 0).toFixed(0)} DH
              </div>
           </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
           
           {/* Toolbar */}
           <div className="p-4 border-b border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-white font-bold flex items-center gap-2">
                 <Database className="w-5 h-5 text-slate-400" />
                 قاعدة بيانات العملاء
              </h2>
              <div className="relative w-full md:w-64">
                 <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
                 <input 
                   type="text" 
                   placeholder="بحث بالاسم أو IP..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 pr-10 pl-4 text-sm text-white focus:border-rose-500 outline-none"
                 />
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-right text-sm text-slate-400">
                 <thead className="bg-slate-900/50 text-xs uppercase font-medium text-slate-500">
                    <tr>
                       <th className="px-6 py-4">المستخدم (Identifiant)</th>
                       <th className="px-6 py-4">كلمة المرور</th>
                       <th className="px-6 py-4">معلومات الاتصال (IP & Device)</th>
                       <th className="px-6 py-4">آخر ظهور</th>
                       <th className="px-6 py-4 text-left">رأس المال</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-700/50">
                    {loading ? (
                       <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-slate-500">جاري تحميل البيانات...</td>
                       </tr>
                    ) : filteredUsers.length === 0 ? (
                       <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-slate-500">لا يوجد مستخدمين مطابقين</td>
                       </tr>
                    ) : (
                       filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                             <td className="px-6 py-4">
                                <div className="font-bold text-white">{user.username || 'Unknown'}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{user.id.slice(0, 8)}...</div>
                             </td>
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded border border-slate-700 w-fit">
                                   <EyeOff className="w-3 h-3 text-slate-500" />
                                   <span className="text-[10px] font-mono tracking-widest text-slate-500">********</span>
                                </div>
                                <span className="text-[9px] text-rose-500/70 block mt-1">مشفر (Encrypted)</span>
                             </td>
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-2 mb-1">
                                   <MapPin className="w-3 h-3 text-blue-400" />
                                   <span className="font-mono text-white bg-blue-500/10 px-1 rounded">{user.ip_address || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                   <Smartphone className="w-3 h-3 text-slate-500" />
                                   <span className="text-xs text-slate-500 truncate max-w-[200px]" title={user.device_info}>{user.device_info || 'Unknown Device'}</span>
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                   <Clock className="w-3 h-3 text-slate-500" />
                                   <span>
                                      {user.last_login ? new Date(user.last_login).toLocaleString('ar-MA') : 'غير متوفر'}
                                   </span>
                                </div>
                             </td>
                             <td className="px-6 py-4 text-left font-mono font-bold text-emerald-400">
                                {user.capital?.toFixed(2)} DH
                             </td>
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
