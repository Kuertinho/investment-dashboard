import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

const MODEL = 'claude-haiku-4-5-20251001'
const ANALYZER_MODEL = 'claude-haiku-4-5-20251001'

function extractJson(raw) {
  const start = raw.indexOf('[')
  const end = raw.lastIndexOf(']')
  if (start === -1 || end === -1) throw new Error('No JSON array found in response')
  return raw.slice(start, end + 1)
}

function extractJsonObject(raw) {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found in response')
  return raw.slice(start, end + 1)
}

function extractText(response) {
  const block = response.content.filter(b => b.type === 'text').at(-1)
  if (!block) throw new Error('No text in Claude response')
  return block.text
}

export async function generateHypotheses() {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: `You are a senior equity research strategist. Identify structural, multi-year investment
themes grounded in fundamental drivers: demographic shifts, capex supercycles, regulatory change,
technology adoption curves, energy transition, or geopolitical reconfigurations.
Focus on themes whose long-term equity implications are real but not yet fully priced into public markets.
Avoid speculative or hype-driven narratives. Every hypothesis must be defensible with fundamental data.`,
    messages: [{
      role: 'user',
      content: `Generate exactly 6 distinct structural investment hypotheses.

Return ONLY a valid JSON array — no other text, no markdown fences. Each element:
{
  "headline": "concise punchy title, max 12 words",
  "thesis": "2-3 sentences: fundamental driver + why equity implication may not be fully priced in",
  "sectors": ["3-4 sector or industry strings most exposed to this theme"]
}`,
    }],
  })
  return JSON.parse(extractJson(extractText(response)))
}

export async function generateIdeas(headline, thesis, sectors) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 12000,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    system: `You are a sell-side equity research analyst with deep knowledge of global public markets.
Given an investment hypothesis, identify the most relevant publicly traded companies with direct,
material exposure to the thesis driver.
Use web search to verify every company you list is currently publicly traded.
Exclude any company you cannot confirm has an active, listed ticker on a major exchange.`,
    messages: [{
      role: 'user',
      content: `Investment hypothesis:
Headline: ${headline}
Thesis: ${thesis}
Key sectors: ${sectors.join(', ')}

List exactly 20 publicly traded companies with the strongest exposure to this thesis.

IMPORTANT: Only include companies you have confirmed are publicly listed via web search.
Do not include private companies. If a company you intended to include turns out to be private or delisted, replace it with another publicly traded alternative.

Return ONLY a valid JSON array — no other text, no markdown fences. Each element:
{
  "companyName": "full company name",
  "ticker": "UPPERCASE ticker",
  "exchange": "primary exchange (NYSE, NASDAQ, LSE, XETRA, TSE, etc.)",
  "marketCap": "formatted e.g. $142B or $890M",
  "revenue": "trailing twelve-month revenue, same format",
  "relevanceReason": "exactly one sentence explaining direct exposure to this thesis",
  "fitScore": 8,
  "valueScore": 7,
  "valueSupportingData": {
    "trailingPE": "22.5x or N/A",
    "forwardPE": "18.0x or N/A",
    "priceChange12m": "+45.2% or N/A",
    "analystConsensus": "Buy / Hold / Sell / N/A",
    "analystPriceTargetUpside": "+18% or N/A"
  },
  "qualityScore": 8,
  "qualitySupportingData": {
    "operatingMargin": "18.3% or N/A",
    "ebitMargin": "22.1% or N/A",
    "debtToEquity": "0.43x or N/A",
    "operatingCashFlow": "$2.1B or N/A",
    "revenueGrowthYoY": "+15.2% or N/A"
  }
}

fitScore: integer 1-10, where 10 = direct pure-play on this thesis, 1 = tangential.
Base it on how central the thesis driver is to this company's revenue and growth.

valueScore: integer 1-10. How attractively valued is this stock right now?
  9-10: P/E well below sector, Strong Buy consensus, >20% price target upside
  7-8:  modestly undervalued vs peers, Buy consensus or confirming momentum
  5-6:  fairly valued, Hold consensus, in-line performance
  3-4:  modestly expensive or Underperform signals
  1-2:  expensive on all metrics, Sell consensus, or large drawdown with no catalyst
If 3+ valueSupportingData fields are N/A, cap valueScore at 6.
Use web search: trailing P/E, forward P/E, 12M price return, analyst consensus, price target upside.

qualityScore: integer 1-10. How strong are the business fundamentals?
  9-10: op. margin >25%, D/E <0.3x, strong positive FCF, revenue growth >15% YoY
  7-8:  op. margin >15%, manageable debt, positive OCF, solid growth
  5-6:  average sector margins, moderate debt, breakeven OCF
  3-4:  below-sector margins, elevated leverage, weak/negative OCF
  1-2:  negative op. margin, high debt, negative OCF
If 3+ qualitySupportingData fields are N/A, cap qualityScore at 6.
Use web search: operating margin TTM, EBIT margin, D/E ratio, operating cash flow TTM, revenue growth YoY.

Calibrate valueScore and qualityScore relative to the 20-company set you are generating.
To conserve search calls: batch searches where possible (e.g. "AAPL MSFT NVDA P/E analyst consensus").

marketCap and revenue: use web search for current values.
Include a mix of large, mid, and small cap. Sort by market cap descending.`,
    }],
  })
  return JSON.parse(extractJson(extractText(response)))
}

