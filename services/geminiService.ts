import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TradeSignal, MarketType, TradeAction, AIModelId, Timeframe, MarketCondition, BacktestResult, BacktestDuration, PerformanceReview, NewsItem, NewsAnalysis } from "../types";

// Initialize Gemini Client
const FALLBACK_API_KEY = 'AIzaSyBqUiOA5ZTY7PQORgQ22Vt3TPUPAfaXrDU';
let apiKey = FALLBACK_API_KEY;

try {
  // Safely attempt to access Vite environment variables
  // @ts-ignore
  if (import.meta && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    apiKey = import.meta.env.VITE_API_KEY;
  }
} catch (error) {
  console.warn('Using fallback API key');
}

const ai = new GoogleGenAI({ apiKey: apiKey });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    action: { type: Type.STRING, enum: ['ACHAT', 'VENTE', 'NEUTRE'] },
    entryPrice: { type: Type.NUMBER },
    stopLoss: { type: Type.NUMBER },
    takeProfit: { type: Type.NUMBER },
    probability: { type: Type.NUMBER, description: "Percentage between 0 and 100" },
    riskRewardRatio: { type: Type.STRING, description: "Format like '1:2.5'" },
    marketCondition: { type: Type.STRING, enum: ['Stable', 'Volatile', 'High Risk'] },

    // Financials
    expectedProfitAmount: { type: Type.NUMBER, description: "Profit in account currency based on capital" },
    expectedLossAmount: { type: Type.NUMBER, description: "Loss in account currency based on capital" },
    riskAmount: { type: Type.NUMBER, description: "The specific amount risked" },

    technicalSummary: { type: Type.STRING, description: "Detailed technical breakdown in Arabic. Explain Market Structure, Support/Resistance levels, and exact Candle pattern reason." },
    trend: { type: Type.STRING, enum: ['Haussier', 'Baissier', 'Latéral'] },
    rsiValue: { type: Type.NUMBER },
    rsiSignal: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutre'] },
    macdSignal: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutre'] },
    emaSignal: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutre'] },
    
    fundamentalSummary: { type: Type.STRING, description: "Combined Deep Analysis in Arabic. Merge technical and fundamental reasons. Explain WHY to enter, WHY this Stop Loss specifically. Be professional and persuasive." },
    sentiment: { type: Type.STRING, enum: ['Risk-On', 'Risk-Off', 'Neutre'] },
    keyEvents: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of key economic events upcoming"
    }
  },
  required: [
    'action', 'entryPrice', 'stopLoss', 'takeProfit', 'probability', 
    'riskRewardRatio', 'expectedProfitAmount', 'expectedLossAmount', 'riskAmount',
    'marketCondition', 'technicalSummary', 'trend', 'rsiValue', 
    'rsiSignal', 'macdSignal', 'emaSignal', 'fundamentalSummary', 
    'sentiment', 'keyEvents'
  ]
};

const backtestSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    totalTrades: { type: Type.NUMBER },
    winningTrades: { type: Type.NUMBER },
    losingTrades: { type: Type.NUMBER },
    winRate: { type: Type.NUMBER },
    totalProfit: { type: Type.NUMBER },
    totalLoss: { type: Type.NUMBER },
    finalCapital: { type: Type.NUMBER },
    maxDrawdown: { type: Type.NUMBER },
    strategyQuality: { type: Type.STRING, enum: ['Good', 'Average', 'Weak'] },
    explanation: { type: Type.STRING },
    equityCurve: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING },
          balance: { type: Type.NUMBER }
        }
      }
    }
  },
  required: ['totalTrades', 'winningTrades', 'losingTrades', 'winRate', 'totalProfit', 'totalLoss', 'finalCapital', 'maxDrawdown', 'strategyQuality', 'explanation', 'equityCurve']
};

const reviewSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    status: { type: Type.STRING, enum: ['Safe', 'Caution', 'Stop'] },
    liveWinRate: { type: Type.NUMBER },
    backtestWinRate: { type: Type.NUMBER },
    riskAdjustment: { type: Type.STRING },
    advice: { type: Type.STRING },
    reason: { type: Type.STRING },
  },
  required: ['status', 'liveWinRate', 'backtestWinRate', 'riskAdjustment', 'advice', 'reason']
};

const newsAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "Short summary of market impact in Arabic" },
    sentiment: { type: Type.STRING, enum: ['Bullish', 'Bearish', 'Neutral'] },
    focusAsset: { type: Type.STRING, description: "The currency or asset most affected (e.g. USD, Gold)" },
    tradingHint: { type: Type.STRING, description: "Clear recommendation in Arabic (e.g. Look for Buys on USD)" },
  },
  required: ['summary', 'sentiment', 'focusAsset', 'tradingHint']
}

