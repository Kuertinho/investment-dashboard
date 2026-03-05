import { useEffect, useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { fetchPriceHistory, priceChangePercent } from '../../lib/priceHistory'

export default function PriceChart({ ticker }) {
  const [status, setStatus] = useState('loading')
  const [history, setHistory] = useState([])
  const [pctChange, setPctChange] = useState(null)

  const historyWithMA = useMemo(() => {
    if (history.length < 200) return history
    return history.map((point, i) => {
      if (i < 199) return { ...point, ma200: null }
      const window = history.slice(i - 199, i + 1)
      const avg = window.reduce((s, p) => s + p.price, 0) / 200
      return { ...point, ma200: parseFloat(avg.toFixed(2)) }
    })
  }, [history])

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    fetchPriceHistory(ticker)
      .then(data => {
        if (cancelled) return
        setHistory(data)
        setPctChange(priceChangePercent(data))
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => { cancelled = true }
  }, [ticker])

  if (status === 'error') {
    return <p className="text-zinc-600 text-xs">Price data unavailable</p>
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-[180px]">
        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const pctFormatted = pctChange !== null
    ? `${pctChange >= 0 ? '+' : ''}${pctChange.toFixed(1)}%`
    : null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">12-Month Price</span>
        {pctFormatted && (
          <span className={`text-sm font-mono font-semibold ${pctChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {pctFormatted}
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={historyWithMA}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={ms => new Date(ms).toLocaleDateString('en-US', { month: 'short' })}
            tick={{ fill: '#52525b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fill: '#52525b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `$${v.toFixed(0)}`}
            width={50}
          />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8 }}
            labelFormatter={ms => new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            formatter={(v, name) => [`$${v.toFixed(2)}`, name === 'ma200' ? '200-day MA' : 'Price']}
          />
          <Line type="monotone" dataKey="price" stroke="#fbbf24" strokeWidth={1.5} dot={false} />
          {history.length >= 200 && (
            <Line type="monotone" dataKey="ma200" stroke="#6b7280" strokeWidth={1} dot={false} strokeDasharray="4 4" connectNulls={false} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
