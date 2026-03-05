import { useState } from 'react'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'
import PriceChart from './PriceChart'
import { ScoreRadar, MarginTrendChart, PeerComparisonChart, CapitalAllocationChart } from './ScorecardCharts'

const VERDICT_STYLE = {
  strong_buy: 'bg-green-400/10 text-green-400 border-green-400/20',
  buy:        'bg-teal-400/10 text-teal-400 border-teal-400/20',
  watch:      'bg-amber-400/10 text-amber-400 border-amber-400/20',
  avoid:      'bg-red-400/10 text-red-400 border-red-400/20',
}

const VERDICT_LABEL = {
  strong_buy: 'Strong Buy',
  buy:        'Buy',
  watch:      'Watch',
  avoid:      'Avoid',
}

const TAILWIND_STYLE = {
  direct_play:  'bg-green-400/10 text-green-400 border-green-400/20',
  strong:       'bg-teal-400/10 text-teal-400 border-teal-400/20',
  moderate:     'bg-amber-400/10 text-amber-400 border-amber-400/20',
  weak:         'bg-zinc-700/50 text-zinc-400 border-zinc-600/30',
}

const MARGIN_SAFETY_STYLE = {
  comfortable: 'bg-green-400/10 text-green-400 border-green-400/20',
  adequate:    'bg-teal-400/10 text-teal-400 border-teal-400/20',
  thin:        'bg-amber-400/10 text-amber-400 border-amber-400/20',
  none:        'bg-red-400/10 text-red-400 border-red-400/20',
}

const PILLAR_COLORS = {
  quality:     '#fbbf24',
  businessEco: '#2dd4bf',
  solvency:    '#60a5fa',
  value:       '#a78bfa',
  hypothesis:  '#f472b6',
}

function kv(label, value) {
  return (
    <div key={label} className="flex flex-col gap-0.5">
      <span className="text-zinc-600 text-xs uppercase tracking-wider">{label}</span>
      <span className="text-zinc-200 text-sm">{value ?? 'N/A'}</span>
    </div>
  )
}

function ScoreBadge({ score, color }) {
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold font-mono border"
      style={{ color, borderColor: `${color}33`, backgroundColor: `${color}15` }}
    >
      {score ?? '—'}
    </span>
  )
}

function FlagPills({ flags }) {
  if (!flags || flags.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {flags.map((f, i) => (
        <span
          key={i}
          className={`text-xs px-2 py-0.5 rounded-full border ${f.red ? 'bg-red-400/10 text-red-400 border-red-400/20' : 'bg-green-400/10 text-green-400 border-green-400/20'}`}
        >
          {f.label}
        </span>
      ))}
    </div>
  )
}

function PillarCard({ title, weight, rawScore, color, data, verdict, flags, expanded, onToggle }) {
  const excerpt = verdict ? verdict.split('.')[0] + '.' : ''

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-4 hover:bg-zinc-800/40 transition-colors text-left"
        onClick={onToggle}
      >
        <ScoreBadge score={rawScore} color={color} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-zinc-200 font-medium text-sm">{title}</span>
            <span className="text-zinc-600 text-xs">{weight}% weight</span>
          </div>
          {!expanded && <p className="text-zinc-500 text-xs mt-0.5 truncate">{excerpt}</p>}
        </div>
        {expanded ? <ChevronUp size={14} className="text-zinc-500 shrink-0" /> : <ChevronDown size={14} className="text-zinc-500 shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-zinc-800">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-4">
            {data}
          </div>
          {verdict && (
            <p className="text-zinc-400 text-sm leading-relaxed mt-4">{verdict}</p>
          )}
          <FlagPills flags={flags} />
        </div>
      )}
    </div>
  )
}

