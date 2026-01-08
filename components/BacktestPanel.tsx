import React, { useState } from 'react';
import { AVAILABLE_ASSETS, MarketType, Timeframe, BacktestDuration, BacktestResult } from '../types';
import { runBacktestAnalysis } from '../services/geminiService';
import { FlaskConical, Play, RotateCcw, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  currentCapital: number;
  onRunComplete: (result: BacktestResult) => void;
}

const BacktestPanel: React.FC<Props> = ({ currentCapital, onRunComplete }) => {
  const [asset, setAsset] = useState(AVAILABLE_ASSETS[MarketType.FOREX][0]);
  const [timeframe, setTimeframe] = useState<Timeframe>(Timeframe.H1);
  const [duration, setDuration] = useState<BacktestDuration>(BacktestDuration.MONTH_1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const handleRunBacktest = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      const data = await runBacktestAnalysis(asset, timeframe, duration, currentCapital);
      setResult(data);
      onRunComplete(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-institutional-card border border-slate-700 rounded-xl overflow-hidden shadow-2xl mt-8 mb-12">
      <div className="bg-slate-800/50 p-4 md:p-6 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg shadow-lg">
             <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">مختبر الاستراتيجيات</h2>
            <p className="text-[10px] md:text-xs text-slate-400">Backtesting Lab</p>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Controls - Compact on Mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
           <div className="col-span-2 md:col-span-1">
             <label className="block text-[10px] text-slate-500 mb-1 font-bold uppercase">الأصل</label>
             <select 
               value={asset}
               onChange={(e) => setAsset(e.target.value)}
               className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none transition-colors"
             >
                <optgroup label="Forex">
                  {AVAILABLE_ASSETS[MarketType.FOREX].map(a => <option key={a} value={a}>{a}</option>)}
                </optgroup>
                <optgroup label="Commodities">
                  {AVAILABLE_ASSETS[MarketType.COMMODITIES].map(a => <option key={a} value={a}>{a}</option>)}
                </optgroup>
             </select>
           </div>
           
           <div>
             <label className="block text-[10px] text-slate-500 mb-1 font-bold uppercase">الإطار</label>
             <select 
               value={timeframe}
               onChange={(e) => setTimeframe(e.target.value as Timeframe)}
               className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none"
             >
                <option value={Timeframe.M15}>15 Min</option>
                <option value={Timeframe.H1}>1 Hour</option>
             </select>
           </div>

           <div>
             <label className="block text-[10px] text-slate-500 mb-1 font-bold uppercase">المدة</label>
             <select 
               value={duration}
               onChange={(e) => setDuration(e.target.value as BacktestDuration)}
               className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none"
             >
                <option value={BacktestDuration.WEEK_1}>أسبوع</option>
                <option value={BacktestDuration.MONTH_1}>شهر</option>
                <option value={BacktestDuration.MONTH_3}>3 شهور</option>
             </select>
           </div>

           <div className="col-span-2 md:col-span-1 flex items-end">
             <button 
                onClick={handleRunBacktest}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-lg transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isLoading ? (
                 <RotateCcw className="w-5 h-5 animate-spin" />
               ) : (
                 <>
                   <Play className="w-4 h-4 fill-current" />
                   <span>بدء التحليل</span>
                 </>
               )}
             </button>
           </div>
        </div>

        {/* Results */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI Stats - Minimalist Row */}
            <div className="flex flex-wrap gap-2 md:gap-4 mb-6 justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-800">
               <div className="text-center flex-1 min-w-[80px]">
                 <div className="text-[10px] text-slate-500 uppercase font-bold">Trades</div>
                 <div className="text-lg font-bold text-white">{result.totalTrades}</div>
               </div>
               <div className="w-px bg-slate-700 h-8 self-center"></div>
               <div className="text-center flex-1 min-w-[80px]">
                 <div className="text-[10px] text-slate-500 uppercase font-bold">Win Rate</div>
                 <div className={`text-lg font-bold ${result.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.winRate}%
                 </div>
               </div>
               <div className="w-px bg-slate-700 h-8 self-center"></div>
               <div className="text-center flex-1 min-w-[80px]">
                 <div className="text-[10px] text-slate-500 uppercase font-bold">Net Profit</div>
                 <div className={`text-lg font-bold ${result.totalProfit > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {result.totalProfit > 0 ? '+' : ''}{result.totalProfit.toFixed(0)}
                 </div>
               </div>
               <div className="w-px bg-slate-700 h-8 self-center hidden md:block"></div>
               <div className="text-center flex-1 min-w-[80px] hidden md:block">
                 <div className="text-[10px] text-slate-500 uppercase font-bold">Drawdown</div>
                 <div className="text-lg font-bold text-rose-400">-{result.maxDrawdown.toFixed(0)}</div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Minimalist Chart Area */}
               <div className="lg:col-span-2 bg-slate-900 rounded-xl p-1 border border-slate-800 h-[250px] md:h-[300px] relative overflow-hidden group">
                 <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
                    <div className="bg-slate-800/80 p-1.5 rounded-lg backdrop-blur">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-300">Capital Curve</span>
                 </div>
                 
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.equityCurve} margin={{ top: 40, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="day" hide />
                      <YAxis 
                        stroke="#475569" 
                        fontSize={10} 
                        domain={['auto', 'auto']} 
                        tickFormatter={(val) => val.toFixed(0)} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                        itemStyle={{ color: '#60a5fa' }}
                        formatter={(value: number) => [`${value.toFixed(2)} DH`, 'Balance']}
                        labelStyle={{ display: 'none' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="#3b82f6" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorBalance)" 
                      />
                    </AreaChart>
                 </ResponsiveContainer>
               </div>

               {/* Analysis Text Card */}
               <div className="flex flex-col gap-3">
                  <div className={`p-4 rounded-xl border flex-1 flex flex-col justify-center ${
                      result.strategyQuality === 'Good' ? 'bg-emerald-900/10 border-emerald-500/20' : 
                      result.strategyQuality === 'Average' ? 'bg-orange-900/10 border-orange-500/20' : 
                      'bg-rose-900/10 border-rose-500/20'
                    }`}>
                     <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className={`w-4 h-4 ${result.strategyQuality === 'Good' ? 'text-emerald-400' : 'text-orange-400'}`} />
                        <span className="text-xs font-bold text-slate-400 uppercase">Quality</span>
                     </div>
                     <div className={`text-2xl font-bold ${result.strategyQuality === 'Good' ? 'text-emerald-400' : result.strategyQuality === 'Average' ? 'text-orange-400' : 'text-rose-400'}`}>
                        {result.strategyQuality}
                     </div>
                     <p className="text-xs text-slate-400 mt-2 leading-relaxed opacity-80" dir="rtl">
                       {result.explanation.length > 150 ? result.explanation.slice(0, 150) + "..." : result.explanation}
                     </p>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                     <span className="text-xs text-slate-500 font-bold">Final Capital</span>
                     <span className="text-lg font-mono font-bold text-white">{result.finalCapital.toFixed(2)}</span>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BacktestPanel;