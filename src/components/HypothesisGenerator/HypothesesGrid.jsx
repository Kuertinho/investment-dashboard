import { useState } from 'react'
import { RefreshCw, Plus, X, Bookmark } from 'lucide-react'
import HypothesisCard from './HypothesisCard'

function HypothesisSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 animate-pulse">
      <div className="h-4 bg-zinc-800 rounded w-3/4 mb-3" />
      <div className="h-3 bg-zinc-800 rounded w-full mb-2" />
      <div className="h-3 bg-zinc-800 rounded w-5/6 mb-4" />
      <div className="flex gap-2 mb-4">
        {[16, 20, 14].map(w => (
          <div key={w} className={`h-5 w-${w} bg-zinc-800 rounded-full`} />
        ))}
      </div>
      <div className="h-8 w-44 bg-zinc-800 rounded-lg" />
    </div>
  )
}

export default function HypothesesGrid({ stage, hypotheses, customHypotheses, savedHeadlines, error, onExplore, onRetry, onRegenerate, onAddCustom, onToggleSave }) {
  const [showForm, setShowForm] = useState(false)
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [headline, setHeadline] = useState('')
  const [thesis, setThesis] = useState('')
  const [sectors, setSectors] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onAddCustom({
      headline: headline.trim(),
      thesis: thesis.trim(),
      sectors: sectors.split(',').map(s => s.trim()).filter(Boolean),
    })
    setShowForm(false)
    setHeadline('')
    setThesis('')
    setSectors('')
  }

  if (stage === 'error') {
    return (
      <div className="bg-zinc-900 border border-amber-400/30 rounded-xl p-8 flex flex-col items-center gap-4 max-w-lg">
        <p className="text-zinc-300 text-sm text-center">Failed to generate hypotheses. {error}</p>
        <button
          onClick={onRetry}
          className="text-sm text-amber-400 border border-amber-400/30 hover:border-amber-400/60 rounded-lg px-4 py-2 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (stage === 'loading-hypotheses') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <HypothesisSkeleton key={i} />
        ))}
      </div>
    )
  }

  const allHypotheses = [...hypotheses, ...customHypotheses]
  const visibleHypotheses = showSavedOnly
    ? allHypotheses.filter(h => savedHeadlines.has(h.headline))
    : allHypotheses
  const savedCount = savedHeadlines.size

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-zinc-500 text-sm">
          {showSavedOnly
            ? `${visibleHypotheses.length} saved theme${visibleHypotheses.length !== 1 ? 's' : ''}`
            : `${allHypotheses.length} structural investment themes`}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSavedOnly(v => !v)}
            className={`flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 transition-colors ${
              showSavedOnly
                ? 'text-amber-400 border-amber-400/40 bg-amber-400/5'
                : 'text-zinc-400 border-zinc-700 hover:border-amber-400/40 hover:text-amber-400'
            }`}
          >
            <Bookmark size={12} />
            Saved{savedCount > 0 ? ` (${savedCount})` : ''}
          </button>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 border border-zinc-700 hover:border-amber-400/40 hover:text-amber-400 rounded-lg px-3 py-1.5 transition-colors"
          >
            <Plus size={12} />
            Add Custom
          </button>
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 text-xs text-zinc-400 border border-zinc-700 hover:border-amber-400/40 hover:text-amber-400 rounded-lg px-3 py-1.5 transition-colors"
          >
            <RefreshCw size={12} />
            Regenerate
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-200 text-sm font-semibold">Add Custom Hypothesis</h3>
            <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <X size={15} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-zinc-400 text-xs">Headline <span className="text-amber-400">*</span></label>
              <input
                required
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                placeholder="e.g. Nuclear Renaissance Drives Energy Security"
                className="bg-zinc-800 border border-zinc-700 focus:border-amber-400/60 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-zinc-400 text-xs">Thesis <span className="text-amber-400">*</span></label>
              <textarea
                required
                rows={3}
                value={thesis}
                onChange={e => setThesis(e.target.value)}
                placeholder="Describe the investment rationale…"
                className="bg-zinc-800 border border-zinc-700 focus:border-amber-400/60 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors resize-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-zinc-400 text-xs">Sectors <span className="text-zinc-600">(comma-separated, optional)</span></label>
              <input
                value={sectors}
                onChange={e => setSectors(e.target.value)}
                placeholder="e.g. Energy, Utilities, Infrastructure"
                className="bg-zinc-800 border border-zinc-700 focus:border-amber-400/60 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors"
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="text-sm text-amber-400 border border-amber-400/30 hover:border-amber-400/60 rounded-lg px-4 py-2 transition-colors"
              >
                Add Hypothesis
              </button>
            </div>
          </form>
        </div>
      )}

      {showSavedOnly && visibleHypotheses.length === 0 && (
        <div className="py-16 text-center text-zinc-500 text-sm">
          No saved hypotheses yet — click the <Bookmark size={12} className="inline mb-0.5" /> icon on any card to save it.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleHypotheses.map((hypothesis, i) => (
          <HypothesisCard
            key={hypothesis.isCustom ? `custom-${i}` : i}
            hypothesis={hypothesis}
            onExplore={onExplore}
            isCustom={hypothesis.isCustom}
            isSaved={savedHeadlines.has(hypothesis.headline)}
            onToggleSave={onToggleSave}
          />
        ))}
      </div>
    </div>
  )
}
