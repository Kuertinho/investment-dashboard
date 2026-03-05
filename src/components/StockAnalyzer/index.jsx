import { useState, useEffect } from 'react'
import { TrendingUp, Lightbulb, X, Loader2 } from 'lucide-react'
import PageShell from '../Layout/PageShell'
import Scorecard from './Scorecard'
import { analyzeStockScorecard } from '../../lib/claude'
import { useWatchlist } from '../../hooks/useWatchlist'

const LOADING_STEPS = [
  'Fetching financials…',
  'Assessing business economics…',
  'Evaluating capital allocation…',
  'Scoring hypothesis fit…',
  'Building scorecard…',
]

export default function StockAnalyzer({ initialTicker = '', hypothesisContext = null, returnContext = null, onNavigate = null }) {
  const [ticker, setTicker] = useState(initialTicker.toUpperCase())
  const [showContext, setShowContext] = useState(!!hypothesisContext)
  const [stage, setStage] = useState('idle')
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const [loadingStep, setLoadingStep] = useState(0)
  const { add } = useWatchlist()

  useEffect(() => {
    if (stage !== 'loading') return
    setLoadingStep(0)
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev))
    }, 4000)
    return () => clearInterval(interval)
  }, [stage])

  async function handleAnalyze() {
    const sym = ticker.trim()
    if (!sym) return
    setStage('loading')
    setAnalysis(null)
    setError(null)
    try {
      const result = await analyzeStockScorecard(sym, showContext ? hypothesisContext : null)
      setAnalysis(result)
      setStage('result')
    } catch (err) {
      setError(err.message ?? 'Unknown error')
      setStage('error')
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAnalyze()
  }

  function handleNewSearch() {
    setStage('idle')
    setAnalysis(null)
    setError(null)
    setTicker('')
  }

  function handleAddToWatchlist() {
    if (!analysis) return
    add(analysis.ticker, '', {
      companyName: analysis.companyName,
      sector: analysis.sector,
      kpiSnapshot: null,
      hypothesis: showContext ? hypothesisContext : null,
      investmentCase: analysis.overall?.executiveSummary,
      snapshotAt: new Date().toISOString(),
      scorecardSnapshot: analysis,
    })
  }

  const isLoading = stage === 'loading'

  return (
    <PageShell
      title="Stock Analyzer"
      description="Enter a ticker symbol to get AI-powered fundamental analysis"
      icon={TrendingUp}
    >
      <div className="max-w-5xl flex flex-col gap-4">
        {returnContext && onNavigate && (
          <button
            onClick={() => onNavigate('hypothesis', { restoreState: returnContext })}
            className="self-start text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors"
          >
            ← Back to {returnContext.selectedHypothesis?.headline}
          </button>
        )}
        {showContext && hypothesisContext && (
          <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4 flex items-start gap-3">
            <Lightbulb size={16} className="text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-amber-400 text-xs font-medium mb-1">You're analyzing this stock because of this thesis</p>
              <p className="text-zinc-200 text-sm font-medium leading-snug">{hypothesisContext.headline}</p>
              {hypothesisContext.thesis && (
                <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{hypothesisContext.thesis}</p>
              )}
            </div>
            <button
              onClick={() => setShowContext(false)}
              className="text-zinc-600 hover:text-zinc-400 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Ticker Symbol</label>
            <input
              type="text"
              value={ticker}
              onChange={e => setTicker(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="e.g. AAPL, NVDA, MSFT"
              disabled={isLoading}
              className="w-full h-12 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 text-zinc-100 font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div className="flex justify-end gap-3">
            {stage === 'result' && (
              <button
                onClick={handleNewSearch}
                className="h-10 px-5 rounded-lg border border-zinc-700 text-zinc-400 text-sm font-medium hover:border-zinc-600 hover:text-zinc-300 transition-colors"
              >
                New Search
              </button>
            )}
            <button
              onClick={handleAnalyze}
              disabled={!ticker.trim() || isLoading}
              className="h-10 px-6 rounded-lg bg-amber-400/20 border border-amber-400/30 text-amber-400 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-amber-400/30 transition-colors"
            >
              {isLoading ? 'Analyzing…' : 'Analyze →'}
            </button>
          </div>
        </div>

        {stage === 'loading' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 flex flex-col items-center gap-5">
            <Loader2 size={32} className="text-amber-400 animate-spin" />
            <div className="text-center flex flex-col gap-2">
              <p className="text-zinc-200 font-medium">{LOADING_STEPS[loadingStep]}</p>
              <p className="text-zinc-500 text-sm">Building QSV+BE scorecard · This may take 30–60 seconds</p>
            </div>
            <div className="flex gap-1.5">
              {LOADING_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${i <= loadingStep ? 'bg-amber-400' : 'bg-zinc-700'}`}
                />
              ))}
            </div>
          </div>
        )}

        {stage === 'error' && (
          <div className="bg-red-400/5 border border-red-400/20 rounded-xl p-6 flex flex-col gap-3">
            <p className="text-red-400 text-sm font-medium">Analysis failed</p>
            <p className="text-zinc-400 text-sm">{error}</p>
            <button
              onClick={handleAnalyze}
              className="self-start h-9 px-4 rounded-lg border border-red-400/30 text-red-400 text-sm hover:bg-red-400/10 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {stage === 'result' && analysis && (
          <Scorecard
            analysis={analysis}
            hypothesisContext={showContext ? hypothesisContext : null}
            onAddToWatchlist={handleAddToWatchlist}
          />
        )}
      </div>
    </PageShell>
  )
}
