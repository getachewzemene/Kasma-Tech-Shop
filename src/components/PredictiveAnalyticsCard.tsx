import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Brain, 
  HelpCircle,
  Lightbulb,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface CategoryForecast {
  id: string;
  nameEn: string;
  nameAm: string;
  historicalSales: number[];
  projectedSales: number;
  growthRate: number;
  aiRationale: string;
}

interface PriceVolatilityProduct {
  id: string;
  nameEn: string;
  nameAm: string;
  category: string;
  currentPrice: number;
  volatilityScore: number;
  priceHistory: number[];
  aiRationale: string;
  aiRationaleAm: string;
}

interface PredictiveAnalyticsCardProps {
  language: 'en' | 'am';
}

export default function PredictiveAnalyticsCard({ language }: PredictiveAnalyticsCardProps) {
  const [activeSubSection, setActiveSubSection] = useState<'SALES_VOLUME' | 'PRICE_VOLATILITY'>('SALES_VOLUME');
  const [forecasts, setForecasts] = useState<CategoryForecast[]>([]);
  const [agentInsight, setAgentInsight] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('computers');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Price Volatility States
  const [volatilityProducts, setVolatilityProducts] = useState<PriceVolatilityProduct[]>([]);
  const [selectedVolProductId, setSelectedVolProductId] = useState<string>('macbook-m3');
  const [marketSummary, setMarketSummary] = useState<string>('');

  const fetchForecasts = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/predict/category-sales');
      if (!response.ok) {
        throw new Error('Server returned error response for forecast generation.');
      }
      const data = await response.json();
      if (data.success) {
        setForecasts(data.categories);
        setAgentInsight(data.agentInsight);
        setSource(data.source);
        
        // If the current selected category is not in the new list, pick the first one
        if (data.categories.length > 0 && !data.categories.some((c: CategoryForecast) => c.id === selectedCategoryId)) {
          setSelectedCategoryId(data.categories[0].id);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch predictions.');
      }
    } catch (err: any) {
      console.error('Error fetching demand forecasts:', err);
      setError(err?.message || 'Could not load predictive analytics.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchPriceVolatility = async () => {
    try {
      const response = await fetch('/api/predict/price-volatility');
      if (!response.ok) {
        throw new Error('Server returned error response for price volatility prediction.');
      }
      const data = await response.json();
      if (data.success) {
        setVolatilityProducts(data.products);
        setMarketSummary(data.marketSummary);
        if (data.products.length > 0 && !data.products.some((p: PriceVolatilityProduct) => p.id === selectedVolProductId)) {
          setSelectedVolProductId(data.products[0].id);
        }
      }
    } catch (err: any) {
      console.error('Error fetching price volatility data:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        fetchForecasts(true),
        fetchPriceVolatility()
      ]);
      setLoading(false);
    };
    init();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchForecasts(true),
      fetchPriceVolatility()
    ]);
    setIsRefreshing(false);
  };

  const activeCategory = forecasts.find(c => c.id === selectedCategoryId);

  // Prepare chart data for transition from historical (solid) to projected (dashed)
  const chartData = activeCategory ? [
    {
      name: language === 'en' ? 'Month -3' : 'ወር -3',
      historical: activeCategory.historicalSales[0],
      projected: null,
    },
    {
      name: language === 'en' ? 'Month -2' : 'ወር -2',
      historical: activeCategory.historicalSales[1],
      projected: null,
    },
    {
      name: language === 'en' ? 'Month -1' : 'ወር -1',
      historical: activeCategory.historicalSales[2],
      projected: activeCategory.historicalSales[2], // Bridge point
    },
    {
      name: language === 'en' ? 'Next Month (AI)' : 'የሚቀጥለው ወር (AI)',
      historical: null,
      projected: activeCategory.projectedSales,
    }
  ] : [];

  const activeVolProduct = volatilityProducts.find(p => p.id === selectedVolProductId);

  // Price Volatility Chart Data setup with bridge at current price (index 3)
  const volChartData = activeVolProduct ? [
    {
      name: language === 'en' ? 'Month -3' : 'ወር -3',
      historicalPrice: activeVolProduct.priceHistory[0],
      projectedPrice: null
    },
    {
      name: language === 'en' ? 'Month -2' : 'ወር -2',
      historicalPrice: activeVolProduct.priceHistory[1],
      projectedPrice: null
    },
    {
      name: language === 'en' ? 'Month -1' : 'ወር -1',
      historicalPrice: activeVolProduct.priceHistory[2],
      projectedPrice: null
    },
    {
      name: language === 'en' ? 'Current' : 'ያሁኑ',
      historicalPrice: activeVolProduct.priceHistory[3],
      projectedPrice: activeVolProduct.priceHistory[3]
    },
    {
      name: language === 'en' ? 'Month +1 (AI)' : 'ወር +1 (AI)',
      historicalPrice: null,
      projectedPrice: activeVolProduct.priceHistory[4]
    },
    {
      name: language === 'en' ? 'Month +2 (AI)' : 'ወር +2 (AI)',
      historicalPrice: null,
      projectedPrice: activeVolProduct.priceHistory[5]
    },
    {
      name: language === 'en' ? 'Month +3 (AI)' : 'ወር +3 (AI)',
      historicalPrice: null,
      projectedPrice: activeVolProduct.priceHistory[6]
    }
  ] : [];

  const getAmharicHeader = () => 'የወደፊት የሽያጭ ትንበያ (AI-Powered)';
  const getEnglishHeader = () => 'AI Demand Forecasting & Predictive Analytics';

  if (loading) {
    return (
      <div className="bg-white border border-gray-150 rounded-2xl p-8 shadow-xs flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          <Brain className="w-5 h-5 text-indigo-600 absolute animate-pulse" />
        </div>
        <p className="mt-4 text-xs text-gray-500 font-semibold tracking-wide animate-pulse">
          {language === 'en' ? 'AI Demand Agent is analyzing historical checkout vectors...' : 'የሽያጭ ትንበያ ሞዴል መረጃዎችን እያሰላ ነው...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-100 rounded-2xl p-8 shadow-xs flex flex-col items-center justify-center text-center min-h-[300px]">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <h4 className="mt-4 font-bold text-zinc-900 text-sm">
          {language === 'en' ? 'Demand Prediction Offline' : 'የሽያጭ ትንበያው መስመር ላይ አይደለም'}
        </h4>
        <p className="text-xs text-gray-400 mt-1 max-w-md">{error}</p>
        <button 
          onClick={() => fetchForecasts()}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs transition-colors"
        >
          {language === 'en' ? 'Retry Handshake' : 'እንደገና ሞክር'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs hover:shadow-sm transition-all duration-300 space-y-6">
      
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </span>
            <h4 className="font-extrabold text-sm text-zinc-900 uppercase tracking-wider">
              {language === 'en' ? getEnglishHeader() : getAmharicHeader()}
            </h4>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 max-w-xl">
            {language === 'en' 
              ? 'AI-driven category sales volume forecasting utilizing seasonal indices and real-time checkout telemetry.' 
              : 'የቅርብ ጊዜ የገበያ እንቅስቃሴዎችን እና የአየር ሁኔታን መሰረት በማድረግ በሚቀጥለው ወር የሚሸጡ እቃዎች ብዛት ትንበያ።'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-start">
          <span className={`text-[9px] px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider ${
            source === 'ai_agent' 
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
              : 'bg-zinc-100 text-zinc-700 border-zinc-200'
          }`}>
            {source === 'ai_agent' ? 'AI Agent: Gemini 3.5' : 'Deterministic fallback'}
          </span>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-zinc-800 hover:border-[#0052FF] bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold text-xs rounded-xl shadow-xs transition-all duration-200 cursor-pointer disabled:opacity-50"
            title="Re-run predictive modeling on latest ledger data"
          >
            <RefreshCw className={`w-3 h-3 text-indigo-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-[10px]">{language === 'en' ? 'Run Simulation' : 'አዲስ አስላ'}</span>
          </button>
        </div>
      </div>

      {/* Sub-section Switcher Tabs */}
      <div className="flex border-b border-gray-100 pb-px">
        <button
          onClick={() => setActiveSubSection('SALES_VOLUME')}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubSection === 'SALES_VOLUME'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-gray-400 hover:text-zinc-900'
          }`}
        >
          {language === 'en' ? 'Category Demand Forecast' : 'የዘርፍ ሽያጭ ትንበያ'}
        </button>
        <button
          onClick={() => setActiveSubSection('PRICE_VOLATILITY')}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubSection === 'PRICE_VOLATILITY'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-gray-400 hover:text-zinc-900'
          }`}
        >
          {language === 'en' ? 'Electronics Price Volatility' : 'የኤሌክትሮኒክስ ዋጋ መዋዠቅ'}
        </button>
      </div>

      {activeSubSection === 'SALES_VOLUME' ? (
        <>
          {/* Grid Layout: Category list vs Trend Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Side: 10 Categories List */}
            <div className="lg:col-span-5 space-y-2 max-h-[420px] overflow-y-auto pr-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 pb-1">
                <span>{language === 'en' ? 'Category' : 'የእቃው ዘርፍ'}</span>
                <span>{language === 'en' ? 'Projection' : 'የሚጠበቀው ሽያጭ'}</span>
              </div>

              <div className="space-y-1.5">
                {forecasts.map((forecast) => {
                  const isSelected = forecast.id === selectedCategoryId;
                  const isPositive = forecast.growthRate >= 0;
                  return (
                    <button
                      key={forecast.id}
                      onClick={() => setSelectedCategoryId(forecast.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer group ${
                        isSelected 
                          ? 'bg-indigo-600/5 border-indigo-600/30 text-indigo-950 font-semibold' 
                          : 'bg-white hover:bg-gray-50/80 border-gray-150 text-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full transition-all ${
                          isSelected ? 'bg-indigo-600 scale-125 animate-pulse' : 'bg-gray-300 group-hover:bg-gray-400'
                        }`} />
                        <div>
                          <span className="text-xs font-bold block text-zinc-900">
                            {language === 'en' ? forecast.nameEn : forecast.nameAm}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {language === 'en' ? 'Historical: ' : 'የበፊቱ: '}
                            {forecast.historicalSales[2]} units
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-right">
                        <div>
                          <span className="text-xs font-extrabold font-mono text-zinc-950 block">
                            {forecast.projectedSales} <span className="text-[9px] font-normal text-gray-550">qty</span>
                          </span>
                          <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            isPositive 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                            {isPositive ? '+' : ''}{forecast.growthRate}%
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Chart & AI Rationale Card */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              
              {/* Recharts Area Chart */}
              {activeCategory && (
                <div className="bg-gray-50/50 border border-gray-150/80 rounded-2xl p-4 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-600">
                        {language === 'en' ? 'Trend Progression Vector' : 'የሽያጭ ሂደት ቬክተር'}
                      </span>
                      <h5 className="font-extrabold text-xs text-zinc-900 uppercase tracking-tight mt-0.5">
                        {language === 'en' ? activeCategory.nameEn : activeCategory.nameAm}
                      </h5>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 block">
                        {language === 'en' ? 'Next-Month Prediction' : 'የሚቀጥለው ወር ትንበያ'}
                      </span>
                      <span className="font-mono font-extrabold text-sm text-black">
                        {activeCategory.projectedSales} units
                      </span>
                    </div>
                  </div>

                  {/* Chart Frame */}
                  <div className="h-56 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={9} tickLine={false} />
                        <YAxis stroke="#9CA3AF" fontSize={9} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181B', borderRadius: '12px', border: 'none', color: '#F3F4F6' }}
                          labelStyle={{ fontWeight: 'bold', fontSize: '10px', color: '#9CA3AF' }}
                          formatter={(value: any, name: any) => [
                            `${value} units`,
                            name === 'historical' 
                              ? (language === 'en' ? 'Historical' : 'የበፊቱ ሽያጭ') 
                              : (language === 'en' ? 'AI Projected' : 'በአይ የተተነበየ')
                          ]}
                        />
                        <Legend 
                          verticalAlign="top" 
                          height={32}
                          iconSize={8}
                          wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                        />
                        {/* Historical Area - Solid Stroke */}
                        <Area 
                          type="monotone" 
                          dataKey="historical" 
                          name={language === 'en' ? 'Historical Sales' : 'የበፊቱ ሽያጭ'} 
                          stroke="#6366f1" 
                          strokeWidth={2.5} 
                          fillOpacity={1} 
                          fill="url(#colorHist)" 
                        />
                        {/* Projected Area - Dashed Stroke */}
                        <Area 
                          type="monotone" 
                          dataKey="projected" 
                          name={language === 'en' ? 'AI Projected Demand' : 'በአይ የተተነበየ'} 
                          stroke="#4f46e5" 
                          strokeWidth={2.5} 
                          strokeDasharray="5 5"
                          fillOpacity={1} 
                          fill="url(#colorProj)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Rationale Section */}
                  <div className="mt-3 bg-indigo-50/40 border border-indigo-100/50 rounded-xl p-3 flex gap-2.5 items-start">
                    <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-wider block">
                        {language === 'en' ? 'AI Demand Agent Rationale' : 'የአይ ትንበያ ማብራሪያ'}
                      </span>
                      <p className="text-[11px] text-zinc-700 leading-relaxed italic">
                        "{activeCategory.aiRationale}"
                      </p>
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>

          {/* Global Agent insights panel at the bottom */}
          {agentInsight && (
            <div className="bg-zinc-900 text-zinc-100 rounded-2xl p-4 flex gap-3 items-start border border-zinc-800">
              <Brain className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                    {language === 'en' ? 'Global Marketplace Demand Insight' : 'አጠቃላይ የገበያ ሁኔታ ትንበያ'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] text-zinc-550 font-mono uppercase tracking-widest font-black">Agent Online</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {agentInsight}
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* NEW Tab: Price Volatility Forecasts for Top Electronics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Side: 5 Electronic Products List */}
            <div className="lg:col-span-5 space-y-2 max-h-[420px] overflow-y-auto pr-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 pb-1">
                <span>{language === 'en' ? 'Electronic Product' : 'የኤሌክትሮኒክስ እቃ'}</span>
                <span>{language === 'en' ? 'Volatility Index' : 'የዋጋ መዋዠቅ ጠቋሚ'}</span>
              </div>

              <div className="space-y-1.5">
                {volatilityProducts.map((product) => {
                  const isSelected = product.id === selectedVolProductId;
                  const isHighVol = product.volatilityScore >= 15;
                  const isLowVol = product.volatilityScore < 10;
                  return (
                    <button
                      key={product.id}
                      onClick={() => setSelectedVolProductId(product.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer group ${
                        isSelected 
                          ? 'bg-indigo-600/5 border-indigo-600/30 text-indigo-950 font-semibold' 
                          : 'bg-white hover:bg-gray-50/80 border-gray-150 text-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full transition-all ${
                          isSelected ? 'bg-indigo-600 scale-125 animate-pulse' : 'bg-gray-300 group-hover:bg-gray-400'
                        }`} />
                        <div>
                          <span className="text-xs font-bold block text-zinc-900">
                            {language === 'en' ? product.nameEn : product.nameAm}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {language === 'en' ? 'Current Price: ' : 'ያሁኑ ዋጋ: '}
                            {product.currentPrice.toLocaleString()} ETB
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-right">
                        <div>
                          <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            isHighVol 
                              ? 'bg-rose-50 text-rose-700 border-rose-100' 
                              : isLowVol
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            <TrendingUp className="w-2.5 h-2.5" />
                            {product.volatilityScore}%
                          </span>
                          <span className="text-[9px] text-gray-400 block mt-0.5 font-mono">
                            {isHighVol ? (language === 'en' ? 'High' : 'ከፍተኛ') : isLowVol ? (language === 'en' ? 'Low' : 'ዝቅተኛ') : (language === 'en' ? 'Medium' : 'መካከለኛ')}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Price Volatility Trend Chart */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              
              {activeVolProduct && (
                <div className="bg-gray-50/50 border border-gray-150/80 rounded-2xl p-4 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-600">
                        {language === 'en' ? 'Market Volatility Vector (7-Month Horizon)' : 'የዋጋ መዋዠቅ ሂደት (7-ወራት)'}
                      </span>
                      <h5 className="font-extrabold text-xs text-zinc-900 uppercase tracking-tight mt-0.5">
                        {language === 'en' ? activeVolProduct.nameEn : activeVolProduct.nameAm}
                      </h5>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 block">
                        {language === 'en' ? 'Current Baseline Price' : 'ያሁኑ መሰረታዊ ዋጋ'}
                      </span>
                      <span className="font-mono font-extrabold text-sm text-black">
                        {activeVolProduct.currentPrice.toLocaleString()} ETB
                      </span>
                    </div>
                  </div>

                  {/* Chart Frame */}
                  <div className="h-56 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={volChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorVolHist" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0052FF" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#0052FF" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorVolProj" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={9} tickLine={false} />
                        <YAxis 
                          stroke="#9CA3AF" 
                          fontSize={9} 
                          tickLine={false} 
                          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181B', borderRadius: '12px', border: 'none', color: '#F3F4F6' }}
                          labelStyle={{ fontWeight: 'bold', fontSize: '10px', color: '#9CA3AF' }}
                          formatter={(value: any, name: any) => [
                            `${value.toLocaleString()} ETB`,
                            name === 'historicalPrice' 
                              ? (language === 'en' ? 'Historical / Current' : 'የበፊቱ / ያሁኑ ዋጋ') 
                              : (language === 'en' ? 'AI Projected' : 'በአይ የተተነበየ ዋጋ')
                          ]}
                        />
                        <Legend 
                          verticalAlign="top" 
                          height={32}
                          iconSize={8}
                          wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                        />
                        {/* Historical Price Curve */}
                        <Area 
                          type="monotone" 
                          dataKey="historicalPrice" 
                          name={language === 'en' ? 'Historical / Current Price' : 'የበፊቱ / ያሁኑ ዋጋ'} 
                          stroke="#0052FF" 
                          strokeWidth={2.5} 
                          fillOpacity={1} 
                          fill="url(#colorVolHist)" 
                        />
                        {/* Projected Price Curve */}
                        <Area 
                          type="monotone" 
                          dataKey="projectedPrice" 
                          name={language === 'en' ? 'AI Expected Fluctuation' : 'በአይ የተተነበየ ዋጋ'} 
                          stroke="#4f46e5" 
                          strokeWidth={2.5} 
                          strokeDasharray="5 5"
                          fillOpacity={1} 
                          fill="url(#colorVolProj)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Volatility Rationale Section */}
                  <div className="mt-3 bg-indigo-50/40 border border-indigo-100/50 rounded-xl p-3 flex gap-2.5 items-start">
                    <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-wider block">
                        {language === 'en' ? 'AI Volatility Rationale & LC Exposure' : 'የዋጋ መዋዠቅ ምክንያት እና የ LC ተጋላጭነት'}
                      </span>
                      <p className="text-[11px] text-zinc-700 leading-relaxed italic">
                        "{language === 'en' ? activeVolProduct.aiRationale : activeVolProduct.aiRationaleAm}"
                      </p>
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>

          {/* Expanded Volatility Market Summary Bottom Panel */}
          {marketSummary && (
            <div className="bg-zinc-900 text-zinc-100 rounded-2xl p-4 flex gap-3 items-start border border-zinc-800">
              <Brain className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                    {language === 'en' ? 'Macro-Economic Pricing Dynamics & Forex Report' : 'አጠቃላይ የገበያ ሁኔታ እና የምንዛሬ ተመን መግለጫ'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-[9px] text-zinc-550 font-mono uppercase tracking-widest font-black">Analytical Agent Online</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {marketSummary}
                </p>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
