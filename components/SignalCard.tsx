import React, { useState } from 'react';
import { TradeSignal, TradeAction, MarketCondition } from '../types';
import { ArrowUpRight, ArrowDownRight, Shield, CheckCircle2, XCircle, AlertTriangle, TrendingUp, Info, Activity } from 'lucide-react';

interface Props {
  signal: TradeSignal;
  onSimulateResult: (amount: number, isWin: boolean) => void;
}

const SignalCard: React.FC<Props> = ({ signal, onSimulateResult }) => {
  const [isProcessed, setIsProcessed] = useState(false);
  
  const isBuy = signal.action === TradeAction.BUY;
  const isSell = signal.action === TradeAction.SELL;
  const isNeutral = signal.action === TradeAction.NEUTRAL;

  const handleResult = (isWin: boolean) => {
    if (isProcessed) return;
    const amount = isWin ? signal.expectedProfitAmount : -signal.expectedLossAmount;
    onSimulateResult(amount, isWin);
    setIsProcessed(true);
  };

  return (
    <div className="bg-institutional-card rounded-xl border border-slate-700 shadow-lg overflow-hidden relative group">
       
       {isProcessed && (
        <div className="absolute inset-0 bg-slate-900/90 z-20 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm">
           <CheckCircle2 className="w-12 h-12 text-indigo-400 mb-2" />
           <h3 className="text-lg font-bold text-white">تم التسجيل</h3>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-slate-700/50 bg-slate-800/20">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isBuy ? 'bg-emerald-500/10' : isSell ? 'bg-rose-500/10' : 'bg-slate-700/30'}`}>
            {isBuy ? <ArrowUpRight className="w-5 h-5 text-emerald-400" /> : 
             isSell ? <ArrowDownRight className="w-5 h-5 text-rose-400" /> : 
             <Shield className="w-5 h-5 text-slate-400" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-none mb-1">
              {signal.asset} 
            </h3>
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{signal.timeframe}</span>
                <span className={`text-xs font-bold ${isBuy ? 'text-emerald-400' : isSell ? 'text-rose-400' : 'text-slate-400'}`}>
                    {isNeutral ? 'NEUTRE' : signal.action}
                </span>
            </div>
          </div>
        </div>
        
        {/* Probability Badge */}
        <div className="text-center">
            <div className="text-xs text-slate-500 mb-0.5">الدقة</div>
            <div className="text-sm font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {signal.probability}%
            </div>
        </div>
      </div>

      <div className="p-4">
        {isNeutral ? (
          <div className="text-center py-4">
            <p className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              "{signal.fundamentalAnalysis.summary}"
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Levels Row */}
            <div className="grid grid-cols-3 gap-2 text-center">
               <div className="bg-slate-800/30 p-2 rounded border border-slate-700/30">
                  <div className="text-[10px] text-slate-500 uppercase">Entry</div>
                  <div className="font-mono font-bold text-sm text-white">{signal.entryPrice}</div>
               </div>
               <div className="bg-rose-900/10 p-2 rounded border border-rose-500/20">
                  <div className="text-[10px] text-rose-400 uppercase">Stop</div>
                  <div className="font-mono font-bold text-sm text-rose-400">{signal.stopLoss}</div>
               </div>
               <div className="bg-emerald-900/10 p-2 rounded border border-emerald-500/20">
                  <div className="text-[10px] text-emerald-400 uppercase">Target</div>
                  <div className="font-mono font-bold text-sm text-emerald-400">{signal.takeProfit}</div>
               </div>
            </div>

            {/* AI Insight */}
            <div className="bg-indigo-900/10 p-3 rounded-lg border border-indigo-500/20">
                 <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-3 h-3 text-indigo-400" />
                    <span className="text-[10px] font-bold text-indigo-300">تحليل سريع</span>
                 </div>
                 <p className="text-xs text-slate-300 leading-relaxed" dir="rtl">
                   {signal.fundamentalAnalysis.summary.slice(0, 120)}...
                 </p>
            </div>

            {/* Actions Buttons - Large Touch Targets */}
            <div className="grid grid-cols-2 gap-3 pt-2">
               <button 
                  onClick={() => handleResult(true)} 
                  className="flex flex-col items-center justify-center bg-emerald-600 active:bg-emerald-700 text-white py-3 rounded-xl transition-colors shadow-lg shadow-emerald-900/20 group"
                >
                  <span className="text-xs opacity-80 group-hover:opacity-100">ربح</span>
                  <span className="font-bold font-mono text-lg">+{signal.expectedProfitAmount.toFixed(0)}</span>
               </button>
               <button 
                  onClick={() => handleResult(false)} 
                  className="flex flex-col items-center justify-center bg-slate-700 active:bg-slate-600 text-slate-300 py-3 rounded-xl transition-colors border border-slate-600"
                >
                  <span className="text-xs opacity-80">خسارة</span>
                  <span className="font-bold font-mono text-lg text-rose-400">-{signal.expectedLossAmount.toFixed(0)}</span>
               </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default SignalCard;