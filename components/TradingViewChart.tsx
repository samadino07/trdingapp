import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface Props {
  symbol: string;
}

const TradingViewChart: React.FC<Props> = ({ symbol }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Re-render chart when expansion state changes or symbol changes
    if (containerRef.current && window.TradingView) {
      containerRef.current.innerHTML = ""; // Clear previous chart
      let tvSymbol = symbol.replace('/', ''); 
      if (symbol.includes('Gold')) tvSymbol = 'XAUUSD';
      if (symbol.includes('Silver')) tvSymbol = 'XAGUSD';
      if (symbol.includes('Dow')) tvSymbol = 'US30';
      if (symbol.includes('Nasdaq')) tvSymbol = 'NAS100';
      
      new window.TradingView.widget({
        container_id: containerRef.current.id,
        symbol: tvSymbol,
        interval: "60",
        timezone: "Africa/Casablanca",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#1e293b",
        enable_publishing: false,
        hide_side_toolbar: true,
        allow_symbol_change: false,
        save_image: false,
        details: false,
        calendar: false,
        // Make chart transparent to blend with app design
        container_bg: "#1e293b", 
        width: "100%",
        height: "100%",
        overrides: {
           "paneProperties.background": "#1e293b",
           "paneProperties.vertGridProperties.color": "#334155",
           "paneProperties.horzGridProperties.color": "#334155",
           "scalesProperties.textColor": "#94a3b8",
        }
      });
    }
  }, [symbol, isExpanded]);

  return (
    <div className={`
      relative transition-all duration-300 ease-in-out bg-institutional-card border border-slate-700 shadow-xl overflow-hidden
      ${isExpanded ? 'fixed inset-0 z-50 m-0 rounded-none h-screen w-screen' : 'rounded-xl h-[280px] md:h-[400px] w-full'}
    `}>
       {/* Header Overlay */}
       <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 py-2 bg-slate-900/80 backdrop-blur z-10 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-xs font-bold text-white">{symbol}</span>
             <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">1H</span>
          </div>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title={isExpanded ? "تصغير" : "تكبير"}
          >
             {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
       </div>

      <div id={`tradingview_widget_${isExpanded ? 'expanded' : 'normal'}`} ref={containerRef} className="w-full h-full pt-8" />
    </div>
  );
};

export default TradingViewChart;