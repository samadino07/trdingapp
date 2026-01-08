import React, { useRef } from 'react';
import { Download, Upload, Smartphone } from 'lucide-react';
import { TradeHistoryItem, TradeSignal, BacktestResult } from '../types';

interface Props {
  capital: number;
  history: TradeHistoryItem[];
  signals: TradeSignal[];
  backtestResult: BacktestResult | null;
  onImportData: (data: any) => void;
}

const DataPersistence: React.FC<Props> = ({ capital, history, signals, backtestResult, onImportData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = {
      capital,
      history,
      signals,
      backtestResult,
      exportDate: new Date().toISOString()
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `al-mohalil-backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          onImportData(json);
          alert("تم استرجاع البيانات بنجاح!");
        } catch (error) {
          alert("حدث خطأ في قراءة الملف.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 mb-2">
      <div className="flex items-center gap-2 mb-3">
        <Smartphone className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-400">حفظ البيانات (Sync)</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={handleExport}
          className="flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold py-2 rounded transition-colors"
        >
          <Download className="w-3 h-3" /> Backup
        </button>
        
        <button 
          onClick={handleImportClick}
          className="flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold py-2 rounded transition-colors"
        >
          <Upload className="w-3 h-3" /> Restore
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
      </div>
    </div>
  );
};

export default DataPersistence;