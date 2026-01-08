import React, { useState, useEffect } from 'react';
import { NewsItem, NewsAnalysis } from '../types';
import { Newspaper, Flame, BrainCircuit, X, TrendingUp, TrendingDown, ArrowRight, Loader2, Wifi } from 'lucide-react';
import { analyzeNewsImpact, fetchLatestNews } from '../services/geminiService';

const NewsPanel: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<NewsAnalysis | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const initNews = async () => {
      setLoadingNews(true);
      try {
        // 1. Fetch News
        const news = await fetchLatestNews();
        setNewsItems(news);

        // 2. Auto Trigger Analysis if news exists
        if (news.length > 0) {
          setAnalyzing(true);
          const result = await analyzeNewsImpact(news);
          setAnalysis(result);
          setAnalyzing(false);
        }
      } catch (error) {
        console.error("Failed to initialize news:", error);
      } finally {
        setLoadingNews(false);
        setAnalyzing(false);
      }
    };

    initNews();
  }, []);

  return (
    <>
    <div className="bg-institutional-card rounded-xl border border-slate-700 shadow-lg overflow-hidden h-full flex flex-col relative">
      <div className="bg-slate-800/50 p-4 border-b border-slate-700/50 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">الأجندة الاقتصادية (Live)</h3>
         </div>
         <div className="flex items-center gap-2">
            {loadingNews && <Loader2 className="w-3 h-3 text-slate-500 animate-spin" />}
            <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded flex items-center gap-1">
               <Wifi className={`w-3 h-3 ${loadingNews ? 'text-slate-500' : 'text-emerald-500'}`} /> 
               Today
            </span>
         </div>
      </div>
      
      <div className="divide-y divide-slate-800/50 overflow-y-auto flex-1 custom-scrollbar relative min-h-[150px]">
        {loadingNews ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs">Jary tahmil al-akhbar...</span>
           </div>
        ) : newsItems.length === 0 ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
              <p className="text-xs">No significant news found for today.</p>
           </div>
        ) : (
           newsItems.map(news => (
             <div key={news.id} className="p-3 hover:bg-slate-800/30 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="text-xs font-mono text-slate-400 bg-slate-900 px-1.5 py-1 rounded border border-slate-700 w-12 text-center">
                      {news.time}
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-0.5">
                         <span className="font-bold text-white text-xs">{news.currency}</span>
                         {news.impact === 'High' && <Flame className="w-3 h-3 text-rose-500" fill="currentColor" />}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[120px] md:max-w-[150px]" title={news.event}>{news.event}</div>
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
           ))
        )}
      </div>
      
      <div className="p-3 bg-slate-800/30 text-center shrink-0 border-t border-slate-700/50">
         {analysis ? (
             <button 
             onClick={() => setShowModal(true)}
             className="w-full flex items-center justify-between px-4 py-2 bg-indigo-900/20 hover:bg-indigo-900/30 border border-indigo-500/30 rounded-lg transition-all group"
           >
              <div className="flex items-center gap-2">
                 <BrainCircuit className="w-4 h-4 text-indigo-400" />
                 <span className="text-xs font-bold text-indigo-300">Analysis Ready</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 group-hover:text-white transition-colors">
                 <span>View Insight</span>
                 <ArrowRight className="w-3 h-3" />
              </div>
           </button>
         ) : (
            <button 
               disabled={analyzing || loadingNews}
               className="w-full flex items-center justify-center gap-2 text-xs font-bold bg-slate-700 text-slate-400 py-2.5 rounded-lg cursor-not-allowed opacity-70"
            >
               {analyzing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> Analyzing Impact...
                  </>
               ) : (
                  <>
                    <BrainCircuit className="w-4 h-4" /> Waiting for data...
                  </>
               )}
            </button>
         )}
      </div>
    </div>

    {/* Analysis Modal */}
    {showModal && analysis && (
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
             </div>
          </div>
       </div>
    )}
    </>
  );
};

export default NewsPanel;