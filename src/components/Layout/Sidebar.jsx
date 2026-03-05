import { Lightbulb, TrendingUp, Star } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'hypothesis', label: 'Hypothesis Generator', icon: Lightbulb },
  { id: 'analyzer',   label: 'Stock Analyzer',       icon: TrendingUp },
  { id: 'watchlist',  label: 'Watchlist',            icon: Star },
]

export default function Sidebar({ activeView, onNavigate }) {
  return (
    <aside className="w-64 shrink-0 flex flex-col bg-zinc-900 border-r border-zinc-800">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-800">
        <span className="text-lg font-bold tracking-widest">
          <span className="text-amber-400">INV</span>
          <span className="text-zinc-100">EST</span>
          <span className="text-zinc-500 text-xs ml-2 font-mono">AI</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeView === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium
                transition-colors duration-150 border-r-2
                ${active
                  ? 'text-amber-400 bg-amber-400/10 border-amber-400'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border-transparent'
                }`}
            >
              <Icon size={16} strokeWidth={active ? 2 : 1.5} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-zinc-800">
        <p className="text-[11px] text-zinc-600 font-mono uppercase tracking-wider">
          Investment Dashboard
        </p>
        <p className="text-[10px] text-zinc-700 mt-0.5">v0.1.0 · Powered by Claude</p>
      </div>
    </aside>
  )
}
