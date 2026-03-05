import { useState } from 'react'
import { Star, LayoutList, Layers } from 'lucide-react'
import PageShell from '../Layout/PageShell'
import { useWatchlist } from '../../hooks/useWatchlist'
import WatchlistCard from './WatchlistCard'

function parsePlainNumber(s) {
  if (!s || s === 'N/A') return null
  const n = parseFloat(s.replace(/[x%$,\s]/g, '').replace(/^[+-]/, ''))
  return isNaN(n) ? null : n
}

export default function Watchlist({ onNavigate }) {
  const { watchlist, remove, updateNotes, updateKpis } = useWatchlist()
  const [groupBy, setGroupBy] = useState('flat')

  // Summary strip calculations
  const hypothesesCount = new Set(
    watchlist.map(i => i.hypothesis?.headline).filter(Boolean)
  ).size

  const forwardPEs = watchlist
    .map(i => parsePlainNumber(i.kpiSnapshot?.forwardPE))
    .filter(n => n !== null)
  const avgForwardPE = forwardPEs.length > 0
    ? (forwardPEs.reduce((a, b) => a + b, 0) / forwardPEs.length).toFixed(1) + 'x'
    : '—'

  // Grouping
  const sorted = [...watchlist].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))

  let groups = []
  if (groupBy === 'hypothesis') {
    const map = new Map()
    for (const item of sorted) {
      const key = item.hypothesis?.headline ?? '__none__'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(item)
    }
    // named groups first, then __none__
    const named = [...map.entries()].filter(([k]) => k !== '__none__')
    const none = map.has('__none__') ? [['__none__', map.get('__none__')]] : []
    groups = [...named, ...none]
  }

  return (
    <PageShell
      title="Watchlist"
      description="Track your stocks and add personal notes"
      icon={Star}
    >
      {watchlist.length === 0 ? (
        <div className="max-w-2xl">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 flex flex-col items-center gap-4">
            <div className="p-3 rounded-full bg-amber-400/10 text-amber-400">
              <Star size={28} strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <h2 className="text-zinc-200 font-medium mb-1">Your Watchlist is Empty</h2>
              <p className="text-sm text-zinc-500 mb-4">
                Add tickers from the Stock Analyzer to start tracking them here
              </p>
              <button
                onClick={() => onNavigate('hypothesis', {})}
                className="h-9 px-5 rounded-lg bg-amber-400/20 border border-amber-400/30 text-amber-400 text-sm font-medium hover:bg-amber-400/30 transition-colors"
              >
                Explore Hypotheses →
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl flex flex-col gap-6">
          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-3">
            {[
              ['Stocks Tracked', watchlist.length],
              ['Hypotheses Explored', hypothesesCount],
              ['Avg. Forward P/E', avgForwardPE],
            ].map(([label, value]) => (
              <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                <p className="text-zinc-600 text-[10px] uppercase tracking-wider mb-1">{label}</p>
                <p className="text-zinc-100 font-mono text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setGroupBy('flat')}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors ${
                groupBy === 'flat'
                  ? 'border-amber-400/40 text-amber-400 bg-amber-400/10'
                  : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <LayoutList size={13} /> Flat List
            </button>
            <button
              onClick={() => setGroupBy('hypothesis')}
              className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors ${
                groupBy === 'hypothesis'
                  ? 'border-amber-400/40 text-amber-400 bg-amber-400/10'
                  : 'border-zinc-700 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Layers size={13} /> Group by Thesis
            </button>
          </div>

          {/* Card list */}
          {groupBy === 'flat' ? (
            <div className="flex flex-col gap-4">
              {sorted.map(item => (
                <WatchlistCard
                  key={item.ticker}
                  item={item}
                  onRemove={() => remove(item.ticker)}
                  onUpdateNotes={(notes) => updateNotes(item.ticker, notes)}
                  onUpdateKpis={updateKpis}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {groups.map(([headline, items]) => (
                <div key={headline}>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-amber-400 mb-3">
                    {headline === '__none__' ? 'No Thesis' : headline}
                    {' '}· {items.length} stock{items.length !== 1 ? 's' : ''}
                  </h3>
                  <div className="flex flex-col gap-4">
                    {items.map(item => (
                      <WatchlistCard
                        key={item.ticker}
                        item={item}
                        onRemove={() => remove(item.ticker)}
                        onUpdateNotes={(notes) => updateNotes(item.ticker, notes)}
                        onUpdateKpis={updateKpis}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PageShell>
  )
}
