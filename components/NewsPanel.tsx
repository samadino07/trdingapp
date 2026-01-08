import React, { useState, useEffect, useRef } from 'react';
import { NewsItem, NewsAnalysis } from '../types';
import { Newspaper, Flame, BrainCircuit, X, TrendingUp, TrendingDown, RefreshCw, Loader2, Wifi, Clock, Megaphone } from 'lucide-react';
import { analyzeNewsImpact, fetchLatestNews } from '../services/geminiService';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 Minutes

const NewsPanel: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<NewsAnalysis | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [nextUpdateIn, setNextUpdateIn] = useState<number>(300); // seconds

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = async () => {
    setLoadingNews(true);
    try {
      // 1. Fetch News
      const news = await fetchLatestNews();
      setNewsItems(news);
      setLastUpdated(new Date());
      setNextUpdateIn(300); // Reset countdown

      // 2. Auto Trigger Analysis
      if (news.length > 0) {
        setAnalyzing(true);
        const result = await analyzeNewsImpact(news);
        setAnalysis(result);
      }
    } catch (error) {
      console.error("Failed to update news:", error);
    } finally {
      setLoadingNews(false);
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set interval for 5 minutes
    timerRef.current = setInterval(fetchData, REFRESH_INTERVAL);

    // Countdown timer for UI
    countdownRef.current = setInterval(() => {
      setNextUpdateIn((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-institutional-card rounded-xl border border-slate-700 shadow-lg overflow-hidden h-full flex flex-col relative">
      
      {/* Header */}
      <div className="bg-slate-800/50 p-4 border-b border-slate-700/50 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-indigo-400" />
            <div>
               <h3 className="font-bold text-white text-sm">الأجندة الحية (Live News)</h3>
               <div className="flex items-center gap-1 text-[9px] text-slate-400">
                  <Clock className="w-3 h-3" /> تحديث: {formatTime(nextUpdateIn)}
               </div>
            </div>
         </div>
         <button 
            onClick={() => { if (!loadingNews) fetchData(); }}
            className="p-2 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700 group"
            title="تحديث الآن"
         >
            <RefreshCw className={`w-4 h-4 text-emerald-500 ${loadingNews ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
         </button>
      </div>
      
      {/* News List */}
      <div className="divide-y divide-slate-800/50 overflow-y-auto flex-1 custom-scrollbar relative min-h-[150px]">
        {loadingNews && newsItems.length === 0 ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs">جاري جلب الأخبار العاجلة...</span>
           </div>
        ) : newsItems.length === 0 ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
              <p className="text-xs">لا توجد أخبار مؤثرة حالياً.</p>
           </div>
        ) : (
           newsItems.map(news => (
             <div key={news.id} className="p-3 hover:bg-slate-800/30 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-1 rounded border border-slate-700 w-12 text-center">
                      {news.time}
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-0.5">
                         <span className="font-bold text-white text-xs">{news.currency}</span>
                         {news.impact === 'High' && <Flame className="w-3 h-3 text-rose-500 animate-pulse" fill="currentColor" />}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[120px] md:max-w-[150px]" title={news.event}>{news.event}</div>
                   </div>
                </div>
                
                <div className={`text-[9px] font-bold px-2 py-0.5 rounded ${
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
      
      {/* AI Recommendation Section (Visible Inline) */}
      <div className="shrink-0 border-t border-slate-700/50 bg-slate-900/50 p-3">
         {analyzing ? (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-indigo-400">
               <Loader2 className="w-4 h-4 animate-spin" />
               جاري تحليل تأثير الأخبار...
            </div>
         ) : analysis ? (
            <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-lg p-3 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-1 opacity-20">
                  <Megaphone className="w-12 h-12 text-indigo-500 -rotate-12" />
               </div>
               
               <div className="flex items-center justify-between mb-2 relative z-10">
                  <div className="flex items-center gap-2">
                     <BrainCircuit className="w-4 h-4 text-indigo-400" />
                     <span className="text-xs font-bold text-indigo-300">توصية المحلل الأساسي</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                     analysis.sentiment === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                     analysis.sentiment === 'Bearish' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                     'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                     {analysis.sentiment}
                  </span>
               </div>
               
               <p className="text-xs text-white font-bold leading-relaxed relative z-10" dir="rtl">
                  {analysis.tradingHint}
               </p>
               
               <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500 border-t border-indigo-500/10 pt-1 relative z-10">
                  <span>التركيز على:</span>
                  <span className="text-indigo-300 font-mono font-bold">{analysis.focusAsset}</span>
               </div>
            </div>
         ) : (
            <div className="text-center py-2 text-xs text-slate-500">
               بانتظار البيانات للتحليل...
            </div>
         )}
      </div>
    </div>
  );
};

export default NewsPanel;