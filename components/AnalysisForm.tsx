import React, { useState } from 'react';
import { AVAILABLE_ASSETS, MarketType, AIModelId, Timeframe } from '../types';
import { Search, Loader2, BrainCircuit, Zap, Clock, Wallet } from 'lucide-react';

interface Props {
  onAnalyze: (asset: string, type: MarketType, modelId: AIModelId, timeframe: Timeframe) => void;
  isLoading: boolean;
  currentCapital: number;
  onUpdateCapital: (newCapital: number) => void;
}

const AnalysisForm: React.FC<Props> = ({ onAnalyze, isLoading, currentCapital, onUpdateCapital }) => {
  const [selectedType, setSelectedType] = useState<MarketType>(MarketType.FOREX);
  const [selectedAsset, setSelectedAsset] = useState<string>(AVAILABLE_ASSETS[MarketType.FOREX][0]);
  const [selectedModel, setSelectedModel] = useState<AIModelId>(AIModelId.PRO);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>(Timeframe.H1);
  const [isEditingCapital, setIsEditingCapital] = useState(false);
  const [tempCapital, setTempCapital] = useState(currentCapital.toString());

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as MarketType;
    setSelectedType(newType);
    setSelectedAsset(AVAILABLE_ASSETS[newType][0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(selectedAsset, selectedType, selectedModel, selectedTimeframe);
  };

  const handleCapitalSubmit = () => {
    const val = parseFloat(tempCapital);
    if (!isNaN(val) && val > 0) {
      onUpdateCapital(val);
      setIsEditingCapital(false);
    }
  };

  return (
    <div className="bg-institutional-card p-6 rounded-lg border border-slate-700 mb-8 shadow-xl">
      
      {/* Capital Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700/50">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Search className="w-5 h-5 text-gold" />
          غرفة التحليل (Salle de Trading)
        </h2>
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-700">
          <Wallet className="w-4 h-4 text-emerald-400" />
          {isEditingCapital ? (
            <div className="flex items-center gap-1">
              <input 
                type="number" 
                value={tempCapital}
                onChange={(e) => setTempCapital(e.target.value)}
                className="w-20 bg-slate-800 text-white text-xs p-1 rounded border border-slate-600 focus:outline-none"
              />
              <button onClick={handleCapitalSubmit} className="text-xs text-emerald-400 font-bold hover:underline">حفظ</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setTempCapital(currentCapital.toString()); setIsEditingCapital(true); }}>
              <span className="text-slate-400 text-xs">رأس المال:</span>
              <span className="text-white font-mono font-bold">{currentCapital.toFixed(2)} DH</span>
            </div>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Row 1: Asset Selection */}
          <div className="space-y-4">
             <div>
                <label className="block text-slate-400 text-xs mb-1.5">نوع السوق (Marché)</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded p-3 focus:outline-none focus:border-indigo-500 transition-colors"
                  value={selectedType}
                  onChange={handleTypeChange}
                  disabled={isLoading}
                >
                  {Object.values(MarketType).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
             </div>
             <div>
                <label className="block text-slate-400 text-xs mb-1.5">الأصل (Actif)</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded p-3 focus:outline-none focus:border-indigo-500 transition-colors"
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  disabled={isLoading}
                >
                  {AVAILABLE_ASSETS[selectedType].map((asset) => (
                    <option key={asset} value={asset}>{asset}</option>
                  ))}
                </select>
             </div>
          </div>

          {/* Row 2: Config */}
          <div className="space-y-4">
             {/* Timeframe Selector */}
             <div>
                <label className="block text-slate-400 text-xs mb-1.5">الإطار الزمني (Timeframe)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTimeframe(Timeframe.M15)}
                    className={`p-3 rounded border flex items-center justify-center gap-2 transition-all ${selectedTimeframe === Timeframe.M15 ? 'bg-indigo-900/40 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                  >
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-bold">15 Min</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTimeframe(Timeframe.H1)}
                    className={`p-3 rounded border flex items-center justify-center gap-2 transition-all ${selectedTimeframe === Timeframe.H1 ? 'bg-indigo-900/40 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                  >
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-bold">1 Hour</span>
                  </button>
                </div>
             </div>

             {/* Model Selector */}
             <div>
                <label className="block text-slate-400 text-xs mb-1.5">المساعد الذكي (AI Model)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedModel(AIModelId.FLASH)}
                    className={`p-2 rounded border flex flex-col items-center justify-center transition-all ${selectedModel === AIModelId.FLASH ? 'bg-indigo-900/40 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                  >
                    <Zap className="w-3 h-3 mb-1" />
                    <span className="text-[10px] font-bold">السريع (Flash)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedModel(AIModelId.PRO)}
                    className={`p-2 rounded border flex flex-col items-center justify-center transition-all ${selectedModel === AIModelId.PRO ? 'bg-gold/20 border-gold text-gold' : 'bg-slate-900 border-slate-700 text-slate-500 hover:bg-slate-800'}`}
                  >
                    <BrainCircuit className="w-3 h-3 mb-1" />
                    <span className="text-[10px] font-bold">الخبير (Pro)</span>
                  </button>
                </div>
             </div>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full font-bold py-4 px-4 rounded-lg transition-all flex justify-center items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2
            ${selectedModel === AIModelId.PRO ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري تحليل السوق وحساب المخاطر...
            </>
          ) : (
            <span className="flex items-center gap-2 text-lg">
              {selectedModel === AIModelId.PRO ? <BrainCircuit className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
              أطلب توصية (Demander Signal)
            </span>
          )}
        </button>
      </form>
    </div>
  );
};

export default AnalysisForm;