import React from 'react';
import { TradeHistoryItem } from '../types';
import { BarChart3, TrendingUp, Calendar, ArrowRight, PieChart } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

interface Props {
  history: TradeHistoryItem[];
}

const ReportsPanel: React.FC<Props> = ({ history }) => {
  // Process Data for Charts
  const dailyPnL: Record<string, number> = {};
  history.forEach(trade => {
    const date = new Date(trade.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    dailyPnL[date] = (dailyPnL[date] || 0) + (trade.result === 'WIN' ? trade.amount : -trade.amount);
  });

  const chartData = Object.keys(dailyPnL).map(date => ({
    date,
    pnl: dailyPnL[date]
  })).slice(-7); // Last 7 active days

  const totalTrades = history.length;
  const wins = history.filter(t => t.result === 'WIN').length;
  const losses = totalTrades - wins;
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
  
  const avgWin = wins > 0 ? history.filter(t => t.result === 'WIN').reduce((a, b) => a + b.amount, 0) / wins : 0;
  const avgLoss = losses > 0 ? history.filter(t => t.result === 'LOSS').reduce((a, b) => a + b.amount, 0) / losses : 0;

  return (
    <div className="space-y-6">
       <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-lg">
                   <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-white">التقرير الأسبوعي</h2>
                   <p className="text-xs text-slate-400">Weekly Performance Report</p>
                </div>
             </div>
             <button className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2">
                <Calendar className="w-3 h-3" /> آخر 30 يوم
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Key Stats */}
             <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                   <div className="text-xs text-slate-500 mb-1">معدل النجاح (Win Rate)</div>
                   <div className="flex items-end gap-2">
                      <span className={`text-3xl font-bold ${winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>{winRate}%</span>
                      <span className="text-xs text-slate-400 mb-1.5">من {totalTrades} صفقة</span>
                   </div>
                   <div className="w-full h-1.5 bg-slate-700 rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${winRate}%` }}></div>
                   </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                   <div className="text-xs text-slate-500 mb-1">المتوسط (Avg R:R)</div>
                   <div className="flex justify-between items-center mt-2">
                      <div className="text-center">
                         <div className="text-[10px] text-emerald-400">Avg Win</div>
                         <div className="text-sm font-mono font-bold text-white">+{avgWin.toFixed(0)}</div>
                      </div>
                      <div className="w-px h-8 bg-slate-700"></div>
                      <div className="text-center">
                         <div className="text-[10px] text-rose-400">Avg Loss</div>
                         <div className="text-sm font-mono font-bold text-white">-{avgLoss.toFixed(0)}</div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Chart */}
             <div className="md:col-span-2 h-[200px] bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                <h3 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2">
                   <TrendingUp className="w-3 h-3" /> الأداء اليومي (Daily PnL)
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                         cursor={{fill: '#1e293b'}}
                         contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                         {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'} />
                         ))}
                      </Bar>
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
       </div>

       {/* Detailed List */}
       <div className="bg-institutional-card rounded-xl border border-slate-700 p-6">
          <h3 className="font-bold text-white mb-4">تحليل الأخطاء</h3>
          {losses > 0 ? (
             <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-rose-900/10 rounded-lg border border-rose-500/10">
                   <TrendingUp className="w-5 h-5 text-rose-400 mt-0.5" />
                   <div>
                      <div className="text-sm font-bold text-rose-300">تنبيه المخاطرة</div>
                      <p className="text-xs text-slate-400 mt-1">
                         لديك {losses} صفقات خاسرة. تأكد من الالتزام بوقف الخسارة (Stop Loss) وعدم تحريكه.
                      </p>
                   </div>
                </div>
             </div>
          ) : (
             <div className="flex items-center gap-2 text-emerald-400 bg-emerald-900/10 p-4 rounded-lg border border-emerald-500/10">
                <PieChart className="w-5 h-5" />
                <span className="text-sm font-bold">أداء ممتاز! استمر في الالتزام بالخطة.</span>
             </div>
          )}
       </div>
    </div>
  );
};

export default ReportsPanel;