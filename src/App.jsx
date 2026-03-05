import { useState, useCallback } from 'react'
import Sidebar from './components/Layout/Sidebar'
import HypothesisGenerator from './components/HypothesisGenerator'
import StockAnalyzer from './components/StockAnalyzer'
import Watchlist from './components/Watchlist'

const VIEWS = {
  hypothesis: HypothesisGenerator,
  analyzer: StockAnalyzer,
  watchlist: Watchlist,
}

export default function App() {
  const [activeView, setActiveView] = useState('hypothesis')
  const [viewContext, setViewContext] = useState({})

  const navigateTo = useCallback((view, context = {}) => {
    setActiveView(view)
    setViewContext(context)
  }, [])

  const handleSidebarNavigate = useCallback((view) => {
    setActiveView(view)
    setViewContext({})
  }, [])

  const ActiveView = VIEWS[activeView]

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar activeView={activeView} onNavigate={handleSidebarNavigate} />
      <main className="flex-1 overflow-y-auto">
        <ActiveView onNavigate={navigateTo} {...viewContext} />
      </main>
    </div>
  )
}
