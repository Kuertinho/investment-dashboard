export async function fetchPriceHistory(ticker) {
  const res = await fetch(
    `/yahoo-finance/v8/finance/chart/${ticker.toUpperCase()}?interval=1wk&range=1y&includePrePost=false`
  )
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  const result = data?.chart?.result?.[0]
  if (!result) throw new Error('No data returned')
  const timestamps = result.timestamp
  const closes = result.indicators.quote[0].close
  return timestamps
    .map((ts, i) => ({ date: ts * 1000, price: closes[i] }))
    .filter(d => d.price != null)
}

export function priceChangePercent(history) {
  if (!history || history.length < 2) return null
  return ((history.at(-1).price - history[0].price) / history[0].price) * 100
}
