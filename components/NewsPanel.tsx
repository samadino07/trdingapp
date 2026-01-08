import React, { useState } from 'react';
import { NewsItem, NewsAnalysis } from '../types';
import { Newspaper, Flame, Clock, BrainCircuit, X, TrendingUp, TrendingDown, ArrowRight, Loader2 } from 'lucide-react';
import { analyzeNewsImpact } from '../services/geminiService';

const MOCK_NEWS: NewsItem[] = [
  { id: '1', time: '14:30', currency: 'USD', event: 'CPI Inflation Data', impact: 'High' },
  { id: '2', time: '15:00', currency: 'EUR', event: 'Lagarde Speech', impact: 'High' },
  { id: '3', time: '16:00', currency: 'USD', event: 'Consumer Confidence', impact: 'Medium' },
  { id: '4', time: '09:00', currency: 'GBP', event: 'GDP Growth Rate', impact: 'High' },
];

const NewsPanel: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<NewsAnalysis | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setShowModal(true); // Show modal immediately with loading state
    try {
      const result = await analyzeNewsImpact(MOCK_NEWS);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <>
    <div className="bg-institutional-card rounded-xl border border-slate-700 shadow-lg overflow-hidden h-full flex flex-col">
      <div className="bg-slate-800/50 p-4 border-b border-slate-700/50 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">الأجندة الاقتصادية</h3>
         </div>
         <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded">Today</span>
      </div>
      
      <div className="divide-y divide-slate-800/50 overflow-y-auto flex-1 custom-scrollbar">
        {MOCK_NEWS.map(news => (
          <div key={news.id} className="p-3 hover:bg-slate-800/30 transition-colors flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="text-xs font-mono text-slate-400 bg-slate-900 px-1.5 py-1 rounded border border-slate-700">
                   {news.time}
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-white text-xs">{news.currency}</span>
                      {news.impact === 'High' && <Flame className="w-3 h-3 text-rose-500" fill="currentColor" />}
                   </div>
                   <div className="text-xs text-slate-400">{news.event}</div>
                </div>
             </div>
             
             <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                news.impact === 'High' ? 'bg-rose-900/20 text-rose-400 border border-rose-500/20' : 
                news.impact === 'Medium' ? 'bg-orange-900/20 text-orange-400 border border-orange-500/20' : 
                'bg-emerald-900/20 text-emerald-400 border border-emerald-500/20'
             }`}>
                {news.impact}
             </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 bg-slate-800/30 text-center shrink-0 border-t border-slate-700/50">
         <button 
           onClick={handleAnalyze}
           className="w-full flex items-center justify-center gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg transition-colors shadow-lg"
         >
            <BrainCircuit className="w-4 h-4" />
            تحليل تأثير الأخبار (AI Insight)
         </button>
      </div>
    </div>

    {/* Analysis Modal */}
    {showModal && (
       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-institutional-card w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden relative">
             <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 bg-slate-800/50 rounded-full"
             >
                <X className="w-4 h-4" />
             </button>

             <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                   <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-3 rounded-xl shadow-lg">
                      <BrainCircuit className="w-6 h-6 text-white" />
                   </div>
                   <div>
                      <h2 className="text-lg font-bold text-white">التحليل الأساسي الذكي</h2>
                      <p className="text-xs text-slate-400">Fundamental AI Outlook</p>
                   </div>
                </div>

                {analyzing ? (
                   <div className="py-12 text-center">
                      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
                      <p className="text-sm text-slate-300">جاري قراءة الأخبار وربط الأحداث...</p>
                      <p className="text-xs text-slate-500 mt-2">Connecting to Economic Calendar...</p>
                   </div>
                ) : analysis ? (
                   <div className="space-y-4 animate-in slide-in-from-bottom-4">
                      {/* Sentiment Badge */}
                      <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                         <span className="text-xs text-slate-400">الاتجاه العام (Sentiment)</span>
                         <span className={`px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2 ${
                            analysis.sentiment === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            analysis.sentiment === 'Bearish' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                         }`}>
                            {analysis.sentiment === 'Bullish' && <TrendingUp className="w-4 h-4" />}
                            {analysis.sentiment === 'Bearish' && <TrendingDown className="w-4 h-4" />}
                            {analysis.sentiment}
                         </span>
                      </div>

                      {/* Focus Asset */}
                      <div className="flex items-center gap-2">
                         <span className="text-xs text-slate-500">العملة تحت المجهر:</span>
                         <span className="text-sm font-bold text-white">{analysis.focusAsset}</span>
                      </div>

                      {/* Summary */}
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-sm text-slate-300 leading-relaxed" dir="rtl">
                         {analysis.summary}
                      </div>

                      {/* Recommendation */}
                      <div className="bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/30 mt-2">
                         <div className="flex items-center gap-2 mb-2">
                            <ArrowRight className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold text-indigo-300 uppercase">توصية المحلل</span>
                         </div>
                         <p className="text-sm font-bold text-white" dir="rtl">
                            {analysis.tradingHint}
                         </p>
                      </div>
                   </div>
                ) : null}
             </div>
          </div>
       </div>
    )}
    </>
  );
};

export default NewsPanel;