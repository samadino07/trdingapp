export enum MarketType {
  FOREX = 'Forex',
  INDICES = 'Indices',
  COMMODITIES = 'Commodities',
  STOCKS = 'Stocks'
}

export enum TradeAction {
  BUY = 'ACHAT',
  SELL = 'VENTE',
  NEUTRAL = 'NEUTRE' // Wait
}

export enum AIModelId {
  FLASH = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview'
}

export enum Timeframe {
  M15 = '15M',
  H1 = '1H'
}

export enum BacktestDuration {
  WEEK_1 = '7 Jours',
  MONTH_1 = '30 Jours',
  MONTH_3 = '3 Mois'
}

export enum MarketCondition {
  STABLE = 'Stable',
  VOLATILE = 'Volatile',
  HIGH_RISK = 'High Risk'
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at?: string;
}

export interface UserProfile {
  id: string; // matches auth.users id
  capital: number;
  risk_per_trade: number;
}

export interface UserSettings {
  riskPerTrade: number; // Percentage 1-5%
  theme: 'dark' | 'light';
  notifications: boolean;
  language: 'ar' | 'fr';
}

export interface LivePrice {
  symbol: string;
  price: number;
  change: number;
  lastUpdated: number;
}

export interface TechnicalIndicator {
  name: string;
  value: string | number;
  signal: 'Positive' | 'Negative' | 'Neutre';
}

export interface TradeHistoryItem {
  id: string;
  user_id?: string;
  date: string;
  asset: string;
  action: TradeAction;
  result: 'WIN' | 'LOSS';
  amount: number;
  balanceAfter: number;
}

export interface BacktestResult {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  finalCapital: number;
  maxDrawdown: number;
  strategyQuality: 'Good' | 'Average' | 'Weak';
  explanation: string;
  equityCurve: { day: string; balance: number }[];
}

export interface PerformanceReview {
  status: 'Safe' | 'Caution' | 'Stop';
  liveWinRate: number;
  backtestWinRate: number;
  riskAdjustment: string; // e.g., "Reduce to 1%", "Keep 2%"
  advice: string; // Arabic explanation
  reason: string; // Short reason
}

export interface TradeSignal {
  id: string;
  user_id?: string;
  asset: string;
  marketType: MarketType;
  modelUsed: string; 
  timeframe: string;
  timestamp: string;
  action: TradeAction;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  probability: number; // 0-100
  riskRewardRatio: string; 
  marketCondition: MarketCondition;
  
  // Financial Projections
  expectedProfitAmount: number; // In account currency (e.g., MAD)
  expectedLossAmount: number;   // In account currency
  riskAmount: number;           // Amount risked
  status?: 'PENDING' | 'ACTIVE' | 'CLOSED'; // For live tracking
  
  technicalAnalysis: {
    summary: string;
    indicators: TechnicalIndicator[]; 
    trend: 'Haussier' | 'Baissier' | 'Latéral';
  };
  
  fundamentalAnalysis: {
    summary: string; // "Friend" explanation
    keyEvents: string[];
    sentiment: 'Risk-On' | 'Risk-Off' | 'Neutre';
  };
}

export interface NewsItem {
  id: string;
  time: string;
  currency: string;
  event: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface NewsAnalysis {
  summary: string; // Arabic summary
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  focusAsset: string; // e.g., "USD" or "Gold"
  tradingHint: string; // "Search for Buy signals on USD pairs"
}

export interface TutorialItem {
  id: string;
  title: string;
  category: 'Basics' | 'Strategy' | 'Psychology';
  duration: string;
  content: string;
}

// Predefined assets
export const AVAILABLE_ASSETS: Record<MarketType, string[]> = {
  [MarketType.FOREX]: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD'],
  [MarketType.INDICES]: ['US30 (Dow)', 'NAS100 (Nasdaq)', 'SPX500', 'GER40 (DAX)', 'UK100'],
  [MarketType.COMMODITIES]: ['XAU/USD (Gold)', 'XAG/USD (Silver)', 'WTI Oil', 'Brent Oil', 'Natural Gas'],
  [MarketType.STOCKS]: ['AAPL', 'TSLA', 'NVDA', 'AMZN', 'MSFT', 'GOOGL']
};