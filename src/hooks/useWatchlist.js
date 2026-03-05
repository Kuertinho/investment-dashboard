import { useState, useEffect } from 'react'

const STORAGE_KEY = 'investai_watchlist'

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist))
  }, [watchlist])

  const add = (ticker, notes = '', meta = {}) => {
    setWatchlist(prev => {
      if (prev.find(i => i.ticker === ticker.toUpperCase())) return prev
      return [...prev, {
        ticker: ticker.toUpperCase(),
        companyName: meta.companyName ?? null,
        sector: meta.sector ?? null,
        notes,
        addedAt: new Date().toISOString(),
        kpiSnapshot: meta.kpiSnapshot ?? null,
        hypothesis: meta.hypothesis ?? null,
        investmentCase: meta.investmentCase ?? null,
        snapshotAt: meta.snapshotAt ?? null,
      }]
    })
  }

  const remove = (ticker) =>
    setWatchlist(prev => prev.filter(i => i.ticker !== ticker))

  const updateNotes = (ticker, notes) =>
    setWatchlist(prev => prev.map(i => i.ticker === ticker ? { ...i, notes } : i))

  const updateKpis = (ticker, kpiSnapshot, snapshotAt) =>
    setWatchlist(prev =>
      prev.map(i => i.ticker === ticker ? { ...i, kpiSnapshot, snapshotAt } : i)
    )

  return { watchlist, add, remove, updateNotes, updateKpis }
}
