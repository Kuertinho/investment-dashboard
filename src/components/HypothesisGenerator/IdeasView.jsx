import IdeasTable from './IdeasTable'

export default function IdeasView({ stage, hypothesis, ideas, error, onBack, onAnalyze, onRetry }) {
  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={onBack}
        className="self-start text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors"
      >
        ← Back to Hypotheses
      </button>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3">
        <h2 className="text-zinc-100 font-semibold text-sm">{hypothesis.headline}</h2>
        <p className="text-zinc-400 text-sm leading-relaxed">{hypothesis.thesis}</p>
        <div className="flex flex-wrap gap-1.5">
          {hypothesis.sectors.map(sector => (
            <span
              key={sector}
              className="bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-full text-[11px] px-2.5 py-1"
            >
              {sector}
            </span>
          ))}
        </div>
      </div>

      {stage === 'loading-ideas' && (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-amber-400 animate-spin" />
          <p className="text-zinc-500 text-sm">Researching investment ideas…</p>
        </div>
      )}

      {stage === 'error' && (
        <div className="bg-zinc-900 border border-red-400/30 rounded-xl p-6 flex flex-col items-center gap-4 max-w-lg">
          <p className="text-zinc-300 text-sm text-center">Failed to load investment ideas. {error}</p>
          <button
            onClick={onRetry}
            className="text-sm text-amber-400 border border-amber-400/30 hover:border-amber-400/60 rounded-lg px-4 py-2 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {stage === 'ideas' && (
        <IdeasTable ideas={ideas} onAnalyze={onAnalyze} />
      )}
    </div>
  )
}
