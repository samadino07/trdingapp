import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, History, AlertOctagon, Edit2, Check, X } from 'lucide-react';

interface Props {
  capital: number;
  totalProfit: number;
  totalLoss: number;
  tradeCount: number;
  onUpdateCapital: (newCap: number) => void;
}

const StatsOverview: React.FC<Props> = ({ capital, totalProfit, totalLoss, tradeCount, onUpdateCapital }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(capital.toString());

  const handleSave = () => {
    const val = parseFloat(tempValue);
    if (!isNaN(val) && val > 0) {
      onUpdateCapital(val);
      setIsEditing(false);
    }
  };

  const StatCard = ({ title, value, sub, icon: Icon, colorClass, isEditable = false }: any) => (
    <div className="bg-institutional-card p-4 rounded-xl border border-slate-700 shadow-sm relative overflow-hidden group">
        <div className={`absolute top-0 left-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
          <Icon className="w-12 h-12 transform -rotate-12" />
        </div>
        
        <div className="flex justify-between items-start mb-2 relative z-10">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{title}</div>
            {isEditable && !isEditing && (
                <button onClick={() => { setTempValue(capital.toString()); setIsEditing(true); }} className="text-slate-500 hover:text-white p-1">
                    <Edit2 className="w-3 h-3" />
                </button>
            )}
        </div>

        {isEditable && isEditing ? (
             <div className="flex items-center gap-1 relative z-10">
                <input 
                    type="number" 
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-1 py-0.5 text-white font-mono text-sm focus:outline-none"
                    autoFocus
                />
                <button onClick={handleSave} className="bg-emerald-600 p-1 rounded hover:bg-emerald-500 text-white"><Check className="w-3 h-3" /></button>
                <button onClick={() => setIsEditing(false)} className="bg-slate-700 p-1 rounded hover:bg-slate-600 text-white"><X className="w-3 h-3" /></button>
            </div>
        ) : (
            <div className={`text-xl md:text-2xl font-mono font-bold relative z-10 ${colorClass.replace('text-', 'text-opacity-100 ')}`}>
               {value}
            </div>
        )}
        
        {sub && <div className="text-[10px] text-slate-500 mt-1 relative z-10">{sub}</div>}
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-2">
      <StatCard 
        title="رأس المال" 
        value={`${capital.toFixed(2)}`} 
        sub="Max Risk: 2%" 
        icon={Wallet} 
        colorClass="text-white"
        isEditable={true}
      />
      <StatCard 
        title="الأرباح" 
        value={`+${totalProfit.toFixed(2)}`} 
        icon={TrendingUp} 
        colorClass="text-emerald-400"
      />
      <StatCard 
        title="الخسائر" 
        value={`-${Math.abs(totalLoss).toFixed(2)}`} 
        icon={TrendingDown} 
        colorClass="text-rose-400"
      />
      <StatCard 
        title="الصفقات" 
        value={tradeCount} 
        icon={History} 
        colorClass="text-indigo-400"
      />
    </div>
  );
};

export default StatsOverview;