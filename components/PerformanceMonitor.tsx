import React, { useEffect, useState } from 'react';
import { BacktestResult, TradeHistoryItem, PerformanceReview } from '../types';
import { generatePerformanceReview } from '../services/geminiService';
import { Scale, AlertTriangle, ShieldCheck, Ban, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  backtestResult: BacktestResult | null;
  history: TradeHistoryItem[];
}

const PerformanceMonitor: React.FC<Props> = ({ backtestResult, history }) => {
  const [review, setReview] = useState<PerformanceReview | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate Live Stats
  const liveTradeCount = history.length;
  const winningTrades = history.filter(t => t.result === 'WIN').length;
  const liveWinRate = liveTradeCount > 0 ? Math.round((winningTrades / liveTradeCount) * 100) : 0;
  const liveProfit = history.reduce((acc, curr) => acc + curr.amount, 0);

  useEffect(() => {
    const fetchReview = async () => {
      if (backtestResult && liveTradeCount >= 3) {
        setIsLoading(true);
        try {
          const result = await generatePerformanceReview(backtestResult, {
            winRate: liveWinRate,
            tradeCount: liveTradeCount,
            totalProfit: liveProfit
          });
          setReview(result);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchReview();
  }, [backtestResult, liveTradeCount, liveWinRate]); // Re-run when history changes

  if (!backtestResult) {
    return (
      <div className="bg-institutional-card border border-slate-700/50 border-dashed rounded-xl p-6 text-center mb-8">
        <Scale className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <h3 className="text-slate-400 font-bold">نظام المراقبة غير مفعل</h3>
        <p className="text-xs text-slate-500">قم بتشغيل Backtest أولاً لتفعيل المقارنة الذكية.</p>
      </div>
    );
  }

  return (
    <div className="bg-institutional-card border border-slate-700 rounded-xl overflow-hidden shadow-xl mb-8">
      <div className="bg-slate-800/50 p-4 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">مراقبة الأداء (AI Review)</h3>
        </div>
        {review && (
          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
            review.status === 'Safe' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            review.status === 'Caution' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
            'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {review.status === 'Safe' && <ShieldCheck className="w-3 h-3" />}
            {review.status === 'Caution' && <AlertTriangle className="w-3 h-3" />}
            {review.status === 'Stop' && <Ban className="w-3 h-3" />}
            {review.status}
          </div>
        )}
      </div>

      <div className="p-6">
        {liveTradeCount < 3 ? (
           <div className="text-center py-4">
             <p className="text-sm text-slate-400">نحتاج إلى 3 صفقات حقيقية على الأقل لبدء المقارنة.</p>
             <div className="mt-2 text-xs text-slate-500">الصفقات الحالية: {liveTradeCount}/3</div>
           </div>
        ) : isLoading ? (
          <div className="flex justify-center py-6 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> جاري تحليل الأداء...
          </div>
        ) : review ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Stats Comparison */}
            <div className="space-y-6">
               <div>
                 <div className="flex justify-between text-xs text-slate-400 mb-2">
                   <span>Backtest Win Rate (المتوقع)</span>
                   <span className="text-purple-400 font-bold">{backtestResult.winRate}%</span>
                 </div>
                 <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-purple-500 rounded-full opacity-50" style={{ width: `${backtestResult.winRate}%` }}></div>
                 </div>
               </div>

               <div>
                 <div className="flex justify-between text-xs text-slate-400 mb-2">
                   <span>Live Win Rate (الحقيقي)</span>
                   <span className={`${liveWinRate >= backtestResult.winRate - 5 ? 'text-emerald-400' : 'text-rose-400'} font-bold`}>{liveWinRate}%</span>
                 </div>
                 <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
                   <div className={`h-full rounded-full transition-all duration-500 ${liveWinRate >= backtestResult.winRate - 5 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${liveWinRate}%` }}></div>
                   {/* Marker for Backtest target */}
                   <div className="absolute top-0 bottom-0 w-0.5 bg-white/30" style={{ left: `${backtestResult.winRate}%` }}></div>
                 </div>
                 <p className="text-[10px] text-slate-500 mt-1 text-right">الهدف هو الوصول للخط الأبيض</p>
               </div>
            </div>

            {/* AI Advice */}
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
               <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
                 <ArrowRight className="w-3 h-3 text-blue-400" />
                 توصية الذكاء الاصطناعي
               </h4>
               <p className="text-sm text-slate-200 leading-relaxed mb-3" dir="rtl">
                 "{review.advice}"
               </p>
               <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                 <span className="text-xs text-slate-500">Risk Adjustment:</span>
                 <span className="text-xs font-bold font-mono text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                    {review.riskAdjustment}
                 </span>
               </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PerformanceMonitor;