export async function analyzeStock(ticker, hypothesisContext = null) {
  const hypothesisSection = hypothesisContext
    ? `\n\nThis analysis is in the context of an investment thesis:
Hypothesis: ${hypothesisContext.headline}
Thesis: ${hypothesisContext.thesis ?? ''}
Relevance to this stock: ${hypothesisContext.relevanceReason ?? ''}
In "investmentCase", explicitly reference how this stock fits (or fails to fit) the thesis.`
    : `\n\nIn "investmentCase", give an independent 2-3 sentence investment case.`

  const response = await client.messages.create({
    model: ANALYZER_MODEL,
    max_tokens: 8000,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    system: `You are a senior equity research analyst. Use web search for current data.
Return ONLY valid JSON — no markdown, no text outside the JSON object.`,
    messages: [{
      role: 'user',
      content: `Analyze the publicly traded stock: ${ticker.toUpperCase()}

Search for current financials, recent news (last 90 days), and analyst commentary.

Return ONLY a valid JSON object:
{
  "companyName": "full name",
  "ticker": "UPPERCASE",
  "sector": "GICS sector",
  "kpis": {
    "trailingPE": "14.2x or N/A",
    "forwardPE": "12.1x or N/A",
    "marketCap": "$2.4T",
    "operatingMargin": "30.5%",
    "ebitMargin": "32.1%",
    "revenueGrowthYoY": "+12.3% or -5.1%",
    "debtToEquity": "0.43 or N/A",
    "dividendYield": "0.44% or N/A"
  },
  "recentNews": [
    { "headline": "string", "summary": "1-2 sentences", "date": "YYYY-MM-DD", "sentiment": "positive|negative|neutral" }
  ],
  "swot": {
    "strengths": ["2-3 bullets"],
    "weaknesses": ["2-3 bullets"],
    "opportunities": ["2-3 bullets"],
    "threats": ["2-3 bullets"]
  },
  "investmentCase": "2-3 sentence summary"
}

Include exactly 3-5 items in recentNews with distinct topics.${hypothesisSection}`,
    }],
  })

  const textBlock = response.content.filter(b => b.type === 'text').at(-1)
  if (!textBlock) throw new Error('No text block in response')
  return JSON.parse(extractJsonObject(textBlock.text))
}

const SCORECARD_MODEL = 'claude-sonnet-4-6'