function WeightedBar({ analysis }) {
  const { quality, businessEconomics, solvency, value, hypothesisFit, overall } = analysis
  const total = overall?.weightedTotalScore || 1
  const included = hypothesisFit?.included

  const segments = [
    { label: 'Quality', score: ((quality?.quantScore ?? 0) + (quality?.qualScore ?? 0)) / 2, weight: included ? 0.35 : 0.412, color: PILLAR_COLORS.quality },
    { label: 'Bus. Econ.', score: businessEconomics?.businessEconomicsScore ?? 0, weight: included ? 0.20 : 0.235, color: PILLAR_COLORS.businessEco },
    { label: 'Solvency', score: solvency?.solvencyScore ?? 0, weight: included ? 0.10 : 0.118, color: PILLAR_COLORS.solvency },
    { label: 'Value', score: value?.valueScore ?? 0, weight: included ? 0.20 : 0.235, color: PILLAR_COLORS.value },
    ...(included ? [{ label: 'Thesis', score: hypothesisFit.hypothesisScore ?? 0, weight: 0.15, color: PILLAR_COLORS.hypothesis }] : []),
  ]

  return (
    <div className="flex h-5 rounded-full overflow-hidden gap-0.5">
      {segments.map(s => {
        const contrib = s.score * s.weight
        const pct = total > 0 ? (contrib / total) * 100 : 0
        return (
          <div
            key={s.label}
            style={{ width: `${pct}%`, backgroundColor: s.color, opacity: 0.7 }}
            title={`${s.label}: ${contrib.toFixed(2)} pts`}
          />
        )
      })}
    </div>
  )
}

function computeFlags(analysis) {
  const flags = []
  const sol = analysis.solvency
  const qual = analysis.quality
  const be = analysis.businessEconomics
  const val = analysis.value

  if (sol?.netDebtToEbitda?.flagHigh === true) flags.push({ label: 'High Leverage', red: true })
  if (sol?.interestCoverage?.flagLow === true) flags.push({ label: 'Weak Interest Coverage', red: true })
  if (qual?.quantitative?.grossMargin?.trend === 'contracting') flags.push({ label: 'Margin Contraction', red: true })
  if (be?.earningsQuality?.revenueVisibility === 'transactional' && be?.earningsQuality?.cyclicality === 'high') {
    flags.push({ label: 'Transactional + High Cyclicality', red: true })
  }
  if (be?.capitalAllocation?.reinvestmentRateVsROIC?.compoundingMachine === true) {
    flags.push({ label: 'Compounding Machine', red: false })
  }
  if (be?.ownerOrientation?.founderLed === true) flags.push({ label: 'Founder-Led', red: false })
  if (qual?.quantitative?.roic?.flagHigh === true) flags.push({ label: 'High ROIC', red: false })
  if (qual?.qualitative?.moatStrength === 'strong') flags.push({ label: 'Strong Moat', red: false })
  if (val?.downside?.marginOfSafetyAssessment === 'comfortable') flags.push({ label: 'Comfortable Margin of Safety', red: false })

  return flags
}

