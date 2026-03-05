import { Bookmark, BookmarkCheck } from 'lucide-react'

export default function HypothesisCard({ hypothesis, onExplore, isCustom, isSaved, onToggleSave }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4 hover:border-zinc-700 transition-colors">
      <div className="flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-zinc-100 font-semibold text-sm leading-snug">{hypothesis.headline}</h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {isCustom && (
              <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded-full text-[10px] px-2 py-0.5">Custom</span>
            )}
            <button
              onClick={e => { e.stopPropagation(); onToggleSave(hypothesis.headline) }}
              title={isSaved ? 'Remove from saved' : 'Save for later'}
              className={`transition-colors ${isSaved ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            </button>
          </div>
        </div>
        <p className="text-zinc-400 text-sm leading-relaxed flex-1">{hypothesis.thesis}</p>
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
      <button
        onClick={() => onExplore(hypothesis)}
        className="self-start text-sm text-zinc-300 border border-zinc-700 hover:border-amber-400/40 hover:text-amber-400 rounded-lg px-4 py-2 transition-colors"
      >
        Explore Investment Ideas →
      </button>
    </div>
  )
}