export async function analyzeStockScorecard(ticker, hypothesisContext = null) {
  const hypothesisNote = hypothesisContext
    ? `\n\nHypothesis context is PROVIDED. Set hypothesisFit.included = true.
Hypothesis headline: ${hypothesisContext.headline}
Relevance reason: ${hypothesisContext.relevanceReason ?? ''}
Assess revenue exposure percentage and tailwind strength honestly based on the company's actual business.`
    : `\n\nNo hypothesis context provided. Set hypothesisFit.included = false and hypothesisScore = null.
Use the no-hypothesis weighting formula.`

  try {
    const response = await client.messages.create({
      model: SCORECARD_MODEL,
      max_tokens: 16000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      system: `You are a senior buy-side equity research analyst with a Buffett/Munger quality-first lens.
Use web search extensively to gather current financial data, analyst consensus, and market signals.
Return ONLY valid JSON — no markdown, no text outside the JSON object.
If data is unavailable mark it "N/A" and explain gaps in the written verdict.
If web search returns conflicting data, use the most recent and mark it "estimated".`,
      messages: [{
        role: 'user',
        content: `Analyze the publicly traded stock: ${ticker.toUpperCase()}

Search for current financials, recent news, analyst consensus, and market data.

Return ONLY a valid JSON object with this exact structure:
{
  "companyName": "string",
  "ticker": "UPPERCASE",
  "sector": "GICS sector",

  "quality": {
    "quantitative": {
      "grossMargin": { "value": "45.2%", "trend": "expanding|stable|contracting" },
      "operatingMargin": { "value": "18.3%", "vsSectorAvg": "+5.2pp or N/A" },
      "roic": { "value": "22.5%", "flagHigh": true },
      "revenueGrowthConsistency": "assessment string",
      "fcfConversion": "89% or N/A"
    },
    "qualitative": {
      "proprietaryKnowHow": "assessment string",
      "brandAndPricingPower": "assessment string",
      "managementQuality": "assessment string",
      "moatType": "network_effect|switching_costs|cost_advantage|intangible_assets|none",
      "moatStrength": "weak|moderate|strong",
      "customerConcentrationRisk": "low|medium|high"
    },
    "quantScore": 8,
    "qualScore": 7,
    "verdict": "3-4 sentence synthesis"
  },

  "businessEconomics": {
    "capitalAllocation": {
      "shareBuybackHistory": { "assessment": "string", "accretive": true },
      "maTrackRecord": { "assessment": "string", "valueCreating": true },
      "dividendConsistency": "assessment string",
      "reinvestmentRateVsROIC": { "assessment": "string", "compoundingMachine": false }
    },
    "earningsQuality": {
      "accrualsRatio": "assessment string",
      "earningsRevisionHistory": "assessment string",
      "revenueVisibility": "recurring|mixed|transactional",
      "cyclicality": "low|moderate|high"
    },
    "reinvestmentRunway": {
      "tamVsCurrentMarketShare": "assessment string",
      "organicGrowthPotential": "assessment string",
      "internationalExpansionPotential": "low|moderate|high"
    },
    "ownerOrientation": {
      "insiderOwnershipPct": { "value": "12.3%", "flagHigh": true },
      "compensationStructure": "assessment string",
      "founderLed": true,
      "shareholderCommunicationQuality": "poor|adequate|excellent"
    },
    "businessEconomicsScore": 8,
    "verdict": "3-4 sentence synthesis"
  },

  "solvency": {
    "netDebtToEbitda": { "value": "1.2x", "flagHigh": false },
    "interestCoverage": { "value": "18.5x", "flagLow": false },
    "currentRatio": "2.1x",
    "nearTermRefinancingRisk": "low|medium|high",
    "fcfVsDebtObligations": "assessment string",
    "solvencyScore": 9,
    "verdict": "3-4 sentence synthesis"
  },

  "value": {
    "multiples": {
      "trailingPE": { "value": "22.5x", "vs5yrAvg": "-15% or N/A" },
      "forwardPE": { "value": "18.0x" },
      "evToEbitda": { "value": "12.1x", "vsSectorMedian": "-8% or N/A" },
      "priceToSales": "4.2x",
      "priceToFCF": "19.5x",
      "peerValuationPremiumDiscount": { "pct": "-12%", "justification": "string" },
      "marketPremiumDiscount": "vs S&P 500 forward P/E: -5% or N/A"
    },
    "marketSignals": {
      "week52Position": { "fromLow": "+45%", "fromHigh": "-8%" },
      "priceVs200ma": { "position": "above|below", "pctDistance": "+12%" },
      "relativeStrength6M": "+8% vs sector or N/A",
      "relativeStrength12M": "+22% vs sector or N/A"
    },
    "downside": {
      "bearCaseScenario": "2-3 sentence description",
      "assetBacking": "assessment string",
      "historicalDrawdownBehavior": "assessment string",
      "marginOfSafetyAssessment": "none|thin|adequate|comfortable"
    },
    "valueScore": 7,
    "verdict": "3-4 sentence synthesis"
  },

  "hypothesisFit": {
    "included": false,
    "hypothesisHeadline": null,
    "fitAssessment": "N/A",
    "revenueExposure": { "pct": "N/A", "reasoning": "N/A" },
    "tailwindStrength": "weak",
    "competitivePositionWithinThesis": "indirect_beneficiary",
    "hypothesisScore": null,
    "verdict": "N/A"
  },

  "overall": {
    "weightedTotalScore": 7.4,
    "verdict": "strong_buy|buy|watch|avoid",
    "executiveSummary": "4-5 sentence synthesis"
  },

  "chartData": {
    "marginTrend": [
      { "period": "Q1 2023", "grossMargin": 44.1, "operatingMargin": 17.2 }
    ],
    "peerComparison": [
      { "name": "Peer Co", "ticker": "PC", "evEbitda": 15.2, "forwardPE": 22.0 }
    ],
    "capitalAllocation": [
      { "year": "2020", "fcf": 2.1, "buybacks": 0.8, "dividends": 0.3, "capex": 1.2 }
    ]
  },

  "recentNews": [
    { "headline": "string", "summary": "1-2 sentences", "date": "YYYY-MM-DD", "sentiment": "positive|negative|neutral" }
  ]
}

SCORING RULES:
${hypothesisContext ? `Hypothesis IS provided — use these weights:
weightedTotalScore = (quantScore * 0.175) + (qualScore * 0.175) + (businessEconomicsScore * 0.20) + (solvencyScore * 0.10) + (valueScore * 0.20) + (hypothesisScore * 0.15)` : `No hypothesis — use these weights:
weightedTotalScore = (quantScore * 0.206) + (qualScore * 0.206) + (businessEconomicsScore * 0.235) + (solvencyScore * 0.118) + (valueScore * 0.235)`}

Verdict thresholds: >=8.0 = strong_buy, >=6.5 = buy, >=5.0 = watch, <5.0 = avoid

chartData.marginTrend: last 5-6 quarters, grossMargin and operatingMargin as numbers (not strings).
chartData.peerComparison: 3-4 closest publicly traded peers + the subject company first (different name), evEbitda and forwardPE as numbers.
chartData.capitalAllocation: last 5 fiscal years, values in billions, numbers only.
recentNews: 3-5 items with distinct topics from the last 90 days.
Batch searches where possible to conserve tool calls.${hypothesisNote}`,
      }],
    })

    const textBlock = response.content.filter(b => b.type === 'text').at(-1)
    if (!textBlock) throw new Error('No text block in response')
    return JSON.parse(extractJsonObject(textBlock.text))
  } catch (err) {
    throw new Error(err.message ?? 'Scorecard analysis failed')
  }
}

export async function fetchKpis(ticker) {
  const response = await client.messages.create({
    model: ANALYZER_MODEL,
    max_tokens: 1024,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    system: `You are a financial data analyst. Use web search for current market data.
Return ONLY valid JSON — no markdown, no text outside the JSON object.`,
    messages: [{
      role: 'user',
      content: `Fetch current financial KPIs for the publicly traded stock: ${ticker.toUpperCase()}

Return ONLY a valid JSON object:
{
  "companyName": "full name",
  "ticker": "UPPERCASE",
  "sector": "GICS sector",
  "kpis": {
    "trailingPE": "14.2x or N/A",
    "forwardPE": "12.1x or N/A",
    "marketCap": "$2.4T",
    "operatingMargin": "30.5%",
    "ebitMargin": "32.1%",
    "revenueGrowthYoY": "+12.3% or -5.1%",
    "debtToEquity": "0.43 or N/A",
    "dividendYield": "0.44% or N/A"
  }
}`,
    }],
  })
  const textBlock = response.content.filter(b => b.type === 'text').at(-1)
  if (!textBlock) throw new Error('No text block in response')
  return JSON.parse(extractJsonObject(textBlock.text))
}
