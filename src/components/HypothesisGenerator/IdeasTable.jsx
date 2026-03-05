import { useMemo, useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

function parseFinancialString(str) {
  if (!str) return -Infinity
  const match = str.replace(/\s/g, '').toUpperCase().match(/^\$?([\d,.]+)([BMT])?$/)
  if (!match) return -Infinity
  const num = parseFloat(match[1].replace(/,/g, ''))
  const mult = { B: 1e9, M: 1e6, T: 1e12 }[match[2]] ?? 1
  return num * mult
}

function fitBadgeClass(score) {
  if (score >= 7) return 'text-green-400 bg-green-400/10 border-green-400/20'
  if (score >= 4) return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
  return 'text-red-400 bg-red-400/10 border-red-400/20'
}

function scoreBadgeClass(score) {
  if (score >= 7) return 'text-green-400 bg-green-400/10 border-green-400/20'
  if (score >= 4) return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
  return 'text-red-400 bg-red-400/10 border-red-400/20'
}

function TooltipRow({ label, value }) {
  const missing = !value || value === 'N/A'
  return (
    <div className="flex justify-between items-baseline gap-2">
      <span className="text-zinc-500 text-[10px] shrink-0">{label}</span>
      <span className={`text-[10px] font-mono tabular-nums ${missing ? 'text-zinc-700' : 'text-zinc-300'}`}>
        {missing ? '—' : value}
      </span>
    </div>
  )
}

function ScoreBadge({ score, label, tooltipRows }) {
  if (score == null) return <span className="text-zinc-700 text-xs">—</span>
  return (
    <div className="group relative inline-block">
      <span className={`text-xs font-mono border rounded px-1.5 py-0.5 cursor-default select-none ${scoreBadgeClass(score)}`}>
        {score}/10
      </span>
      <div className="absolute left-0 top-full mt-1.5 z-50 w-52 bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-xl shadow-black/40 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
        <p className="text-zinc-400 text-[10px] font-medium uppercase tracking-wider mb-2">{label}</p>
        <div className="flex flex-col gap-1.5">
          {tooltipRows.map(([lbl, val]) => (
            <TooltipRow key={lbl} label={lbl} value={val} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SortIcon({ column, sortKey, sortDir }) {
  if (sortKey !== column) return <ChevronsUpDown size={13} className="text-zinc-600" />
  return sortDir === 'asc'
    ? <ChevronUp size={13} className="text-amber-400" />
    : <ChevronDown size={13} className="text-amber-400" />
}

export default function IdeasTable({ ideas, onAnalyze }) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('desc')

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return ideas
    return [...ideas].sort((a, b) => {
      if (['fitScore', 'valueScore', 'qualityScore'].includes(sortKey)) {
        const av = a[sortKey] ?? 0
        const bv = b[sortKey] ?? 0
        return sortDir === 'desc' ? bv - av : av - bv
      }
      const av = parseFinancialString(a[sortKey])
      const bv = parseFinancialString(b[sortKey])
      return sortDir === 'desc' ? bv - av : av - bv
    })
  }, [ideas, sortKey, sortDir])

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/80">
            <th className="text-left px-4 py-3 text-zinc-500 font-medium text-xs">Company</th>
            <th className="text-left px-4 py-3 text-zinc-500 font-medium text-xs">Ticker</th>
            <th
              className="text-left px-4 py-3 text-zinc-500 font-medium text-xs cursor-pointer hover:text-zinc-300 select-none"
              onClick={() => handleSort('marketCap')}
            >
              <span className="flex items-center gap-1">
                Mkt Cap
                <SortIcon column="marketCap" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </th>
            <th
              className="text-left px-4 py-3 text-zinc-500 font-medium text-xs cursor-pointer hover:text-zinc-300 select-none"
              onClick={() => handleSort('revenue')}
            >
              <span className="flex items-center gap-1">
                Revenue (TTM)
                <SortIcon column="revenue" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </th>
            <th className="text-left px-4 py-3 text-zinc-500 font-medium text-xs cursor-pointer hover:text-zinc-300 select-none"
                onClick={() => handleSort('valueScore')}>
              <span className="flex items-center gap-1">
                Value <SortIcon column="valueScore" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </th>
            <th className="text-left px-4 py-3 text-zinc-500 font-medium text-xs cursor-pointer hover:text-zinc-300 select-none"
                onClick={() => handleSort('qualityScore')}>
              <span className="flex items-center gap-1">
                Quality <SortIcon column="qualityScore" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </th>
            <th
              className="text-left px-4 py-3 text-zinc-500 font-medium text-xs cursor-pointer hover:text-zinc-300 select-none"
              onClick={() => handleSort('fitScore')}
            >
              <span className="flex items-center gap-1">
                Fit
                <SortIcon column="fitScore" sortKey={sortKey} sortDir={sortDir} />
              </span>
            </th>
            <th className="text-left px-4 py-3 text-zinc-500 font-medium text-xs">Relevance</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {sorted.map((idea, i) => (
            <tr key={i} className="hover:bg-zinc-800/40 transition-colors">
              <td className="px-4 py-3">
                <div className="text-zinc-200 text-sm font-medium whitespace-nowrap">{idea.companyName}</div>
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-amber-400 text-xs">{idea.ticker}</span>
              </td>
              <td className="px-4 py-3 text-zinc-300 text-sm tabular-nums">{idea.marketCap}</td>
              <td className="px-4 py-3 text-zinc-300 text-sm tabular-nums">{idea.revenue}</td>
              <td className="px-4 py-3">
                <ScoreBadge
                  score={idea.valueScore}
                  label="Value Metrics"
                  tooltipRows={[
                    ['P/E (TTM)',  idea.valueSupportingData?.trailingPE],
                    ['Fwd P/E',   idea.valueSupportingData?.forwardPE],
                    ['12M Perf.', idea.valueSupportingData?.priceChange12m],
                    ['Consensus', idea.valueSupportingData?.analystConsensus],
                    ['PT Upside', idea.valueSupportingData?.analystPriceTargetUpside],
                  ]}
                />
              </td>
              <td className="px-4 py-3">
                <ScoreBadge
                  score={idea.qualityScore}
                  label="Quality Metrics"
                  tooltipRows={[
                    ['Op. Margin',    idea.qualitySupportingData?.operatingMargin],
                    ['EBIT Margin',   idea.qualitySupportingData?.ebitMargin],
                    ['D/E Ratio',     idea.qualitySupportingData?.debtToEquity],
                    ['Op. Cash Flow', idea.qualitySupportingData?.operatingCashFlow],
                    ['Rev. Growth',   idea.qualitySupportingData?.revenueGrowthYoY],
                  ]}
                />
              </td>
              <td className="px-4 py-3">
                {idea.fitScore != null ? (
                  <span className={`text-xs font-mono border rounded px-1.5 py-0.5 ${fitBadgeClass(idea.fitScore)}`}>
                    {idea.fitScore}/10
                  </span>
                ) : (
                  <span className="text-zinc-700 text-xs">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-zinc-500 text-xs max-w-xs">{idea.relevanceReason}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onAnalyze(idea.ticker, idea)}
                  className="text-xs text-amber-400 border border-amber-400/30 hover:border-amber-400/60 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap"
                >
                  Analyze →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
