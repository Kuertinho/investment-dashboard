import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

export function ScoreRadar({ analysis }) {
  const { quality, businessEconomics, solvency, value, hypothesisFit } = analysis
  const quantScore = quality?.quantScore ?? 0
  const qualScore = quality?.qualScore ?? 0
  const avgQuality = parseFloat(((quantScore + qualScore) / 2).toFixed(1))

  const data = [
    { pillar: 'Quality', score: avgQuality },
    { pillar: 'Bus. Econ.', score: businessEconomics?.businessEconomicsScore ?? 0 },
    { pillar: 'Solvency', score: solvency?.solvencyScore ?? 0 },
    { pillar: 'Value', score: value?.valueScore ?? 0 },
    ...(hypothesisFit?.included ? [{ pillar: 'Thesis Fit', score: hypothesisFit.hypothesisScore ?? 0 }] : []),
  ]

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="#27272a" />
        <PolarAngleAxis
          dataKey="pillar"
          tick={{ fill: '#a1a1aa', fontSize: 11 }}
        />
        <PolarRadiusAxis
          domain={[0, 10]}
          tick={false}
          axisLine={false}
          tickCount={6}
        />
        <Radar
          dataKey="score"
          stroke="#fbbf24"
          fill="#fbbf24"
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export function MarginTrendChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-zinc-600 text-xs flex items-center justify-center h-[200px]">No margin data</p>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis
          dataKey="period"
          tick={{ fill: '#52525b', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#52525b', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `${v}%`}
          width={36}
        />
        <Tooltip
          contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
          formatter={(v, name) => [`${v.toFixed(1)}%`, name === 'grossMargin' ? 'Gross Margin' : 'Op. Margin']}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, color: '#71717a' }}
          formatter={v => v === 'grossMargin' ? 'Gross Margin' : 'Op. Margin'}
        />
        <Line type="monotone" dataKey="grossMargin" stroke="#fbbf24" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="operatingMargin" stroke="#2dd4bf" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function PeerComparisonChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-zinc-600 text-xs flex items-center justify-center h-[200px]">No peer data</p>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#52525b', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#52525b', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
          formatter={(v, name) => [`${v.toFixed(1)}x`, name === 'evEbitda' ? 'EV/EBITDA' : 'Fwd P/E']}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, color: '#71717a' }}
          formatter={v => v === 'evEbitda' ? 'EV/EBITDA' : 'Fwd P/E'}
        />
        <Bar dataKey="evEbitda" fill="#fbbf24" radius={[3, 3, 0, 0]} />
        <Bar dataKey="forwardPE" fill="#71717a" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CapitalAllocationChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-zinc-600 text-xs flex items-center justify-center h-[200px]">No capital allocation data</p>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis
          dataKey="year"
          tick={{ fill: '#52525b', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#52525b', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `$${v}B`}
          width={36}
        />
        <Tooltip
          contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
          formatter={(v, name) => [`$${v.toFixed(1)}B`, { fcf: 'FCF', buybacks: 'Buybacks', dividends: 'Dividends', capex: 'CapEx' }[name] ?? name]}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, color: '#71717a' }}
          formatter={v => ({ fcf: 'FCF', buybacks: 'Buybacks', dividends: 'Dividends', capex: 'CapEx' }[v] ?? v)}
        />
        <Bar dataKey="fcf" stackId="a" fill="#fbbf24" />
        <Bar dataKey="buybacks" stackId="a" fill="#4ade80" />
        <Bar dataKey="dividends" stackId="a" fill="#2dd4bf" />
        <Bar dataKey="capex" stackId="a" fill="#52525b" />
      </BarChart>
    </ResponsiveContainer>
  )
}
