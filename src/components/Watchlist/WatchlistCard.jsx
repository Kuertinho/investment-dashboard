import { useState } from 'react'
import { Lightbulb, RefreshCw, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { fetchKpis } from '../../lib/claude'

const KPI_META = [
  ['trailingPE', 'P/E (TTM)'],       ['forwardPE', 'P/E (Fwd)'],
  ['marketCap', 'Market Cap'],        ['revenueGrowthYoY', 'Rev. Growth'],
  ['operatingMargin', 'Op. Margin'],  ['ebitMargin', 'EBIT Margin'],
  ['debtToEquity', 'Debt/Equity'],    ['dividendYield', 'Div. Yield'],
]

function kpiColor(key, value) {
  if (!value || value === 'N/A') return 'text-zinc-500'
  const n = parseFloat(value.replace(/[x%$,\s]/g, '').replace(/^[+-]/, ''))
  switch (key) {
    case 'trailingPE': case 'forwardPE':
      return isNaN(n) ? 'text-zinc-500' : n < 20 ? 'text-green-400' : n <= 35 ? 'text-amber-400' : 'text-red-400'
    case 'operatingMargin': case 'ebitMargin':
      return isNaN(n) ? 'text-zinc-500' : n > 15 ? 'text-green-400' : n >= 5 ? 'text-amber-400' : 'text-red-400'
    case 'revenueGrowthYoY':
      return value.startsWith('+') ? 'text-green-400' : value.startsWith('-') ? 'text-red-400' : 'text-amber-400'
    case 'debtToEquity':
      return isNaN(n) ? 'text-zinc-500' : n < 0.5 ? 'text-green-400' : n <= 1.5 ? 'text-amber-400' : 'text-red-400'
    case 'dividendYield': return 'text-amber-400'
    default: return 'text-zinc-300'
  }
}

const lowerIsBetter = new Set(['trailingPE', 'forwardPE', 'debtToEquity'])

function parsePlain(s) {
  if (!s || s === 'N/A') return null
  const n = parseFloat(s.replace(/[x%$,\s]/g, '').replace(/^[+-]/, ''))
  return isNaN(n) ? null : n
}

function getDelta(oldVal, newVal) {
  const o = parsePlain(oldVal), n = parsePlain(newVal)
  if (o === null || n === null || o === n) return null
  return n > o ? 'up' : 'down'
}

function deltaColorClass(key, dir) {
  if (!dir) return ''
  const good = lowerIsBetter.has(key) ? dir === 'down' : dir === 'up'
  return good ? 'text-green-400' : 'text-red-400'
}

export default function WatchlistCard({ item, onRemove, onUpdateNotes, onUpdateKpis, onNavigate }) {
  const [refreshStage, setRefreshStage] = useState('idle')
  const [freshKpis, setFreshKpis] = useState(null)
  const [prevSnapshot, setPrevSnapshot] = useState(null)
  const [thesisExpanded, setThesisExpanded] = useState(false)
  const [notes, setNotes] = useState(item.notes ?? '')

  async function handleRefresh() {
    setPrevSnapshot(item.kpiSnapshot)
    setRefreshStage('loading')
    try {
      const result = await fetchKpis(item.ticker)
      setFreshKpis(result.kpis)
      onUpdateKpis(item.ticker, result.kpis, new Date().toISOString())
      setRefreshStage('done')
    } catch {
      setRefreshStage('error')
    }
  }

  function handleNotesBlur() {
    onUpdateNotes(notes)
  }

  function handleReanalyze() {
    onNavigate('analyzer', {
      initialTicker: item.ticker,
      hypothesisContext: item.hypothesis ?? null,
    })
  }

  const displayKpis = freshKpis ?? item.kpiSnapshot
  const snapshotDate = item.snapshotAt ? new Date(item.snapshotAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null
  const addedDate = new Date(item.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const hasThesis = !!item.hypothesis?.headline

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 flex items-start justify-between">
        <div>
          <h3 className="text-zinc-100 font-semibold">
            {item.companyName ?? item.ticker}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-amber-400 text-sm">{item.ticker}</span>
            {item.sector && (
              <span className="text-zinc-500 text-sm">{item.sector}</span>
            )}
          </div>
        </div>
        <span className="text-[11px] text-zinc-600 font-mono mt-0.5 shrink-0">{addedDate}</span>
      </div>

      {/* Hypothesis section */}
      {hasThesis && (
        <div className="mx-5 mb-4 bg-amber-400/5 border border-amber-400/20 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Lightbulb size={13} className="text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-zinc-100 text-sm font-medium leading-snug">{item.hypothesis.headline}</p>
              {item.hypothesis.thesis && (
                <>
                  <p className={`text-zinc-400 text-xs leading-relaxed mt-1.5 ${thesisExpanded ? '' : 'line-clamp-2'}`}>
                    {item.hypothesis.thesis}
                  </p>
                  <button
                    onClick={() => setThesisExpanded(e => !e)}
                    className="text-amber-400 text-xs mt-1 flex items-center gap-0.5"
                  >
                    {thesisExpanded ? <><ChevronUp size={11} /> show less</> : <><ChevronDown size={11} /> show more</>}
                  </button>
                </>
              )}
              {item.hypothesis.relevanceReason && (
                <p className="text-zinc-500 text-xs italic mt-2 leading-relaxed">{item.hypothesis.relevanceReason}</p>
              )}
            </div>
          </div>
          {item.investmentCase && (
            <p className="text-zinc-500 text-xs italic mt-3 leading-relaxed border-t border-amber-400/10 pt-3">
              {item.investmentCase}
            </p>
          )}
        </div>
      )}

      {/* KPI section */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Key Metrics</span>
            {snapshotDate && (
              <span className="text-zinc-700 text-[10px] font-mono">snapshot {snapshotDate}</span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshStage === 'loading'}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-50 transition-colors"
          >
            {refreshStage === 'loading'
              ? <Loader2 size={12} className="animate-spin" />
              : <RefreshCw size={12} />
            }
            {refreshStage === 'loading' ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {refreshStage === 'error' && (
          <p className="text-red-400 text-xs mb-3">Refresh failed — try again</p>
        )}

        {displayKpis ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {KPI_META.map(([key, label]) => {
              const val = displayKpis[key]
              const dir = refreshStage === 'done' && prevSnapshot
                ? getDelta(prevSnapshot[key], val)
                : null
              return (
                <div key={key} className="flex flex-col gap-0.5">
                  <span className="text-zinc-600 text-[10px] uppercase tracking-wide">{label}</span>
                  <span className={`font-mono text-sm ${kpiColor(key, val)}`}>
                    {val ?? 'N/A'}
                    {dir && (
                      <sup className={`ml-0.5 text-[10px] ${deltaColorClass(key, dir)}`}>
                        {dir === 'up' ? '↑' : '↓'}
                      </sup>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-zinc-600 text-xs">No KPI snapshot — click Refresh to fetch current data</p>
        )}
      </div>

      {/* Notes */}
      <div className="px-5 pb-4 border-t border-zinc-800 pt-4">
        <label className="text-zinc-600 text-[10px] uppercase tracking-wide block mb-1.5">Notes</label>
        <textarea
          rows={2}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Add your investment notes…"
          className="w-full bg-transparent text-sm text-zinc-400 resize-none focus:outline-none placeholder:text-zinc-700"
        />
      </div>

      {/* Footer actions */}
      <div className="px-5 pb-4 flex items-center justify-between border-t border-zinc-800 pt-3">
        <button
          onClick={handleReanalyze}
          className="h-8 px-4 rounded-lg border border-amber-400/30 text-amber-400 text-xs font-medium hover:bg-amber-400/10 transition-colors"
        >
          Re-analyze →
        </button>
        <button
          onClick={onRemove}
          className="text-zinc-600 hover:text-red-400 text-xs transition-colors"
        >
          ✕ Remove
        </button>
      </div>
    </div>
  )
}