export default function Scorecard({ analysis, hypothesisContext, onAddToWatchlist }) {
  const [expanded, setExpanded] = useState({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [saved, setSaved] = useState(false)

  function togglePillar(key) {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function handleConfirmSave() {
    onAddToWatchlist()
    setShowConfirm(false)
    setSaved(true)
  }

  const { quality, businessEconomics, solvency, value, hypothesisFit, overall, chartData, recentNews } = analysis
  const allFlags = computeFlags(analysis)
  const verdictStyle = VERDICT_STYLE[overall?.verdict] ?? VERDICT_STYLE.watch
  const included = hypothesisFit?.included === true

  // Pillar data renderers
  const qualQuantData = quality?.quantitative && [
    kv('Gross Margin', quality.quantitative.grossMargin?.value + (quality.quantitative.grossMargin?.trend ? ` (${quality.quantitative.grossMargin.trend})` : '')),
    kv('Operating Margin', quality.quantitative.operatingMargin?.value),
    kv('vs Sector Avg', quality.quantitative.operatingMargin?.vsSectorAvg),
    kv('ROIC', quality.quantitative.roic?.value),
    kv('FCF Conversion', quality.quantitative.fcfConversion),
    kv('Revenue Growth', quality.quantitative.revenueGrowthConsistency),
  ]

  const qualQualData = quality?.qualitative && [
    kv('Moat Type', quality.qualitative.moatType?.replace(/_/g, ' ')),
    kv('Moat Strength', quality.qualitative.moatStrength),
    kv('Customer Concentration', quality.qualitative.customerConcentrationRisk),
    kv('Brand / Pricing Power', quality.qualitative.brandAndPricingPower),
    kv('Proprietary Know-How', quality.qualitative.proprietaryKnowHow),
    kv('Management Quality', quality.qualitative.managementQuality),
  ]

  const beData = businessEconomics && [
    kv('Revenue Visibility', businessEconomics.earningsQuality?.revenueVisibility),
    kv('Cyclicality', businessEconomics.earningsQuality?.cyclicality),
    kv('Earnings Revisions', businessEconomics.earningsQuality?.earningsRevisionHistory),
    kv('Insider Ownership', businessEconomics.ownerOrientation?.insiderOwnershipPct?.value),
    kv('Founder-Led', businessEconomics.ownerOrientation?.founderLed ? 'Yes' : 'No'),
    kv('Buybacks Accretive', businessEconomics.capitalAllocation?.shareBuybackHistory?.accretive ? 'Yes' : 'No'),
    kv('M&A Track Record', businessEconomics.capitalAllocation?.maTrackRecord?.assessment),
    kv('Reinvestment vs ROIC', businessEconomics.capitalAllocation?.reinvestmentRateVsROIC?.assessment),
    kv('Int\'l Expansion', businessEconomics.reinvestmentRunway?.internationalExpansionPotential),
    kv('Shareholder Comms', businessEconomics.ownerOrientation?.shareholderCommunicationQuality),
  ]

  const solData = solvency && [
    kv('Net Debt / EBITDA', solvency.netDebtToEbitda?.value),
    kv('Interest Coverage', solvency.interestCoverage?.value),
    kv('Current Ratio', solvency.currentRatio),
    kv('Refinancing Risk', solvency.nearTermRefinancingRisk),
    kv('FCF vs Debt Obligations', solvency.fcfVsDebtObligations),
  ]

  const valData = value && [
    kv('Trailing P/E', value.multiples?.trailingPE?.value + (value.multiples?.trailingPE?.vs5yrAvg ? ` (vs 5yr: ${value.multiples.trailingPE.vs5yrAvg})` : '')),
    kv('Forward P/E', value.multiples?.forwardPE?.value),
    kv('EV/EBITDA', value.multiples?.evToEbitda?.value),
    kv('Price/Sales', value.multiples?.priceToSales),
    kv('Price/FCF', value.multiples?.priceToFCF),
    kv('Peer Premium/Discount', value.multiples?.peerValuationPremiumDiscount?.pct),
    kv('vs Market', value.multiples?.marketPremiumDiscount),
    kv('52w from Low', value.marketSignals?.week52Position?.fromLow),
    kv('52w from High', value.marketSignals?.week52Position?.fromHigh),
    kv('vs 200-Day MA', value.marketSignals?.priceVs200ma?.position + ' ' + (value.marketSignals?.priceVs200ma?.pctDistance ?? '')),
    kv('Relative Strength 6M', value.marketSignals?.relativeStrength6M),
    kv('Relative Strength 12M', value.marketSignals?.relativeStrength12M),
  ]

  const hypoData = hypothesisFit && included && [
    kv('Revenue Exposure', hypothesisFit.revenueExposure?.pct),
    kv('Exposure Reasoning', hypothesisFit.revenueExposure?.reasoning),
    kv('Tailwind Strength', hypothesisFit.tailwindStrength?.replace(/_/g, ' ')),
    kv('Competitive Position', hypothesisFit.competitivePositionWithinThesis?.replace(/_/g, ' ')),
  ]

  const sentimentStyle = { positive: 'text-green-400', negative: 'text-red-400', neutral: 'text-zinc-500' }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className="text-3xl font-bold font-mono text-zinc-100">
                {overall?.weightedTotalScore?.toFixed(1) ?? '—'}
                <span className="text-zinc-600 text-lg"> / 10</span>
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${verdictStyle}`}>
                {VERDICT_LABEL[overall?.verdict] ?? overall?.verdict ?? 'N/A'}
              </span>
            </div>
            <h2 className="text-zinc-100 font-semibold text-lg leading-tight">{analysis.companyName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-amber-400 font-mono text-sm">{analysis.ticker}</span>
              <span className="text-zinc-600 text-xs">·</span>
              <span className="text-zinc-500 text-xs">{analysis.sector}</span>
            </div>
          </div>
        </div>
        {overall?.executiveSummary && (
          <p className="text-zinc-400 text-sm leading-relaxed mt-4">{overall.executiveSummary}</p>
        )}
      </div>

      {/* Score Overview */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-4">Score Overview</h3>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-full sm:w-64 shrink-0">
            <ScoreRadar analysis={analysis} />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-3 pt-2">
            <p className="text-zinc-600 text-xs uppercase tracking-wider mb-1">Weighted contribution</p>
            <WeightedBar analysis={analysis} />
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2">
              {[
                { label: 'Quality (Quant)', score: quality?.quantScore, color: PILLAR_COLORS.quality },
                { label: 'Quality (Qual)', score: quality?.qualScore, color: PILLAR_COLORS.quality },
                { label: 'Business Economics', score: businessEconomics?.businessEconomicsScore, color: PILLAR_COLORS.businessEco },
                { label: 'Solvency', score: solvency?.solvencyScore, color: PILLAR_COLORS.solvency },
                { label: 'Value', score: value?.valueScore, color: PILLAR_COLORS.value },
                ...(included ? [{ label: 'Thesis Fit', score: hypothesisFit.hypothesisScore, color: PILLAR_COLORS.hypothesis }] : []),
              ].map(({ label, score, color }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="text-zinc-500 text-xs">{label}</span>
                  <span className="font-mono text-sm font-semibold" style={{ color }}>{score ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pillar Cards */}
      <div className="flex flex-col gap-3">
        <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Pillar Analysis</h3>

        <PillarCard
          title="Quality — Quantitative"
          weight={included ? 17.5 : 20.6}
          rawScore={quality?.quantScore}
          color={PILLAR_COLORS.quality}
          data={qualQuantData}
          verdict={quality?.verdict}
          flags={allFlags.filter(f => ['Margin Contraction', 'High ROIC'].includes(f.label))}
          expanded={!!expanded.qualQuant}
          onToggle={() => togglePillar('qualQuant')}
        />

        <PillarCard
          title="Quality — Qualitative"
          weight={included ? 17.5 : 20.6}
          rawScore={quality?.qualScore}
          color={PILLAR_COLORS.quality}
          data={qualQualData}
          verdict={null}
          flags={allFlags.filter(f => ['Strong Moat'].includes(f.label))}
          expanded={!!expanded.qualQual}
          onToggle={() => togglePillar('qualQual')}
        />

        <PillarCard
          title="Business Economics"
          weight={included ? 20 : 23.5}
          rawScore={businessEconomics?.businessEconomicsScore}
          color={PILLAR_COLORS.businessEco}
          data={beData}
          verdict={businessEconomics?.verdict}
          flags={allFlags.filter(f => ['Transactional + High Cyclicality', 'Compounding Machine', 'Founder-Led'].includes(f.label))}
          expanded={!!expanded.be}
          onToggle={() => togglePillar('be')}
        />

        <PillarCard
          title="Solvency"
          weight={included ? 10 : 11.8}
          rawScore={solvency?.solvencyScore}
          color={PILLAR_COLORS.solvency}
          data={solData}
          verdict={solvency?.verdict}
          flags={allFlags.filter(f => ['High Leverage', 'Weak Interest Coverage'].includes(f.label))}
          expanded={!!expanded.sol}
          onToggle={() => togglePillar('sol')}
        />

        <PillarCard
          title="Value"
          weight={included ? 20 : 23.5}
          rawScore={value?.valueScore}
          color={PILLAR_COLORS.value}
          data={valData}
          verdict={value?.verdict}
          flags={allFlags.filter(f => ['Comfortable Margin of Safety'].includes(f.label))}
          expanded={!!expanded.val}
          onToggle={() => togglePillar('val')}
        />

        {included && (
          <PillarCard
            title="Hypothesis Fit"
            weight={15}
            rawScore={hypothesisFit?.hypothesisScore}
            color={PILLAR_COLORS.hypothesis}
            data={hypoData}
            verdict={hypothesisFit?.verdict}
            flags={[]}
            expanded={!!expanded.hypo}
            onToggle={() => togglePillar('hypo')}
          />
        )}
      </div>

      {/* Charts */}
      <div>
        <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-3">Charts</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">12-Month Price</p>
            <PriceChart ticker={analysis.ticker} />
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">Margin Trend</p>
            <MarginTrendChart data={chartData?.marginTrend} />
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">Peer Valuation</p>
            <PeerComparisonChart data={chartData?.peerComparison} />
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">Capital Allocation</p>
            <CapitalAllocationChart data={chartData?.capitalAllocation} />
          </div>
        </div>
      </div>

      {/* Hypothesis Fit Card */}
      {included && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-3">Hypothesis Fit</h3>
          <p className="text-amber-400 font-medium text-sm mb-3">{hypothesisFit.hypothesisHeadline}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs px-2.5 py-1 rounded-full border bg-zinc-800 text-zinc-300 border-zinc-700">
              Revenue exposure: {hypothesisFit.revenueExposure?.pct ?? 'N/A'}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full border ${TAILWIND_STYLE[hypothesisFit.tailwindStrength] ?? TAILWIND_STYLE.weak}`}>
              {hypothesisFit.tailwindStrength?.replace(/_/g, ' ') ?? 'N/A'}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full border bg-zinc-800 text-zinc-300 border-zinc-700">
              {hypothesisFit.competitivePositionWithinThesis?.replace(/_/g, ' ') ?? 'N/A'}
            </span>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">{hypothesisFit.fitAssessment}</p>
        </div>
      )}

      {/* Downside Snapshot */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-4">Downside Snapshot</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <p className="text-zinc-600 text-xs uppercase tracking-wider mb-1">Bear Case</p>
            <p className="text-zinc-300 text-sm leading-relaxed">{value?.downside?.bearCaseScenario ?? 'N/A'}</p>
          </div>
          <div>
            <p className="text-zinc-600 text-xs uppercase tracking-wider mb-1">Margin of Safety</p>
            <span className={`text-xs px-2.5 py-1 rounded-full border ${MARGIN_SAFETY_STYLE[value?.downside?.marginOfSafetyAssessment] ?? ''}`}>
              {value?.downside?.marginOfSafetyAssessment ?? 'N/A'}
            </span>
          </div>
          <div>
            <p className="text-zinc-600 text-xs uppercase tracking-wider mb-1">Historical Drawdown</p>
            <p className="text-zinc-300 text-sm leading-relaxed">{value?.downside?.historicalDrawdownBehavior ?? 'N/A'}</p>
          </div>
          <div>
            <p className="text-zinc-600 text-xs uppercase tracking-wider mb-1">Asset Backing</p>
            <p className="text-zinc-300 text-sm leading-relaxed">{value?.downside?.assetBacking ?? 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Recent News */}
      {recentNews && recentNews.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-4">Recent News</h3>
          <div className="flex flex-col gap-3">
            {recentNews.map((item, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-zinc-800 last:border-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-200 text-sm font-medium leading-snug">{item.headline}</p>
                  <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{item.summary}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-xs font-medium ${sentimentStyle[item.sentiment] ?? 'text-zinc-500'}`}>
                    {item.sentiment}
                  </span>
                  <span className="text-zinc-600 text-xs">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save to Watchlist */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-4">Save to Watchlist</h3>

        {saved ? (
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
            <Check size={16} />
            Saved to Watchlist
          </div>
        ) : showConfirm ? (
          <div className="flex flex-col gap-4">
            <div className="bg-zinc-800 rounded-lg p-4 text-sm">
              <p className="text-zinc-200 font-medium">{analysis.companyName} ({analysis.ticker})</p>
              <p className="text-zinc-500 mt-1">
                Overall score: <span className="text-zinc-300 font-mono">{overall?.weightedTotalScore?.toFixed(1)}</span>
                {' · '}
                Verdict: <span className={`font-medium ${verdictStyle.split(' ')[1]}`}>{VERDICT_LABEL[overall?.verdict] ?? overall?.verdict}</span>
              </p>
              <p className="text-zinc-600 text-xs mt-1.5">Full scorecard snapshot will be saved ({Object.keys(analysis).length} fields)</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmSave}
                className="h-9 px-5 rounded-lg bg-green-400/20 border border-green-400/30 text-green-400 text-sm font-medium hover:bg-green-400/30 transition-colors"
              >
                Confirm Save
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="h-9 px-4 rounded-lg border border-zinc-700 text-zinc-400 text-sm hover:border-zinc-600 hover:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="h-9 px-5 rounded-lg bg-amber-400/20 border border-amber-400/30 text-amber-400 text-sm font-medium hover:bg-amber-400/30 transition-colors"
          >
            Add to Watchlist
          </button>
        )}
      </div>
    </div>
  )
}
