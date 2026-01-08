import React from 'react';
import { TradeHistoryItem, TradeAction } from '../types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Props {
  history: TradeHistoryItem[];
}

const TradeHistoryTable: React.FC<Props> = ({ history }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-8 bg-institutional-card rounded-xl border border-slate-700 shadow-lg overflow-hidden">
      <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">سجل التداول (Historique)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-800/50 text-xs uppercase font-medium text-slate-500">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Asset</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Result</th>
              <th className="px-6 py-3 text-right">Amount</th>
              <th className="px-6 py-3 text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                <td className="px-6 py-4 font-bold text-white">{item.asset}</td>
                <td className="px-6 py-4">
                  {item.action === TradeAction.BUY ? 
                    <span className="flex items-center text-emerald-400 gap-1"><ArrowUpRight className="w-3 h-3" /> BUY</span> : 
                    <span className="flex items-center text-rose-400 gap-1"><ArrowDownRight className="w-3 h-3" /> SELL</span>
                  }
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.result === 'WIN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                    {item.result}
                  </span>
                </td>
                <td className={`px-6 py-4 text-right font-mono font-bold ${item.result === 'WIN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.result === 'WIN' ? '+' : ''}{item.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right font-mono text-white">
                  {item.balanceAfter.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeHistoryTable;