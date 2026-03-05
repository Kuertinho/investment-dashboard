import { Star } from 'lucide-react'
import PriceChart from './PriceChart'

function parseKpiValue(value) {
  if (!value || value === 'N/A') return null
  const n = parseFloat(value.replace(/[x%$,\s]/g, '').replace(/^[+-]/, ''))
  return isNaN(n) ? null : n
}

function kpiColor(key, value) {
  if (!value || value === 'N/A') return 'text-zinc-500'
  const n = parseKpiValue(value)
  switch (key) {
    case 'trailingPE': case 'forwardPE':
      return n === null ? 'text-zinc-500' : n < 20 ? 'text-green-400' : n <= 35 ? 'text-amber-400' : 'text-red-400'
    case 'operatingMargin': case 'ebitMargin':
      return n === null ? 'text-zinc-500' : n > 15 ? 'text-green-400' : n >= 5 ? 'text-amber-400' : 'text-red-400'
    case 'revenueGrowthYoY':
      return value.startsWith('+') ? 'text-green-400' : value.startsWith('-') ? 'text-red-400' : 'text-amber-400'
    case 'debtToEquity':
      return n === null ? 'text-zinc-500' : n < 0.5 ? 'text-green-400' : n <= 1.5 ? 'text-amber-400' : 'text-red-400'
    case 'dividendYield': return 'text-amber-400'
    default: return 'text-zinc-300'
  }
}

function sentimentClass(s) {
  if (s === 'positive') return 'bg-green-400/10 text-green-400 border border-green-400/20'
  if (s === 'negative') return 'bg-red-400/10 text-red-400 border border-red-400/20'
  return 'bg-zinc-800 text-zinc-400 border border-zinc-700'
}

const KPI_META = [
  ['trailingPE', 'P/E (Trailing)'], ['forwardPE', 'P/E (Forward)'],
  ['marketCap', 'Market Cap'],      ['operatingMargin', 'Operating Margin'],
  ['ebitMargin', 'EBIT Margin'],    ['revenueGrowthYoY', 'Revenue Growth YoY'],
  ['debtToEquity', 'Debt / Equity'],['dividendYield', 'Dividend Yield'],
]

const SWOT_CONFIG = [
  { key: 'strengths',     label: 'Strengths',     color: 'text-green-400', border: 'border-green-400/20', bg: 'bg-green-400/5' },
  { key: 'weaknesses',    label: 'Weaknesses',    color: 'text-red-400',   border: 'border-red-400/20',   bg: 'bg-red-400/5'   },
  { key: 'opportunities', label: 'Opportunities', color: 'text-amber-400', border: 'border-amber-400/20', bg: 'bg-amber-400/5' },
  { key: 'threats',       label: 'Threats',       color: 'text-zinc-400',  border: 'border-zinc-700',     bg: 'bg-zinc-800/50' },
]

export default function AnalysisResult({ analysis, onAddToWatchlist }) {
  const { companyName, ticker, sector, kpis, recentNews, swot, investmentCase } = analysis

  return (
    <div className="flex flex-col gap-5">
      {/* Company Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-zinc-100 font-semibold text-lg">{companyName}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-amber-400 font-mono font-medium">{ticker}</span>
            {sector && <span className="text-zinc-500 text-sm">{sector}</span>}
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-5">
        <PriceChart ticker={ticker} />
      </div>

      {/* Investment Case */}
      <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl px-6 py-4">
        <p className="text-amber-400 text-xs font-medium uppercase tracking-wider mb-2">Investment Case</p>
        <p className="text-zinc-300 text-sm leading-relaxed">{investmentCase}</p>
      </div>

      {/* KPI Grid */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-5">
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-4">Key Metrics</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {KPI_META.map(([key, label]) => (
            <div key={key} className="flex flex-col gap-1">
              <span className="text-zinc-600 text-[11px] font-medium uppercase tracking-wide">{label}</span>
              <span className={`font-mono text-sm font-semibold ${kpiColor(key, kpis?.[key])}`}>
                {kpis?.[key] ?? 'N/A'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent News */}
      {recentNews?.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-5">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-4">Recent News</p>
          <div className="flex flex-col divide-y divide-zinc-800">
            {recentNews.map((item, i) => (
              <div key={i} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-200 text-sm font-medium leading-snug">{item.headline}</p>
                  <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{item.summary}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${sentimentClass(item.sentiment)}`}>
                    {item.sentiment}
                  </span>
                  <span className="text-zinc-600 text-[11px] font-mono">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SWOT */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-5">
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-4">SWOT Analysis</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SWOT_CONFIG.map(({ key, label, color, border, bg }) => (
            <div key={key} className={`rounded-lg border ${border} ${bg} p-4`}>
              <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${color}`}>{label}</p>
              <ul className="flex flex-col gap-1.5">
                {swot?.[key]?.map((item, i) => (
                  <li key={i} className="text-zinc-400 text-xs leading-relaxed flex gap-2">
                    <span className={`mt-0.5 shrink-0 ${color}`}>·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Add to Watchlist */}
      <div className="flex justify-end">
        <button
          onClick={onAddToWatchlist}
          className="flex items-center gap-2 h-10 px-5 rounded-lg bg-amber-400/20 border border-amber-400/30 text-amber-400 text-sm font-medium hover:bg-amber-400/30 transition-colors"
        >
          <Star size={14} />
          Add to Watchlist
        </button>
      </div>
    </div>
  )
}
