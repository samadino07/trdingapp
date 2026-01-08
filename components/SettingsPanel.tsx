import React from 'react';
import { Sliders, Bell, Globe, Shield, Moon } from 'lucide-react';

const SettingsPanel: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-center">
          <Sliders className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white">إعدادات المنصة</h2>
          <p className="text-xs text-slate-400">تخصيص تجربة التداول وإدارة المخاطر</p>
       </div>

       <div className="bg-institutional-card rounded-xl border border-slate-700 divide-y divide-slate-800">
          
          {/* Risk Management */}
          <div className="p-4 md:p-6 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="bg-rose-500/10 p-2.5 rounded-lg">
                   <Shield className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                   <h3 className="font-bold text-white text-sm">إدارة المخاطر (Risk Management)</h3>
                   <p className="text-[10px] text-slate-400">تحديد نسبة المخاطرة القصوى لكل صفقة</p>
                </div>
             </div>
             <select className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2 focus:border-indigo-500 outline-none">
                <option value="1">1% (Conservative)</option>
                <option value="2">2% (Balanced)</option>
                <option value="4">4% (Aggressive)</option>
             </select>
          </div>

          {/* Notifications */}
          <div className="p-4 md:p-6 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="bg-indigo-500/10 p-2.5 rounded-lg">
                   <Bell className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                   <h3 className="font-bold text-white text-sm">التنبيهات (Alerts)</h3>
                   <p className="text-[10px] text-slate-400">تلقي إشعارات عند توفر فرص جديدة</p>
                </div>
             </div>
             <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
             </div>
          </div>

          {/* Language */}
          <div className="p-4 md:p-6 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="bg-emerald-500/10 p-2.5 rounded-lg">
                   <Globe className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                   <h3 className="font-bold text-white text-sm">اللغة (Language)</h3>
                   <p className="text-[10px] text-slate-400">لغة واجهة التطبيق والتحليلات</p>
                </div>
             </div>
             <select className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2 focus:border-indigo-500 outline-none">
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
                <option value="en">English</option>
             </select>
          </div>

          {/* Theme */}
          <div className="p-4 md:p-6 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="bg-slate-500/10 p-2.5 rounded-lg">
                   <Moon className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                   <h3 className="font-bold text-white text-sm">المظهر (Theme)</h3>
                   <p className="text-[10px] text-slate-400">الوضع الليلي هو الافتراضي للمنصات المؤسساتية</p>
                </div>
             </div>
             <span className="text-xs font-bold text-slate-500 bg-slate-900 px-3 py-1 rounded border border-slate-800">Dark Mode Only</span>
          </div>

       </div>
    </div>
  );
};

export default SettingsPanel;