export const generateMarketAnalysis = async (
  asset: string, 
  marketType: MarketType, 
  modelId: AIModelId, 
  timeframe: Timeframe,
  currentCapital: number
): Promise<TradeSignal> => {
  
  if (!apiKey) {
    throw new Error("API Key غير موجود. تأكد من إعداد VITE_API_KEY في Vercel.");
  }

  const prompt = `
    Role: You are "Al-Mohalil Pro", a Senior Institutional Technical Analyst.
    User Context: Capital: ${currentCapital}, Asset: ${asset}, Timeframe: ${timeframe}.

    YOUR MISSION:
    Provide a HIGH-PRECISION Trading Signal. The user wants a DEEP explanation, not just a summary.

    1. **Detailed Technical Analysis**:
       - Identify Key Liquidity Zones (Order Blocks).
       - Analyze Market Structure (HH, HL, Break of Structure).
       - Confirm with Indicators (RSI Divergence, EMA Crossover).
    
    2. **Trade Setup**:
       - Entry: Precise level based on retest or breakout.
       - Stop Loss: Place it logically below/above invalidation structure. **Explain WHY this SL level was chosen.**
       - Take Profit: Target next liquidity pool.
    
    3. **Risk Calculation**:
       - Calculate exact Risk Amount (1.5% of ${currentCapital}).
       - Ensure Risk:Reward is at least 1:2.

    4. **The "Why" (FundamentalSummary)**:
       - Write a detailed paragraph in Arabic.
       - Start by explaining the general trend.
       - Then explain the trigger (e.g., "Price rejected 1.0850 support with a Pinbar").
       - Explicitly state: "Entering here is safe because..."
       - Explicitly state: "If price breaks [SL Level], the setup is invalid."

    OUTPUT REQUIREMENTS:
    - Strictly JSON matching the schema.
    - NO Crypto.
    - Language: Professional Arabic (Trading Terminology in English/French allowed).
    - If Probability < 60%, force action: "NEUTRE" and explain why we are waiting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.1, 
      }
    });

    const data = JSON.parse(response.text || "{}");

    // Map the raw JSON to our App's TradeSignal interface
    const signal: TradeSignal = {
      id: crypto.randomUUID(),
      asset: asset,
      marketType: marketType,
      modelUsed: modelId === AIModelId.PRO ? 'Gemini 3 Pro' : 'Gemini 3 Flash',
      timeframe: timeframe,
      timestamp: new Date().toISOString(),
      action: data.action as TradeAction,
      entryPrice: data.entryPrice,
      stopLoss: data.stopLoss,
      takeProfit: data.takeProfit,
      probability: data.probability,
      riskRewardRatio: data.riskRewardRatio,
      marketCondition: data.marketCondition as MarketCondition,
      
      expectedProfitAmount: data.expectedProfitAmount,
      expectedLossAmount: data.expectedLossAmount,
      riskAmount: data.riskAmount,

      technicalAnalysis: {
        summary: data.technicalSummary,
        trend: data.trend,
        indicators: [
          { name: 'RSI', value: data.rsiValue, signal: data.rsiSignal },
          { name: 'MACD', value: 'Conv.', signal: data.macdSignal },
          { name: 'EMA', value: 'Trend', signal: data.emaSignal }
        ]
      },
      fundamentalAnalysis: {
        summary: data.fundamentalSummary, // This now contains the deep analysis
        sentiment: data.sentiment,
        keyEvents: data.keyEvents
      }
    };

    return signal;

  } catch (error) {
    console.error("Analysis generation failed:", error);
    throw new Error("حدث خطأ أثناء الاتصال بالمستشار الذكي. حاول مجدداً.");
  }
};

export const runBacktestAnalysis = async (
  asset: string,
  timeframe: Timeframe,
  duration: BacktestDuration,
  initialCapital: number
): Promise<BacktestResult> => {
  
  if (!apiKey) {
    throw new Error("API Key غير موجود.");
  }

  const prompt = `
    أنت ذكاء اصطناعي متخصص في التداول وتحليل البيانات التاريخية.
    مهمتك هي تنفيذ Backtesting واقعي لنفس نظام التوصيات الذي تستخدمه (Trend Following + Price Action).

    شروط Backtesting:
    - الأصل: ${asset}
    - الإطار الزمني: ${timeframe}
    - المدة: ${duration}
    - رأس المال الأولي: ${initialCapital}
    - ممنوع Crypto نهائياً.
    - احترام قواعد Risk Management: المخاطرة 1% إلى 2% فقط في الصفقة.
    - استخدام Compound Capital (الأرباح تضاف للرصيد).

    خطوات العمل:
    1. قم بمحاكاة سلوك السعر لهذا الأصل خلال فترة "${duration}" الماضية بناءً على معرفتك.
    2. طبق استراتيجية الدخول عند توفر الشروط فقط (Probability > 65%).
    3. تجنب التداول في أوقات الأخبار شديدة التقلب.
    
    النتائج المطلوبة (JSON):
    - إحصائيات دقيقة (عدد الصفقات، الربح، الخسارة).
    - Equity Curve: قائمة بتطور الرصيد يوماً بيوم (أو صفقة بصفقة) لرسم Chart.
    - تقييم الاستراتيجية (Good/Average/Weak).
    - شرح بسيط بالعربية للمستخدم المبتدئ حول أداء الاستراتيجية.

    كن واقعياً جداً (Conservative). لا تبالغ في الأرباح. الخسارة جزء من اللعبة.
  `;

  try {
    const response = await ai.models.generateContent({
      model: AIModelId.PRO,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: backtestSchema,
        temperature: 0.2,
      }
    });

    return JSON.parse(response.text || "{}") as BacktestResult;
  } catch (error) {
    console.error("Backtest failed:", error);
    throw new Error("فشل تشغيل المحاكاة. حاول مرة أخرى.");
  }
};

export const generatePerformanceReview = async (
  backtestResult: BacktestResult,
  liveStats: { winRate: number; tradeCount: number; totalProfit: number }
): Promise<PerformanceReview> => {

  const prompt = `
    أنت ذكاء اصطناعي متخصص في التداول وتحليل الأداء.
    دورك هو الربط بين نتائج Backtesting والنتائج الحقيقية (Live) بهدف تحسين جودة التوصيات وحماية رأس المال.

    البيانات:
    - Backtest Win Rate: ${backtestResult.winRate}%
    - Backtest Strategy Quality: ${backtestResult.strategyQuality}
    - Live Win Rate (Actual): ${liveStats.winRate}%
    - Live Trade Count: ${liveStats.tradeCount}

    المهمة:
    1. قارن الأداء المتوقع بالأداء الحقيقي.
    2. قرر حالة الحساب (Safe, Caution, Stop).
    3. اقترح تعديل المخاطرة (Risk Adjustment).

    القواعد:
    - إذا Live Win Rate < Backtest Win Rate بـ 10% أو أكثر -> حالة Caution + تقليل المخاطرة.
    - إذا Live Win Rate < 40% -> حالة Stop + نصيحة بالتوقف والدراسة.
    - إذا Live Win Rate قريب من Backtest -> حالة Safe + استمرار.

    المخرجات (JSON):
    - status: Safe / Caution / Stop
    - riskAdjustment: نصيحة مباشرة (مثلاً: "خفّض المخاطرة إلى 1%")
    - advice: شرح بسيط بالعربية للمبتدئ.
    - reason: سبب القرار في جملة واحدة.
  `;

  try {
    const response = await ai.models.generateContent({
      model: AIModelId.FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: reviewSchema,
        temperature: 0.1,
      }
    });

    return JSON.parse(response.text || "{}") as PerformanceReview;
  } catch (error) {
    console.error("Performance review failed:", error);
    throw new Error("فشل تحليل الأداء.");
  }
};

export const analyzeNewsImpact = async (newsItems: NewsItem[]): Promise<NewsAnalysis> => {
  const newsContext = newsItems.map(n => `${n.time} - ${n.currency}: ${n.event} (Impact: ${n.impact})`).join('\n');
  
  const prompt = `
    أنت محلل اقتصادي كبير (Fundamental Analyst).
    لديك قائمة بالأخبار الاقتصادية لهذا اليوم:
    ${newsContext}

    المطلوب:
    1. ما هو الاتجاه العام للسوق بناءً على هذه الأخبار؟ (تضخم، فائدة، قوة عملة).
    2. حدد عملة أو أصل واحد (Focus Asset) هو الأكثر تأثراً اليوم.
    3. أعطِ نصيحة تداول واضحة (Trading Hint).

    اكتب الرد بالعربية بأسلوب "مختصر ومفيد" للمتداول.
  `;

  try {
    const response = await ai.models.generateContent({
      model: AIModelId.FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: newsAnalysisSchema,
        temperature: 0.2,
      }
    });
    return JSON.parse(response.text || "{}") as NewsAnalysis;
  } catch (error) {
    console.error("News Analysis failed:", error);
    throw new Error("تعذر تحليل الأخبار حالياً.");
  }
}