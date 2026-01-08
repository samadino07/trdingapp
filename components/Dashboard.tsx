import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, LayoutDashboard, Clock, MapPin, Zap, Menu, LogOut, User as UserIcon, History, Settings, LineChart, PieChart, GraduationCap, BarChart4 } from 'lucide-react';
import SignalCard from './SignalCard';
import AnalysisForm from './AnalysisForm';
import StatsOverview from './StatsOverview';
import TradeHistoryTable from './TradeHistoryTable';
import BacktestPanel from './BacktestPanel';
import PerformanceMonitor from './PerformanceMonitor';
import TradingViewChart from './TradingViewChart';
import MarketWatch from './MarketWatch';
import NewsPanel from './NewsPanel';
import TutorialsPanel from './TutorialsPanel';
import ReportsPanel from './ReportsPanel';
import SettingsPanel from './SettingsPanel';
import { generateMarketAnalysis } from '../services/geminiService';
import { TradeSignal, MarketType, AIModelId, Timeframe, TradeHistoryItem, BacktestResult, LivePrice, AVAILABLE_ASSETS, User } from '../types';

interface Props {
  user: User;
  onLogout: () => void;
}

type ViewMode = 'dashboard' | 'reports' | 'history' | 'backtest' | 'education' | 'settings';

const Dashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- State Management ---
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [capital, setCapital] = useState<number>(1000);
  const [history, setHistory] = useState<TradeHistoryItem[]>([]);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalLoss, setTotalLoss] = useState(0);

  const [livePrices, setLivePrices] = useState<LivePrice[]>([]);
  const [activeAsset, setActiveAsset] = useState<string>('EUR/USD');

  // --- Fetch Data from Supabase ---
  useEffect(() => {
    const fetchData = async () => {
      // 1. Get Capital (Profile)
      const { data: profile } = await supabase
        .from('profiles')
        .select('capital')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setCapital(profile.capital);
      } else {
        // Init profile if not exists
        await supabase.from('profiles').insert([{ id: user.id, capital: 1000 }]);
      }

      // 2. Get Trade History
      const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (trades) setHistory(trades);

      // 3. Get Recent Signals (Optional - e.g. last 24h)
      const { data: savedSignals } = await supabase
        .from('signals')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(10);
        
      if (savedSignals) setSignals(savedSignals);
    };

    fetchData();
  }, [user.id]);

  // --- Market Simulation (No Change) ---
  useEffect(() => {
    const assets = [
        ...AVAILABLE_ASSETS[MarketType.FOREX].slice(0, 3), 
        ...AVAILABLE_ASSETS[MarketType.COMMODITIES].slice(0, 2),
        ...AVAILABLE_ASSETS[MarketType.INDICES].slice(0, 2)
    ];
    
    const initialPrices = assets.map(s => ({
        symbol: s,
        price: s.includes('JPY') ? 145.00 : s.includes('Gold') ? 2300.00 : 1.0800,
        change: 0,
        lastUpdated: Date.now()
    }));
    setLivePrices(initialPrices);

    const interval = setInterval(() => {
        setLivePrices(prevPrices => prevPrices.map(p => {
            const move = (Math.random() - 0.5) * (p.symbol.includes('JPY') || p.symbol.includes('Gold') ? 0.5 : 0.0005);
            return {
                ...p,
                price: p.price + move,
                change: move,
                lastUpdated: Date.now()
            };
        }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // --- Stats Calculation ---
  useEffect(() => {
    let p = 0;
    let l = 0;
    history.forEach(item => {
      if (item.result === 'WIN') p += item.amount;
      else l += Math.abs(item.amount);
    });
    setTotalProfit(p);
    setTotalLoss(l * -1); 
  }, [history]);

  // --- Handlers with Supabase ---

  const handleUpdateCapital = async (newCap: number) => {
    setCapital(newCap);
    await supabase
      .from('profiles')
      .update({ capital: newCap })
      .eq('id', user.id);
  };

  const handleAnalyze = useCallback(async (asset: string, type: MarketType, modelId: AIModelId, timeframe: Timeframe) => {
    setLoading(true);
    setError(null);
    setActiveAsset(asset);
    
    try {
      const newSignal = await generateMarketAnalysis(asset, type, modelId, timeframe, capital);
      
      // Save Signal to DB
      const signalToSave = { ...newSignal, user_id: user.id };
      await supabase.from('signals').insert([signalToSave]);

      setSignals(prev => [newSignal, ...prev]);
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, [capital, user.id]);

  const handleSimulateResult = async (amount: number, isWin: boolean) => {
    const currentSignal = signals[0]; 
    const newBalance = capital + amount;
    
    // 1. Update Capital State
    setCapital(newBalance);

    // 2. Create History Item
    const newItem: TradeHistoryItem = {
      id: crypto.randomUUID(),
      user_id: user.id,
      date: new Date().toISOString(),
      asset: currentSignal?.asset || 'Unknown',
      action: currentSignal?.action,
      result: isWin ? 'WIN' : 'LOSS',
      amount: amount,
      balanceAfter: newBalance
    };

    setHistory(prev => [newItem, ...prev]);

    // 3. Persist to Supabase
    await supabase.from('profiles').update({ capital: newBalance }).eq('id', user.id);
    await supabase.from('trades').insert([newItem]);
  };

  const getSession = () => {
    const hour = new Date().getUTCHours();
    if (hour >= 8 && hour < 16) return { name: 'London', color: 'text-indigo-400' };
    if (hour >= 13 && hour < 21) return { name: 'New York', color: 'text-emerald-400' };
    if (hour >= 0 && hour < 8) return { name: 'Asian', color: 'text-orange-400' };
    return { name: 'Closed', color: 'text-slate-500' };
  };
  const session = getSession();

  const SidebarItem = ({ id, icon: Icon, label }: { id: ViewMode, icon: any, label: string }) => (
    <button 
      onClick={() => { setCurrentView(id); setMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 ${
        currentView === id 
        ? 'bg-indigo-600/10 text-indigo-400 border-r-2 border-indigo-500 font-bold' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 font-medium'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-institutional-bg text-slate-200 overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 right-0 z-50 w-64 bg-slate-900 border-l border-slate-700 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
        md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 shrink-0">
           <div className="bg-gradient-to-tr from-indigo-600 to-blue-500 p-1.5 rounded-lg shadow-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
           <h1 className="text-lg font-extrabold text-white tracking-wide">
             AL-MOHALIL <span className="text-indigo-500">PRO</span>
           </h1>
        </div>

        {/* User Card */}
        <div className="p-4 shrink-0">
           <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 border border-slate-600">
                 <UserIcon className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                 <div className="text-sm font-bold text-white truncate">{user.email?.split('@')[0]}</div>
                 <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    متصل (Online)
                 </div>
              </div>
           </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar">
           <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">الرئيسية</div>
           <SidebarItem id="dashboard" icon={LayoutDashboard} label="لوحة التداول" />
           <SidebarItem id="reports" icon={BarChart4} label="التقارير والإحصائيات" />
           
           <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">الأدوات</div>
           <SidebarItem id="history" icon={History} label="سجل الصفقات" />
           <SidebarItem id="backtest" icon={PieChart} label="مختبر الاستراتيجيات" />
           
           <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">التعليم</div>
           <SidebarItem id="education" icon={GraduationCap} label="أكاديمية المحلل" />
           <SidebarItem id="settings" icon={Settings} label="الإعدادات" />
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 shrink-0 space-y-3">
           <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 text-rose-400 hover:bg-rose-500/10 p-2.5 rounded-lg transition-colors text-sm font-bold border border-transparent hover:border-rose-500/20"
           >
             <LogOut className="w-4 h-4" /> تسجيل الخروج
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-16 bg-institutional-card/80 backdrop-blur border-b border-slate-700/50 flex items-center justify-between px-4 sticky top-0 z-30 shrink-0">
           <div className="flex items-center gap-3 md:hidden">
              <button onClick={() => setMobileMenuOpen(true)} className="text-slate-300 hover:text-white p-1">
                 <Menu className="w-6 h-6" />
              </button>
              <span className="font-bold text-white text-sm">Al-Mohalil Pro</span>
           </div>

           {/* Market Ticker */}
           <div className="flex-1 hidden md:block overflow-hidden mx-4">
              <MarketWatch prices={livePrices} />
           </div>

           {/* Session & Time */}
           <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end mr-4">
                 <div className="text-[10px] text-slate-400">Market Session</div>
                 <div className={`text-xs font-bold flex items-center gap-1 ${session.color}`}>
                    <MapPin className="w-3 h-3" /> {session.name}
                 </div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm">
                 <Clock className="w-4 h-4 text-slate-400" />
                 <span className="text-xs font-mono font-bold text-white">
                    {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </span>
              </div>
           </div>
        </header>

        {/* Scrollable Main View */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <div className="max-w-screen-2xl mx-auto space-y-6">
            
            {/* View: DASHBOARD */}
            {currentView === 'dashboard' && (
              <>
                 {/* Top Stats */}
                 <StatsOverview 
                    capital={capital} 
                    totalProfit={totalProfit} 
                    totalLoss={totalLoss} 
                    tradeCount={history.length} 
                    onUpdateCapital={handleUpdateCapital}
                 />

                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Analysis Column (Left) */}
                    <div className="lg:col-span-8 space-y-6">
                       {/* Chart Area */}
                       <div className="space-y-2">
                          <div className="flex items-center justify-between px-1">
                             <h2 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                <LineChart className="w-4 h-4" /> الرسم البياني (Live Chart)
                             </h2>
                             <span className="text-[10px] text-emerald-400 animate-pulse">● Live Data</span>
                          </div>
                          <TradingViewChart symbol={activeAsset} />
                       </div>
                       
                       {/* Action Area */}
                       <div className="bg-slate-900/50 rounded-xl p-1 border border-slate-800">
                          <AnalysisForm 
                             onAnalyze={handleAnalyze} 
                             isLoading={loading} 
                             currentCapital={capital} 
                             onUpdateCapital={handleUpdateCapital}
                          />
                       </div>
                    </div>

                    {/* Side Feed Column (Right) */}
                    <div className="lg:col-span-4 space-y-6 flex flex-col">
                       {/* Active Signals */}
                       <div className="space-y-2">
                          <div className="flex items-center justify-between px-1">
                             <h2 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-gold" /> الإشارات الحية
                             </h2>
                          </div>
                          
                          {error && (
                            <div className="bg-rose-900/20 border border-rose-500/50 text-rose-300 p-3 rounded-lg text-xs">
                               {error}
                            </div>
                          )}

                          {signals.length === 0 && !loading ? (
                             <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                                <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                <p className="text-xs text-slate-500">لا توجد توصيات نشطة حالياً</p>
                             </div>
                          ) : (
                             <div className="space-y-4">
                                {signals.map((signal) => (
                                   <SignalCard 
                                      key={signal.id} 
                                      signal={signal} 
                                      onSimulateResult={handleSimulateResult}
                                   />
                                ))}
                             </div>
                          )}
                       </div>

                       {/* News & AI Widget */}
                       <div className="grid grid-cols-1 gap-4 flex-1">
                          <NewsPanel />
                          <PerformanceMonitor backtestResult={backtestResult} history={history} />
                       </div>
                    </div>
                 </div>
              </>
            )}

            {/* View: REPORTS */}
            {currentView === 'reports' && (
               <div className="animate-in fade-in slide-in-from-bottom-4">
                  <ReportsPanel history={history} />
               </div>
            )}

            {/* View: HISTORY */}
            {currentView === 'history' && (
               <div className="animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                     <History className="w-6 h-6 text-slate-400" /> سجل العمليات الكامل
                  </h2>
                  <TradeHistoryTable history={history} />
               </div>
            )}

            {/* View: BACKTEST */}
            {currentView === 'backtest' && (
               <div className="animate-in fade-in slide-in-from-bottom-4">
                  <BacktestPanel currentCapital={capital} onRunComplete={setBacktestResult} />
               </div>
            )}

            {/* View: EDUCATION */}
            {currentView === 'education' && (
               <div className="animate-in fade-in slide-in-from-bottom-4">
                  <TutorialsPanel />
               </div>
            )}

             {/* View: SETTINGS */}
             {currentView === 'settings' && (
               <div className="animate-in fade-in slide-in-from-bottom-4">
                  <SettingsPanel />
               </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;