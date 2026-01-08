import React from 'react';
import { LivePrice } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  prices: LivePrice[];
}

const MarketWatch: React.FC<Props> = ({ prices }) => {
  return (
    <div className="flex items-center h-full overflow-hidden relative w-full">
      <div className="flex items-center gap-4 animate-scroll-left whitespace-nowrap">
        {prices.map((item) => (
          <div key={item.symbol} className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-400">{item.symbol}</span>
            <span className={`font-mono font-bold ${item.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {item.price.toFixed(item.symbol.includes('JPY') ? 2 : 4)}
            </span>
          </div>
        ))}
        {/* Duplicate for infinite scroll illusion */}
        {prices.map((item) => (
          <div key={`${item.symbol}-dup`} className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-400">{item.symbol}</span>
            <span className={`font-mono font-bold ${item.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {item.price.toFixed(item.symbol.includes('JPY') ? 2 : 4)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketWatch;